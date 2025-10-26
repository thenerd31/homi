"""
Register ONLY the Search Agent on Agentverse
"""
import os
from uagents_core.utils.registration import (
    register_chat_agent,
    RegistrationRequestCredentials,
)

# Set environment variables
os.environ["AGENTVERSE_KEY"] = "eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE3NjE0NTQ0NzUsImlhdCI6MTc2MTQ1MDg3NSwiaXNzIjoiZmV0Y2guYWkiLCJqdGkiOiI0ZGYzMDAwZDA3ZjdkY2FlMTQ2YjczMjEiLCJzY29wZSI6IiIsInN1YiI6IjhkYmMwNDhiNTU3ZWUzYTdmYmM2MGEyODE2YTg1M2M3NDIxYjFkZWE1MDcxYzdlYyJ9.blV8DxOdWiYElYGLbHSYQBeUd4VzmgSTJ7S0lzxyJRxzyxpycTJeWY5Ro8ksLWRJe87FikNa6pP0prTktR9ONjl_YYKhKiIZ6um4JvEMKJL8KVDhlIrQkAsS2Y3Qz3eSeuIqcTqDt4sBZHOpgDvUVlOU4wBCr00SEIYGahVwSM2xBh9yWNBQcf1ezF91E2AQ9M2YsVNVLE1FeRpHHj99V9EEfPKzWuPpiyU1OlpdDhY2oC1tkl_kU8EwC1fj95y-WZZENb9MDaYT8MOpIILiRPksGIgd1dybmTjXus4VZ35IAoVYMAoTsMtfT-mHqykUeywN4ZYZiDyrB1uXybWVDA"
os.environ["AGENT_SEED_PHRASE"] = "vibe_search_secret_phrase"

print("=" * 60)
print("🔍 Registering ONLY Search Agent on Agentverse")
print("=" * 60)

try:
    register_chat_agent(
        "search agent",
        "https://wise-tools-drive.loca.lt/submit",
        active=True,
        credentials=RegistrationRequestCredentials(
            agentverse_api_key=os.environ["AGENTVERSE_KEY"],
            agent_seed_phrase=os.environ["AGENT_SEED_PHRASE"],
        ),
    )
    print("✅ Search Agent registered successfully!")
    print("   Agent Address: agent1qghc7aa9yhhfjuxap2j0k7l2qpjrnd0ppwtgzxqgznj25mlt9kqluvqmkft")
    print("   Endpoint: https://wise-tools-drive.loca.lt/submit")
except Exception as e:
    print(f"❌ Error: {e}")

print("=" * 60)
