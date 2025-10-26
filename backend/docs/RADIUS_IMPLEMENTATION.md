# 🗺️ Dynamic Radius Implementation Guide

## Current Problem

**Line 315 in `main.py`:**
```python
"hardcoded_radius_miles": 25  # TODO: Implement Maps API radius
```

The radius is hardcoded and doesn't:
- Use actual geo-coordinates
- Adjust based on location density
- Filter by geographic distance
- Provide accurate "nearby" results

## Solution: Dynamic Geo-Radius Search

### Architecture Overview

```
User Query ("Malibu beach house")
    ↓
1. Geocode location using Maps API → lat/lon
    ↓
2. Elasticsearch geo_distance query with dynamic radius
    ↓
3. Adjust radius based on result count
    ↓
4. Return results with actual distance
```

---

## Implementation Steps

### 1. Choose a Maps API

#### Option A: **Google Maps Geocoding API** (Recommended)
- **Pros**: Most accurate, global coverage, 40k free requests/month
- **Cons**: Requires billing account (even for free tier)
- **Cost**: $5 per 1000 requests after free tier
- **Setup**: https://developers.google.com/maps/documentation/geocoding

```bash
# Add to .env
GOOGLE_MAPS_API_KEY=your_key_here
```

#### Option B: **Mapbox Geocoding API**
- **Pros**: Good accuracy, 100k free requests/month, no billing required
- **Cons**: Slightly less accurate for some regions
- **Cost**: Free tier is generous
- **Setup**: https://docs.mapbox.com/api/search/geocoding/

```bash
# Add to .env
MAPBOX_API_KEY=your_key_here
```

#### Option C: **OpenStreetMap Nominatim** (Free, Open Source)
- **Pros**: Free, no API key, open source
- **Cons**: Rate limited (1 req/sec), less reliable
- **Cost**: Free
- **Setup**: No key needed

---

### 2. Create Geocoding Service

**File: `backend/services/geocoding_service.py`**

```python
"""
Geocoding Service - Convert location strings to lat/lon coordinates
"""
import os
import aiohttp
from typing import Optional, Dict, Tuple
from functools import lru_cache

class GeocodingService:
    def __init__(self):
        self.google_api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        self.mapbox_api_key = os.getenv("MAPBOX_API_KEY")

        # Choose provider based on available keys
        if self.google_api_key:
            self.provider = "google"
        elif self.mapbox_api_key:
            self.provider = "mapbox"
        else:
            self.provider = "nominatim"  # Free fallback

    async def geocode(self, location: str) -> Optional[Dict]:
        """
        Convert location string to coordinates

        Returns:
            {
                "lat": 34.0259,
                "lon": -118.7798,
                "display_name": "Malibu, CA, USA",
                "bounding_box": {...}
            }
        """
        if self.provider == "google":
            return await self._geocode_google(location)
        elif self.provider == "mapbox":
            return await self._geocode_mapbox(location)
        else:
            return await self._geocode_nominatim(location)

    async def _geocode_google(self, location: str) -> Optional[Dict]:
        """Google Maps Geocoding"""
        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            "address": location,
            "key": self.google_api_key
        }

        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as resp:
                data = await resp.json()

                if data["status"] == "OK" and data["results"]:
                    result = data["results"][0]
                    loc = result["geometry"]["location"]

                    return {
                        "lat": loc["lat"],
                        "lon": loc["lng"],
                        "display_name": result["formatted_address"],
                        "place_id": result["place_id"],
                        "types": result.get("types", [])
                    }

        return None

    async def _geocode_mapbox(self, location: str) -> Optional[Dict]:
        """Mapbox Geocoding"""
        url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{location}.json"
        params = {
            "access_token": self.mapbox_api_key,
            "limit": 1
        }

        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as resp:
                data = await resp.json()

                if data.get("features"):
                    feature = data["features"][0]
                    lon, lat = feature["geometry"]["coordinates"]

                    return {
                        "lat": lat,
                        "lon": lon,
                        "display_name": feature["place_name"],
                        "place_type": feature.get("place_type", [])
                    }

        return None

    async def _geocode_nominatim(self, location: str) -> Optional[Dict]:
        """OpenStreetMap Nominatim (Free fallback)"""
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": location,
            "format": "json",
            "limit": 1
        }
        headers = {
            "User-Agent": "VIBE-App/1.0"  # Required by Nominatim
        }

        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, headers=headers) as resp:
                data = await resp.json()

                if data:
                    result = data[0]
                    return {
                        "lat": float(result["lat"]),
                        "lon": float(result["lon"]),
                        "display_name": result["display_name"]
                    }

        return None

    def calculate_dynamic_radius(
        self,
        location_type: str,
        desired_results: int = 20
    ) -> int:
        """
        Calculate appropriate search radius based on location type

        Args:
            location_type: "city", "neighborhood", "country", etc.
            desired_results: Target number of results

        Returns:
            Radius in miles
        """
        radius_map = {
            "country": 200,      # Search whole country
            "state": 100,        # State-wide
            "city": 25,          # City-wide
            "neighborhood": 5,   # Local area
            "poi": 2,            # Around specific point
            "address": 1         # Very specific
        }

        # Default to 25 miles
        return radius_map.get(location_type, 25)
```

