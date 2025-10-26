"""
Letta Service - Stateful Memory for Personalization
Learns user preferences, search patterns, and swipe behavior
"""

import os
from typing import Dict, Any, Optional
import json
import httpx

class LettaService:
    def __init__(self):
        self.api_key = os.getenv("LETTA_API_KEY")
        self.base_url = os.getenv("LETTA_BASE_URL", "https://api.letta.com")
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={"Authorization": f"Bearer {self.api_key}"}
        )

        # In-memory fallback if Letta not available
        self.memory_store = {}

    async def get_user_context(self, user_id: Optional[str]) -> Dict[str, Any]:
        """
        Get user's search history, preferences, and learned patterns

        Returns:
        {
            "liked_amenities": ["pool", "hot tub", "ocean view"],
            "price_range": {"min": 100, "max": 300},
            "preferred_locations": ["Malibu", "Santa Monica"],
            "search_history": [...],
            "swipe_patterns": {...}
        }
        """
        if not user_id:
            return {}

        # Try Letta API first
        try:
            response = await self.client.get(f"/agents/{user_id}/memory")
            if response.status_code == 200:
                return response.json()
        except:
            pass

        # Fallback to in-memory store
        return self.memory_store.get(user_id, {
            "liked_amenities": [],
            "price_range": {},
            "preferred_locations": [],
            "search_history": [],
            "swipe_patterns": {"likes": 0, "passes": 0}
        })

    async def update_search_history(
        self,
        user_id: Optional[str],
        query: str,
        filters: Dict[str, Any]
    ):
        """
        Store search query and extracted filters
        Learn patterns over time
        """
        if not user_id:
            return

        context = await self.get_user_context(user_id)

        # Add to search history
        if "search_history" not in context:
            context["search_history"] = []

        context["search_history"].append({
            "query": query,
            "filters": filters,
            "timestamp": "now"  # In production, use actual timestamp
        })

        # Learn preferences from filters
        if "amenities" in filters:
            if "liked_amenities" not in context:
                context["liked_amenities"] = []
            context["liked_amenities"].extend(filters["amenities"])
            # Deduplicate
            context["liked_amenities"] = list(set(context["liked_amenities"]))

        if "location" in filters:
            if "preferred_locations" not in context:
                context["preferred_locations"] = []
            if filters["location"] not in context["preferred_locations"]:
                context["preferred_locations"].append(filters["location"])

        if "price_max" in filters or "price_min" in filters:
            if "price_range" not in context:
                context["price_range"] = {}
            if "price_max" in filters:
                context["price_range"]["max"] = filters["price_max"]
            if "price_min" in filters:
                context["price_range"]["min"] = filters["price_min"]

        # Save updated context
        await self._save_context(user_id, context)

    async def record_swipe_action(
        self,
        user_id: str,
        listing_id: str,
        action: str  # "like" or "pass"
    ):
        """
        Learn from swipe behavior
        Track what users like/pass to improve recommendations
        """
        context = await self.get_user_context(user_id)

        # Initialize swipe patterns
        if "swipe_patterns" not in context:
            context["swipe_patterns"] = {"likes": 0, "passes": 0}

        if action == "like":
            context["swipe_patterns"]["likes"] += 1

            # Track liked listings
            if "liked_listings" not in context:
                context["liked_listings"] = []
            context["liked_listings"].append(listing_id)

        elif action == "pass":
            context["swipe_patterns"]["passes"] += 1

            # Track passed listings
            if "passed_listings" not in context:
                context["passed_listings"] = []
            context["passed_listings"].append(listing_id)

        # Calculate engagement score
        total_swipes = context["swipe_patterns"]["likes"] + context["swipe_patterns"]["passes"]
        if total_swipes > 0:
            context["engagement_score"] = context["swipe_patterns"]["likes"] / total_swipes

        await self._save_context(user_id, context)

    async def get_personalized_filters(self, user_id: str, base_query: str) -> Dict[str, Any]:
        """
        Enhance search filters based on learned preferences

        Example:
        User always likes pools → add "pool" to amenities filter
        User's average price is $200 → suggest similar range
        """
        context = await self.get_user_context(user_id)

        personalized = {}

        # Add frequently liked amenities
        if context.get("liked_amenities"):
            # Get top 3 most common amenities
            personalized["suggested_amenities"] = context["liked_amenities"][:3]

        # Suggest price range based on history
        if context.get("price_range"):
            personalized["suggested_price_range"] = context["price_range"]

        # Suggest locations
        if context.get("preferred_locations"):
            personalized["suggested_locations"] = context["preferred_locations"]

        return personalized

    async def _save_context(self, user_id: str, context: Dict[str, Any]):
        """
        Save user context to Letta or in-memory store
        """
        try:
            # Try Letta API
            response = await self.client.post(
                f"/agents/{user_id}/memory",
                json=context
            )
            if response.status_code in [200, 201]:
                return
        except:
            pass

        # Fallback to in-memory
        self.memory_store[user_id] = context

    async def health(self) -> bool:
        """Health check"""
        # Check if API key is configured
        if not self.api_key:
            return True  # In-memory mode always available

        try:
            async with httpx.AsyncClient() as client:
                # Letta health endpoint: GET /v1/health/
                response = await client.get(
                    f"{self.base_url}/v1/health/",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=5.0
                )
                return response.status_code == 200
        except:
            return True  # In-memory fallback always works
