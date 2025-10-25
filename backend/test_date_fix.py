import httpx
import json

# Test the date extraction fix
response = httpx.post(
    "http://localhost:8000/api/search/conversation",
    json={
        "user_message": "California coast, next weekend, 3 guests, under $300",
        "user_id": "test-user-001",
        "conversation_history": [
            {"role": "user", "content": "I want a beach house"},
            {"role": "assistant", "content": "Great! Where would you like to stay?"}
        ],
        "extracted_so_far": {"property_type": "house"}
    },
    timeout=30.0
)

print("Status:", response.status_code)
print("\nResponse:")
print(json.dumps(response.json(), indent=2))
