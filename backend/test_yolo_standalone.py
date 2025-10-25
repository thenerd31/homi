"""
Standalone YOLO test - no API keys or server needed!

Usage:
    python test_yolo_standalone.py <image_url_or_path> [image_url_or_path2 ...]

Example:
    python test_yolo_standalone.py https://example.com/airbnb1.jpg
    python test_yolo_standalone.py ./bedroom.jpg ./kitchen.jpg
"""

import sys
import asyncio
import requests
from pathlib import Path
from urllib.parse import urlparse

# Import YOLO service directly
from services.yolo_service import YOLOService

def is_url(string):
    """Check if string is a URL"""
    try:
        result = urlparse(string)
        return all([result.scheme, result.netloc])
    except:
        return False

def get_image_bytes(image_source):
    """Get image bytes from URL or local file"""
    if is_url(image_source):
        print(f"📥 Downloading image from: {image_source}")
        response = requests.get(image_source)
        response.raise_for_status()
        return response.content
    else:
        print(f"📂 Reading local file: {image_source}")
        with open(image_source, 'rb') as f:
            return f.read()

async def test_single_image(yolo_service, image_source, image_num, total):
    """Test YOLO detection on a single image"""

    print("\n" + "="*70)
    print(f"🖼️  IMAGE {image_num}/{total}")
    print("="*70)

    try:
        # Get image bytes
        image_bytes = get_image_bytes(image_source)
        print(f"✅ Image loaded ({len(image_bytes)} bytes)")

        # Run YOLO detection
        print("🔄 Running YOLO detection...")
        result = await yolo_service.detect_amenities_from_image(image_bytes)

        if not result["success"]:
            print(f"❌ Detection failed: {result.get('error', 'Unknown error')}")
            return None

        # Display results
        print(f"\n✅ DETECTION SUCCESSFUL!")
        print(f"\n📐 Image Info:")
        print(f"   Size: {result['image_size']['width']}x{result['image_size']['height']} pixels")
        print(f"   Quality Score: {result['quality_score']:.1f}/100")

        print(f"\n🏠 Room Analysis:")
        print(f"   Room Type: {result['room_analysis']['room_type']}")
        print(f"   Confidence: {result['room_analysis']['confidence']:.2%}")

        print(f"\n🎯 Detected Objects ({result['total_objects']} total):")
        for detection in result['detections'][:15]:  # Show top 15
            bbox = detection['bbox']
            print(f"   • {detection['object']:20s} - confidence: {detection['confidence']:.2f}, "
                  f"size: {detection['relative_size']:.3f}, bbox: [{bbox[0]}, {bbox[1]}, {bbox[2]}, {bbox[3]}]")

        if result['total_objects'] > 15:
            print(f"   ... and {result['total_objects'] - 15} more objects")

        print(f"\n✨ Inferred Amenities ({len(result['amenities'])} total):")
        for amenity in result['amenities']:
            print(f"   • {amenity}")

        print(f"\n🏷️  Property Characteristics:")
        for key, value in result['characteristics'].items():
            status = "✓" if value else "✗"
            print(f"   {status} {key.replace('_', ' ').title()}")

        return result

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

async def test_multiple_images(yolo_service, image_sources):
    """Test YOLO on multiple images and aggregate results"""

    print("\n" + "="*70)
    print(f"🚀 Testing YOLO on {len(image_sources)} image(s)")
    print("="*70)

    all_results = []

    # Process each image
    for idx, image_source in enumerate(image_sources, 1):
        result = await test_single_image(yolo_service, image_source, idx, len(image_sources))
        if result:
            all_results.append(result)

    # If multiple images, show aggregate analysis
    if len(all_results) > 1:
        print("\n" + "="*70)
        print("📊 AGGREGATE ANALYSIS (Multiple Images)")
        print("="*70)

        # Collect all amenities
        all_amenities = set()
        all_objects = []
        room_types = []
        quality_scores = []

        for result in all_results:
            all_amenities.update(result['amenities'])
            all_objects.extend(result['detected_objects'])
            room_types.append(result['room_analysis']['room_type'])
            quality_scores.append(result['quality_score'])

        # Count rooms
        from collections import Counter
        room_counts = Counter(room_types)

        print(f"\n🛏️  Room Detection:")
        for room, count in room_counts.most_common():
            print(f"   • {room}: {count} image(s)")

        # Infer property type
        bedrooms = room_counts.get("bedroom", 0)
        bathrooms = room_counts.get("bathroom", 0)
        has_kitchen = room_counts.get("kitchen", 0) > 0

        if bedrooms >= 3:
            property_type = "Entire house"
        elif bedrooms >= 2:
            property_type = "Entire apartment"
        elif bedrooms == 1:
            property_type = "Studio apartment" if has_kitchen else "Private room"
        else:
            property_type = "Room"

        print(f"\n🏠 Inferred Property Type: {property_type}")
        print(f"   Bedrooms: {bedrooms}")
        print(f"   Bathrooms: {bathrooms}")
        print(f"   Kitchen: {'Yes' if has_kitchen else 'No'}")

        print(f"\n⭐ Average Quality Score: {sum(quality_scores)/len(quality_scores):.1f}/100")

        print(f"\n✨ All Unique Amenities ({len(all_amenities)} total):")
        for amenity in sorted(all_amenities):
            print(f"   • {amenity}")

        print(f"\n🎯 Most Common Objects:")
        object_counts = Counter(all_objects)
        for obj, count in object_counts.most_common(10):
            print(f"   • {obj}: {count}x")

    return len(all_results) == len(image_sources)

async def main():
    if len(sys.argv) < 2:
        print(__doc__)
        print("\n❌ Please provide at least one image URL or file path")
        print("\n📝 Example Airbnb image URLs to test:")
        print("   https://a0.muscache.com/im/pictures/miso/Hosting-53274539/original/ae3426d1-8a0e-4818-b102-6191ad5fb862.jpeg")
        print("   https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTEzMTA4MjU5Mzc2MjE2NDI5Mg%3D%3D/original/ae4d3c5f-b9e9-42f8-b3bc-8def400e4ab6.jpeg")
        sys.exit(1)

    image_sources = sys.argv[1:]

    print("🕶️  VIBE - Standalone YOLO Test")
    print("="*70)
    print("Initializing YOLO model...")

    try:
        # Initialize YOLO service
        yolo_service = YOLOService(model_path="yolov8n.pt")
        print("✅ YOLO model loaded successfully (yolov8n.pt)")

        # Run tests
        success = await test_multiple_images(yolo_service, image_sources)

        if success:
            print("\n" + "="*70)
            print("✅ All images processed successfully!")
            print("="*70)
        else:
            print("\n" + "="*70)
            print("⚠️  Some images failed to process")
            print("="*70)
            sys.exit(1)

    except Exception as e:
        print(f"\n❌ Failed to initialize YOLO: {str(e)}")
        print("\nMake sure ultralytics is installed:")
        print("  pip install ultralytics")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
