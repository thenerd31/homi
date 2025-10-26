"""
Geocoding Service - Convert location strings to lat/lon coordinates using Google Maps API

Sponsors: Google Maps Geocoding API
Uses: Dynamic radius search based on actual geographic coordinates
"""
import os
import aiohttp
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class GeocodingService:
    """
    Geocoding service using Google Maps Geocoding API

    Features:
    - Convert location strings to coordinates
    - Determine location type (city, neighborhood, country, etc.)
    - Calculate dynamic search radius based on location type
    - Cache results to minimize API calls
    """

    def __init__(self):
        self.api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        self.base_url = "https://maps.googleapis.com/maps/api/geocode/json"

        # Fallback to OpenStreetMap Nominatim if no API key
        self.use_nominatim = not self.api_key

        if self.use_nominatim:
            logger.warning("No GOOGLE_MAPS_API_KEY found, falling back to Nominatim (free, rate limited)")
        else:
            logger.info("Google Maps Geocoding API initialized")

    async def geocode(self, location: str) -> Optional[Dict[str, Any]]:
        """
        Convert location string to coordinates

        Args:
            location: Location string (e.g., "Malibu, CA" or "San Francisco")

        Returns:
            {
                "lat": 34.0259,
                "lon": -118.7798,
                "display_name": "Malibu, CA, USA",
                "types": ["locality", "political"],  # Google Maps types
                "place_id": "ChIJ...",
                "bounds": {...}  # Bounding box
            }

            Returns None if geocoding fails
        """
        if not location or not location.strip():
            return None

        if self.use_nominatim:
            return await self._geocode_nominatim(location)
        else:
            return await self._geocode_google(location)

    async def _geocode_google(self, location: str) -> Optional[Dict[str, Any]]:
        """
        Geocode using Google Maps Geocoding API

        API Docs: https://developers.google.com/maps/documentation/geocoding
        """
        params = {
            "address": location,
            "key": self.api_key
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.base_url, params=params, timeout=5) as resp:
                    if resp.status != 200:
                        logger.error(f"Google Maps API error: {resp.status}")
                        return None

                    data = await resp.json()

                    if data["status"] == "OK" and data.get("results"):
                        result = data["results"][0]
                        geometry = result["geometry"]
                        loc = geometry["location"]

                        # Extract location type from address components
                        location_types = result.get("types", [])

                        geo_data = {
                            "lat": loc["lat"],
                            "lon": loc["lng"],
                            "display_name": result["formatted_address"],
                            "types": location_types,
                            "place_id": result.get("place_id"),
                            "bounds": geometry.get("bounds")  # Bounding box if available
                        }

                        logger.info(f"Geocoded '{location}' → {loc['lat']}, {loc['lng']} (types: {location_types})")
                        return geo_data

                    elif data["status"] == "ZERO_RESULTS":
                        logger.warning(f"No results found for location: {location}")
                        return None
                    else:
                        logger.error(f"Google Maps API error: {data['status']}")
                        return None

        except aiohttp.ClientError as e:
            logger.error(f"Network error during geocoding: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error during geocoding: {e}")
            return None

    async def _geocode_nominatim(self, location: str) -> Optional[Dict[str, Any]]:
        """
        Fallback to OpenStreetMap Nominatim (free, no API key required)

        Note: Rate limited to 1 request/second
        API Docs: https://nominatim.org/release-docs/develop/api/Search/
        """
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": location,
            "format": "json",
            "limit": 1,
            "addressdetails": 1
        }
        headers = {
            "User-Agent": "VIBE-AI-Airbnb/1.0 (contact@vibe.ai)"  # Required by Nominatim
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, headers=headers, timeout=5) as resp:
                    if resp.status != 200:
                        logger.error(f"Nominatim API error: {resp.status}")
                        return None

                    data = await resp.json()

                    if data:
                        result = data[0]

                        # Determine type from OSM class
                        osm_type = result.get("class", "")
                        types = [osm_type] if osm_type else ["locality"]

                        geo_data = {
                            "lat": float(result["lat"]),
                            "lon": float(result["lon"]),
                            "display_name": result["display_name"],
                            "types": types,
                            "place_id": result.get("place_id")
                        }

                        logger.info(f"Geocoded (Nominatim) '{location}' → {geo_data['lat']}, {geo_data['lon']}")
                        return geo_data

                    else:
                        logger.warning(f"No results found for location: {location}")
                        return None

        except Exception as e:
            logger.error(f"Nominatim geocoding error: {e}")
            return None

    def calculate_dynamic_radius(
        self,
        geo_data: Dict[str, Any],
        desired_results: int = 20
    ) -> int:
        """
        Calculate appropriate search radius based on location type

        Args:
            geo_data: Geocoding result with "types" field
            desired_results: Target number of results to find

        Returns:
            Radius in miles

        Logic:
        - Country/Administrative → 200 miles
        - City/Locality → 25 miles
        - Neighborhood/Sublocality → 5 miles
        - POI/Street Address → 2 miles
        """
        location_types = geo_data.get("types", [])

        # Google Maps type hierarchy
        # Docs: https://developers.google.com/maps/documentation/geocoding/requests-geocoding#Types

        type_to_radius = {
            # Large areas
            "country": 200,
            "administrative_area_level_1": 100,  # State/Province
            "administrative_area_level_2": 50,   # County

            # Cities
            "locality": 25,                       # City
            "postal_town": 25,

            # Neighborhoods
            "sublocality": 5,
            "sublocality_level_1": 5,
            "neighborhood": 5,

            # Specific locations
            "route": 2,                           # Street
            "street_address": 1,
            "premise": 1,
            "poi": 2,                             # Point of interest
            "establishment": 2
        }

        # Find most specific type match
        for location_type in location_types:
            if location_type in type_to_radius:
                radius = type_to_radius[location_type]
                logger.info(f"Location type '{location_type}' → radius {radius} miles")
                return radius

        # Default fallback
        logger.info(f"Unknown location types {location_types}, using default 25 miles")
        return 25

    def adjust_radius_based_on_results(
        self,
        current_radius: int,
        result_count: int,
        target_results: int = 20
    ) -> int:
        """
        Adjust search radius based on number of results found

        Args:
            current_radius: Current search radius in miles
            result_count: Number of results found
            target_results: Desired number of results

        Returns:
            Adjusted radius in miles

        Logic:
        - Too few results (< 5): Triple the radius
        - Few results (< 10): Double the radius
        - Too many results (> 100): Halve the radius
        - Good results (10-100): Keep current radius
        """
        if result_count < 5:
            new_radius = min(current_radius * 3, 500)  # Max 500 miles
            logger.info(f"Too few results ({result_count}), expanding radius {current_radius} → {new_radius} miles")
            return new_radius

        elif result_count < 10:
            new_radius = min(current_radius * 2, 500)
            logger.info(f"Few results ({result_count}), expanding radius {current_radius} → {new_radius} miles")
            return new_radius

        elif result_count > 100:
            new_radius = max(current_radius // 2, 2)  # Min 2 miles
            logger.info(f"Too many results ({result_count}), shrinking radius {current_radius} → {new_radius} miles")
            return new_radius

        else:
            logger.info(f"Good result count ({result_count}), keeping radius {current_radius} miles")
            return current_radius

    async def health(self) -> bool:
        """Health check"""
        if self.use_nominatim:
            return True  # Nominatim doesn't need health check

        # Test with a simple geocode request
        try:
            result = await self.geocode("San Francisco")
            return result is not None
        except:
            return False
