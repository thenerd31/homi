import os
from uagents_core.utils.registration import register_chat_agent, RegistrationRequestCredentials

# Set credentials
os.environ["AGENTVERSE_KEY"] = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YzA0N2IwMi0zYzViLTRjNTEtYTUwYS0xNWNhNGVkMjExNDUiLCJleHAiOjE3NzI0NzU1NzR9.eWDt1hKfhUlYMpEqw7tRdh-FBQGVWgbJBK62C0KaXBpUjczlwBiWc1g9TtNzHVJXFdqNqJZt8jlqgUcwhLgMDvjzjBtPDT_Y3QFH8KcXZTcRHjy7x8h9ZYmSpWlG3OJcUm6sGJEGFH4iYgY1OyITx9tz6DmC7L0qJ2tZFP_gPU7hMB4QC5x3yYPqUMp_qpK3Qs4TsWzK8FMb16GHfDLLZPxCrSLnkLQLLkC0j5rWOtLJpGW5CmJ4j7GQ7fxKBRVP4fK3gZg3qJL8f6fPW3pTQ7Gx8fGfQpJKLW3fGQ"
os.environ["AGENT_SEED_PHRASE"] = "vibe_pricing_secret_phrase"

# Register agent
register_chat_agent(
    "pricing agent",
    "http://localhost:8102/submit",
    active=True,
    credentials=RegistrationRequestCredentials(
        agentverse_api_key=os.environ["AGENTVERSE_KEY"],
        agent_seed_phrase=os.environ["AGENT_SEED_PHRASE"],
    ),
)

print("✅ Pricing Agent registered successfully!")
print("Check status at: https://agentverse.ai/profile")
