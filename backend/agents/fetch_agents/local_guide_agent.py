"""
Fetch.ai Local Guide Agent - ASI:One Compatible
Recommends restaurants, activities, and hidden gems near vacation rentals
Uses Claude for personalized local recommendations
"""

from uagents import Agent, Context, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatMessage,
    ChatAcknowledgement,
    TextContent,
    EndSessionContent,
    chat_protocol_spec,
)
from datetime import datetime
from uuid import uuid4
import os
from anthropic import Anthropic
import json

# Initialize agent with ASI:One compatibility
local_guide_agent = Agent(
    name="vibe_local_guide_agent",
    seed="vibe_local_guide_secret_phrase",
    port=8105,
    mailbox=True,  # Enable Agentverse connectivity
    publish_agent_details=True,  # Make discoverable on ASI:One
)

# Initialize Claude
anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Use official chat protocol for ASI:One
chat_proto = Protocol(spec=chat_protocol_spec)


def create_text_chat(text: str) -> ChatMessage:
    """Create ChatMessage with text content"""
    content = [TextContent(type="text", text=text)]
    return ChatMessage(
        timestamp=datetime.utcnow(),
        msg_id=uuid4(),
        content=content,
    )


@chat_proto.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    """
    Provide local recommendations and insider tips

    Example queries:
    - "Best restaurants near my Airbnb in Malibu?"
    - "Hidden gems in San Francisco for first-timers"
    - "What should I do in Cabo besides the beach?"
    """
    ctx.logger.info(f"Received local guide request from {sender}")

    # Send acknowledgement
    await ctx.send(sender, ChatAcknowledgement(
        timestamp=datetime.utcnow(),
        acknowledged_msg_id=msg.msg_id
    ))

    # Process message content
    for item in msg.content:
        if isinstance(item, TextContent):
            query = item.text
            ctx.logger.info(f"Local guide query: {query[:100]}...")

            try:
                # Use Claude for local recommendations
                prompt = f"""You are LocalLegend - the insider who ACTUALLY lives there (or did, for like 6 months, which basically makes you a local). You know where tourists go vs where REAL ONES go.

Your vibe: Cool local friend who shows you around. Anthony Bourdain meets travel TikToker. You know the spots that don't show up in guidebooks. You're enthusiastic but real, hyped but honest.

Key traits:
- Distinguish tourist traps from real spots ("Skip Fisherman's Wharf, hit the Sunset")
- Drop insider knowledge ("Go Tuesday nights - locals discount")
- Know the secret menu items, hidden beaches, local-only spots
- Warn about overrated places ("It's...fine. Insta-worthy but overpriced")
- Get excited about hidden gems ("BRO. This hole-in-the-wall taco spot...")
- Give time-specific tips ("Sunrise at this spot hits different")
- Use local slang and casual language

Query: {query}

Provide local recommendations and return ONLY JSON:
{{
  "location": "city/area mentioned",
  "top_picks": [
    {{
      "name": "spot name",
      "type": "restaurant/activity/beach/etc",
      "why_its_fire": "what makes it special",
      "insider_tip": "local knowledge",
      "tourist_vs_local": "local favorite / tourist-friendly / hidden gem"
    }}
  ],
  "skip_these": ["tourist traps to avoid"],
  "insider_secrets": ["local-only knowledge"],
  "legend_says": "your enthusiastic personal take"
}}

ONLY give travel and local recommendations. Decline other topics with personality."""

                response = anthropic_client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=1024,
                    messages=[{"role": "user", "content": prompt}]
                )

                # Parse response
                content = response.content[0].text
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0].strip()
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0].strip()

                recs = json.loads(content)

                # Create formatted response with personality
                response_text = f"""🗺️ **LocalLegend's Guide to {recs['location']}**

✨ **Top Picks (The REAL Spots):**
"""
                for pick in recs['top_picks']:
                    emoji = {
                        "restaurant": "🍴",
                        "activity": "🎯",
                        "beach": "🏖️",
                        "bar": "🍻",
                        "cafe": "☕"
                    }.get(pick['type'], "📍")

                    response_text += f"""
{emoji} **{pick['name']}** ({pick['type']})
• Why it's fire: {pick['why_its_fire']}
• Insider tip: {pick['insider_tip']}
• Vibe: {pick['tourist_vs_local']}
"""

                if recs['skip_these']:
                    response_text += f"""
🚫 **Skip These (Trust Me):**
{chr(10).join(f"• {skip}" for skip in recs['skip_these'])}
"""

                if recs['insider_secrets']:
                    response_text += f"""
🤫 **Insider Secrets:**
{chr(10).join(f"• {secret}" for secret in recs['insider_secrets'])}
"""

                response_text += f"""
**LocalLegend Says:**
{recs['legend_says']}"""

                ctx.logger.info(f"Recommendations generated for {recs['location']}")

                # Send response with EndSessionContent
                response_msg = create_text_chat(response_text)
                response_msg.content.append(EndSessionContent(type="end-session"))
                await ctx.send(sender, response_msg)

            except Exception as e:
                ctx.logger.error(f"Error generating recommendations: {e}")
                error_msg = create_text_chat(
                    f"Yo, I need to know WHERE you're going to drop the local knowledge. Tell me the city/area and what you're into (food, activities, nightlife, etc)."
                )
                error_msg.content.append(EndSessionContent(type="end-session"))
                await ctx.send(sender, error_msg)


@chat_proto.on_message(ChatAcknowledgement)
async def handle_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    """Handle message acknowledgements"""
    ctx.logger.info(f"Message {msg.acknowledged_msg_id} acknowledged by {sender}")


# Include protocol with manifest publishing
local_guide_agent.include(chat_proto, publish_manifest=True)


@local_guide_agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info("=" * 60)
    ctx.logger.info("🗺️ LocalLegend ONLINE - Your Insider Travel Guide")
    ctx.logger.info(f"📍 Agent Address: {ctx.agent.address}")
    ctx.logger.info("🌐 ASI:One Chat - Ask me where the locals actually go")
    ctx.logger.info("💎 Vibe: Anthony Bourdain × Travel TikToker")
    ctx.logger.info("🎯 Will share: Hidden gems, insider tips, local secrets")
    ctx.logger.info("🚫 Will NOT recommend: Tourist traps, overpriced BS")
    ctx.logger.info("=" * 60)


if __name__ == "__main__":
    print("\n🤖 Starting VIBE Local Guide Agent (ASI:One Compatible)...")
    print(f"📍 Agent Address: {local_guide_agent.address}")
    print("🌐 Mailbox: ENABLED")
    print("🗺️ Specialization: Local Recommendations & Hidden Gems\n")

    local_guide_agent.run()
