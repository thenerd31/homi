"""
Fetch.ai Review Analyzer Agent - ASI:One Compatible
Analyzes vacation rental reviews to spot red flags and summarize sentiment
Uses Claude for deep review analysis and BS detection
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
review_agent = Agent(
    name="vibe_review_agent",
    seed="vibe_review_secret_phrase",
    port=8104,
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
    Analyze property reviews for red flags and sentiment

    Example queries:
    - "Analyze reviews for this Airbnb: [reviews text]"
    - "Should I book this place? Here are the reviews..."
    - "What are the red flags in these reviews?"
    """
    ctx.logger.info(f"Received review analysis request from {sender}")

    # Send acknowledgement
    await ctx.send(sender, ChatAcknowledgement(
        timestamp=datetime.utcnow(),
        acknowledged_msg_id=msg.msg_id
    ))

    # Process message content
    for item in msg.content:
        if isinstance(item, TextContent):
            query = item.text
            ctx.logger.info(f"Review analysis query: {query[:100]}...")

            try:
                # Use Claude for review analysis
                prompt = f"""You are RedFlagRick - a vacation rental review detective who's seen EVERY scam, trick, and disaster. You've read 10,000+ reviews and can spot BS from a mile away.

Your vibe: Protective big brother energy. Detective noir vibes. Seen-it-all attitude. You're cynical but fair, paranoid but accurate, and you'd rather warn someone 100 times than let them book a nightmare once.

Key traits:
- Spot red flags instantly ("'mostly clean' = NOT CLEAN")
- Call out review manipulation ("5 stars but mentions roaches? Sus.")
- Protect travelers fiercely ("DO NOT BOOK", "Hard pass", "Run")
- Give credit when deserved ("Actually legit", "Rare find", "Book it")
- Use detective language ("red flag", "sus", "sketchy", "legit check")
- Quote specific reviews to prove your point
- Rate danger level: 🟢 Safe / 🟡 Proceed with caution / 🔴 DANGER

Query: {query}

Analyze the reviews and return ONLY JSON:
{{
  "danger_level": "green/yellow/red",
  "overall_verdict": "honest summary with PERSONALITY",
  "red_flags": ["list of concerning patterns"],
  "green_flags": ["list of positive patterns"],
  "quoted_concerns": ["specific concerning review quotes"],
  "recommendation": "book it / proceed with caution / hard pass",
  "rick_says": "your brutally honest take in first person"
}}

ONLY analyze vacation rental reviews. Decline other topics with attitude."""

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

                analysis = json.loads(content)

                # Create formatted response with personality
                danger_emoji = {
                    "green": "🟢",
                    "yellow": "🟡",
                    "red": "🔴"
                }.get(analysis['danger_level'], "⚪")

                response_text = f"""🕵️ **RedFlagRick's Review Analysis**

{danger_emoji} **Danger Level: {analysis['danger_level'].upper()}**

**The Verdict:**
{analysis['overall_verdict']}

🚩 **Red Flags Detected:**
{chr(10).join(f"• {flag}" for flag in analysis['red_flags']) if analysis['red_flags'] else "• None (rare!)"}

✅ **Green Flags:**
{chr(10).join(f"• {flag}" for flag in analysis['green_flags']) if analysis['green_flags'] else "• None found"}

📝 **Concerning Quotes:**
{chr(10).join(f'• "{quote}"' for quote in analysis['quoted_concerns']) if analysis['quoted_concerns'] else "• No major concerns"}

**Rick Says:**
{analysis['rick_says']}

**Recommendation: {analysis['recommendation'].upper()}**"""

                ctx.logger.info(f"Analysis complete: {analysis['recommendation']}")

                # Send response with EndSessionContent
                response_msg = create_text_chat(response_text)
                response_msg.content.append(EndSessionContent(type="end-session"))
                await ctx.send(sender, response_msg)

            except Exception as e:
                ctx.logger.error(f"Error analyzing reviews: {e}")
                error_msg = create_text_chat(
                    f"I hit a snag analyzing those reviews. Send me the review text (actual guest reviews) and I'll spot the red flags for you."
                )
                error_msg.content.append(EndSessionContent(type="end-session"))
                await ctx.send(sender, error_msg)


@chat_proto.on_message(ChatAcknowledgement)
async def handle_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    """Handle message acknowledgements"""
    ctx.logger.info(f"Message {msg.acknowledged_msg_id} acknowledged by {sender}")


# Include protocol with manifest publishing
review_agent.include(chat_proto, publish_manifest=True)


@review_agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info("=" * 60)
    ctx.logger.info("🕵️ RedFlagRick ONLINE - Your Review Detective")
    ctx.logger.info(f"📍 Agent Address: {ctx.agent.address}")
    ctx.logger.info("🌐 ASI:One Chat - Send me reviews to analyze")
    ctx.logger.info("🔍 Vibe: Detective Noir × Protective Big Brother")
    ctx.logger.info("🎯 Will analyze: Reviews, red flags, BS detection")
    ctx.logger.info("🚫 Won't tolerate: Sketchy listings, review manipulation, danger")
    ctx.logger.info("=" * 60)


if __name__ == "__main__":
    print("\n🤖 Starting VIBE Review Agent (ASI:One Compatible)...")
    print(f"📍 Agent Address: {review_agent.address}")
    print("🌐 Mailbox: ENABLED")
    print("🕵️ Specialization: Review Analysis & Red Flag Detection\n")

    review_agent.run()
