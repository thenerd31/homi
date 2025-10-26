"""
Fetch.ai Search Agent - Coordinates Listing Discovery
Uses Claude as reasoning engine to understand search intent

To run and register on Agentverse:
    python search_agent.py

Requirements:
- Fetch.ai account
- Claude API key
- Registered on Agentverse with chat protocol enabled
"""

from uagents import Agent, Context, Protocol
from uagents.setup import fund_agent_if_low
import os
from anthropic import Anthropic
import json

# Initialize agent
search_agent = Agent(
    name="vibe_search_agent",
    port=8101,
    seed="vibe_search_secret_phrase",  # Change in production
    endpoint=["http://localhost:8101/submit"],
)

# Fund agent if needed (testnet)
fund_agent_if_low(search_agent.wallet.address())

# Initialize Claude
anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Chat protocol for Agentverse discoverability
chat_protocol = Protocol("ChatProtocol")


@chat_protocol.on_message(model=str)
async def handle_search_query(ctx: Context, sender: str, msg: str):
    """
    Handle natural language search queries

    Example:
    User: "Find me a beach house in Malibu under $300/night with a hot tub"
    """
    ctx.logger.info(f"Received search query from {sender}: {msg}")

    try:
        # Use Claude to understand search intent and extract filters
        claude_response = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": f"""You are a search intent analyzer for a home rental platform.

User query: "{msg}"

Extract structured search criteria from this query.

Return ONLY JSON (no markdown):
{{
  "location": "city or area",
  "price_max": number or null,
  "price_min": number or null,
  "bedrooms": number or null,
  "guests": number or null,
  "amenities": ["list", "of", "amenities"],
  "property_type": "house/apartment/villa/cabin or null",
  "style": "modern/rustic/luxury or null",
  "special_features": ["beach access", "mountain view", etc],
  "search_summary": "Brief summary of what user wants"
}}

Be specific and extract all mentioned criteria."""
            }]
        )

        # Parse Claude's response
        content = claude_response.content[0].text
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        filters = json.loads(content)

        # Log the extracted filters
        ctx.logger.info(f"Extracted filters: {json.dumps(filters, indent=2)}")

        # Send response back
        await ctx.send(sender, json.dumps({
            "agent": "vibe_search_agent",
            "status": "success",
            "filters": filters,
            "message": f"I understand you're looking for: {filters.get('search_summary', msg)}"
        }))

    except Exception as e:
        ctx.logger.error(f"Error processing search: {e}")
        await ctx.send(sender, json.dumps({
            "agent": "vibe_search_agent",
            "status": "error",
            "error": str(e)
        }))


@chat_protocol.on_interval(period=60.0)
async def periodic_log(ctx: Context):
    """Log agent status every minute"""
    ctx.logger.info(f"Search Agent active. Address: {ctx.agent.address}")


# Include chat protocol
search_agent.include(chat_protocol)


@search_agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info("=" * 50)
    ctx.logger.info("VIBE Search Agent Started")
    ctx.logger.info(f"Agent Address: {ctx.agent.address}")
    ctx.logger.info("Register on Agentverse:")
    ctx.logger.info("1. Go to https://agentverse.ai")
    ctx.logger.info(f"2. Add agent with address: {ctx.agent.address}")
    ctx.logger.info("3. Enable Chat Protocol")
    ctx.logger.info("4. Make discoverable")
    ctx.logger.info("=" * 50)


if __name__ == "__main__":
    print("\n🤖 Starting VIBE Search Agent...")
    print(f"📍 Agent Address: {search_agent.address}")
    print("🌐 Register on Agentverse: https://agentverse.ai\n")

    search_agent.run()
