"""
Simple geocoding utility for location-based search
Maps common city names to coordinates
"""

from typing import Optional, Tuple
import re

# City coordinates mapping - derived from our dataset
CITY_COORDINATES = {
    # California
    "san francisco": (37.7749, -122.4194),
    "sf": (37.7749, -122.4194),
    "los angeles": (34.0522, -118.2437),
    "la": (34.0522, -118.2437),
    "malibu": (34.0259, -118.7798),
    "newport beach": (33.6189, -117.9289),
    "santa cruz": (36.9741, -122.0308),
    "san diego": (32.7157, -117.1611),

    # New York
    "new york": (40.7128, -74.0060),
    "nyc": (40.7128, -74.0060),
    "manhattan": (40.7580, -73.9855),
    "brooklyn": (40.6782, -73.9442),

    # Florida
    "miami": (25.7617, -80.1918),
    "miami beach": (25.7907, -80.1300),
    "key west": (24.5551, -81.7800),

    # Illinois
    "chicago": (41.8781, -87.6298),

    # Washington
    "seattle": (47.6062, -122.3321),

    # Texas
    "austin": (30.2672, -97.7431),

    # Oregon
    "portland": (45.5152, -122.6784),

    # Colorado
    "denver": (39.7392, -104.9903),
    "boulder": (40.0150, -105.2705),

    # Massachusetts
    "boston": (42.3601, -71.0589),
    "cambridge": (42.3736, -71.1097),

    # Tennessee
    "nashville": (36.1627, -86.7816),

    # Louisiana
    "new orleans": (29.9511, -90.0715),

    # Arizona
    "phoenix": (33.4484, -112.0740),
    "scottsdale": (33.4942, -111.9261),

    # Nevada
    "las vegas": (36.1699, -115.1398),
    "vegas": (36.1699, -115.1398),
    "henderson": (36.0395, -114.9817),

    # South Carolina
    "charleston": (32.7765, -79.9311),

    # Georgia
    "savannah": (32.0809, -81.0912),

    # North Carolina
    "asheville": (35.5951, -82.5515),

    # Hawaii
    "honolulu": (21.3099, -157.8581),
    "waikiki": (21.2793, -157.8294),
    "haleiwa": (21.5933, -158.1036),
}

# Common state abbreviations
STATE_MAPPINGS = {
    "california": "ca",
    "new york": "ny",
    "florida": "fl",
    "illinois": "il",
    "washington": "wa",
    "texas": "tx",
    "oregon": "or",
    "colorado": "co",
    "massachusetts": "ma",
    "tennessee": "tn",
    "louisiana": "la",
    "arizona": "az",
    "nevada": "nv",
    "south carolina": "sc",
    "georgia": "ga",
    "north carolina": "nc",
    "hawaii": "hi",
}


def geocode(location: str) -> Optional[Tuple[float, float]]:
    """
    Convert location string to (latitude, longitude) coordinates

    Args:
        location: Location string like "San Francisco" or "Miami, FL"

    Returns:
        Tuple of (latitude, longitude) or None if not found
    """
    if not location:
        return None

    # Normalize location string
    location_lower = location.lower().strip()

    # Remove common suffixes like ", CA" or ", USA"
    location_clean = re.sub(r',?\s*(ca|ny|fl|il|wa|tx|or|co|ma|tn|la|az|nv|sc|ga|nc|hi|usa)$', '', location_lower, flags=re.IGNORECASE)
    location_clean = location_clean.strip()

    # Try exact match first
    if location_clean in CITY_COORDINATES:
        return CITY_COORDINATES[location_clean]

    # Try original (with state) if clean version didn't match
    if location_lower in CITY_COORDINATES:
        return CITY_COORDINATES[location_lower]

    # Try partial matching (e.g., "san francisco bay area" -> "san francisco")
    for city, coords in CITY_COORDINATES.items():
        if city in location_lower or location_lower in city:
            return coords

    return None


def get_default_radius(location: str) -> int:
    """
    Get default search radius in miles based on location type

    Args:
        location: Location string

    Returns:
        Radius in miles (default 25)
    """
    location_lower = location.lower()

    # Larger cities get bigger radius
    large_cities = ["new york", "nyc", "los angeles", "la", "chicago", "miami"]
    if any(city in location_lower for city in large_cities):
        return 35

    # Medium cities
    medium_cities = ["san francisco", "seattle", "austin", "denver", "boston"]
    if any(city in location_lower for city in medium_cities):
        return 25

    # Small cities / specific neighborhoods
    return 15


# Example usage
if __name__ == "__main__":
    test_locations = [
        "San Francisco",
        "Miami, FL",
        "New York City",
        "Austin, Texas",
        "Portland",
    ]

    for loc in test_locations:
        coords = geocode(loc)
        radius = get_default_radius(loc)
        print(f"{loc:20} -> {coords} (radius: {radius} mi)")
