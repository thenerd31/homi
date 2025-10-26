# Claude CSV Search Implementation

This implementation replaces Supabase/Elasticsearch search with Claude-powered CSV parsing for intelligent listing matching.

## Overview

The system now uses Claude to:
1. Parse CSV files containing Airbnb listing data
2. Intelligently match user preferences with listings
3. Return top 20 ranked results based on user query
4. Provide dynamic listing detail pages

## New Files Created

### Backend

1. **`backend/services/csv_search_service.py`**
   - Core service for Claude-powered CSV search
   - Loads listings from CSV files in `frontend/public/datasets/`
   - Uses Claude Sonnet 4 to rank and match listings
   - Supports location, guests, budget filtering
   - Methods:
     - `search_with_claude()` - Main search function
     - `get_listing_by_id()` - Get single listing details
     - `_load_csv_data()` - Load CSV files
     - `_basic_filter()` - Pre-filter by guests/budget

2. **`backend/main_extended.py`**
   - Adds new routes to FastAPI app
   - Import this in `main.py` to activate Claude search
   - Routes:
     - `POST /api/claude-search` - Search with Claude
     - `GET /api/listing/{listing_id}` - Get listing details

3. **`backend/routes/search_routes.py`**
   - Alternative router-based implementation
   - Contains same routes as main_extended.py

4. **`backend/activate_claude_search.py`**
   - Standalone test script
   - Run to test CSV search without starting full backend

### Frontend

1. **`frontend/app/listing-detail/[id]/page.tsx`**
   - Dynamic listing detail page
   - Fetches listing from `/api/listing/{id}`
   - Displays:
     - Listing name, description, images
     - Host information
     - Amenities
     - Price, bedrooms, beds, bathrooms
     - Location
     - Rating and reviews

2. **`frontend/app/components/ui/listing-card-dynamic.tsx`**
   - Enhanced listing card component
   - Clickable to navigate to detail page
   - Accepts `listingId` prop
   - Displays listing name, price, location, beds/baths

3. **`frontend/app/discover/swipe-claude/page.tsx`**
   - New swipe page using Claude search
   - Fetches listings from `/api/claude-search`
   - Accepts URL params:
     - `query` - Natural language search
     - `location` - Desired location
     - `guests` - Number of guests
     - `budget` - Max price per night
   - Uses `ListingCardDynamic` component

## Setup Instructions

### 1. Activate Backend Routes

Add this to `backend/main.py` after app initialization:

```python
# Import and activate Claude CSV search routes
from main_extended import add_claude_search_routes
add_claude_search_routes(app)
```

### 2. Ensure CSV Files Exist

The CSV files should be in:
```
frontend/public/datasets/
├── sf_listings.csv
├── la_listings.csv
├── seattle_listings.csv
├── hawaii.csv
├── denver_listings.csv
├── dtx_listings.csv (Dallas)
├── atx_listings.csv (Austin)
├── chi_listings.csv (Chicago)
└── bos_listings.csv (Boston)
```

### 3. Test Backend (Optional)

Run the test script:

```bash
cd backend
python activate_claude_search.py
```

This will test Claude search without starting the full server.

### 4. Start Backend

```bash
cd backend
uvicorn main:app --reload
```

The new routes will be available at:
- `http://localhost:8000/api/claude-search` (POST)
- `http://localhost:8000/api/listing/{id}` (GET)

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

## Usage

### Option 1: Direct Navigation

Navigate to the new swipe page with search params:

```
http://localhost:3000/discover/swipe-claude?query=cozy+apartment&location=San+Francisco&guests=2&budget=200
```

### Option 2: Programmatic Search

Use the API directly:

```typescript
const response = await fetch('http://localhost:8000/api/claude-search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: "I want a beachfront property with a pool",
    location: "Los Angeles",
    guests: 4,
    budget: 300,
    limit: 20
  })
});

const data = await response.json();
console.log(data.listings); // Array of matched listings
```

### Option 3: View Listing Details

