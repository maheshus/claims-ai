import logging
import json
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse # <--- UPDATED
from langchain_core.messages import HumanMessage
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.agent import graph
from app.database import get_db
from app.mock_data import get_mock_claim
from app.services import get_claim_summary, sanitize_for_agent

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("claims-api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Claims Intelligence API starting up...")
    yield
    logger.info("Claims Intelligence API shutting down...")

app = FastAPI(
    title="Healthcare Claims Intelligence API",
    version="2.1.0", # Bumped version
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})

# --- SYSTEM ROUTES ---
@app.get("/", tags=["System"])
def read_root():
    return {"status": "System Operational", "streaming_enabled": True}

@app.get("/health", tags=["System"])
def check_db(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1")).scalar()
        return {"status": "healthy", "db_status": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "db_status": "disconnected"}

# --- CLAIM ROUTES ---
@app.get("/claims", tags=["Claims"])
def list_available_claims():
    from app.mock_data import _MOCK_DB
    return {"available_claims": sorted(_MOCK_DB.keys()), "total": len(_MOCK_DB)}

@app.get("/claims/{claim_id}/raw", tags=["Claims"])
def read_claim_raw(claim_id: str):
    claim = get_mock_claim(claim_id)
    if not claim: raise HTTPException(404, "Claim not found")
    return claim

@app.get("/claims/{claim_id}/summary", tags=["Claims"])
def read_claim_summary(claim_id: str, db: Session = Depends(get_db), include_pii: bool = False):
    summary = get_claim_summary(db, claim_id)
    if not summary: raise HTTPException(404, "Claim not found")
    return summary if include_pii else sanitize_for_agent(summary)

# --- CHAT ROUTE (STREAMING) ---
class ChatRequest(BaseModel):
    query: str
    thread_id: str = "default_session"

@app.post("/chat", tags=["AI Agent"])
async def chat_with_agent(request: ChatRequest): # Note: async def
    """
    Streams the AI response token-by-token.
    """
    config = {"configurable": {"thread_id": request.thread_id}}
    input_state = {"messages": [HumanMessage(content=request.query.strip())]}

    async def event_stream():
        try:
            # astream_events allows us to see tokens AS they are generated
            # version="v1" is required for LangChain 0.1+
            async for event in graph.astream_events(input_state, config=config, version="v1"):
                
                # We only care about the Chat Model streaming content
                # We ignore tool calls, retrieval steps, etc.
                kind = event["event"]
                
                if kind == "on_chat_model_stream":
                    content = event["data"]["chunk"].content
                    if content:
                        # Yield the raw text chunk
                        yield content
                        
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            yield f"\n[System Error: {str(e)}]"

    # Return a StreamingResponse with text/plain media type
    return StreamingResponse(event_stream(), media_type="text/plain")