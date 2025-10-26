"""
Direct test of geo-search functionality
"""

import asyncio
import httpx

BASE_URL = "http://localhost:8000"

async def test_geo_search_direct(location: str, property_type: str = None):
    """Directly test geo-search execute endpoint"""
    print(f"\n{'='*60}")
    print(f"Testing: {location}")
    print(f"{'='*60}")

    params = {"location": location}
    if property_type:
        params["property_type"] = property_type

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{BASE_URL}/api/search/execute",
                json={
                    "user_id": "test-user",
                    "extracted_params": params,
                    "relevance_threshold": 0.3  # Low threshold for testing
                }
            )

            if response.status_code != 200:
                print(f"   ❌ Error: {response.status_code}")
                print(f"   {response.text}")
                return

            result = response.json()
            print(f"   ✓ Search type: {result.get('search_type', 'unknown')}")
            print(f"   ✓ Radius: {result.get('radius_miles', 'N/A')} miles")
            coords = result.get('coordinates')
            if coords:
                print(f"   ✓ Coordinates: ({coords.get('lat', 'N/A'):.4f}, {coords.get('lon', 'N/A'):.4f})")
            print(f"   ✓ Total matches: {result.get('total_matches', 0)}")

            # Show all results
            matches = result.get("matches", [])
            if matches:
                print(f"\n   Results:")
                for i, listing in enumerate(matches, 1):
                    print(f"   {i}. {listing.get('title', 'Unknown')[:55]}")
                    print(f"      📍 {listing.get('location', 'N/A')}")
                    print(f"      💰 ${listing.get('price', 0)}/night")
                    print(f"      ⭐ Relevance: {listing.get('relevance_score', 0):.3f}")
                    if i < len(matches):
                        print()
            else:
                print(f"   ⚠️  No results found")

        except Exception as e:
            print(f"   ❌ Exception: {e}")


async def main():
    """Run direct geo-search tests"""

    test_cases = [
        ("Miami", None),
        ("Miami Beach", None),
        ("New York", None),
        ("San Francisco", None),
        ("Los Angeles", None),
        ("Austin", None),
        ("Seattle", None),
        ("Chicago", None),
        ("Portland", None),
        ("Denver", None),
        ("Boston", None),
        ("Nashville", None),
        ("Phoenix", None),
        ("Las Vegas", None),
        ("Honolulu", None),
    ]

    print("🧪 Direct Geo-Search Testing")
    print("=" * 60)
    print("Testing radius-based location filtering")
    print("Dataset: 40 listings across 30 US cities")
    print("=" * 60)

    for location, property_type in test_cases:
        await test_geo_search_direct(location, property_type)
        await asyncio.sleep(0.3)  # Brief pause

    print(f"\n{'='*60}")
    print("✅ Testing complete!")
    print(f"{'='*60}")


if __name__ == "__main__":
    asyncio.run(main())
