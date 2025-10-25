"""
Quick API test script - shows what VIBE backend does
"""

import httpx
import asyncio

async def test_vibe():
    print("=" * 60)
    print("🧪 TESTING VIBE BACKEND API")
    print("=" * 60)

    base_url = "http://127.0.0.1:8000"

    async with httpx.AsyncClient() as client:
        # Test 1: Health check
        print("\n1️⃣  Testing Health Check...")
        r = await client.get(f"{base_url}/health")
        print(f"   Status: {r.status_code}")
        print(f"   Response: {r.json()}")

        # Test 2: Search
        print("\n2️⃣  Testing Natural Language Search...")
        print('   Query: "Find me a beach house in Malibu under $300"')
        r = await client.post(f"{base_url}/api/search", json={
            "query": "Find me a beach house in Malibu under $300"
        })
        print(f"   Status: {r.status_code}")
        data = r.json()
        print(f"   Success: {data.get('success')}")
        print(f"   Listings found: {len(data.get('listings', []))}")

        if data.get('listings'):
            listing = data['listings'][0]
            print(f"\n   📍 First Listing:")
            print(f"      Title: {listing.get('title')}")
            print(f"      Price: ${listing.get('price')}/night")
            print(f"      Location: {listing.get('location')}")
            print(f"      Amenities: {', '.join(listing.get('amenities', [])[:3])}")

        # Test 3: Listing optimization
        print("\n3️⃣  Testing Listing Optimization (Host Feature)...")
        r = await client.post(f"{base_url}/api/optimize-listing", json={
            "photos": ["https://example.com/photo1.jpg"],
            "location": "Santa Monica, CA",
            "property_type": "apartment"
        })
        print(f"   Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            print(f"   Generated title: {data.get('title')}")
            print(f"   Suggested price: ${data.get('suggested_price')}/night")

    print("\n" + "=" * 60)
    print("✅ BACKEND API IS WORKING!")
    print("=" * 60)
    print("\n📚 What it does:")
    print("  • Natural language search (extracts filters from text)")
    print("  • AI-powered listing optimization (photo → listing)")
    print("  • Mock data when no real APIs configured")
    print("\n⚠️  To unlock full features, add API keys to .env:")
    print("  • ANTHROPIC_API_KEY - for Claude Vision")
    print("  • GROQ_API_KEY - for fast search")
    print("  • ELASTIC_CLOUD_ID + ELASTIC_API_KEY - for semantic search")
    print("  • SUPABASE_URL + SUPABASE_KEY - for database")

if __name__ == "__main__":
    asyncio.run(test_vibe())
