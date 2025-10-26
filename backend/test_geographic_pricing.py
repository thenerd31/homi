"""
Test Geographic Pricing with Dynamic Pricing
Tests the new geographic analysis and justification features
"""

import asyncio
import sys
from services.pricing_service import PricingService
from datetime import datetime, timedelta

async def test_geographic_pricing():
    print("=" * 80)
    print("TESTING GEOGRAPHIC PRICING WITH CLAUDE")
    print("=" * 80)

    service = PricingService()

    # Test different locations
    test_locations = [
        {
            "location": "Venice Beach, Los Angeles, CA",
            "property_type": "apartment",
            "amenities": ["wifi", "kitchen", "pool", "ocean view"],
            "bedrooms": 2,
            "bathrooms": 2
        },
        {
            "location": "Rural Montana",
            "property_type": "cabin",
            "amenities": ["wifi", "fireplace", "mountain view"],
            "bedrooms": 3,
            "bathrooms": 1
        },
        {
            "location": "Downtown Manhattan, New York, NY",
            "property_type": "apartment",
            "amenities": ["wifi", "kitchen", "doorman", "gym"],
            "bedrooms": 1,
            "bathrooms": 1
        }
    ]

    # Test dates
    start_date = (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d")
    end_date = (datetime.now() + timedelta(days=21)).strftime("%Y-%m-%d")

    for idx, listing in enumerate(test_locations, 1):
        print(f"\n{'=' * 80}")
        print(f"TEST {idx}: {listing['location']}")
        print(f"{'=' * 80}")
        print(f"Property Type: {listing['property_type']}")
        print(f"Amenities: {', '.join(listing['amenities'])}")
        print(f"Date Range: {start_date} to {end_date}")
        print()

        # Get dynamic pricing with geographic analysis
        try:
            result = await service.analyze_dynamic_pricing_for_dates(
                listing_data=listing,
                date_range_start=start_date,
                date_range_end=end_date,
                elastic_client=None  # No Elasticsearch for this test
            )

            # Display geographic analysis
            if result.get("geographic_analysis"):
                geo = result["geographic_analysis"]
                print("🌍 GEOGRAPHIC ANALYSIS:")
                print(f"  Multiplier: {geo['multiplier']}x")
                print(f"  Reasoning: {geo['reasoning']}")
                print(f"  Key Factors: {', '.join(geo['factors'])}")
                print()

            # Display pricing summary
            summary = result["summary"]
            print("💰 PRICING SUMMARY:")
            print(f"  Average Price: ${summary['avg_price']}")
            print(f"  Price Range: ${summary['min_price']} - ${summary['max_price']}")
            print(f"  Total Revenue (7 nights): ${summary['total_revenue_estimate']}")
            print()

            # Display pricing justification
            if result.get("pricing_justification"):
                print("📋 PRICING JUSTIFICATION:")
                print("-" * 80)
                print(result["pricing_justification"])
                print("-" * 80)
                print()

            # Show sample daily prices
            print("📅 SAMPLE DAILY PRICES:")
            for day in result["daily_prices"][:3]:  # First 3 days
                multipliers_str = ", ".join([f"{k}: {v}x" for k, v in day["multipliers"].items()])
                print(f"  {day['date']} ({day['day_of_week']}): ${day['final_price']}")
                print(f"    Base: ${day['base_price']} | {multipliers_str}")
                print(f"    Reason: {day['reasoning']}")

            if len(result["daily_prices"]) > 3:
                print(f"  ... and {len(result['daily_prices']) - 3} more days")

            print()

        except Exception as e:
            print(f"❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
            print()

    print("=" * 80)
    print("✅ TESTING COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    print("\nStarting geographic pricing test...")
    print("This will use Claude to analyze locations and generate pricing.\n")
    asyncio.run(test_geographic_pricing())
