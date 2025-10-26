"""
Fetch.ai Booking Assistant Agent - ASI:One Compatible
Helps with booking logistics, cancellation policies, and travel planning
Uses Claude for policy explanations and booking assistance
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
booking_agent = Agent(
    name="vibe_booking_agent",
    seed="vibe_booking_secret_phrase",
    port=8106,
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
    Help with booking logistics and policies

    Example queries:
    - "What's the cancellation policy for this listing?"
    - "When should I book for Christmas vacation?"
    - "How do I handle early check-in?"
    """
    ctx.logger.info(f"Received booking assistance request from {sender}")

    # Send acknowledgement
    await ctx.send(sender, ChatAcknowledgement(
        timestamp=datetime.utcnow(),
        acknowledged_msg_id=msg.msg_id
    ))

    # Process message content
    for item in msg.content:
        if isinstance(item, TextContent):
            query = item.text
            ctx.logger.info(f"Booking query: {query[:100]}...")

            try:
                # Use Claude for booking assistance
                prompt = f"""You are BookItBetty - the most organized, helpful travel coordinator who's booked 1000+ vacation rentals. You're like that friend who has ALL the spreadsheets, knows ALL the policies, and ALWAYS has a plan B.

Your vibe: Super helpful, organized, proactive, but FUN about it. Leslie Knope meets travel agent meets that friend who plans everything. You love logistics but make it exciting.

Key traits:
- Break down complex policies simply ("Here's the deal...")
- Give proactive advice ("Book now, prices spike in 2 weeks")
- Anticipate problems ("Pro tip: message host BEFORE booking about...")
- Love checklists and timelines
- Use organized language ("Let me break this down", "Here's your game plan")
- Get excited about good deals and smooth bookings
- Emoji-friendly for clarity 📅✅🎯

Query: {query}

Provide booking assistance and return ONLY JSON:
{{
  "question_type": "cancellation/timing/logistics/policy/other",
  "simple_answer": "clear straightforward answer",
  "detailed_breakdown": "step-by-step explanation",
  "pro_tips": ["helpful insider booking tips"],
  "common_mistakes": ["things to avoid"],
  "betty_says": "your enthusiastic personal advice",
  "action_items": ["checklist of things to do"]
}}

ONLY help with vacation rental bookings and travel logistics. Decline other topics cheerfully."""

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

                advice = json.loads(content)

                # Create formatted response with personality
                response_text = f"""📋 **BookItBetty's Booking Guide**

**Quick Answer:**
{advice['simple_answer']}

**The Full Breakdown:**
{advice['detailed_breakdown']}

💡 **Pro Tips:**
{chr(10).join(f"• {tip}" for tip in advice['pro_tips'])}

⚠️ **Avoid These Mistakes:**
{chr(10).join(f"• {mistake}" for mistake in advice['common_mistakes'])}

✅ **Action Items:**
{chr(10).join(f"☐ {item}" for item in advice['action_items'])}

**Betty Says:**
{advice['betty_says']}"""

                ctx.logger.info(f"Booking advice provided: {advice['question_type']}")

                # Send response with EndSessionContent
                response_msg = create_text_chat(response_text)
                response_msg.content.append(EndSessionContent(type="end-session"))
                await ctx.send(sender, response_msg)

            except Exception as e:
                ctx.logger.error(f"Error providing booking assistance: {e}")
                error_msg = create_text_chat(
                    f"Ooh, I need more details to help! Tell me: What are you trying to book? What specific question do you have? (cancellation policy, timing, check-in, etc)"
                )
                error_msg.content.append(EndSessionContent(type="end-session"))
                await ctx.send(sender, error_msg)


@chat_proto.on_message(ChatAcknowledgement)
async def handle_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    """Handle message acknowledgements"""
    ctx.logger.info(f"Message {msg.acknowledged_msg_id} acknowledged by {sender}")


# Include protocol with manifest publishing
booking_agent.include(chat_proto, publish_manifest=True)


@booking_agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info("=" * 60)
    ctx.logger.info("📋 BookItBetty ONLINE - Your Travel Coordinator BFF")
    ctx.logger.info(f"📍 Agent Address: {ctx.agent.address}")
    ctx.logger.info("🌐 ASI:One Chat - Ask me about bookings, policies, logistics")
    ctx.logger.info("💼 Vibe: Leslie Knope × Travel Agent × Organized Friend")
    ctx.logger.info("🎯 Will help with: Bookings, policies, timing, logistics")
    ctx.logger.info("🚫 Can't help with: Actual payment processing (that's the platform)")
    ctx.logger.info("=" * 60)


if __name__ == "__main__":
    print("\n🤖 Starting VIBE Booking Agent (ASI:One Compatible)...")
    print(f"📍 Agent Address: {booking_agent.address}")
    print("🌐 Mailbox: ENABLED")
    print("📋 Specialization: Booking Assistance & Travel Logistics\n")

    booking_agent.run()
