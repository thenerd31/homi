"""
Generate mock listings with relevancy scores computed based on search criteria
"""
import json
import random
from typing import List, Dict, Any

# Mock listing data from existing images
LISTINGS = [
    {
        "id": "listing_1",
        "title": "Peaceful Private Room - 3 min walk to Ocean Beach",
        "location": "San Francisco, CA",
        "address": "Near Ocean Beach, San Francisco",
        "description": "Cozy private room just steps from Ocean Beach. Perfect for beach lovers and surfers. Enjoy stunning sunsets and the sound of waves.",
        "price": 150,
        "bedrooms": 1,
        "bathrooms": 1,
        "guests": 2,
        "property_type": "room",
        "amenities": ["wifi", "beach_access", "parking", "kitchen"],
        "photos": [
            "/images/golden-gateway/golden-gateway1.avif",
            "/images/golden-gateway/golden-gateway2.avif"
        ]
    },
    {
        "id": "listing_2",
        "title": "Classic Private Room in West LA",
        "location": "Los Angeles, CA",
        "address": "West Los Angeles",
        "description": "Modern private room in vibrant West LA neighborhood. Close to UCLA, shopping, and restaurants. Perfect for city explorers.",
        "price": 120,
        "bedrooms": 1,
        "bathrooms": 1,
        "guests": 2,
        "property_type": "room",
        "amenities": ["wifi", "parking", "kitchen", "air_conditioning"],
        "photos": [
            "/images/victorian-home/victorian_home1.avif",
            "/images/victorian-home/victorian_home2.avif"
        ]
    },
    {
        "id": "listing_3",
        "title": "Suite A - Azure Anticipation Luxury",
        "location": "Newport Beach, CA",
        "address": "Newport Beach Coastal Area",
        "description": "Luxurious suite with ocean views and upscale amenities. Perfect for a romantic getaway or special occasion. High-end finishes throughout.",
        "price": 280,
        "bedrooms": 1,
        "bathrooms": 1,
        "guests": 2,
        "property_type": "suite",
        "amenities": ["ocean_view", "hot_tub", "pool", "wifi", "balcony", "luxury_bedding"],
        "photos": [
            "/images/ritzy-room/ritzy-room1.avif",
            "/images/ritzy-room/ritzy-room2.avif"
        ]
    },
    {
        "id": "listing_4",
        "title": "Downtown SF Loft with City Views",
        "location": "San Francisco, CA",
        "address": "Downtown San Francisco",
        "description": "Modern loft in the heart of downtown SF. Walking distance to Union Square, Chinatown, and Financial District. Perfect for business or leisure.",
        "price": 200,
        "bedrooms": 1,
        "bathrooms": 1,
        "guests": 2,
        "property_type": "loft",
        "amenities": ["wifi", "city_view", "elevator", "gym", "parking"],
        "photos": [
            "/images/victorian-home/victorian_home3.avif",
            "/images/victorian-home/victorian_home4.avif"
        ]
    },
    {
        "id": "listing_5",
        "title": "Beachfront Villa with Private Pool",
        "location": "Malibu, CA",
        "address": "Malibu Coast",
        "description": "Stunning beachfront villa with private pool and direct beach access. Perfect for families or groups seeking luxury and privacy.",
        "price": 450,
        "bedrooms": 3,
        "bathrooms": 2,
        "guests": 6,
        "property_type": "villa",
        "amenities": ["beach_access", "pool", "hot_tub", "wifi", "ocean_view", "bbq", "parking"],
        "photos": [
            "/images/morrocan-home/morrocan-home1.avif",
            "/images/morrocan-home/morrocan-home2.avif"
        ]
    },
    {
        "id": "listing_6",
        "title": "Cozy Studio near Golden Gate Park",
        "location": "San Francisco, CA",
        "address": "Inner Sunset, San Francisco",
        "description": "Charming studio apartment near Golden Gate Park. Perfect for nature lovers and those wanting to explore SF's outdoor spaces.",
        "price": 130,
        "bedrooms": 1,
        "bathrooms": 1,
        "guests": 2,
        "property_type": "apartment",
        "amenities": ["wifi", "kitchen", "parking"],
        "photos": [
            "/images/golden-gateway/golden-gateway3.avif",
            "/images/golden-gateway/golden-gateway4.avif"
        ]
    },
    {
        "id": "listing_7",
        "title": "Modern LA Penthouse with Rooftop",
        "location": "Los Angeles, CA",
        "address": "Downtown Los Angeles",
        "description": "Luxurious penthouse with private rooftop terrace. Stunning city skyline views. Perfect for entertaining or relaxation.",
        "price": 350,
        "bedrooms": 2,
        "bathrooms": 2,
        "guests": 4,
        "property_type": "penthouse",
        "amenities": ["city_view", "rooftop", "wifi", "gym", "pool", "parking", "luxury_bedding"],
        "photos": [
            "/images/ritzy-room/ritzy-room3.avif",
            "/images/ritzy-room/ritzy-room1.avif"
        ]
    },
    {
        "id": "listing_8",
        "title": "Seaside Cottage with Garden",
        "location": "Santa Cruz, CA",
        "address": "Santa Cruz Beachfront",
        "description": "Charming seaside cottage with private garden. Steps from the beach and boardwalk. Perfect for a relaxing coastal retreat.",
        "price": 180,
        "bedrooms": 2,
        "bathrooms": 1,
        "guests": 4,
        "property_type": "cottage",
        "amenities": ["beach_access", "garden", "wifi", "kitchen", "bbq"],
        "photos": [
            "/images/morrocan-home/morrocan-home3.avif",
            "/images/victorian-home/victorian_home5.avif"
        ]
    }
]


