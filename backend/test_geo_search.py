"""
Test geo-search functionality with different locations
"""

import asyncio
import httpx

BASE_URL = "http://localhost:8000"

async def test_geo_search(location: str, query: str = ""):
    """Test geo-search for a specific location"""
    print(f"\n{'='*60}")
    print(f"Testing: {location}")
    print(f"{'='*60}")

    # Simulate conversational search flow
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Step 1: Start conversation
        response = await client.post(
            f"{BASE_URL}/api/search/conversation",
            json={
                "user_id": "test-user",
                "message": f"{query} in {location}" if query else f"Find me a place in {location}"
            }
        )

        result = response.json()
        print(f"\n1. Conversation response:")
        print(f"   - Complete: {result.get('search_complete')}")
        print(f"   - Response: {result.get('assistant_response', 'N/A')[:100]}...")

        if result.get("search_complete"):
            # Step 2: Execute search
            execute_response = await client.post(
                f"{BASE_URL}/api/search/execute",
                json={
                    "user_id": "test-user",
                    "extracted_params": result.get("extracted_params", {}),
                    "relevance_threshold": 0.5  # Lower threshold for testing
                }
            )

            execute_result = execute_response.json()
            print(f"\n2. Search execution:")
            print(f"   - Search type: {execute_result.get('search_type', 'unknown')}")
            print(f"   - Radius: {execute_result.get('radius_miles', 'N/A')} miles")
            print(f"   - Coordinates: {execute_result.get('coordinates', 'N/A')}")
            print(f"   - Total matches: {execute_result.get('total_matches', 0)}")

            # Show top 3 results
            matches = execute_result.get("matches", [])
            if matches:
                print(f"\n3. Top results:")
                for i, listing in enumerate(matches[:3], 1):
                    print(f"   {i}. {listing.get('title', 'Unknown')[:60]}")
                    print(f"      Location: {listing.get('location', 'N/A')}")
                    print(f"      Price: ${listing.get('price', 0)}/night")
                    print(f"      Relevance: {listing.get('relevance_score', 0):.2f}")
            else:
                print(f"\n3. No results found")


async def main():
    """Run geo-search tests for multiple locations"""

    test_cases = [
        ("Miami", "beachfront property"),
        ("New York", "luxury apartment"),
        ("San Francisco", "cozy studio"),
        ("Austin", ""),
        ("Seattle", "modern condo"),
        ("Chicago", "downtown loft"),
        ("Portland", ""),
        ("Denver", "mountain view"),
        ("Boston", "historic"),
        ("Nashville", ""),
    ]

    print("🧪 Geo-Search Testing")
    print("Testing radius-based location filtering with expanded dataset")

    for location, query in test_cases:
        try:
            await test_geo_search(location, query)
            await asyncio.sleep(0.5)  # Brief pause between requests
        except Exception as e:
            print(f"\n❌ Error testing {location}: {e}")

    print(f"\n{'='*60}")
    print("✅ Testing complete!")
    print(f"{'='*60}")


if __name__ == "__main__":
    asyncio.run(main())
