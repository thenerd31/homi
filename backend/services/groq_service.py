"""
Groq Service - Ultra-fast LLM inference
Used for: Real-time search filter extraction, quick content generation
"""

from groq import Groq
import os
import json
from typing import Dict, Any, List

class GroqService:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.3-70b-versatile"  # Fast and good

    async def extract_search_filters(
        self,
        query: str,
        user_history: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Extract structured filters from natural language query

        Example:
        Input: "Find me a beach house in Malibu under $300/night with hot tub"
        Output: {
            "location": "Malibu, CA",
            "price_max": 300,
            "amenities": ["hot tub", "beach access"],
            "property_type": "house"
        }
        """

        context = ""
        if user_history:
            context = f"\n\nUser's past preferences: {json.dumps(user_history)}"

        prompt = f"""You are a search query parser for a home rental platform.

Extract structured filters from this natural language query:
"{query}"{context}

Return a JSON object with these fields (only include if mentioned):
- location: string (city, region, or area)
- price_min: number (per night)
- price_max: number (per night)
- guests: number
- bedrooms: number
- bathrooms: number
- amenities: array of strings (pool, hot tub, wifi, kitchen, parking, etc.)
- property_type: string (house, apartment, villa, cabin, etc.)
- check_in: date (ISO format)
- check_out: date (ISO format)
- style: string (modern, rustic, luxury, cozy, etc.)
- special_features: array (ocean view, fireplace, balcony, etc.)

Return ONLY valid JSON, nothing else."""

        response = self.client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=self.model,
            temperature=0.1,
            response_format={"type": "json_object"}
        )

        filters = json.loads(response.choices[0].message.content)

        # Add search query for semantic search
        filters["original_query"] = query

        return filters

    async def generate_listing_content(
        self,
        amenities: List[str],
        pricing: Dict[str, Any]
    ) -> Dict[str, str]:
        """
        Generate compelling title and description for a listing
        """

        prompt = f"""You are an expert Airbnb listing writer.

Generate a compelling listing based on:

Amenities detected: {', '.join(amenities)}
Suggested price: ${pricing.get('suggested_price', 'N/A')}/night
Competitive range: ${pricing.get('price_range', {}).get('min', 'N/A')} - ${pricing.get('price_range', {}).get('max', 'N/A')}

Create:
1. A catchy title (max 50 characters) that highlights the best features
2. An engaging description (150-200 words) that:
   - Paints a vivid picture of the experience
   - Highlights unique amenities
   - Mentions nearby attractions
   - Uses emotional, inviting language
   - Ends with a call to action

Return JSON:
{{
  "title": "...",
  "description": "..."
}}"""

        response = self.client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=self.model,
            temperature=0.7,
            response_format={"type": "json_object"}
        )

        return json.loads(response.choices[0].message.content)

    async def chat_response(self, message: str, context: List[Dict] = None) -> str:
        """
        General chat response with context
        """
        messages = context or []
        messages.append({"role": "user", "content": message})

        response = self.client.chat.completions.create(
            messages=messages,
            model=self.model,
            temperature=0.7
        )

        return response.choices[0].message.content

    async def summarize_listing(self, listing_data: Dict[str, Any]) -> str:
        """
        Create a brief summary for Tinder-style cards
        """
        prompt = f"""Summarize this Airbnb listing in 2-3 short, punchy sentences for a mobile swipe interface.

Title: {listing_data.get('title', 'N/A')}
Description: {listing_data.get('description', 'N/A')}
Price: ${listing_data.get('price', 'N/A')}/night
Amenities: {', '.join(listing_data.get('amenities', []))}

Make it exciting and highlight the best parts. Be conversational."""

        response = self.client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=self.model,
            temperature=0.8
        )

        return response.choices[0].message.content
