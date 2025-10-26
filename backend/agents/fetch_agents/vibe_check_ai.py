"""
Vibe Check AI - The Sarcastic, Funny Personal AI
For Fetch.ai "Most Viral ASI:One Personal AI" Track ($1,000)

This AI has PERSONALITY:
- Sarcastic but helpful
- Roasts your choices (lovingly)
- Gen Z energy
- Viral-worthy responses
- Actually helps you find your vibe

To run: python vibe_check_ai.py
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

vibe_check = Agent(
    name="vibe_check_ai",
    port=8004,
    seed="vibe_check_secret_phrase",
    endpoint=["http://localhost:8004/submit"],
)

fund_agent_if_low(vibe_check.wallet.address())

anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

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
    Handle chat messages with PERSONALITY

    Examples:
    User: "Find me the cheapest place in SF"
    Vibe Check: "Bestie, the cheapest place in SF is Oakland 💀
                 But fr, here's what I found..."

    User: "I want a luxury villa for $50/night"
    Vibe Check: "And I want a pet unicorn 🦄 Let's be realistic, luv..."
    """
    ctx.logger.info(f"Vibe Check got a message from {sender}")

    await ctx.send(sender, ChatAcknowledgement(
        timestamp=datetime.utcnow(),
        acknowledged_msg_id=msg.msg_id
    ))

    for item in msg.content:
        if isinstance(item, StartSessionContent):
            ctx.logger.info(f"New vibe check session with {sender}")

            # Welcome message with personality
            welcome = create_text_chat(
                "Heyyy bestie! 👋 I'm your Vibe Check AI - I'm like a real estate agent, "
                "but make it honest. Tell me what you're looking for and I'll help you "
                "find your vibe (and maybe roast you a lil if needed) 😌✨"
            )
            await ctx.send(sender, welcome)

        elif isinstance(item, TextContent):
            user_message = item.text.lower()
            ctx.logger.info(f"User said: {user_message}")

            # Use Claude with a PERSONALITY SYSTEM PROMPT
            try:
                response = anthropic_client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=512,
                    system="""You are Vibe Check AI - a sarcastic but ultimately helpful AI assistant for finding vacation rentals.

Your personality:
- Gen Z energy with millennial humor
- Use emojis (but not too many - keep it cool)
- Roast unrealistic expectations but then actually help
- Be honest about budget/location reality checks
- Use slang like "bestie", "fr" (for real), "ngl" (not gonna lie), "lowkey", "highkey"
- Reference pop culture when relevant
- Be witty but never mean
- Always end up being helpful after the roast

Examples of your vibe:
"Bestie, the cheapest place in Manhattan is New Jersey 💀 But fr, here's a cozy spot in Washington Heights for $120/night"

"Ooh big spender! 💸 Love that energy. Here's a luxury villa that'll make your Instagram THRIVE"

"Not you trying to find a 5-bed villa for $100/night 😭 Babe, let's be realistic. How about this cute 2-bed for $150?"

Always be:
1. Funny/sarcastic (30%)
2. Reality check if needed (20%)
3. Actually helpful (50%)""",
                    messages=[{
                        "role": "user",
                        "content": user_message
                    }]
                )

                vibe_response = response.content[0].text

                ctx.logger.info(f"Vibe Check says: {vibe_response}")

                response_msg = create_text_chat(vibe_response)
                await ctx.send(sender, response_msg)

            except Exception as e:
                ctx.logger.error(f"Error: {e}")
                fallback = create_text_chat(
                    "Omg I'm lowkey glitching rn 🤖💔 Try asking me again bestie!"
                )
                await ctx.send(sender, fallback)

        elif isinstance(item, EndSessionContent):
            ctx.logger.info(f"Vibe check session ended with {sender}")
            goodbye = create_text_chat(
                "Okayy catch you later bestie! Hope you find your perfect vibe ✨ "
                "Come back when you need another reality check 😌"
            )
            await ctx.send(sender, goodbye)


@chat_proto.on_message(ChatAcknowledgement)
async def handle_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    ctx.logger.info(f"Message acknowledged by {sender}")


vibe_check.include(chat_proto, publish_manifest=True)


@vibe_check.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info("=" * 60)
    ctx.logger.info("✨ VIBE CHECK AI - Personal AI with PERSONALITY ✨")
    ctx.logger.info(f"Agent Address: {ctx.agent.address}")
    ctx.logger.info("")
    ctx.logger.info("This AI:")
    ctx.logger.info("  • Roasts your unrealistic expectations")
    ctx.logger.info("  • Gives you reality checks")
    ctx.logger.info("  • Actually helps you find your vibe")
    ctx.logger.info("  • Is viral-worthy on TikTok/X")
    ctx.logger.info("")
    ctx.logger.info("For 'Most Viral ASI:One Personal AI' Track")
    ctx.logger.info("=" * 60)


if __name__ == "__main__":
    print("\n✨ Starting Vibe Check AI - Your Sarcastic BFF ✨")
    print(f"📍 Agent Address: {vibe_check.address}")
    print("\nShare interactions on:")
    print("  • Twitter/X: #VibeCheckAI")
    print("  • TikTok: Demo the roasts!")
    print("  • Instagram: Screenshot the best ones\n")

    vibe_check.run()
