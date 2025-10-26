"""
CSV Search Service - Claude-powered listing search from CSV files

Uses Claude to intelligently match user preferences with CSV data
"""

import os
import csv
import anthropic
from typing import List, Dict, Any, Optional
import json

class CSVSearchService:
    """Search listings from CSV files using Claude for intelligent matching"""

    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        self.client = anthropic.Anthropic(api_key=api_key) if api_key else None

        # Path to CSV datasets
        self.csv_base_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "frontend", "public", "datasets"
        )

        # Mapping of locations to CSV files
        self.location_csv_map = {
            "san francisco": "sf_listings.csv",
            "sf": "sf_listings.csv",
            "los angeles": "la_listings.csv",
            "la": "la_listings.csv",
            "seattle": "seattle_listings.csv",
            "hawaii": "hawaii.csv",
            "denver": "denver_listings.csv",
            "dallas": "dtx_listings.csv",
            "austin": "atx_listings.csv",
            "chicago": "chi_listings.csv",
            "boston": "bos_listings.csv",
        }

    def _load_csv_data(self, location: Optional[str] = None) -> List[Dict[str, Any]]:
        """Load listings from CSV file(s)"""

        csv_files = []

        if location:
            # Find matching CSV file for location
            location_lower = location.lower()
            for loc_key, csv_file in self.location_csv_map.items():
                if loc_key in location_lower or location_lower in loc_key:
                    csv_files.append(csv_file)
                    break

        # If no specific location or not found, load all CSV files
        if not csv_files:
            csv_files = list(set(self.location_csv_map.values()))

        all_listings = []

        for csv_file in csv_files:
            csv_path = os.path.join(self.csv_base_path, csv_file)

            if not os.path.exists(csv_path):
                print(f"Warning: CSV file not found: {csv_path}")
                continue

            try:
                with open(csv_path, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        # Extract key fields
                        listing = {
                            "id": row.get("id", ""),
                            "name": row.get("name", ""),
                            "description": row.get("description", ""),
                            "picture_url": row.get("picture_url", ""),
                            "host_name": row.get("host_name", ""),
                            "host_location": row.get("host_location", ""),
                            "host_picture_url": row.get("host_picture_url", ""),
                            "amenities": row.get("amenities", ""),
                            "price": row.get("price", "$0"),
                            "property_type": row.get("property_type", ""),
                            "room_type": row.get("room_type", ""),
                            "accommodates": row.get("accommodates", "0"),
                            "bedrooms": row.get("bedrooms", "0"),
                            "beds": row.get("beds", "0"),
                            "bathrooms_text": row.get("bathrooms_text", ""),
                            "neighbourhood_cleansed": row.get("neighbourhood_cleansed", ""),
                            "latitude": row.get("latitude", ""),
                            "longitude": row.get("longitude", ""),
                            "review_scores_rating": row.get("review_scores_rating", ""),
                            "number_of_reviews": row.get("number_of_reviews", "0"),
                        }
                        all_listings.append(listing)

            except Exception as e:
                print(f"Error reading CSV {csv_file}: {e}")

        return all_listings

    async def search_with_claude(
        self,
        user_query: str,
        location: Optional[str] = None,
        guests: Optional[int] = None,
        budget: Optional[float] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Use Claude to intelligently search and rank listings from CSV data

        Args:
            user_query: Natural language query
            location: Desired location
            guests: Number of guests
            budget: Maximum price per night
            limit: Number of results to return

        Returns:
            List of matched listings
        """

        if not self.client:
            print("Warning: Anthropic API key not found, returning mock data")
            return self._get_mock_listings()

        # Load CSV data
        all_listings = self._load_csv_data(location)

        if not all_listings:
            print("No listings found in CSV files")
            return []

        # Filter by basic criteria first to reduce data sent to Claude
        filtered_listings = self._basic_filter(all_listings, guests, budget)

        # If we have too many listings, take a sample
        if len(filtered_listings) > 200:
            # Take top 200 based on reviews
            filtered_listings = sorted(
                filtered_listings,
                key=lambda x: int(x.get("number_of_reviews", "0") or "0"),
                reverse=True
            )[:200]

        # Create a condensed version for Claude
        condensed_listings = []
        for i, listing in enumerate(filtered_listings):
            condensed_listings.append({
                "index": i,
                "id": listing["id"],
                "name": listing["name"],
                "description": listing["description"][:300] if listing["description"] else "",  # Truncate
                "price": listing["price"],
                "property_type": listing["property_type"],
                "accommodates": listing["accommodates"],
                "bedrooms": listing["bedrooms"],
                "amenities_preview": listing["amenities"][:200] if listing["amenities"] else "",  # Truncate
                "rating": listing["review_scores_rating"],
            })

        # Ask Claude to rank the listings
        prompt = f"""You are a travel assistant helping match users with the perfect Airbnb listing.

User Query: "{user_query}"
Location: {location or "Any"}
Number of Guests: {guests or "Any"}
Budget (max per night): ${budget or "Any"}

Here are {len(condensed_listings)} listings to choose from (in JSON format):

{json.dumps(condensed_listings, indent=2)}

Please analyze these listings and return the indices of the top {limit} listings that best match the user's query, ordered from best to worst match.

Consider:
- How well the listing matches the user's stated preferences
- Price value relative to features
- Property type and amenities
- Guest capacity
- Overall quality (ratings)

Return ONLY a JSON array of indices (numbers), nothing else. Example: [5, 12, 3, 8, 15]
"""

        try:
            # Call Claude
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            # Parse response
            response_text = message.content[0].text.strip()

            # Extract JSON array from response
            selected_indices = json.loads(response_text)

            # Get the selected listings in order
            results = []
            for idx in selected_indices[:limit]:
                if 0 <= idx < len(filtered_listings):
                    results.append(self._format_listing(filtered_listings[idx]))

            return results

        except Exception as e:
            print(f"Error calling Claude for search: {e}")
            # Fallback to simple filtering
            return [self._format_listing(listing) for listing in filtered_listings[:limit]]

    def _basic_filter(
        self,
        listings: List[Dict[str, Any]],
        guests: Optional[int] = None,
        budget: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """Apply basic filtering before sending to Claude"""

        filtered = listings

        # Filter by guest capacity
        if guests:
            filtered = [
                listing for listing in filtered
                if int(listing.get("accommodates", "0") or "0") >= guests
            ]

        # Filter by budget
        if budget:
            filtered = [
                listing for listing in filtered
                if self._parse_price(listing.get("price", "$0")) <= budget
            ]

        return filtered

    def _parse_price(self, price_str: str) -> float:
        """Parse price string like '$150.00' to float"""
        try:
            # Remove $ and commas, convert to float
            return float(price_str.replace("$", "").replace(",", ""))
        except:
            return 0.0

    def _format_listing(self, listing: Dict[str, Any]) -> Dict[str, Any]:
        """Format listing for API response"""

        # Parse price
        price = self._parse_price(listing.get("price", "$0"))

        # Parse amenities from string like '["WiFi", "Kitchen"]' to list
        amenities = []
        try:
            amenities_str = listing.get("amenities", "")
            if amenities_str:
                amenities = json.loads(amenities_str.replace("'", '"'))
        except:
            pass

        return {
            "id": listing["id"],
            "name": listing["name"],
            "description": listing["description"],
            "picture_url": listing["picture_url"],
            "host_name": listing["host_name"],
            "host_location": listing["host_location"],
            "host_picture_url": listing["host_picture_url"],
            "amenities": amenities,
            "price": price,
            "property_type": listing["property_type"],
            "room_type": listing["room_type"],
            "accommodates": int(listing.get("accommodates", "0") or "0"),
            "bedrooms": int(float(listing.get("bedrooms", "0") or "0")),
            "beds": int(float(listing.get("beds", "0") or "0")),
            "bathrooms_text": listing["bathrooms_text"],
            "neighbourhood": listing["neighbourhood_cleansed"],
            "latitude": listing["latitude"],
            "longitude": listing["longitude"],
            "rating": float(listing.get("review_scores_rating", "0") or "0"),
            "number_of_reviews": int(listing.get("number_of_reviews", "0") or "0"),
        }

    async def get_listing_by_id(self, listing_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific listing by ID from CSV files"""

        # Load all listings from all CSV files
        all_listings = self._load_csv_data(location=None)

        # Find the listing with matching ID
        for listing in all_listings:
            if listing["id"] == listing_id:
                return self._format_listing(listing)

        return None

    def _get_mock_listings(self) -> List[Dict[str, Any]]:
        """Return mock listings when API is not available"""
        return [
            {
                "id": "mock_1",
                "name": "Mock Listing 1",
                "description": "A beautiful place to stay",
                "picture_url": "/images/golden-gateway/golden-gateway1.avif",
                "host_name": "John Doe",
                "host_location": "San Francisco, CA",
                "host_picture_url": "/images/stock_pfp.webp",
                "amenities": ["WiFi", "Kitchen", "TV"],
                "price": 150,
                "property_type": "Entire apartment",
                "room_type": "Entire home/apt",
                "accommodates": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms_text": "2 baths",
                "neighbourhood": "Downtown",
                "latitude": "37.7749",
                "longitude": "-122.4194",
                "rating": 4.8,
                "number_of_reviews": 50,
            }
        ]
