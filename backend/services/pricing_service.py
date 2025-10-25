"""
Pricing Service - Competitive pricing analysis
Uses Groq + Claude for market analysis
"""

import os
from typing import Dict, Any, List
from groq import Groq


class PricingService:
    """
    AI-powered competitive pricing analysis

    Features:
    - Analyzes market rates in the area
    - Considers amenities and property features
    - Provides price range and optimal price
    - Explains pricing rationale
    """

    def __init__(self):
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.3-70b-versatile"

    async def analyze_pricing(
        self,
        location: str,
        property_type: str,
        amenities: List[str],
        bedrooms: int = None,
        bathrooms: int = None
    ) -> Dict[str, Any]:
        """
        Analyze competitive pricing for a listing

        Args:
            location: Property location
            property_type: Type of property (apartment, house, villa, etc.)
            amenities: List of amenities
            bedrooms: Number of bedrooms (optional)
            bathrooms: Number of bathrooms (optional)

        Returns:
            {
                "suggested_price": float,
                "price_range": {"min": float, "max": float},
                "reasoning": str,
                "market_position": str  # "budget", "mid-range", or "luxury"
            }
        """

        # Build property description
        property_desc = self._build_property_description(
            location, property_type, amenities, bedrooms, bathrooms
        )

        # Create pricing analysis prompt
        prompt = f"""You are a pricing expert for vacation rental properties.

Analyze the following property and provide optimal pricing:

{property_desc}

Based on typical market rates for similar properties in this area, provide:
1. A suggested nightly price (in USD)
2. A reasonable price range (min-max)
3. Brief reasoning for the price
4. Market position (budget/mid-range/luxury)

Consider:
- Location desirability
- Property type and size
- Quality and quantity of amenities
- Typical rates in the area
- Seasonal variations (provide year-round average)

Format your response as JSON:
{{
  "suggested_price": <number>,
  "price_range": {{"min": <number>, "max": <number>}},
  "reasoning": "<brief explanation>",
  "market_position": "<budget|mid-range|luxury>"
}}

Only respond with the JSON, no other text."""

        # Call Groq for fast pricing analysis
        response = self.groq_client.chat.completions.create(
            model=self.model,
            messages=[{
                "role": "user",
                "content": prompt
            }],
            temperature=0.3,  # Lower temperature for more consistent pricing
            max_tokens=500
        )

        # Parse response
        import json
        try:
            pricing_data = json.loads(response.choices[0].message.content)

            # Ensure all required fields are present
            if not all(k in pricing_data for k in ["suggested_price", "price_range", "reasoning"]):
                return self._fallback_pricing(property_type, amenities)

            return pricing_data
        except json.JSONDecodeError:
            # Fallback to rule-based pricing
            return self._fallback_pricing(property_type, amenities)

    async def compare_with_competitors(
        self,
        listing_data: Dict[str, Any],
        competitor_listings: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Compare pricing with specific competitor listings

        Args:
            listing_data: The listing to price
            competitor_listings: List of similar competing listings

        Returns:
            Competitive analysis with positioning recommendations
        """
        if not competitor_listings:
            return {
                "competitive_position": "unknown",
                "recommendation": "No competitors found for comparison"
            }

        # Extract competitor prices
        competitor_prices = [
            c.get("price", c.get("suggested_price", 0))
            for c in competitor_listings
            if c.get("price") or c.get("suggested_price")
        ]

        if not competitor_prices:
            return {
                "competitive_position": "unknown",
                "recommendation": "Competitor price data unavailable"
            }

        avg_price = sum(competitor_prices) / len(competitor_prices)
        min_price = min(competitor_prices)
        max_price = max(competitor_prices)

        # Analyze amenity advantage
        our_amenities = set(listing_data.get("amenities", []))
        competitor_amenities_avg = sum(
            len(c.get("amenities", []))
            for c in competitor_listings
        ) / len(competitor_listings)

        amenity_advantage = len(our_amenities) > competitor_amenities_avg

        # Determine positioning
        if amenity_advantage:
            suggested = min(avg_price * 1.1, max_price)  # Price 10% above average, cap at max
            position = "premium"
        else:
            suggested = avg_price * 0.95  # Price 5% below average
            position = "competitive"

        return {
            "suggested_price": round(suggested, 2),
            "competitor_avg": round(avg_price, 2),
            "competitor_range": {"min": min_price, "max": max_price},
            "competitive_position": position,
            "amenity_advantage": amenity_advantage,
            "recommendation": self._generate_pricing_recommendation(
                suggested, avg_price, position, amenity_advantage
            )
        }

    def _build_property_description(
        self,
        location: str,
        property_type: str,
        amenities: List[str],
        bedrooms: int = None,
        bathrooms: int = None
    ) -> str:
        """Build a description for pricing analysis"""
        parts = [
            f"Location: {location}",
            f"Property Type: {property_type}"
        ]

        if bedrooms:
            parts.append(f"Bedrooms: {bedrooms}")
        if bathrooms:
            parts.append(f"Bathrooms: {bathrooms}")

        if amenities:
            parts.append(f"Amenities: {', '.join(amenities[:15])}")  # Top 15 amenities

        return "\n".join(parts)

    def _fallback_pricing(
        self,
        property_type: str,
        amenities: List[str]
    ) -> Dict[str, Any]:
        """
        Rule-based fallback pricing if AI fails

        Basic pricing heuristics based on property type and amenities
        """
        base_prices = {
            "apartment": 120,
            "house": 200,
            "villa": 350,
            "condo": 150,
            "cabin": 180,
            "cottage": 160,
            "loft": 140,
            "studio": 90,
            "bungalow": 170
        }

        base = base_prices.get(property_type.lower(), 150)

        # Adjust for premium amenities
        premium_amenities = {
            "pool", "hot tub", "ocean view", "waterfront", "gym",
            "chef's kitchen", "home theater", "wine cellar", "sauna"
        }

        amenity_set = set(a.lower() for a in amenities)
        premium_count = len(amenity_set.intersection(premium_amenities))

        # Each premium amenity adds 15%
        multiplier = 1 + (premium_count * 0.15)
        suggested = base * multiplier

        # Create price range (±20%)
        price_min = suggested * 0.8
        price_max = suggested * 1.2

        # Determine market position
        if suggested < 150:
            position = "budget"
        elif suggested < 300:
            position = "mid-range"
        else:
            position = "luxury"

        return {
            "suggested_price": round(suggested, 2),
            "price_range": {
                "min": round(price_min, 2),
                "max": round(price_max, 2)
            },
            "reasoning": f"Based on {property_type} base rate (${base}) with {premium_count} premium amenities",
            "market_position": position
        }

    def _generate_pricing_recommendation(
        self,
        suggested: float,
        market_avg: float,
        position: str,
        has_amenity_advantage: bool
    ) -> str:
        """Generate human-readable pricing recommendation"""
        if position == "premium":
            return (
                f"Your property has superior amenities compared to competitors. "
                f"Recommended price of ${suggested:.0f}/night is {((suggested/market_avg - 1) * 100):.0f}% "
                f"above market average of ${market_avg:.0f}, justified by premium features."
            )
        else:
            return (
                f"To remain competitive, recommend pricing at ${suggested:.0f}/night, "
                f"which is slightly below market average of ${market_avg:.0f}. "
                f"This positions you attractively while maintaining good margins."
            )

    async def health(self) -> bool:
        """Health check"""
        return bool(os.getenv("GROQ_API_KEY"))
