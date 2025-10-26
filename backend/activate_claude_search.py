"""
Add this to your main.py to activate Claude CSV search routes

Add this line after app initialization:
    from main_extended import add_claude_search_routes
    add_claude_search_routes(app)
"""

# Or run this standalone to test the CSV search service
import asyncio
from services.csv_search_service import CSVSearchService

async def test_search():
    service = CSVSearchService()

    print("Testing Claude CSV Search...")
    print("-" * 50)

    # Test search
    results = await service.search_with_claude(
        user_query="I want a cozy apartment for 2 people near downtown",
        location="San Francisco",
        guests=2,
        budget=200,
        limit=5
    )

    print(f"\nFound {len(results)} listings:")
    for i, listing in enumerate(results, 1):
        print(f"\n{i}. {listing['name']}")
        print(f"   ID: {listing['id']}")
        print(f"   Price: ${listing['price']}/night")
        print(f"   Accommodates: {listing['accommodates']} guests")
        print(f"   Type: {listing['property_type']}")

    # Test getting single listing
    if results:
        print("\n" + "=" * 50)
        print("Testing get_listing_by_id...")
        print("=" * 50)

        listing_id = results[0]['id']
        listing = await service.get_listing_by_id(listing_id)

        if listing:
            print(f"\nListing Details for ID: {listing_id}")
            print(f"Name: {listing['name']}")
            print(f"Description: {listing['description'][:200]}...")
            print(f"Host: {listing['host_name']}")
            print(f"Rating: {listing['rating']}")

if __name__ == "__main__":
    asyncio.run(test_search())
