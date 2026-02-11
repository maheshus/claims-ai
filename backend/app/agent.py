from typing import Annotated, TypedDict

from dotenv import load_dotenv
from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition

from app.agent_tools import fetch_claim_health_record_tool

load_dotenv()

model = ChatOpenAI(
    model="qwen-3-32b",
    temperature=0.6,
    streaming=True,  # ← makes UI feel instant
)

tools = [fetch_claim_health_record_tool]
model_w_tools = model.bind_tools(
    tools,
    tool_choice="auto",  # ← lets model decide when to call
)

SYSTEM_PROMPT = """You are a Senior Healthcare Claims Assistant.
Your role is to help affiliates who porcess claims understand their Explanation of Benefits (EOB).

GUIDELINES:
1. ALWAYS call `fetch_claim_health_record_tool` when a Claim ID is mentioned.
2. Quote the exact "description" and "action_needed" from the tool output.
3. Clearly state the "patient_responsibility" amount and whether it's $0.
4. Use empathetic, professional language.
5. Never diagnose or infer medical conditions.
6. If no claim is found, say: "I couldn't find that claim. Please double-check the ID."

You are trusted with sensitive financial data — accuracy is everything."""


class ChatState(TypedDict):
    messages: Annotated[list, add_messages]


def chatbot(state: ChatState) -> dict:
    messages = state["messages"]

    # Add system prompt only if this is the first message
    if not messages or not any(isinstance(m, SystemMessage) for m in messages):
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + messages

    response = model_w_tools.invoke(messages)
    return {"messages": [response]}


builder = StateGraph(ChatState)

builder.add_node("chatbot", chatbot)
builder.add_node("tools", ToolNode(tools))

builder.add_edge(START, "chatbot")
builder.add_conditional_edges(
    "chatbot",
    tools_condition,  # ← automatically routes to "tools" or END
    {"tools": "tools", END: END},
)
builder.add_edge("tools", "chatbot")

memory = MemorySaver()
graph = builder.compile(checkpointer=memory)