---

### 3. Update Elasticsearch Mappings

**File: `backend/utils/elastic_client.py`**

Add geo_point field to index mappings:

```python
async def create_index_with_semantic_text(self):
    """
    Create index with geo-location support
    """
    if not self.client:
        return

    index_config = {
        "mappings": {
            "properties": {
                "id": {"type": "keyword"},
                "title": {"type": "text"},
                "description": {"type": "text"},

                # ADD THIS: Geo-location field
                "coordinates": {
                    "type": "geo_point"  # Elasticsearch geo-point type
                },

                "location": {
                    "type": "text",
                    "fields": {
                        "keyword": {"type": "keyword"}
                    }
                },

                # ... rest of fields
            }
        }
    }

    # Create index
```

---

### 4. Add Geo-Distance Search Method

**Add to `elastic_client.py`:**

```python
async def geo_search(
    self,
    query_text: str,
    latitude: float,
    longitude: float,
    radius_miles: int = 25,
    filters: Dict[str, Any] = {},
    limit: int = 50
) -> List[Dict[str, Any]]:
    """
    Search with geographic radius filtering

    Args:
        query_text: Search query
        latitude: Center point latitude
        longitude: Center point longitude
        radius_miles: Search radius in miles
        filters: Additional filters (price, amenities, etc.)
        limit: Max results

    Returns:
        List of listings with distance
    """
    if not self.client:
        return self._mock_search_results(filters, limit)

    # Build filter clauses (price, amenities, etc.)
    filter_clauses = []

    # GEO-DISTANCE FILTER
    filter_clauses.append({
        "geo_distance": {
            "distance": f"{radius_miles}mi",
            "coordinates": {
                "lat": latitude,
                "lon": longitude
            }
        }
    })

    # Add other filters (price, amenities, etc.)
    if filters.get("price_max"):
        filter_clauses.append({
            "range": {"price": {"lte": filters["price_max"]}}
        })

    # ... other filters

    # Hybrid search with geo-filtering
    search_query = {
        "query": {
            "bool": {
                "must": [
                    {
                        "semantic": {
                            "field": "semantic_content",
                            "query": query_text
                        }
                    }
                ],
                "filter": filter_clauses
            }
        },
        # Sort by distance + relevance
        "sort": [
            {
                "_score": {"order": "desc"}  # Relevance first
            },
            {
                "_geo_distance": {
                    "coordinates": {
                        "lat": latitude,
                        "lon": longitude
                    },
                    "order": "asc",  # Then by distance
                    "unit": "mi"
                }
            }
        ],
        "size": limit
    }

    try:
        response = await self.client.search(
            index=self.index_name,
            body=search_query
        )

        results = []
        for hit in response["hits"]["hits"]:
            listing = hit["_source"]
            listing["relevance_score"] = hit["_score"]

            # Add calculated distance
            if hit.get("sort") and len(hit["sort"]) > 1:
                listing["distance_miles"] = round(hit["sort"][1], 2)

            listing.pop("semantic_content", None)
            results.append(listing)

        return results

    except Exception as e:
        print(f"Geo-search error: {e}")
        return await self.semantic_search(query_text, filters, limit)
```

