import httpx
import json

print("Testing Frontend-Backend Integration")
print("=" * 60)

# Test 1: Conversational Search - Initial message
print("\n1. Testing conversational search (first message)...")

response = httpx.post(
    "http://localhost:8000/api/search/conversation",
    json={
        "user_message": "I'm looking for a place in San Francisco for next weekend",
        "user_id": "test-user-integration",
        "conversation_history": [],
        "extracted_so_far": {}
    },
    timeout=30.0
)

print(f"Status: {response.status_code}")
if response.status_code == 200:
    result = response.json()
    print(f"\nStatus: {result['status']}")
    print(f"Message: {result['message']}")
    print(f"Extracted: {json.dumps(result['extracted_params'], indent=2)}")
    print(f"Missing: {result['missing_params']}")

    # Test 2: Follow-up message
    print("\n\n2. Testing conversational search (follow-up)...")

    response2 = httpx.post(
        "http://localhost:8000/api/search/conversation",
        json={
            "user_message": "2 people, and I can spend up to $300 per night",
            "user_id": "test-user-integration",
            "conversation_history": [
                {"role": "user", "content": "I'm looking for a place in San Francisco for next weekend"},
                {"role": "assistant", "content": result['message']}
            ],
            "extracted_so_far": result['extracted_params']
        },
        timeout=30.0
    )

    print(f"Status: {response2.status_code}")
    if response2.status_code == 200:
        result2 = response2.json()
        print(f"\nStatus: {result2['status']}")
        print(f"Message: {result2['message']}")
        print(f"Extracted: {json.dumps(result2['extracted_params'], indent=2)}")
        print(f"Missing: {result2['missing_params']}")

        # Test 3: If ready, execute search
        if result2['status'] == 'ready_to_search':
            print("\n\n3. Executing search with extracted params...")

            response3 = httpx.post(
                "http://localhost:8000/api/search/execute",
                json={
                    "extracted_params": result2['extracted_params'],
                    "user_id": "test-user-integration"
                },
                timeout=30.0
            )

            print(f"Status: {response3.status_code}")
            if response3.status_code == 200:
                result3 = response3.json()
                print(f"\nSuccess: {result3['success']}")
                print(f"Total matches: {result3['total_matches']}")
                print(f"Returned: {len(result3['matches'])} listings")
                if result3['matches']:
                    print(f"\nFirst match: {result3['matches'][0].get('title', 'N/A')}")
else:
    print(f"Error: {response.text}")

# Test 4: Swipe endpoint
print("\n\n" + "=" * 60)
print("\n4. Testing swipe endpoint...")

response4 = httpx.post(
    "http://localhost:8000/api/swipe",
    json={
        "user_id": "test-user-integration",
        "listing_id": "listing-1",
        "action": "like"
    },
    timeout=10.0
)

print(f"Status: {response4.status_code}")
if response4.status_code == 200:
    result4 = response4.json()
    print(f"Success: {result4['success']}")
    print(f"Message: {result4['message']}")
else:
    print(f"Error: {response4.text}")

# Test 5: Get saved listings
print("\n\n5. Testing saved listings endpoint...")

response5 = httpx.get(
    "http://localhost:8000/api/saved-listings/test-user-integration",
    timeout=10.0
)

print(f"Status: {response5.status_code}")
if response5.status_code == 200:
    result5 = response5.json()
    print(f"Success: {result5['success']}")
    print(f"Total saved: {result5['total']}")
    if result5['saved_listings']:
        print(f"First saved: {result5['saved_listings'][0].get('listing_id', 'N/A')}")
else:
    print(f"Error: {response5.text}")

print("\n" + "=" * 60)
print("Integration tests complete!")
