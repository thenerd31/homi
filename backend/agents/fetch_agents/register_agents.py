"""
Register all three Vibe agents on Agentverse
Run this script after starting the agents locally
"""
import os
from uagents_core.utils.registration import (
    register_chat_agent,
    RegistrationRequestCredentials,
)

# Agentverse API Key (same for all agents)
AGENTVERSE_KEY = "eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE3NjE0MjE3MzQsImlhdCI6MTc2MTQxODEzNCwiaXNzIjoiZmV0Y2guYWkiLCJqdGkiOiJkM2M3MGY0N2YxYzZiNzM5NDkwMzAyNzEiLCJzY29wZSI6IiIsInN1YiI6IjhkYmMwNDhiNTU3ZWUzYTdmYmM2MGEyODE2YTg1M2M3NDIxYjFkZWE1MDcxYzdlYyJ9.MyLI6wyxKvgzs5vlTO3tznpH_5lx-XXh_GaFVADsXbov_NfLB9IntG3Jg8E8dwKKNSFeTICa70uEM6WeNrrkhi-z5eHOE8HOjKCuZEMGloaaSbWEsKgO4UTEmnAhrOSygI734C4tp0iciuxlwnIPnYjYxUH26Nsv_DbtAkK47A6BybbO8vVffXQqTKMhGUH73SHAUsO34JYoTl7y3YoXvGbhYmbNWy9B4twDVfU9rUW_NmSlxLdEy4RJXNMge-5jZVMDug_AZ0CGCAyOd_bIEQ8vqY2oh5B5pnP4kIw1bCJKRHFev0IqTe4j0dZ2E5ksZ8HOrcr3Yru0MyE5C3m4PQ"

print("=" * 60)
print("🚀 Registering Vibe Agents on Agentverse")
print("=" * 60)

# Register Search Agent
print("\n🔍 Registering Search Agent...")
print("   Address: agent1qghc7aa9yhhfjuxap2j0k7l2qpjrnd0ppwtgzxqgznj25mlt9kqluvqmkft")
print("   Endpoint: https://wise-tools-drive.loca.lt/submit")

try:
    register_chat_agent(
        "Search agent",
        "https://wise-tools-drive.loca.lt/submit",
        active=True,
        credentials=RegistrationRequestCredentials(
            agentverse_api_key=AGENTVERSE_KEY,
            agent_seed_phrase="vibe_search_secret_phrase",
        ),
    )
    print("   ✅ Search Agent registered successfully!")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Register Pricing Agent
print("\n💰 Registering Pricing Agent...")
print("   Address: agent1qfsn3ug6pskuzqvzkr5yzkyvxc23yvnvrzlyp3h8v7padr99ml9s55eqctl")
print("   Endpoint: https://dull-sites-think.loca.lt/submit")

try:
    register_chat_agent(
        "Pricing agent",
        "https://dull-sites-think.loca.lt/submit",
        active=True,
        credentials=RegistrationRequestCredentials(
            agentverse_api_key=AGENTVERSE_KEY,
            agent_seed_phrase="vibe_pricing_secret_phrase",
        ),
    )
    print("   ✅ Pricing Agent registered successfully!")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Register QA Agent
print("\n💬 Registering QA Agent...")
print("   Address: agent1qgejwvz8kr0ld8f95wk74w8xqrfz5gzkrj8axf3020s2mn2sdtvqv4dvqgh")
print("   Endpoint: https://polite-hairs-play.loca.lt/submit")

try:
    register_chat_agent(
        "QA agent",
        "https://polite-hairs-play.loca.lt/submit",
        active=True,
        credentials=RegistrationRequestCredentials(
            agentverse_api_key=AGENTVERSE_KEY,
            agent_seed_phrase="vibe_qa_secret_phrase",
        ),
    )
    print("   ✅ QA Agent registered successfully!")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "=" * 60)
print("🎉 Registration Complete!")
print("=" * 60)
print("\nAgent Addresses:")
print("  Search:  agent1qghc7aa9yhhfjuxap2j0k7l2qpjrnd0ppwtgzxqgznj25mlt9kqluvqmkft")
print("  Pricing: agent1qfsn3ug6pskuzqvzkr5yzkyvxc23yvnvrzlyp3h8v7padr99ml9s55eqctl")
print("  QA:      agent1qgejwvz8kr0ld8f95wk74w8xqrfz5gzkrj8axf3020s2mn2sdtvqv4dvqgh")
print("\n📍 Visit https://agentverse.ai to verify and manage your agents")
print("=" * 60)