---

### 5. Update Main API Endpoint

**File: `backend/main.py`**

Update `/api/search/execute`:

```python
from services.geocoding_service import GeocodingService

# Initialize service
geocoding_service = GeocodingService()

@app.post("/api/search/execute")
async def execute_search(request: SearchExecuteRequest):
    """
    Execute search with dynamic geo-radius
    """
    try:
        params = request.extracted_params

        # Build query text
        query_parts = []
        if params.get("property_type"):
            query_parts.append(f"{params['property_type']}")
        if params.get("location"):
            query_parts.append(f"in {params['location']}")
        if params.get("amenities"):
            query_parts.append(f"with {', '.join(params['amenities'])}")

        query_text = " ".join(query_parts) if query_parts else params.get("location", "")

        # NEW: Geocode location
        location_str = params.get("location", "")
        geo_data = None
        radius_miles = 25  # Default

        if location_str:
            geo_data = await geocoding_service.geocode(location_str)

            if geo_data:
                # Determine location type for dynamic radius
                location_type = geo_data.get("types", ["city"])[0] if "types" in geo_data else "city"
                radius_miles = geocoding_service.calculate_dynamic_radius(location_type)

        # Build filters
        filters = {}
        if params.get("price_max"):
            filters["price_max"] = params["price_max"]
        # ... other filters

        # NEW: Use geo-search if we have coordinates
        if geo_data:
            listings = await elastic_client.geo_search(
                query_text=query_text,
                latitude=geo_data["lat"],
                longitude=geo_data["lon"],
                radius_miles=radius_miles,
                filters=filters,
                limit=100
            )
        else:
            # Fallback to regular search
            listings = await elastic_client.hybrid_search(
                query_text=query_text,
                filters=filters,
                limit=100
            )

        # Filter by relevance threshold
        threshold = request.relevance_threshold
        filtered_listings = [
            listing for listing in listings
            if listing.get("relevance_score", 0) >= threshold
        ]

        # NEW: Adjust radius if too few results
        if len(filtered_listings) < 5 and geo_data:
            # Expand radius and try again
            radius_miles = radius_miles * 2
            listings = await elastic_client.geo_search(
                query_text=query_text,
                latitude=geo_data["lat"],
                longitude=geo_data["lon"],
                radius_miles=radius_miles,
                filters=filters,
                limit=100
            )
            filtered_listings = [
                listing for listing in listings
                if listing.get("relevance_score", 0) >= threshold
            ]

        # Update Letta memory
        if request.user_id:
            await letta_service.update_search_history(
                user_id=request.user_id,
                query=query_text,
                filters=filters
            )

        return {
            "success": True,
            "matches": filtered_listings,
            "total_matches": len(filtered_listings),
            "threshold": threshold,
            "radius_miles": radius_miles,  # UPDATED: Dynamic radius
            "center_coordinates": {
                "lat": geo_data["lat"],
                "lon": geo_data["lon"]
            } if geo_data else None,
            "location_display": geo_data["display_name"] if geo_data else location_str
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## Installation & Setup

### 1. Install Dependencies

```bash
pip install aiohttp
```

### 2. Choose Your Maps API

**Google Maps (Recommended):**
```bash
# Go to: https://console.cloud.google.com/
# Enable: Geocoding API
# Create API key
# Add to .env:
GOOGLE_MAPS_API_KEY=AIza...
```

**Mapbox (Easiest):**
```bash
# Go to: https://account.mapbox.com/
# Create account (no billing required)
# Copy access token
# Add to .env:
MAPBOX_API_KEY=pk.eyJ1...
```

**Nominatim (Free, No Key):**
- No setup needed
- Just works as fallback

### 3. Update Index Mappings

```bash
# In Python console:
from utils.elastic_client import ElasticClient
client = ElasticClient()
await client.create_index_with_semantic_text()  # Recreate with geo_point
```

### 4. Re-index Existing Listings

When adding new listings, geocode them first:

```python
# When creating listing
geocoding_service = GeocodingService()
geo_data = await geocoding_service.geocode(listing_location)

