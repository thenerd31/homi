"""
Seed Supabase and Elasticsearch with vacation rental listings
"""

import asyncio
from generate_mock_listings import LISTINGS
from utils.supabase_client import SupabaseClient
from utils.elastic_client import ElasticClient


async def seed_elasticsearch():
    """Seed Elasticsearch with all listings"""
    print("\n🔍 Seeding Elasticsearch...")
    elastic_client = ElasticClient()

    # Ensure index exists with proper mapping
    try:
        await elastic_client.create_index_with_semantic_text()
        print("  ✓ Index created/verified")
    except Exception as e:
        print(f"  ⚠️  Index creation skipped: {e}")

    # Index all listings
    indexed = 0
    failed = 0
    for listing in LISTINGS:
        try:
            await elastic_client.index_listing(listing)
            print(f"  ✓ Indexed: {listing['title']} ({listing['location']})")
            indexed += 1
        except Exception as e:
            print(f"  ✗ Failed to index {listing['id']}: {e}")
            failed += 1

    print(f"✅ Elasticsearch seeding complete! {indexed} indexed, {failed} failed.")


async def seed_supabase():
    """Seed Supabase with all listings"""
    print("\n🗄️  Seeding Supabase...")
    supabase_client = SupabaseClient()

    # Get existing listings
    existing = await supabase_client.get_all_listings()
    existing_ids = {l['id'] for l in existing}
    print(f"  Found {len(existing_ids)} existing listings")

    # Create new listings
    inserted = 0
    skipped = 0

    for listing in LISTINGS:
        try:
            if listing['id'] in existing_ids:
                # Skip existing (Supabase client loads from mock data anyway)
                skipped += 1
                print(f"  ↻ Skipped (exists): {listing['title'][:50]}...")
            else:
                # Insert new
                await supabase_client.create_listing(listing)
                inserted += 1
                print(f"  ✓ Inserted: {listing['title'][:50]}...")
        except Exception as e:
            print(f"  ✗ Failed to save {listing['id']}: {e}")

    print(f"✅ Supabase seeding complete! {inserted} inserted, {skipped} skipped.")


async def main():
    """Run seeding for both databases"""
    print("🌱 Starting database seeding...")
    print(f"📊 Total listings to seed: {len(LISTINGS)}")
    print(f"🌎 Locations covered: {len(set(l['location'] for l in LISTINGS))} cities")

    # Run both in parallel
    await asyncio.gather(
        seed_elasticsearch(),
        seed_supabase()
    )

    print("\n✨ All done! Databases seeded successfully.")


if __name__ == "__main__":
    asyncio.run(main())
