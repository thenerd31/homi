"""
Image Quality Filtering Service
Analyzes and selects the best photos from AR glasses scan
Uses Claude Vision to assess quality, composition, and relevance
"""

import os
from typing import List, Dict, Any
from anthropic import Anthropic
import base64
import httpx


class ImageFilterService:
    """
    Filters and ranks photos from AR scan

    Features:
    - Quality assessment (blur, lighting, composition)
    - Content relevance (property features vs random shots)
    - Room type detection (bedroom, bathroom, kitchen, etc.)
    - Duplicate detection
    - Best photo selection per room
    """

    def __init__(self):
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.model = "claude-sonnet-4-5-20250929"

    async def analyze_photo_batch(
        self,
        photo_urls: List[str],
        max_photos: int = 20
    ) -> Dict[str, Any]:
        """
        Analyze a batch of photos from AR scan

        Args:
            photo_urls: List of image URLs from Spectacles scan
            max_photos: Maximum number of photos to select

        Returns:
            {
                "selected_photos": [
                    {
                        "url": "...",
                        "rank": 1,
                        "quality_score": 0.95,
                        "room_type": "living_room",
                        "reason": "High quality shot of main living area with good lighting"
                    }
                ],
                "rejected_photos": [
                    {
                        "url": "...",
                        "reason": "Blurry or poor lighting"
                    }
                ],
                "room_coverage": {
                    "living_room": 3,
                    "bedroom": 2,
                    "kitchen": 2,
                    "bathroom": 1,
                    "exterior": 2
                }
            }
        """

        # For demo: analyze up to 10 photos at once for performance
        photos_to_analyze = photo_urls[:min(len(photo_urls), 10)]

        # Build analysis prompt
        prompt = f"""You are an expert real estate photographer analyzing photos for a vacation rental listing.

Analyze these {len(photos_to_analyze)} photos and:

1. **Quality Assessment** (0-1 score):
   - Image clarity (not blurry)
   - Good lighting (not too dark/bright)
   - Composition (well-framed)
   - Professional appearance

2. **Content Relevance**:
   - Is this a listing-worthy shot? (not random, not in-progress, not trash)
   - Room type: living_room, bedroom, bathroom, kitchen, dining, exterior, pool, patio, other
   - Key features visible

3. **Selection Criteria**:
   - Select the best {max_photos} photos for the listing
   - Prioritize variety (different rooms/angles)
   - At least 1-2 photos per major room type
   - Reject duplicates, blurry shots, or irrelevant images

Return ONLY JSON:
{{
  "photos": [
    {{
      "photo_index": 0,  // index in the provided list
      "selected": true,
      "quality_score": 0.95,
      "room_type": "living_room",
      "features": ["fireplace", "couch", "natural_light"],
      "reason": "High quality shot of main living area"
    }},
    {{
      "photo_index": 1,
      "selected": false,
      "quality_score": 0.3,
      "reason": "Blurry, poor composition"
    }}
  ]
}}

IMPORTANT:
- Be selective - only choose photos that would make someone want to book
- Reject any photos that are blurry, dark, or show construction/clutter
- Prioritize variety in room types and angles
"""

        # Prepare image content for Claude
        content = [{"type": "text", "text": prompt}]

        for url in photos_to_analyze:
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

            # Format results
            selected_photos = []
            rejected_photos = []
            room_coverage = {}

            for photo_data in analysis.get("photos", []):
                photo_index = photo_data.get("photo_index", 0)

                if photo_index >= len(photos_to_analyze):
                    continue

                photo_url = photos_to_analyze[photo_index]

                if photo_data.get("selected", False):
                    room_type = photo_data.get("room_type", "other")
                    selected_photos.append({
                        "url": photo_url,
                        "rank": len(selected_photos) + 1,
                        "quality_score": photo_data.get("quality_score", 0.5),
                        "room_type": room_type,
                        "features": photo_data.get("features", []),
                        "reason": photo_data.get("reason", "Selected")
                    })

                    # Track room coverage
                    room_coverage[room_type] = room_coverage.get(room_type, 0) + 1
                else:
                    rejected_photos.append({
                        "url": photo_url,
                        "reason": photo_data.get("reason", "Quality below threshold")
                    })

            # Sort selected by quality score
            selected_photos.sort(key=lambda x: x["quality_score"], reverse=True)

            # Update ranks
            for i, photo in enumerate(selected_photos):
                photo["rank"] = i + 1

            # Limit to max_photos
            if len(selected_photos) > max_photos:
                rejected_photos.extend([
                    {
                        "url": p["url"],
                        "reason": f"Exceeded max photos limit ({max_photos})"
                    }
                    for p in selected_photos[max_photos:]
                ])
                selected_photos = selected_photos[:max_photos]

            return {
                "selected_photos": selected_photos,
                "rejected_photos": rejected_photos,
                "room_coverage": room_coverage,
                "total_analyzed": len(photos_to_analyze),
                "total_selected": len(selected_photos)
            }

        except Exception as e:
            print(f"Image analysis error: {e}")
            # Fallback: select first max_photos images
            return {
                "selected_photos": [
                    {
                        "url": url,
                        "rank": i + 1,
                        "quality_score": 0.7,
                        "room_type": "unknown",
                        "features": [],
                        "reason": "Auto-selected (analysis unavailable)"
                    }
                    for i, url in enumerate(photos_to_analyze[:max_photos])
                ],
                "rejected_photos": [
                    {"url": url, "reason": "Not analyzed"}
                    for url in photos_to_analyze[max_photos:]
                ],
                "room_coverage": {"unknown": min(len(photos_to_analyze), max_photos)},
                "total_analyzed": len(photos_to_analyze),
                "total_selected": min(len(photos_to_analyze), max_photos)
            }

    async def quick_quality_check(self, photo_url: str) -> Dict[str, Any]:
        """
        Quick quality check for a single photo
        Used during real-time AR scanning

        Returns:
            {
                "accept": true/false,
                "quality_score": 0.85,
                "issues": ["slightly_dark"],
                "suggestion": "Increase brightness by 20%"
            }
        """

        prompt = """Quick quality check for this real estate photo.

Assess:
1. Is it usable for a listing? (not blurry, decent lighting)
2. Quality score (0-1)
3. Any issues? (blur, darkness, clutter, etc.)
4. Brief suggestion for improvement if needed

Return JSON:
{
  "accept": true,
  "quality_score": 0.85,
  "issues": [],
  "suggestion": ""
}
"""

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=256,
                messages=[{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image",
                            "source": {
                                "type": "url",
                                "url": photo_url
                            }
                        }
                    ]
                }]
            )

            response_text = response.content[0].text

            import json
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            return json.loads(response_text)

        except Exception as e:
            print(f"Quick check error: {e}")
            return {
                "accept": True,
                "quality_score": 0.7,
                "issues": [],
                "suggestion": "Unable to analyze"
            }

    async def health(self) -> bool:
        """Health check"""
        return True
