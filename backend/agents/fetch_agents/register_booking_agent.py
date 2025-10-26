"""
Register VIBE Booking Agent (BookItBetty) on Agentverse
"""
import os
from uagents_core.utils.registration import register_chat_agent, RegistrationRequestCredentials

# Set environment variables
os.environ["AGENTVERSE_KEY"] = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZmV0Y2g6YWdlbnQ6YWdlbnQxcWdrejJrZDN1dGN5ZXhycWN1a3o3NWc3dzN2dWUydThueThuN2pzdGo4bWU3dWd0MHE5M2tld3U2OiIsImlhdCI6MTcyOTgzMDY4Nn0.FqYRhJzxh3uTdNXzQgC4DjO7HyODDwOUbLJZZHZeX6N-UVKMRSwJQCO4KxCL8KWdVRz4MBCFo2bNmqhH8z9E-bHUuQKQxH1TqBxsJmhp_kZFz3-nYZ0RzGhyV3WgexHZu7r7_J0RhGUxnYLjHEIjR0FI-nMoZRQOVvVQ66F15dF0XeMVF_WPy79HJPnzwLAKvxbPOZVyHOyazRxZ69OJc6cF60S2TLFUpkAiK8AZLIXHUPEBXyDMFGGZXHv1l98Y2-d5lJzfA_bxL0TInMa8Z4DWXsEyL2J8lXR70Y4-rQVrGOMn4mQZH2F3zKRvSx1H9gCCGjlYM62TxSTc_L1lZg"
os.environ["AGENT_SEED_PHRASE"] = "vibe_booking_secret_phrase"

# Register the agent
register_chat_agent(
    "booking agent",
    "http://localhost:8106/submit",
    active=True,
    credentials=RegistrationRequestCredentials(
        agentverse_api_key=os.environ["AGENTVERSE_KEY"],
        agent_seed_phrase=os.environ["AGENT_SEED_PHRASE"],
    ),
)

print("✅ Booking Agent (BookItBetty) registered successfully!")
