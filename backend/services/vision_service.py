"""
Anthropic Claude Vision Service
Used for: Photo analysis, amenity detection, image understanding
"""

from anthropic import Anthropic
import os
import base64
from typing import List, Dict, Any
import json

class VisionService:
    def __init__(self):
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.vision_model = "claude-sonnet-4-5-20250929"  # Claude Sonnet 4.5

    async def detect_amenities(self, photos: List[str]) -> List[str]:
        """
        Analyze listing photos and detect all amenities
        Returns: List of detected amenities
        """
        all_amenities = []
        all_features = []

        for photo in photos[:10]:  # Analyze first 10 photos
            # Handle base64 or URL
            if photo.startswith('http'):
                image_source = {
                    "type": "url",
                    "url": photo
                }
            else:
                image_source = {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": photo
                }

            message = self.client.messages.create(
                model=self.vision_model,
                max_tokens=1024,
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": image_source,
                        },
                        {
                            "type": "text",
                            "text": """Analyze this property photo in detail.

Detect and list ALL amenities, features, and characteristics visible:

Categories to check:
- Room type (bedroom, kitchen, bathroom, living room, outdoor, etc.)
- Appliances (TV, refrigerator, microwave, coffee maker, etc.)
- Furniture (bed, sofa, dining table, desk, etc.)
- Technology (WiFi router, smart TV, speakers, etc.)
- Bathroom amenities (shower, bathtub, toiletries, etc.)
- Kitchen amenities (stove, oven, dishwasher, pots/pans, etc.)
- Outdoor features (pool, hot tub, BBQ, patio, garden, view, etc.)
- Style & design (modern, rustic, luxury, minimalist, etc.)
- Special features (fireplace, balcony, workspace, etc.)
- Comfort items (air conditioning, heating, fans, etc.)

Return ONLY a JSON object (no markdown):
{
  "room_type": "...",
  "amenities": ["...", "..."],
  "style": "...",
  "special_features": ["...", "..."],
  "quality_score": 1-10
}"""
                        }
                    ],
                }]
            )

            try:
                # Extract JSON from response
                content = message.content[0].text
                # Remove markdown code blocks if present
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0].strip()
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0].strip()

                result = json.loads(content)
                all_amenities.extend(result.get("amenities", []))
                all_features.extend(result.get("special_features", []))
            except:
                # If JSON parsing fails, extract text
                all_amenities.append(message.content[0].text)

        # Combine and deduplicate
        combined = list(set(all_amenities + all_features))
        return combined

    async def rank_by_relevance(
        self,
        listings: List[Dict],
        user_query: str,
        user_preferences: Dict = None
    ) -> List[Dict]:
        """
        Re-rank search results using Claude's reasoning
        """

        # Prepare listings data (take first 5 amenities only)
        listings_data = [{
            "id": l.get("id"),
            "title": l.get("title"),
            "price": l.get("price"),
            "amenities": l.get("amenities", [])[:5],
            "location": l.get("location")
        } for l in listings]

        prompt = f"""You are a recommendation expert for home rentals.

User's search query: "{user_query}"
User's past preferences: {json.dumps(user_preferences) if user_preferences else "None"}

Rank these {len(listings)} listings from most to least relevant.

Listings:
{json.dumps(listings_data, indent=2)}

Consider:
- How well each listing matches the query
- User's past preferences
- Price-to-value ratio
- Unique features that stand out
- Overall quality

Return ONLY a JSON array (no markdown) of listing IDs in ranked order with brief reasoning:
[
  {{"id": "...", "rank": 1, "reason": "..."}},
  {{"id": "...", "rank": 2, "reason": "..."}}
]"""

        message = self.client.messages.create(
            model=self.vision_model,
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}]
        )

        try:
            content = message.content[0].text
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            rankings = json.loads(content)

            # Reorder listings based on rankings
            ranked_listings = []
            for rank in rankings:
                listing = next((l for l in listings if l["id"] == rank["id"]), None)
                if listing:
                    listing["ai_rank_reason"] = rank["reason"]
                    ranked_listings.append(listing)

            return ranked_listings
        except:
            # If parsing fails, return original order
            return listings

    async def generate_ar_layout(self, photos: List[str]) -> Dict[str, Any]:
        """
        Analyze photos to generate AR room layout for Snap Spectacles
        """
        if not photos:
            return {}

        photo = photos[0]

        if photo.startswith('http'):
            image_source = {"type": "url", "url": photo}
        else:
            image_source = {"type": "base64", "media_type": "image/jpeg", "data": photo}

        message = self.client.messages.create(
            model=self.vision_model,
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": image_source,
                    },
                    {
                        "type": "text",
                        "text": """Analyze this room for AR overlay generation.

Identify:
1. Room dimensions (approximate width, depth, height in feet)
2. Key furniture pieces and their approximate positions
3. Features to highlight (fireplace, view, special amenities)
4. Suggested AR anchor points for overlays

Return ONLY JSON (no markdown):
{
  "room_type": "...",
  "dimensions": {"width": 15, "depth": 20, "height": 9},
  "furniture": [
    {"item": "bed", "position": "center-back", "size": "queen"}
  ],
  "highlight_points": [
    {"feature": "ocean view", "position": "window-left", "priority": "high"}
  ],
  "ar_anchors": [
    {"x": 0.5, "y": 0.5, "z": 0, "label": "main_feature"}
  ]
}"""
                    }
                ],
            }]
        )

        try:
            content = message.content[0].text
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            return json.loads(content)
        except:
            return {}

    async def detect_feature_positions(self, photos: List[str]) -> List[Dict]:
        """
        Detect positions of key features for AR markers
        """
        # Simplified for now - in production, use object detection models
        return [
            {"feature": "bed", "x": 0.5, "y": 0.5},
            {"feature": "window", "x": 0.8, "y": 0.3},
        ]
