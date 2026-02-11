import logging

from langchain.tools import tool
from pydantic import BaseModel, Field

from app.database import SessionLocal
from app.services import get_claim_summary, sanitize_for_agent

logger = logging.getLogger("claim-agent.tool")


# 1. Define the Input Schema
# This tells the LLM exactly what arguments to generate.
class ClaimInput(BaseModel):
    claim_id: str = Field(
        description="The numeric Claim ID (e.g., '2500998765') to look up."
    )


# 2. Define the Tool
@tool("fetch_claim_health_record", args_schema=ClaimInput)
def fetch_claim_health_record_tool(claim_id: str):
    """
    Retrieves full financial and clinical claim details for AI reasoning.

    ALWAYS call this tool first when a user asks about:
    • Claim status, payment, denial, or patient responsibility
    • Diagnosis, DRG, or billed amount
    • Why a claim was paid/denied/adjusted

    Returns a clean, PII-free, AI-optimized summary.
    """
    if not claim_id or not isinstance(claim_id, str) or len(claim_id.strip()) == 0:
        return {"error": "Invalid claim ID"}

    claim_id = claim_id.strip()
    logger.info(f"Fetching claim: {claim_id}")

    # Open a new DB session for the tool execution
    db = SessionLocal()
    try:
        summary = get_claim_summary(db, claim_id)
        if not summary:
            return {"error": "Claim not found", "claim_id": claim_id}

        return sanitize_for_agent(summary)
    except Exception as e:
        logger.error(f"Error fetching claim {claim_id}: {e}", exc_info=True)
        return {"error": "System error", "detail": "Unable to retrieve claim"}
    finally:
        db.close()
