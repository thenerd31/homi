"""
Fetch.ai Pricing Agent - Competitive Price Analysis
Uses Claude to analyze market rates and suggest optimal pricing

To run: python pricing_agent.py
"""

from uagents import Agent, Context, Protocol
from uagents.setup import fund_agent_if_low
import os
from anthropic import Anthropic
import json

pricing_agent = Agent(
    name="vibe_pricing_agent",
    port=8102,
    seed="vibe_pricing_secret_phrase",
    endpoint=["http://localhost:8102/submit"],
)

fund_agent_if_low(pricing_agent.wallet.address())

anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
chat_protocol = Protocol("ChatProtocol")


@chat_protocol.on_message(model=dict)
async def analyze_pricing(ctx: Context, sender: str, msg: dict):
    """
    Analyze competitive pricing for a listing

    Input:
    {
        "location": "Malibu, CA",
        "amenities": ["pool", "hot tub", "ocean view"],
        "property_type": "villa",
        "bedrooms": 3,
        "bathrooms": 2
    }

    Output:
    {
        "suggested_price": 250,
        "price_range": {"min": 200, "max": 350},
        "reasoning": "...",
        "competitive_analysis": "..."
    }
    """
    ctx.logger.info(f"Received pricing request from {sender}")

    try:
        # Use Claude for competitive analysis
        prompt = f"""You are a pricing expert for vacation rentals.

Analyze pricing for this property:

Location: {msg.get('location', 'Not specified')}
Property Type: {msg.get('property_type', 'Not specified')}
Bedrooms: {msg.get('bedrooms', 'Not specified')}
Bathrooms: {msg.get('bathrooms', 'Not specified')}
Amenities: {', '.join(msg.get('amenities', []))}

Based on typical market rates for similar properties in this area:

1. Suggest an optimal nightly price
2. Provide a competitive price range (min-max)
3. Explain your reasoning
4. Give competitive positioning advice

Return ONLY JSON (no markdown):
{{
  "suggested_price": number,
  "price_range": {{"min": number, "max": number}},
  "reasoning": "detailed explanation",
  "competitive_analysis": "how this compares to similar listings",
  "pricing_strategy": "recommendations for maximizing bookings"
}}"""

        response = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )

        content = response.content[0].text
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        pricing_data = json.loads(content)

        ctx.logger.info(f"Suggested price: ${pricing_data.get('suggested_price')}/night")

        await ctx.send(sender, {
            "agent": "vibe_pricing_agent",
            "status": "success",
            **pricing_data
        })

    except Exception as e:
        ctx.logger.error(f"Pricing error: {e}")
        await ctx.send(sender, {
            "agent": "vibe_pricing_agent",
            "status": "error",
            "error": str(e)
        })


pricing_agent.include(chat_protocol)


@pricing_agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info("=" * 50)
    ctx.logger.info("VIBE Pricing Agent Started")
    ctx.logger.info(f"Agent Address: {ctx.agent.address}")
    ctx.logger.info("=" * 50)


if __name__ == "__main__":
    print("\n💰 Starting VIBE Pricing Agent...")
    print(f"📍 Agent Address: {pricing_agent.address}\n")
    pricing_agent.run()