listing_doc = {
    "id": listing_id,
    "title": "Beach House",
    "location": "Malibu, CA",
    "coordinates": {
        "lat": geo_data["lat"],
        "lon": geo_data["lon"]
    },
    # ... other fields
}

await elastic_client.index_listing(listing_doc)
```

---

## Dynamic Radius Logic

### Radius Adjustment Algorithm

```python
def adjust_radius_dynamically(
    initial_results: int,
    target_results: int = 20,
    current_radius: int = 25
) -> int:
    """
    Adjust search radius based on result density
    """
    if initial_results < 5:
        return current_radius * 3  # Triple radius
    elif initial_results < 10:
        return current_radius * 2  # Double radius
    elif initial_results > 100:
        return max(5, current_radius // 2)  # Halve radius (min 5 miles)
    else:
        return current_radius  # Keep current
```

### Location Type → Radius Mapping

| Location Type | Default Radius | Example |
|---------------|----------------|---------|
| Country | 200 miles | "California" |
| State/Region | 100 miles | "Bay Area" |
| City | 25 miles | "San Francisco" |
| Neighborhood | 5 miles | "Mission District" |
| POI | 2 miles | "Golden Gate Bridge" |
| Address | 1 mile | "123 Main St" |

---

## Testing

### Test Geocoding

```bash
curl -X POST http://localhost:8000/api/search/execute \
  -H "Content-Type: application/json" \
  -d '{
    "extracted_params": {
      "location": "Malibu, CA",
      "property_type": "house"
    },
    "user_id": "test123",
    "relevance_threshold": 0.7
  }'
```

### Expected Response

```json
{
  "success": true,
  "matches": [...],
  "total_matches": 12,
  "radius_miles": 25,
  "center_coordinates": {
    "lat": 34.0259,
    "lon": -118.7798
  },
  "location_display": "Malibu, CA, USA"
}
```

---

## Cost Estimates

| Provider | Free Tier | Cost After |
|----------|-----------|------------|
| Google Maps | 40,000 requests/month | $5 per 1,000 |
| Mapbox | 100,000 requests/month | $0.50 per 1,000 |
| Nominatim | Unlimited | Free (1 req/sec limit) |

**Recommended:** Start with Mapbox (free tier is generous), upgrade to Google if needed.

---

## Benefits

✅ **Accurate Distance Filtering** - Only show listings within actual radius
✅ **Dynamic Adjustment** - Expand/contract radius based on result density
✅ **Better UX** - Users see "5.2 miles away" instead of hardcoded radius
✅ **Sort by Distance** - Results ordered by relevance + proximity
✅ **Location Type Awareness** - "San Francisco" gets bigger radius than "Mission District"

---

## Next Steps

1. **Choose API provider** (Mapbox recommended for free tier)
2. **Create `geocoding_service.py`** (copy from above)
3. **Update Elasticsearch mappings** (add `coordinates` field)
4. **Update `elastic_client.py`** (add `geo_search` method)
5. **Update `main.py`** (integrate geocoding service)
6. **Test with real locations**
7. **Re-index existing listings with coordinates**

---

## Future Enhancements

- **Caching**: Cache geocoding results to save API calls
- **Reverse Geocoding**: Convert coordinates back to addresses
- **Bounding Box**: Use viewport bounds from frontend map
- **Travel Time**: Use distance API for "within 30 min drive"
- **Multiple Locations**: Search "near Santa Monica OR Venice Beach"
