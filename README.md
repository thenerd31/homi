# Homi - Conversational Vacation Rental Search

## The Problem

Over 80% of Airbnb hosts are individuals, not companies. Many list only one property—a family beach house, a mountain cabin they inherited, a spare room in their home. These everyday people lack the time or design skills to create professional listings. They're stuck filling endless forms, writing descriptions that sound generic, guessing at competitive prices, and hoping their amateur iPhone photos attract bookings.

On the flip side, guests scroll endlessly through hundreds of listings, clicking through 20+ photos per property, trying to feel a vibe from static images. They toggle through 50+ filter dropdowns, read descriptions that all say "cozy" and "charming," and still can't tell if a place actually matches what they're looking for.

The process is slow, unpersonalized, and fundamentally outdated.

**What if listing and finding vacation rentals didn't have to take hours?**

## What We Built

Homi reimagines vacation rental search as a conversation, not a form. Instead of toggling filters, you describe what you want. Instead of scrolling endlessly, you swipe through intelligently matched properties. Instead of guessing at pricing and amenities, AI handles it automatically.

We built four key innovations that make this possible:

**Prompt-Based Semantic Search**
Say goodbye to keyword matching. We trained our search to understand what you *mean*, not just what you say. Ask for "a cozy place with beach vibes" and it finds properties with ocean views and hammocks, even if the listing never uses those exact words. The system uses vector embeddings to understand intent—it's like having a friend who actually gets what you're looking for instead of a robot that only knows exact matches.

