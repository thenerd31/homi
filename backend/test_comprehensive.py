"""
Comprehensive Testing - Test Each Component + Full Integration
"""

import asyncio
import sys

# Test 1: Groq Service
async def test_groq():
    print("\n" + "="*70)
    print("TEST 1: GROQ SERVICE (Fast Filter Extraction)")
    print("="*70)

    try:
        from services.groq_service import GroqService
        groq = GroqService()

        query = "Find me a beach house in Malibu under $300 with a hot tub"
        print(f"Query: '{query}'")

        filters = await groq.extract_search_filters(query)
        print(f"\n✅ GROQ WORKS!")
        print(f"Extracted filters:")
        import json
        print(json.dumps(filters, indent=2))
        return True
    except Exception as e:
        print(f"❌ GROQ FAILED: {e}")
        return False


# Test 2: Claude Vision Service
async def test_claude_vision():
    print("\n" + "="*70)
    print("TEST 2: CLAUDE VISION SERVICE (Image Analysis)")
    print("="*70)

    try:
        from services.vision_service import VisionService
        vision = VisionService()

        # Use a real Unsplash image
        photo_url = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"
        print(f"Analyzing photo: {photo_url}")

        amenities = await vision.detect_amenities([photo_url])
        print(f"\n✅ CLAUDE VISION WORKS!")
        print(f"Detected {len(amenities)} amenities:")
        print(amenities[:10])  # Show first 10
        return True
    except Exception as e:
        print(f"❌ CLAUDE VISION FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


# Test 3: Letta Service
async def test_letta():
    print("\n" + "="*70)
    print("TEST 3: LETTA SERVICE (Stateful Memory)")
    print("="*70)

    try:
        from services.letta_service import LettaService
        letta = LettaService()

        # Test user context
        user_id = "test_user_123"
        context = await letta.get_user_context(user_id)
        print(f"✅ LETTA WORKS!")
        print(f"User context: {context}")

        # Test saving search history
        await letta.update_search_history(
            user_id,
            "beach house",
            {"location": "Malibu", "price_max": 300}
        )
        print(f"Saved search history")

        # Test swipe action
        await letta.record_swipe_action(user_id, "listing_123", "like")
        print(f"Recorded swipe action")

        return True
    except Exception as e:
        print(f"❌ LETTA FAILED: {e}")
        return False


# Test 4: Elastic Client
async def test_elastic():
    print("\n" + "="*70)
    print("TEST 4: ELASTICSEARCH (Semantic Search)")
    print("="*70)

    try:
        from utils.elastic_client import ElasticClient
        elastic = ElasticClient()

        if elastic.client:
            print(f"✅ ELASTIC CONNECTED!")
            print(f"Client: {elastic.client}")

            # Test search (will use mock if no data)
            results = await elastic.semantic_search(
                query_text="beach house with pool",
                filters={"price_max": 300},
                limit=5
            )
            print(f"Search returned {len(results)} results")
        else:
            print(f"⚠️  ELASTIC MOCK MODE (no credentials)")
            results = await elastic.semantic_search(
                query_text="beach house",
                filters={},
                limit=5
            )
            print(f"Mock search returned {len(results)} results")

        return True
    except Exception as e:
        print(f"❌ ELASTIC FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


# Test 5: Supabase Client
async def test_supabase():
    print("\n" + "="*70)
    print("TEST 5: SUPABASE (Database & Storage)")
    print("="*70)

    try:
        from utils.supabase_client import SupabaseClient
        supabase = SupabaseClient()

        if supabase.client:
            print(f"✅ SUPABASE CONNECTED!")
            print(f"Client: {supabase.client}")
        else:
            print(f"⚠️  SUPABASE MOCK MODE")

        # Test create listing (mock)
        listing = await supabase.create_listing({
            "title": "Test Beach House",
            "price": 250,
            "location": "Malibu, CA"
        })
        print(f"Created listing: {listing['id']}")

        return True
    except Exception as e:
        print(f"❌ SUPABASE FAILED: {e}")
        return False


# Test 6: Full Integration - Search Flow
async def test_full_search_flow():
    print("\n" + "="*70)
    print("TEST 6: FULL SEARCH FLOW (All Components Together)")
    print("="*70)

    try:
        from services.groq_service import GroqService
        from services.letta_service import LettaService
        from utils.elastic_client import ElasticClient

        query = "Cozy cabin in Lake Tahoe under $200 with fireplace"
        user_id = "integration_test_user"

        print(f"Query: '{query}'")
        print(f"\nStep 1: Get user context (Letta)...")
        letta = LettaService()
        user_context = await letta.get_user_context(user_id)
        print(f"   User context: {user_context}")

        print(f"\nStep 2: Extract filters (Groq)...")
        groq = GroqService()
        filters = await groq.extract_search_filters(query, user_context)
        print(f"   Filters: {filters}")

        print(f"\nStep 3: Semantic search (Elastic)...")
        elastic = ElasticClient()
        listings = await elastic.semantic_search(
            query_text=query,
            filters=filters,
            limit=10
        )
        print(f"   Found {len(listings)} listings")

        print(f"\nStep 4: Update search history (Letta)...")
        await letta.update_search_history(user_id, query, filters)
        print(f"   Saved to memory")

        if listings:
            print(f"\n✅ FULL INTEGRATION WORKS!")
            print(f"\nTop Result:")
            top = listings[0]
            print(f"   Title: {top.get('title')}")
            print(f"   Price: ${top.get('price')}/night")
            print(f"   Location: {top.get('location')}")

        return True
    except Exception as e:
        print(f"❌ FULL INTEGRATION FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


# Test 7: Listing Optimization Flow
async def test_listing_optimization():
    print("\n" + "="*70)
    print("TEST 7: LISTING OPTIMIZATION FLOW (Vision + Groq)")
    print("="*70)

    try:
        from services.vision_service import VisionService
        from services.groq_service import GroqService

        photo = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"

        print(f"\nStep 1: Detect amenities (Claude Vision)...")
        vision = VisionService()
        amenities = await vision.detect_amenities([photo])
        print(f"   Detected: {amenities[:5]}")

        print(f"\nStep 2: Generate content (Groq)...")
        groq = GroqService()
        content = await groq.generate_listing_content(
            amenities=amenities,
            pricing={"suggested_price": 250}
        )
        print(f"   Title: {content.get('title')}")
        print(f"   Description: {content.get('description')[:100]}...")

        print(f"\n✅ LISTING OPTIMIZATION WORKS!")
        return True
    except Exception as e:
        print(f"❌ LISTING OPTIMIZATION FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    print("\n" + "🧪"*35)
    print("COMPREHENSIVE VIBE BACKEND TESTING")
    print("🧪"*35)

    results = {}

    # Run all tests
    results['groq'] = await test_groq()
    results['claude_vision'] = await test_claude_vision()
    results['letta'] = await test_letta()
    results['elastic'] = await test_elastic()
    results['supabase'] = await test_supabase()
    results['full_search'] = await test_full_search_flow()
    results['listing_opt'] = await test_listing_optimization()

    # Summary
    print("\n" + "="*70)
    print("FINAL RESULTS")
    print("="*70)

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for test, status in results.items():
        icon = "✅" if status else "❌"
        print(f"{icon} {test.upper()}")

    print(f"\n{passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 ALL TESTS PASSED! Ready to push to GitHub!")
    else:
        print("\n⚠️  Some tests failed. Check errors above.")

    return passed == total


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
