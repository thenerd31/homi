"""
Fetch.ai Q&A Agent - Answers Guest Questions About Listings
Uses Claude to provide accurate, helpful responses

To run: python qa_agent.py
"""

from uagents import Agent, Context, Protocol
from uagents.setup import fund_agent_if_low
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    StartSessionContent,
    TextContent,
    chat_protocol_spec,
)
from datetime import datetime
from uuid import uuid4
import os
from anthropic import Anthropic
import json

qa_agent = Agent(
    name="vibe_qa_agent",
    port=8003,
    seed="vibe_qa_secret_phrase",
    endpoint=["http://localhost:8003/submit"],
)

fund_agent_if_low(qa_agent.wallet.address())

anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Use official chat protocol
chat_proto = Protocol(spec=chat_protocol_spec)


def create_text_chat(text: str) -> ChatMessage:
    """Wrap text in ChatMessage format"""
    content = [TextContent(type="text", text=text)]
    return ChatMessage(
        timestamp=datetime.utcnow(),
        msg_id=uuid4(),
        content=content,
    )


@chat_proto.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    """
    Handle incoming chat messages - answer questions about listings

    Expected format:
    {
        "listing_data": {...},
        "question": "Is this pet-friendly?"
    }
    """
    ctx.logger.info(f"Received message from {sender}")

    # Send acknowledgement
    await ctx.send(sender, ChatAcknowledgement(
        timestamp=datetime.utcnow(),
        acknowledged_msg_id=msg.msg_id
    ))

    # Process content
    for item in msg.content:
        if isinstance(item, StartSessionContent):
            ctx.logger.info(f"Q&A session started with {sender}")

        elif isinstance(item, TextContent):
            ctx.logger.info(f"Question from {sender}: {item.text}")

            try:
                # Parse question (might be JSON or plain text)
                try:
                    data = json.loads(item.text)
                    listing_data = data.get("listing_data", {})
                    question = data.get("question", item.text)
                except:
                    # If not JSON, treat as plain question
                    listing_data = {}
                    question = item.text

                # Use Claude to answer
                prompt = f"""You are a helpful Airbnb host assistant answering guest questions.

Listing Information:
{json.dumps(listing_data, indent=2) if listing_data else "Limited information available"}

Guest Question: {question}

Provide a friendly, accurate, and helpful answer. If you don't have enough information, say so politely and suggest the guest contact the host directly.

Keep your response concise (2-3 sentences) and conversational."""

                response = anthropic_client.messages.create(
                    model="claude-3-5-haiku-20241022",  # Fast model for Q&A
                    max_tokens=512,
                    messages=[{"role": "user", "content": prompt}]
                )

                answer = response.content[0].text

                ctx.logger.info(f"Answer: {answer}")

                # Send response
                response_msg = create_text_chat(answer)
                await ctx.send(sender, response_msg)

            except Exception as e:
                ctx.logger.error(f"Error answering question: {e}")
                error_msg = create_text_chat(
                    "I'm sorry, I'm having trouble answering that question right now. Please try again or contact the host directly."
                )
                await ctx.send(sender, error_msg)

        elif isinstance(item, EndSessionContent):
            ctx.logger.info(f"Q&A session ended with {sender}")


@chat_proto.on_message(ChatAcknowledgement)
async def handle_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    ctx.logger.info(f"Message {msg.acknowledged_msg_id} acknowledged by {sender}")


# Include chat protocol and publish manifest
qa_agent.include(chat_proto, publish_manifest=True)


@qa_agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info("=" * 50)
    ctx.logger.info("VIBE Q&A Agent Started")
    ctx.logger.info(f"Agent Address: {ctx.agent.address}")
    ctx.logger.info("Answers guest questions about listings")
    ctx.logger.info("=" * 50)


if __name__ == "__main__":
    print("\n💬 Starting VIBE Q&A Agent...")
    print(f"📍 Agent Address: {qa_agent.address}\n")
    qa_agent.run()