Click on any listing card or navigate to:

```
http://localhost:3000/listing-detail/{listing_id}
```

## How It Works

### 1. CSV Loading

The service loads CSV files based on location:

```python
# Location mapping
"san francisco": "sf_listings.csv"
"los angeles": "la_listings.csv"
# etc...
```

If no location specified, loads all CSV files.

### 2. Basic Filtering

Before sending to Claude, the service filters by:
- Guest capacity (must accommodate specified guests)
- Budget (price must be <= budget)

This reduces data sent to Claude API.

### 3. Claude Ranking

The service:
1. Takes top 200 listings by review count
2. Creates condensed listing data (name, description preview, price, etc.)
3. Sends to Claude with user query
4. Claude returns array of indices for best matches
5. Service returns full listing data in ranked order

### 4. Response Format

```json
{
  "success": true,
  "listings": [
    {
      "id": "12345",
      "name": "Cozy Downtown Apartment",
      "description": "...",
      "picture_url": "https://...",
      "host_name": "John Doe",
      "host_location": "San Francisco, CA",
      "host_picture_url": "https://...",
      "amenities": ["WiFi", "Kitchen", "TV"],
      "price": 150,
      "property_type": "Entire apartment",
      "room_type": "Entire home/apt",
      "accommodates": 4,
      "bedrooms": 2,
      "beds": 2,
      "bathrooms_text": "2 baths",
      "neighbourhood": "Downtown",
      "latitude": "37.7749",
      "longitude": "-122.4194",
      "rating": 4.8,
      "number_of_reviews": 50
    }
  ],
  "count": 20
}
```

## CSV Data Format

The CSV files should have these columns:

Required:
- `id` - Unique listing ID
- `name` - Listing name/title
- `description` - Full description
- `price` - Price per night (e.g., "$150.00")
- `picture_url` - Main image URL

Recommended:
- `host_name` - Host's name
- `host_location` - Host's location
- `host_picture_url` - Host's profile picture
- `amenities` - JSON array string of amenities
- `property_type` - Type of property
- `room_type` - Room type
- `accommodates` - Number of guests
- `bedrooms` - Number of bedrooms
- `beds` - Number of beds
- `bathrooms_text` - Bathroom description
- `neighbourhood_cleansed` - Neighborhood name
- `latitude` - Latitude coordinate
- `longitude` - Longitude coordinate
- `review_scores_rating` - Average rating
- `number_of_reviews` - Total reviews

## Advantages Over Supabase/Elasticsearch

1. **No External Dependencies**: Works with local CSV files
2. **AI-Powered Matching**: Claude understands natural language queries better
3. **Contextual Ranking**: Claude considers multiple factors holistically
4. **Cost Effective**: No database hosting costs (just Claude API calls)
5. **Easy to Test**: Can run with local data immediately

## Limitations

1. **API Costs**: Each search calls Claude API
2. **Scale**: Not suitable for millions of listings (use Elasticsearch for that)
3. **Speed**: Slower than vector database for large datasets
4. **Static Data**: CSV files must be updated manually

## Next Steps

To integrate into existing flow:

1. **Update Discover Page**: Modify `/discover/text/page.tsx` to use Claude search
2. **Replace Swipe Data**: Update `/discover/swipe/page.tsx` to fetch from Claude
3. **Conversation Integration**: Connect conversational search to Claude CSV search
4. **Add Caching**: Cache Claude results to reduce API calls
5. **Image Support**: Handle multiple images per listing (currently only shows first)

## Troubleshooting

**"Listing not found" error:**
- Check that CSV files exist in `frontend/public/datasets/`
- Verify listing ID is in one of the CSV files

**"No listings found":**
- Check location mapping in `csv_search_service.py`
- Verify CSV files have data

**Claude API errors:**
- Check `ANTHROPIC_API_KEY` in `.env`
- Verify you have API credits

**CORS errors:**
- Ensure backend is running on `http://localhost:8000`
- Check CORS middleware is enabled in `main.py`