**Smart Mapping with Dynamic Radius**
Ever search for "San Francisco" and get results in San Jose 50 miles away? We built a geocoding system that understands city sizes. Search for NYC and it looks within 35 miles (because NYC is huge). Search for Napa and it keeps it tight at 15 miles (because that's the whole valley). The system automatically maps over 40 US cities to GPS coordinates and adjusts search radius based on how sprawling or compact each city actually is.

**AI-Powered Dynamic Pricing**
Hosts don't have to guess what to charge anymore. Our pricing engine analyzes market rates for similar properties, calculates demand patterns (weekends vs weekdays, holiday premiums), and suggests competitive pricing with actual reasoning: "Similar 3-bedroom beach houses in your area go for $350-$450. Your ocean view and hot tub justify $380 on weekends. Holiday season? Bump it to $450."

**Real-Time Object Detection for Listings**
When hosts create listings, our vision system scans uploaded photos to automatically detect amenities. Upload a photo of your backyard and it spots the pool, hot tub, and BBQ grill. Show it your kitchen and it recognizes modern appliances and granite countertops. The system identifies over 50 property features automatically—no more manually checking boxes for every amenity. It also scores image quality, filtering out blurry shots and keeping only the best angles.

## What Makes It Different

**Traditional vacation rental search:**
- Toggle through 50+ filter dropdowns
- Scroll through endless listings
- Read generic descriptions
- No learning or personalization

**Homi:**
- Describe what you want in plain English (or by voice)
- Swipe through intelligently matched results
- System learns your preferences
- Auto-organized saved listings

---

## How It Works

### 1. Conversational Search

Instead of filter menus, just describe what you want:

```
You: "Beach house in California"
Homi: "When are you planning to visit?"
You: "Next weekend, 3 people"
Homi: "What's your budget per night?"
You: "Under $300"
```

The system extracts structured parameters (location, dates, guests, budget) from natural language across multiple conversation turns.

### 2. Semantic Search & Matching

Uses vector embeddings to understand intent beyond keywords:
- "Beach house with hot tub" matches properties even with different wording
- Geographic radius filtering (dynamic based on city size)
- Relevance threshold filtering (only show quality matches)
- Hybrid approach: semantic + keyword + structured filters

### 3. Swipe Interface

Results displayed in Tinder-inspired cards showing:
- Photo carousel
- Amenities
- Location + distance
- Price per night
- Beds/baths
- Rating

Swipe right = save, left = pass. System learns from swipe patterns.

### 4. Preference Learning

Tracks behavior to improve future searches:
- Swipe patterns (what features do you like?)
- Search history (typical destinations, budgets)
- Automatically incorporates learned preferences into future searches

### 5. Auto-Organized Favorites

Saved listings automatically sorted by:
- Original search relevance
- Learned preferences
- Current availability
- Price changes

---

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript, React 19
- **Styling**: Tailwind 4
- **Key Libraries**: Framer Motion (swipe gestures), Vapi SDK (voice)

**Key Routes**:
- `/discover/text` - Text-based conversational search
- `/discover/voice` - Voice input with push-to-talk
- `/discover/swipe` - Tinder-esque property cards
- `/sell` - Host listing creation (simulated)

### Backend Stack
- **Framework**: FastAPI (Python)
- **Validation**: Pydantic models
- **Architecture**: Service-oriented with dependency injection

**Core Services**:

**ConversationService** (`services/conversation_service.py`)
- Multi-turn dialogue management
- Parameter extraction using Claude
- Follow-up question generation
- State tracking across conversation

**VisionService** (`services/vision_service.py`)
- Image quality scoring
- Amenity detection from photos
- Multi-image analysis

**LettaService** (`services/letta_service.py`)
- User memory and context
- Preference learning from swipe patterns
- Historical search patterns

**PricingService** (`services/pricing_service.py`)
- Market rate analysis
- Competitive pricing recommendations
- Calendar-based pricing strategies

**VoiceService** (`services/voice_service.py`)
- Audio transcription via Groq Whisper
- Push-to-talk interface support

### Search & Data Layer

**ElasticClient** (`utils/elastic_client.py`)
- Vector embeddings for semantic search
- Hybrid search (semantic + keyword + filters)
- Geo-radius filtering
- Relevance scoring

**SupabaseClient** (`utils/supabase_client.py`)
- PostgreSQL database (listings, users, swipes)
- Object storage (images)
- User session management

**Geocoding** (`utils/geocoding.py`)
- City name → GPS coordinates
- Dynamic radius calculation by city size
- 40+ US cities mapped

### AI Models

**Anthropic Claude Sonnet 4.5**
- Conversational search dialogue
- Parameter extraction
- Content generation
- Vision analysis

**Groq**
- Fast parameter extraction (Llama)
- Audio transcription (Whisper)
- Real-time inference requirements

**Vapi**
- Voice synthesis (11labs)
- Speech-to-speech interface
- Push-to-talk implementation

**Elasticsearch Vector Search**
- Semantic embeddings
- K-NN similarity search
- Filtered vector queries

### Key API Endpoints

**Search Flow**:
```
POST /api/search/conversation
- Input: user message, conversation history, extracted params so far
- Output: assistant response, updated params, missing params, search status

POST /api/search/execute
- Input: extracted params, relevance threshold
- Output: ranked listings above threshold

POST /api/voice-to-text
- Input: audio file (webm)
- Output: transcribed text
```

**User Tracking**:
```
POST /api/swipe
- Input: user_id, listing_id, action (like/pass), metadata
- Output: success confirmation
- Side effect: Updates Letta with preference data

GET /api/saved-listings/{user_id}
- Output: Auto-ranked saved listings with reasoning
```

**Voice Interface**:
```
GET /api/vapi/public-key
- Output: Vapi public key for client initialization

GET /api/vapi/assistant
- Output: Assistant configuration (voice, model, system prompt)
```

---

## Data Flow

### Conversational Search Flow

```
1. User Input (text or voice)
   ↓
2. ConversationService.process_message()
   - Calls Claude with conversation history
   - Extracts parameters from user message
   - Validates extracted params (location not multi-city, guests reasonable, etc)
   - Merges with previously extracted params
   - Checks if all required params collected
   ↓
3a. If params incomplete:
   - Generate follow-up question for next missing param
   - Return question + quick-reply suggestions

3b. If params complete:
   - Signal ready_to_search
   - Proceed to search execution
   ↓
4. Search Execution
   - Build semantic query from params
   - Generate embedding
   - Query Elasticsearch with filters + vector search
   - Apply geo-radius if location specified
   - Filter by relevance threshold
   - Rank results
   ↓
5. Return Results
   - Top matches as swipeable cards
   - Store search in user history (Letta)
```

### Voice Interface Flow

```
1. User clicks mic button
   ↓
2. MediaRecorder captures audio
   ↓
3. User clicks again to stop
   ↓
4. Audio blob sent to /api/voice-to-text
   ↓
5. Groq Whisper transcribes
   ↓
6. Transcription sent to /api/search/conversation
   (same flow as text search)
   ↓
7. Assistant response returned
   ↓
8. Vapi speaks response (11labs voice)
   ↓
9. Repeat for multi-turn conversation
```

### Swipe Learning Flow

```
1. User swipes right/left on listing
   ↓
2. POST /api/swipe with action + listing metadata
   ↓
3. If swipe right:
   - Save to user's favorites (Supabase)
   - Send to Letta with full listing details

4. Letta analyzes pattern:
   - Preferred amenities (pools, hot tubs, etc)
   - Price range
   - Property types (house vs apartment)
   - Locations
   ↓
5. Future searches:
   - Boost listings matching learned preferences
   - Pre-fill common parameters
   - Suggest locations based on history
```

---

## Getting Started

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add API keys to .env
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Required Environment Variables**:
```
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...
ELASTIC_CLOUD_ID=...
ELASTIC_API_KEY=...
SUPABASE_URL=https://...
SUPABASE_KEY=...
VAPI_API_KEY=...
VAPI_PUBLIC_KEY=...
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Seeding
```bash
cd backend
python seed_data.py  # Seeds Elasticsearch + Supabase with 40 listings
```

**Dataset**: 40 vacation rental listings across 30 US cities with GPS coordinates

---

## Project Structure

```
vibe/
├── frontend/
│   ├── app/
│   │   ├── discover/
│   │   │   ├── text/page.tsx      # Text-based search UI
│   │   │   ├── voice/page.tsx     # Voice interface with Vapi
│   │   │   └── swipe/page.tsx     # Tinder-inspired cards
│   │   ├── sell/                  # Host flow (demo only)
│   │   └── components/            # Shared UI components
│   └── lib/
│       └── api.ts                 # API client wrapper
│
├── backend/
│   ├── main.py                    # All route handlers
│   ├── services/
│   │   ├── conversation_service.py  # Multi-turn search
│   │   ├── vision_service.py        # Image analysis
│   │   ├── letta_service.py         # User memory
│   │   ├── pricing_service.py       # Market analysis
│   │   └── voice_service.py         # Transcription
│   ├── utils/
│   │   ├── elastic_client.py        # Search engine
│   │   ├── supabase_client.py       # Database
│   │   └── geocoding.py             # GPS mapping
│   ├── agents/fetch_agents/         # Autonomous agents
│   ├── seed_data.py                 # Database seeding
│   └── test_*.py                    # Test scripts
│
└── README.md
```

---

## Development & Testing

### Running Tests
```bash
cd backend

# Test conversational search
python test_buyer_seller_flows.py

# Test geo-search with all cities
python test_geo_direct.py

# Test full integration
python test_comprehensive.py
```

### Architecture Decisions

**Why FastAPI?**
- Native async/await support for concurrent API calls
- Automatic OpenAPI docs
- Pydantic validation
- Fast enough for hackathon scale

**Why Next.js 16 App Router?**
- Server + client components
- Built-in routing
- TypeScript support
- Fast refresh for development

**Why Elasticsearch?**
- Vector search with hybrid queries
- Geographic filtering
- Scalable to millions of listings
- Rich query DSL

**Why Claude Sonnet 4.5?**
- Best-in-class conversation capabilities
- Excellent parameter extraction
- Vision API for image analysis
- Long context windows for conversation history

**Why Groq?**
- Fastest inference (important for real-time feel)
- Good enough for parameter extraction
- Whisper for audio transcription

---

## Performance Considerations

**Conversational Search**: ~1-2s response time (Claude API call)
**Search Execution**: ~500ms (Elasticsearch query + ranking)
**Voice Transcription**: ~1-2s (Groq Whisper)
**Voice Synthesis**: ~1-3s (Vapi 11labs)

**Optimizations**:
- Conversation state cached client-side
- Elasticsearch results cached (5min TTL)
- Lazy loading for images
- Optimistic UI updates for swipes

---

Built for CalHacks 2025
