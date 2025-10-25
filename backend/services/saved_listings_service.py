"""
Saved Listings Service
Auto-organizes saved listings by relevance and learned preferences
"""

import os
from typing import Dict, Any, List
import json
from anthropic import Anthropic

class SavedListingsService:
    """
    Manages user's saved listings (swipe-right properties)

    Features:
    - Retrieves all liked listings
    - Re-ranks using AI based on:
      * Original search relevance
      * Learned preferences from swipe patterns
      * Availability
      * Price changes
    - Provides reasoning for each ranking
    """

    def __init__(self):
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.model = "claude-sonnet-4-5-20250929"

    async def get_and_rank_saved_listings(
        self,
        user_id: str,
        saved_listings: List[Dict[str, Any]],
        user_preferences: Dict[str, Any] = {},
        original_search_query: str = ""
    ) -> List[Dict[str, Any]]:
        """
        Re-rank saved listings using AI reasoning

        Args:
            user_id: User ID
            saved_listings: List of listings user swiped right on
            user_preferences: Learned preferences from Letta
            original_search_query: User's original search query

        Returns:
            List of listings sorted by relevance with rank_reason
        """

        if not saved_listings:
            return []

        # Prepare listing data for Claude (simplified for token efficiency)
        listings_for_ranking = []
        for listing in saved_listings[:50]:  # Limit to 50 for performance
            listings_for_ranking.append({
                "id": listing.get("id"),
                "title": listing.get("title"),
                "price": listing.get("price"),
                "location": listing.get("location"),
                "amenities": listing.get("amenities", [])[:5],  # Top 5 amenities
                "original_relevance": listing.get("relevance_score", 0.5),
                "bedrooms": listing.get("bedrooms"),
                "property_type": listing.get("property_type")
            })

        # Build ranking prompt
        prompt = f"""You are a travel recommendation expert helping organize a user's saved vacation rentals.

**User's Original Search:**
"{original_search_query}"

**User's Learned Preferences (from past behavior):**
{json.dumps(user_preferences, indent=2) if user_preferences else "No historical data yet"}

**Saved Listings to Rank:**
{json.dumps(listings_for_ranking, indent=2)}

Your task:
1. Rank these listings from MOST to LEAST relevant for this user
2. Consider:
   - How well they match the original search
   - User's learned preferences (liked amenities, price patterns, locations)
   - Original relevance scores
   - Price-to-value ratio
   - Unique features that stand out

Return ONLY a JSON array of listings in ranked order with brief reasoning:

[
  {{
    "id": "listing-123",
    "rank": 1,
    "rank_reason": "Perfect match for beach preference with pool amenity you've liked before. Great price at $280."
  }},
  {{
    "id": "listing-456",
    "rank": 2,
    "rank_reason": "Matches location preference but lacks pool. Still good value."
  }}
]

IMPORTANT:
- Rank ALL {len(listings_for_ranking)} listings
- Keep reasoning concise (1-2 sentences max)
- Focus on WHY this listing is ranked here
- Consider both search relevance AND learned preferences
"""

        try:
            # Get ranking from Claude
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )

            response_text = response.content[0].text

            # Parse JSON
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            rankings = json.loads(response_text)

            # Merge rankings with full listing data
            ranked_listings = []
            ranking_map = {r["id"]: r for r in rankings}

            for listing in saved_listings:
                listing_id = listing.get("id")
                if listing_id in ranking_map:
                    ranking_info = ranking_map[listing_id]
                    listing["rank"] = ranking_info["rank"]
                    listing["rank_reason"] = ranking_info["rank_reason"]
                    ranked_listings.append(listing)

            # Sort by rank
            ranked_listings.sort(key=lambda x: x.get("rank", 999))

            return ranked_listings

        except Exception as e:
            print(f"Ranking error: {e}")
            # Fallback: sort by original relevance score
            return sorted(
                saved_listings,
                key=lambda x: x.get("relevance_score", 0),
                reverse=True
            )

    async def get_top_matches(
        self,
        saved_listings: List[Dict[str, Any]],
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Get top N matches with highest relevance
        Quick filter without full re-ranking
        """
        sorted_listings = sorted(
            saved_listings,
            key=lambda x: x.get("relevance_score", 0),
            reverse=True
        )
        return sorted_listings[:limit]

    async def filter_by_availability(
        self,
        saved_listings: List[Dict[str, Any]],
        check_in: str = None,
        check_out: str = None
    ) -> List[Dict[str, Any]]:
        """
        Filter saved listings by availability
        (Placeholder - would integrate with calendar system)
        """
        # TODO: Implement actual calendar check
        # For now, assume all are available
        for listing in saved_listings:
            listing["availability"] = "available"

        return saved_listings

    async def detect_price_changes(
        self,
        saved_listings: List[Dict[str, Any]],
        user_id: str
    ) -> List[Dict[str, Any]]:
        """
        Detect if any saved listings have price changes
        (Placeholder - would track historical prices)
        """
        # TODO: Implement price tracking
        # For now, no changes detected
        for listing in saved_listings:
            listing["price_change"] = None

        return saved_listings

    async def health(self) -> bool:
        """Health check"""
        return True
