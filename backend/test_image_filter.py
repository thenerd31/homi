import httpx
import json

# Test image filtering with sample Unsplash photos
test_photos = [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",  # Modern house exterior
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",  # Living room
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",  # Kitchen
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",  # Bedroom
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",  # Bathroom
]

print("Testing Image Quality Filtering Service\n")
print("=" * 60)

# Test 1: Filter photos
print("\n1. Testing /api/filter-photos with 5 sample images...")

response = httpx.post(
    "http://localhost:8000/api/filter-photos",
    json={
        "photo_urls": test_photos,
        "max_photos": 3
    },
    timeout=60.0
)

print(f"Status: {response.status_code}")

if response.status_code == 200:
    result = response.json()
    print(f"\n✅ Analysis complete!")
    print(f"\nTotal analyzed: {result['total_analyzed']}")
    print(f"Total selected: {result['total_selected']}")

    print(f"\n📸 Selected Photos ({len(result['selected_photos'])}):")
    for photo in result['selected_photos']:
        print(f"\n  Rank #{photo['rank']}")
        print(f"  Quality: {photo['quality_score']:.2f}")
        print(f"  Room: {photo['room_type']}")
        print(f"  Reason: {photo['reason']}")
        print(f"  URL: {photo['url'][:60]}...")

    print(f"\n🏠 Room Coverage:")
    for room, count in result['room_coverage'].items():
        print(f"  {room}: {count} photo(s)")

    if result['rejected_photos']:
        print(f"\n❌ Rejected Photos ({len(result['rejected_photos'])}):")
        for photo in result['rejected_photos'][:3]:
            print(f"  - {photo['reason']}")

else:
    print(f"❌ Error: {response.text}")

# Test 2: Quick quality check
print("\n\n" + "=" * 60)
print("\n2. Testing /api/check-photo-quality (single photo)...")

response2 = httpx.post(
    "http://localhost:8000/api/check-photo-quality",
    json={
        "photo_url": test_photos[0]
    },
    timeout=30.0
)

print(f"Status: {response2.status_code}")

if response2.status_code == 200:
    result2 = response2.json()
    print(f"\n✅ Quality check complete!")
    print(f"  Accept: {'✅ Yes' if result2['accept'] else '❌ No'}")
    print(f"  Quality Score: {result2['quality_score']:.2f}")
    if result2['issues']:
        print(f"  Issues: {', '.join(result2['issues'])}")
    if result2['suggestion']:
        print(f"  Suggestion: {result2['suggestion']}")
else:
    print(f"❌ Error: {response2.text}")

print("\n" + "=" * 60)
print("\n✅ Image filtering tests complete!")