def compute_relevancy_score(listing: Dict[str, Any], search_params: Dict[str, Any]) -> float:
    """
    Compute relevancy score (0-1) based on how well listing matches search criteria
    Higher score = better match
    """
    score = 0.0
    max_score = 0.0

    # Location match (weight: 30%)
    if search_params.get("location"):
        max_score += 0.3
        query_location = search_params["location"].lower()
        listing_location = listing["location"].lower()

        # Exact city match
        if query_location in listing_location or listing_location in query_location:
            score += 0.3
        # Partial match
        elif any(word in listing_location for word in query_location.split()):
            score += 0.15

    # Price match (weight: 20%)
    price_min = search_params.get("price_min", 0)
    price_max = search_params.get("price_max", 10000)
    max_score += 0.2

    if price_min <= listing["price"] <= price_max:
        # Perfect match
        score += 0.2
    elif listing["price"] <= price_max + 50:
        # Close match
        score += 0.1

    # Bedrooms match (weight: 15%)
    if search_params.get("bedrooms"):
        max_score += 0.15
        if listing["bedrooms"] >= search_params["bedrooms"]:
            score += 0.15
        elif listing["bedrooms"] == search_params["bedrooms"] - 1:
            score += 0.08

    # Guests match (weight: 15%)
    if search_params.get("guests"):
        max_score += 0.15
        if listing["guests"] >= search_params["guests"]:
            score += 0.15
        elif listing["guests"] == search_params["guests"] - 1:
            score += 0.08

    # Amenities match (weight: 15%)
    if search_params.get("amenities") and len(search_params["amenities"]) > 0:
        max_score += 0.15
        listing_amenities = set(listing["amenities"])
        requested_amenities = set(a.lower() for a in search_params["amenities"])

        matching_amenities = listing_amenities.intersection(requested_amenities)
        if len(requested_amenities) > 0:
            amenity_match_ratio = len(matching_amenities) / len(requested_amenities)
            score += 0.15 * amenity_match_ratio

    # Property type match (weight: 5%)
    if search_params.get("property_type"):
        max_score += 0.05
        if listing["property_type"].lower() == search_params["property_type"].lower():
            score += 0.05

    # Normalize score to 0-1 range
    if max_score > 0:
        normalized_score = score / max_score
    else:
        normalized_score = 0.5  # Default score if no criteria

    # Add small random variation to break ties (±0.02)
    normalized_score += random.uniform(-0.02, 0.02)
    normalized_score = max(0.0, min(1.0, normalized_score))

    return round(normalized_score, 3)


def generate_listings_with_scores(search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate listings with computed relevancy scores
    """
    results = []

    for listing in LISTINGS:
        # Copy listing
        result = listing.copy()

        # Compute relevancy score
        relevancy_score = compute_relevancy_score(listing, search_params)
        result["relevance_score"] = relevancy_score

        results.append(result)

    # Sort by relevancy score (highest first)
    results.sort(key=lambda x: x["relevance_score"], reverse=True)

    return results


# Example search scenarios
if __name__ == "__main__":
    # Scenario 1: Beach vacation in SF
    print("=" * 80)
    print("Scenario 1: Looking for a place near the beach in San Francisco")
    print("=" * 80)

    search_1 = {
        "location": "San Francisco",
        "amenities": ["beach_access"],
        "price_max": 200,
        "guests": 2
    }

    results_1 = generate_listings_with_scores(search_1)
    print(f"\nFound {len(results_1)} listings:\n")
    for i, listing in enumerate(results_1[:5], 1):
        print(f"{i}. {listing['title']}")
        print(f"   Location: {listing['location']}")
        print(f"   Price: ${listing['price']}/night")
        print(f"   Relevancy Score: {listing['relevance_score']:.3f}")
        print()

    # Save to file for frontend
    with open("/tmp/mock_listings_beach_sf.json", "w") as f:
        json.dump(results_1, f, indent=2)

    print(f"✅ Saved to /tmp/mock_listings_beach_sf.json\n\n")

    # Scenario 2: Luxury stay in LA
    print("=" * 80)
    print("Scenario 2: Looking for luxury accommodation in Los Angeles")
    print("=" * 80)

    search_2 = {
        "location": "Los Angeles",
        "price_min": 200,
        "price_max": 400,
        "amenities": ["pool", "city_view"],
        "bedrooms": 2
    }

    results_2 = generate_listings_with_scores(search_2)
    print(f"\nFound {len(results_2)} listings:\n")
    for i, listing in enumerate(results_2[:5], 1):
        print(f"{i}. {listing['title']}")
        print(f"   Location: {listing['location']}")
        print(f"   Price: ${listing['price']}/night")
        print(f"   Relevancy Score: {listing['relevance_score']:.3f}")
        print()

    # Save to file
    with open("/tmp/mock_listings_luxury_la.json", "w") as f:
        json.dump(results_2, f, indent=2)

    print(f"✅ Saved to /tmp/mock_listings_luxury_la.json")
