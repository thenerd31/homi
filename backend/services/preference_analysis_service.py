"""
Multimodal Preference Analysis Service
Analyzes images of places users like to extract search preferences
Uses Claude Vision to understand style, amenities, and vibes
"""

import os
from typing import List, Dict, Any
from anthropic import Anthropic
import base64
import httpx


class PreferenceAnalysisService:
    """
    Analyzes user-uploaded preference images to extract search criteria

    Features:
    - Style detection (modern, rustic, beachy, urban, etc.)
    - Amenity detection (pool, kitchen, fireplace, etc.)
    - Vibe/atmosphere analysis (cozy, luxurious, minimalist, etc.)
    - Location preferences (urban, suburban, coastal, etc.)
    - Extracts searchable parameters from visual preferences
    """

    def __init__(self):
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.model = "claude-sonnet-4-5-20250929"

    async def analyze_preference_images(
        self,
        image_urls: List[str],
        text_description: str = ""
    ) -> Dict[str, Any]:
        """
        Analyze user's preference images to extract search parameters

        Args:
            image_urls: List of image URLs showing places the user likes
            text_description: Optional text description from user

        Returns:
            {
                "extracted_preferences": {
                    "style": ["modern", "minimalist"],
                    "amenities": ["pool", "open_kitchen", "natural_light"],
                    "atmosphere": ["bright", "spacious", "cozy"],
                    "location_type": "coastal",
                    "property_type": "house",
                    "must_haves": ["outdoor_space", "modern_kitchen"]
                },
                "search_query": "Modern coastal house with pool and open kitchen",
                "reasoning": "Based on the images, you prefer..."
            }
        """

        # Build analysis prompt
        prompt = f"""You are an AI real estate assistant analyzing images of places the user loves.

{'User Description: ' + text_description if text_description else ''}

Analyze these {len(image_urls)} images and extract the user's housing preferences:

1. **Style & Aesthetic**:
   - What architectural style? (modern, traditional, rustic, industrial, beachy, etc.)
   - Design aesthetic? (minimalist, maximalist, cozy, luxurious, etc.)

2. **Key Amenities**:
   - What features are prominent? (pool, fireplace, large kitchen, outdoor space, etc.)
   - Special features? (high ceilings, natural light, ocean view, etc.)

3. **Atmosphere & Vibe**:
   - Overall feeling? (bright, cozy, spacious, intimate, etc.)
   - Color palette preferences?

4. **Location Type**:
   - Urban, suburban, coastal, mountain, countryside?
   - City loft vs beach house vs mountain cabin?

5. **Property Type**:
   - House, apartment, villa, cottage, studio?

Return ONLY JSON in this format:
{{
  "extracted_preferences": {{
    "style": ["modern", "minimalist"],
    "amenities": ["pool", "open_kitchen", "ocean_view", "outdoor_space"],
    "atmosphere": ["bright", "spacious", "relaxing"],
    "location_type": "coastal",
    "property_type": "house",
    "must_haves": ["natural_light", "outdoor_space"],
    "color_palette": ["white", "blue", "natural_wood"]
  }},
  "search_query": "Modern minimalist coastal house with pool, open kitchen, and ocean views",
  "reasoning": "Based on the images you've shared, you seem to prefer modern, light-filled spaces with a coastal vibe. The recurring themes are open layouts, natural light, and seamless indoor-outdoor living. You favor clean lines and a neutral color palette with blue accents."
}}

IMPORTANT:
- Be specific about what you see in the images
- Extract concrete, searchable criteria
- Focus on recurring themes across all images
"""

        # Prepare image content for Claude
        content = [{"type": "text", "text": prompt}]

        for url in image_urls[:5]:  # Limit to 5 images for performance
            # Check if it's a data URL (base64)
            if url.startswith('data:'):
                # Extract media type and base64 data
                # Format: data:image/jpeg;base64,/9j/4AAQ...
                parts = url.split(',', 1)
                if len(parts) == 2:
                    media_info = parts[0].split(';')[0].split(':')[1]  # e.g., image/jpeg
                    base64_data = parts[1]

                    content.append({
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_info,
                            "data": base64_data
                        }
                    })
            else:
                # Regular URL
                content.append({
                    "type": "image",
                    "source": {
                        "type": "url",
                        "url": url
                    }
                })

        try:
            # Analyze with Claude Vision
            response = self.client.messages.create(
                model=self.model,
                max_tokens=2048,
                messages=[{
                    "role": "user",
                    "content": content
                }]
            )

            response_text = response.content[0].text

            # Parse JSON response
            import json
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            analysis = json.loads(response_text)

            return {
                "success": True,
                **analysis
            }

        except Exception as e:
            print(f"Preference analysis error: {e}")
            # Fallback: basic extraction from text description
            return {
                "success": False,
                "extracted_preferences": {
                    "style": [],
                    "amenities": [],
                    "atmosphere": [],
                    "location_type": "urban",
                    "property_type": "apartment",
                    "must_haves": []
                },
                "search_query": text_description if text_description else "Comfortable rental property",
                "reasoning": "Unable to analyze images. Using text description as fallback.",
                "error": str(e)
            }

    async def convert_preferences_to_search_params(
        self,
        preferences: Dict[str, Any],
        user_id: str
    ) -> Dict[str, Any]:
        """
        Convert extracted visual preferences into search parameters

        Args:
            preferences: Extracted preferences from analyze_preference_images
            user_id: User ID

        Returns:
            Search parameters compatible with conversational search
        """

        # Build search query from preferences
        search_parts = []

        if preferences.get("location_type"):
            search_parts.append(preferences["location_type"])

        if preferences.get("property_type"):
            search_parts.append(preferences["property_type"])

        if preferences.get("style"):
            search_parts.extend(preferences["style"][:2])  # Top 2 styles

        if preferences.get("amenities"):
            search_parts.append("with " + ", ".join(preferences["amenities"][:3]))

        search_query = " ".join(search_parts)

        return {
            "query": search_query,
            "filters": {
                "property_type": preferences.get("property_type"),
                "amenities": preferences.get("amenities", []),
                "style": preferences.get("style", [])
            },
            "preferences_context": preferences,
            "user_id": user_id
        }

    async def health(self) -> bool:
        """Health check"""
        return True
