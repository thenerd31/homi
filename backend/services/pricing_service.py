"""
Pricing Service - Dynamic competitive pricing analysis
Uses Groq + Claude for market analysis with day-of-week, seasonality, and competitive intelligence
"""

import os
from typing import Dict, Any, List
from datetime import datetime, timedelta
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

    async def analyze_dynamic_pricing_for_dates(
        self,
        listing_data: Dict[str, Any],
        date_range_start: str,  # "2025-11-01"
        date_range_end: str,    # "2025-11-30"
        elastic_client = None   # ElasticClient for competitor data
    ) -> Dict[str, Any]:
        """
        Dynamic pricing analysis for specific date range

        Factors analyzed:
        - Day of week (weekends vs weekdays)
        - Seasonality (holidays, peak/off season)
        - Market demand patterns
        - Competitive pricing in the area
        - Amenity premiums

        Args:
            listing_data: Property information (location, type, amenities, bedrooms, bathrooms)
            date_range_start: Start date (YYYY-MM-DD)
            date_range_end: End date (YYYY-MM-DD)
            elastic_client: Optional ElasticClient for competitive data

        Returns:
            {
                "daily_prices": [
                    {
                        "date": "2025-11-01",
                        "day_of_week": "Friday",
                        "base_price": 200,
                        "multipliers": {
                            "day_of_week": 1.2,
                            "seasonality": 1.1,
                            "demand": 1.05
                        },
                        "final_price": 277,
                        "reasoning": "Weekend + Fall peak season"
                    },
                    ...
                ],
                "summary": {
                    "avg_price": 250,
                    "min_price": 180,
                    "max_price": 320,
                    "total_revenue_estimate": 7500
                },
                "competitive_analysis": {...},
                "recommendations": [...]
            }
        """

        # Parse dates
        start_date = datetime.strptime(date_range_start, "%Y-%m-%d")
        end_date = datetime.strptime(date_range_end, "%Y-%m-%d")

        # Get base price from market analysis
        base_pricing = await self.analyze_pricing(
            location=listing_data.get("location", ""),
            property_type=listing_data.get("property_type", "apartment"),
            amenities=listing_data.get("amenities", []),
            bedrooms=listing_data.get("bedrooms"),
            bathrooms=listing_data.get("bathrooms")
        )

        base_price = base_pricing["suggested_price"]

        # Get competitive data if available
        competitive_data = None
        if elastic_client:
            try:
                competitive_data = await self._fetch_competitor_pricing(
                    listing_data, elastic_client
                )
            except:
                pass

        # Calculate daily prices
        daily_prices = []
        current_date = start_date

        while current_date <= end_date:
            daily_analysis = self._analyze_single_day(
                current_date,
                base_price,
                listing_data,
                competitive_data
            )
            daily_prices.append(daily_analysis)
            current_date += timedelta(days=1)

        # Calculate summary statistics
        prices = [d["final_price"] for d in daily_prices]
        summary = {
            "avg_price": round(sum(prices) / len(prices), 2),
            "min_price": min(prices),
            "max_price": max(prices),
            "total_revenue_estimate": round(sum(prices), 2),
            "number_of_nights": len(daily_prices)
        }

        # Generate recommendations
        recommendations = self._generate_dynamic_recommendations(
            daily_prices, summary, competitive_data
        )

        return {
            "daily_prices": daily_prices,
            "summary": summary,
            "competitive_analysis": competitive_data or {"status": "unavailable"},
            "recommendations": recommendations,
            "base_pricing": base_pricing
        }

    def _analyze_single_day(
        self,
        date: datetime,
        base_price: float,
        listing_data: Dict[str, Any],
        competitive_data: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Analyze pricing for a single day"""

        day_name = date.strftime("%A")
        is_weekend = date.weekday() >= 5  # Saturday = 5, Sunday = 6

        # Start with base price
        multipliers = {}
        current_price = base_price

        # Day of week multiplier
        dow_multiplier = self._get_day_of_week_multiplier(date.weekday())
        multipliers["day_of_week"] = dow_multiplier
        current_price *= dow_multiplier

        # Seasonality multiplier
        season_multiplier = self._get_seasonality_multiplier(date, listing_data.get("location", ""))
        multipliers["seasonality"] = season_multiplier
        current_price *= season_multiplier

        # Holiday multiplier
        holiday_multiplier = self._get_holiday_multiplier(date)
        if holiday_multiplier > 1.0:
            multipliers["holiday"] = holiday_multiplier
            current_price *= holiday_multiplier

        # Demand multiplier (simulated based on day patterns)
        demand_multiplier = self._get_demand_multiplier(date, is_weekend)
        multipliers["demand"] = demand_multiplier
        current_price *= demand_multiplier

        # Competitive adjustment
        if competitive_data and competitive_data.get("competitor_avg"):
            comp_multiplier = self._get_competitive_multiplier(
                current_price, competitive_data["competitor_avg"]
            )
            if abs(comp_multiplier - 1.0) > 0.05:  # Only apply if significant
                multipliers["competitive_adjustment"] = comp_multiplier
                current_price *= comp_multiplier

        # Generate reasoning
        reasoning_parts = []
        if is_weekend:
            reasoning_parts.append("Weekend premium")
        if holiday_multiplier > 1.0:
            reasoning_parts.append("Holiday period")
        if season_multiplier > 1.1:
            reasoning_parts.append("Peak season")
        elif season_multiplier < 0.9:
            reasoning_parts.append("Off-season discount")
        if demand_multiplier > 1.05:
            reasoning_parts.append("High demand expected")

        reasoning = " + ".join(reasoning_parts) if reasoning_parts else "Standard rate"

        return {
            "date": date.strftime("%Y-%m-%d"),
            "day_of_week": day_name,
            "is_weekend": is_weekend,
            "base_price": round(base_price, 2),
            "multipliers": {k: round(v, 2) for k, v in multipliers.items()},
            "final_price": round(current_price, 2),
            "reasoning": reasoning
        }

    def _get_day_of_week_multiplier(self, weekday: int) -> float:
        """
        Get price multiplier based on day of week
        0=Monday, 6=Sunday
        """
        # Weekend pricing (Friday, Saturday, Sunday)
        if weekday in [4, 5, 6]:  # Fri, Sat, Sun
            return 1.25  # 25% premium
        # Thursday (mini-weekend)
        elif weekday == 3:
            return 1.10  # 10% premium
        # Monday-Wednesday
        else:
            return 0.95  # 5% discount

    def _get_seasonality_multiplier(self, date: datetime, location: str) -> float:
        """
        Get price multiplier based on season and location
        """
        month = date.month

        # Beach/warm destinations (higher in summer/spring)
        beach_keywords = ["beach", "ocean", "miami", "malibu", "hawaii", "san diego", "florida"]
        is_beach_location = any(keyword in location.lower() for keyword in beach_keywords)

        # Ski/mountain destinations (higher in winter)
        ski_keywords = ["ski", "mountain", "tahoe", "aspen", "vail", "snow"]
        is_ski_location = any(keyword in location.lower() for keyword in ski_keywords)

        if is_beach_location:
            # Beach location seasonality
            if month in [6, 7, 8]:  # Summer (June-Aug)
                return 1.40  # 40% premium
            elif month in [4, 5, 9]:  # Shoulder season (Apr, May, Sep)
                return 1.15  # 15% premium
            elif month in [12, 1, 2, 3]:  # Winter (Dec-Mar)
                return 0.85  # 15% discount
            else:  # Fall (Oct-Nov)
                return 1.05  # 5% premium

        elif is_ski_location:
            # Ski location seasonality
            if month in [12, 1, 2]:  # Peak ski season (Dec-Feb)
                return 1.50  # 50% premium
            elif month in [11, 3]:  # Shoulder ski season
                return 1.20  # 20% premium
            elif month in [6, 7, 8]:  # Summer (off-season for ski)
                return 0.80  # 20% discount
            else:
                return 1.0

        else:
            # Urban/general destinations
            if month in [6, 7, 8, 12]:  # Summer + December holidays
                return 1.20  # 20% premium
            elif month in [1, 2]:  # Post-holiday winter
                return 0.90  # 10% discount
            else:
                return 1.05  # Slight premium

    def _get_holiday_multiplier(self, date: datetime) -> float:
        """
        Get price multiplier for holidays and special events
        """
        month = date.month
        day = date.day

        # Major US holidays (simple check - in production, use proper holiday library)
        holidays = {
            (1, 1): 1.5,    # New Year's Day
            (7, 4): 1.4,    # July 4th
            (11, 24): 1.5,  # Thanksgiving (approximate)
            (12, 24): 1.5,  # Christmas Eve
            (12, 25): 1.5,  # Christmas
            (12, 31): 1.6,  # New Year's Eve
        }

        # Check if date matches a holiday
        if (month, day) in holidays:
            return holidays[(month, day)]

        # Check for holiday weekends (3-day weekends get premium)
        if date.weekday() == 4:  # Friday
            next_day = date + timedelta(days=1)
            if (next_day.month, next_day.day) in holidays:
                return 1.3  # Holiday weekend premium

        return 1.0

    def _get_demand_multiplier(self, date: datetime, is_weekend: bool) -> float:
        """
        Simulate demand patterns based on day type and advance booking
        In production, this would use historical booking data
        """
        # Weekends naturally have higher demand
        if is_weekend:
            return 1.1  # 10% demand premium
        else:
            return 1.0

    def _get_competitive_multiplier(self, current_price: float, competitor_avg: float) -> float:
        """
        Adjust pricing based on competitive positioning
        """
        if competitor_avg == 0:
            return 1.0

        price_ratio = current_price / competitor_avg

        # If we're significantly above market, reduce slightly
        if price_ratio > 1.15:
            return 0.95  # 5% reduction
        # If we're significantly below market, increase slightly
        elif price_ratio < 0.85:
            return 1.05  # 5% increase
        else:
            return 1.0  # We're in a good range

    async def _fetch_competitor_pricing(
        self,
        listing_data: Dict[str, Any],
        elastic_client
    ) -> Dict[str, Any]:
        """
        Fetch competitor pricing data from Elasticsearch
        """
        try:
            # Search for similar properties in the area
            competitors = await elastic_client.hybrid_search(
                query_text=f"{listing_data.get('property_type', '')} in {listing_data.get('location', '')}",
                filters={
                    "location": listing_data.get("location", ""),
                    "property_type": listing_data.get("property_type", "")
                },
                limit=20
            )

            if not competitors:
                return None

            # Extract prices
            prices = [c.get("price", 0) for c in competitors if c.get("price")]

            if not prices:
                return None

            return {
                "competitor_avg": round(sum(prices) / len(prices), 2),
                "competitor_min": min(prices),
                "competitor_max": max(prices),
                "sample_size": len(prices)
            }
        except:
            return None

    def _generate_dynamic_recommendations(
        self,
        daily_prices: List[Dict[str, Any]],
        summary: Dict[str, Any],
        competitive_data: Dict[str, Any] = None
    ) -> List[str]:
        """Generate pricing strategy recommendations"""
        recommendations = []

        # Analyze price variance
        prices = [d["final_price"] for d in daily_prices]
        avg_price = summary["avg_price"]
        max_price = summary["max_price"]
        min_price = summary["min_price"]

        variance = max_price - min_price
        variance_pct = (variance / avg_price) * 100

        if variance_pct > 30:
            recommendations.append(
                f"High price variance ({variance_pct:.0f}%) detected. "
                "Consider offering weekly discounts to smooth out demand."
            )

        # Weekend strategy
        weekend_prices = [d["final_price"] for d in daily_prices if d["is_weekend"]]
        weekday_prices = [d["final_price"] for d in daily_prices if not d["is_weekend"]]

        if weekend_prices and weekday_prices:
            weekend_avg = sum(weekend_prices) / len(weekend_prices)
            weekday_avg = sum(weekday_prices) / len(weekday_prices)
            weekend_premium_pct = ((weekend_avg / weekday_avg) - 1) * 100

            recommendations.append(
                f"Your weekend premium is {weekend_premium_pct:.0f}%. "
                f"Weekend avg: ${weekend_avg:.0f}, Weekday avg: ${weekday_avg:.0f}"
            )

        # Competitive positioning
        if competitive_data and competitive_data.get("competitor_avg"):
            comp_avg = competitive_data["competitor_avg"]
            our_avg = avg_price
            diff_pct = ((our_avg / comp_avg) - 1) * 100

            if abs(diff_pct) < 10:
                recommendations.append(
                    f"Your pricing is competitive (within 10% of market avg of ${comp_avg:.0f})"
                )
            elif diff_pct > 10:
                recommendations.append(
                    f"You're priced {diff_pct:.0f}% above market (${comp_avg:.0f}). "
                    "Ensure your amenities justify the premium."
                )
            else:
                recommendations.append(
                    f"You're priced {abs(diff_pct):.0f}% below market. "
                    "Consider raising prices to increase revenue."
                )

        # Revenue optimization
        total_revenue = summary["total_revenue_estimate"]
        num_nights = summary["number_of_nights"]

        recommendations.append(
            f"Estimated revenue for {num_nights} nights: ${total_revenue:.2f} "
            f"(${avg_price:.0f}/night average)"
        )

        # Peak pricing strategy
        peak_days = [d for d in daily_prices if any(m > 1.2 for m in d["multipliers"].values())]
        if len(peak_days) > len(daily_prices) * 0.3:
            recommendations.append(
                f"{len(peak_days)} high-demand days detected. "
                "Consider minimum stay requirements for peak periods."
            )

        return recommendations

    async def health(self) -> bool:
        """Health check"""
        return bool(os.getenv("GROQ_API_KEY"))
