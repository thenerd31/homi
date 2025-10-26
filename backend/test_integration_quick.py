#!/usr/bin/env python3
"""
Quick integration test for seller-listings + clean-branch features
Tests both scan features and new clean-branch additions
"""

import httpx
import asyncio

BASE_URL = "http://localhost:8000"

async def test_endpoints():
    async with httpx.AsyncClient() as client:
        tests = []

        # Test 1: Health check
        print("🏥 Testing health endpoint...")
        r = await client.get(f"{BASE_URL}/health")
        assert r.status_code == 200
        print("✅ Health check passed")
        tests.append(("Health", True))

        # Test 2: Geocoding (seller-listings feature)
        print("\n📍 Testing geocoding...")
        r = await client.get(f"{BASE_URL}/api/geocode", params={
            "location": "123 Main St, San Francisco, CA"
        })
        assert r.status_code == 200
        data = r.json()
        print(f"✅ Geocoding works: {data.get('formatted_address', 'N/A')}")
        tests.append(("Geocoding", True))

        # Test 3: AI Analysis (seller-listings feature)
        print("\n🤖 Testing AI scan analysis...")
        r = await client.post(f"{BASE_URL}/api/analyze-scan", json={
            "scan_data": {
                "amenities_detected": ["TV", "full kitchen", "seating"],
                "property_type": "apartment",
                "bedrooms": 2,
                "bathrooms": 1,
                "objects_detected": {},
                "room_breakdown": {"living_room": 5, "kitchen": 3}
            },
            "location": "San Francisco, CA"
        })
        assert r.status_code == 200
        data = r.json()
        print(f"✅ AI Analysis works!")
        print(f"   Title: {data.get('title', 'N/A')}")
        print(f"   Price: ${data.get('suggested_price', 0)}/night")
        print(f"   Amenities: {data.get('amenities', [])}")
        tests.append(("AI Analysis", True))

        # Test 4: Voice transcription
        print("\n🎤 Testing voice-to-text endpoint...")
        # Note: Requires actual audio file, just testing endpoint exists
        r = await client.post(f"{BASE_URL}/api/voice-to-text")
        # Expected to fail without file, but should not be 404
        assert r.status_code != 404
        print("✅ Voice endpoint exists")
        tests.append(("Voice Endpoint", True))

        # Test 5: Conversational search
        print("\n💬 Testing conversational search...")
        r = await client.post(f"{BASE_URL}/api/search/conversation", json={
            "user_id": "test-user",
            "message": "I want a 2 bedroom in SF",
            "conversation_history": []
        })
        assert r.status_code == 200
        data = r.json()
        print(f"✅ Search conversation works")
        print(f"   Response: {data.get('response', 'N/A')[:100]}...")
        tests.append(("Search Conversation", True))

        # Test 6: Camera scan HTML exists
        print("\n📹 Testing camera scan page...")
        r = await client.get(f"{BASE_URL}/camera_scan.html")
        assert r.status_code == 200
        print("✅ Camera scan page accessible")
        tests.append(("Camera Scan Page", True))

        # Summary
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        for name, passed in tests:
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"{status} - {name}")

        print(f"\n{len([t for t in tests if t[1]])}/{len(tests)} tests passed")
        print("\n🎉 Integration test complete!")
        print("\nYour scan features (seller-listings) + clean-branch features are working!")

if __name__ == "__main__":
    asyncio.run(test_endpoints())
