# 🌟 VIBE - AI-Native Home Sharing Platform

> **"Find your vibe, instantly"**

Reimagining Airbnb as if it were founded today - conversational, intelligent, and AR-native.

## 🎯 YC Track: Disrupting Airbnb with AI

**Thesis**: If Airbnb were founded in 2025, it wouldn't have filter dropdowns - it would have conversations. It wouldn't have endless scrolling - it would have intelligent swiping. It wouldn't have hosts manually listing - AR glasses would do it automatically.

### The Problem with 2008 Airbnb:
- 😫 Complex filter UIs with 50+ options
- 📜 Reading through 30+ listings manually
- ⏰ Hosts spend hours crafting listings
- 📸 Bad photos = no bookings
- 🤷 No personalization or learning

### Our AI-Native Solution:

## 🏗️ THE ACTUAL ARCHITECTURE

### **BUYER FLOW** 🛒

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CONVERSATIONAL SEARCH (with follow-ups)                 │
└─────────────────────────────────────────────────────────────┘
  User: "I want a beach house in California"
  AI: "Great! When are you planning to visit?"
  User: "Next weekend, 3 guests"
  AI: "What's your budget per night?"
  User: "Under $300"

  ↓ SPONSOR: Anthropic Claude (conversation), Groq (extraction)

┌─────────────────────────────────────────────────────────────┐
│ 2. INTELLIGENT FILTER EXTRACTION                           │
└─────────────────────────────────────────────────────────────┘
  AI extracts:
  {
    "location": "California coast",
    "dates": "2025-11-01 to 2025-11-03",
    "guests": 3,
    "price_max": 300,
    "amenities_inferred": ["beach access", "parking"]
  }

  ↓ SPONSOR: Letta (learns preferences over time)

┌─────────────────────────────────────────────────────────────┐
│ 3. SEMANTIC SEARCH + MATCHING                              │
└─────────────────────────────────────────────────────────────┘
  - Query Elasticsearch with filters + embeddings
  - Find matches above threshold (e.g., 80% relevance)
  - Use Maps API for radius filtering

  ↓ SPONSOR: Elastic (vector search)

┌─────────────────────────────────────────────────────────────┐
│ 4. TINDER-STYLE SWIPING                                    │
└─────────────────────────────────────────────────────────────┘
  Show cards with:
  - Photo carousel
  - Amenities list
  - Location + distance
  - Price per night
  - Beds/baths
  - Star rating

  Swipe Right = Like
  Swipe Left = Pass

  ↓ SPONSOR: Letta (tracks swipe patterns)

┌─────────────────────────────────────────────────────────────┐
│ 5. AUTO-ORGANIZED SAVED LISTINGS                          │
└─────────────────────────────────────────────────────────────┘
  All "swipe right" listings saved and sorted by:
  - Relevance to original search
  - Learned preferences from past swipes
  - Availability

  ↓ SPONSOR: Anthropic Claude (ranking)

┌─────────────────────────────────────────────────────────────┐
│ 6. LISTING DETAILS & ACTIONS                               │
└─────────────────────────────────────────────────────────────┘
  Click on card to:

  OPTION A: Message Seller
    - Real-time chat
    - AI-suggested questions

  OPTION B: Reserve
    - Confirm dates
    - Payment processing
    - Auto-update seller calendar
    - Auto-send confirmation email

  ↓ SPONSORS: (messaging), (payments), (email)

┌─────────────────────────────────────────────────────────────┐
│ 7. OPTIONAL: 3D/AR PREVIEW (still deciding)                │
└─────────────────────────────────────────────────────────────┘
  - Frontend renders 3D model of property
  - OR: Just show high-quality photos

  ↓ SPONSOR: Snap (if we do 3D models)
```

---

### **SELLER FLOW** 🏡

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PUT ON AR GLASSES & START SCAN                          │
└─────────────────────────────────────────────────────────────┘
  Host: Puts on Snap Spectacles
  App: "Point camera at each room. Walk slowly."

  ↓ SPONSOR: Snap (AR Spectacles + Lens Studio)

┌─────────────────────────────────────────────────────────────┐
│ 2. REAL-TIME AR OBJECT DETECTION                          │
└─────────────────────────────────────────────────────────────┘
  AS SELLER SCANS:
  - Camera detects objects in real-time
  - AR labels appear: "Pool ✓", "Hot tub ✓", "Ocean view ✓"
  - Feedback: "Good coverage. Move to next room."

  Backend receives:
  - Stream of images
  - Detected amenities in real-time
  - Room dimensions (from AR depth)

  ↓ SPONSORS: Snap (object detection), Anthropic Vision (verification)

┌─────────────────────────────────────────────────────────────┐
│ 3. IMAGE PROCESSING & FILTERING                            │
└─────────────────────────────────────────────────────────────┘
  - Backend receives many images
  - Smooth out blurry/bad images
  - Filter for best quality photos
  - Detect duplicate angles
  - Select top 10-15 photos

  ↓ SPONSOR: Anthropic Claude Vision (quality scoring)

┌─────────────────────────────────────────────────────────────┐
│ 4. GENERATE INITIAL LISTING                                │
└─────────────────────────────────────────────────────────────┘
  AI auto-generates:
  - Title (e.g., "Modern Beachfront Villa with Pool")
  - Description (engaging, highlights amenities)
  - Amenity list (from AR detection)
  - Location (from GPS)
  - Beds/baths count

  ↓ SPONSOR: Groq (fast content generation)

┌─────────────────────────────────────────────────────────────┐
│ 5. SELLER REVIEWS VIA CHATBOT                              │
└─────────────────────────────────────────────────────────────┘
  Chatbot: "Here's your listing. Want to make any changes?"

  Seller: "Change title to include 'oceanfront'"
  Chatbot: "Updated! Anything else?"

  Seller: "Remove the bathroom photo"
  Chatbot: "Done. Confirm location, amenities, and photos?"

  Seller: "Looks good"

  ↓ SPONSOR: Anthropic Claude (conversational agent)

┌─────────────────────────────────────────────────────────────┐
│ 6. SET AVAILABILITY & DATES                                │
└─────────────────────────────────────────────────────────────┘
  Chatbot: "What dates are you available to host?"

  Seller: "Weekends in November, and Dec 15-30"

  Chatbot: Shows calendar view
  Seller: Confirms dates

  ↓ SPONSOR: (calendar integration)

┌─────────────────────────────────────────────────────────────┐
│ 7. AI PRICING SUGGESTION                                   │
└─────────────────────────────────────────────────────────────┘
  Chatbot: "Based on your dates, location, and amenities:
  - Weekends: $380/night (high demand)
  - Weekdays: $280/night
  - Dec 15-30: $450/night (holiday premium)

  Market analysis:
  - Similar properties: $300-500/night
  - Your amenities justify premium pricing
  - Nov weekends have 85% booking rate"

  Seller: "Sounds good" OR adjusts prices

  ↓ SPONSORS: Groq (market analysis), Fetch.ai (pricing agent)

┌─────────────────────────────────────────────────────────────┐
│ 8. FINAL CONFIRMATION & PUBLISH                            │
└─────────────────────────────────────────────────────────────┘
  Chatbot: "Ready to publish your listing?"
  Seller: "Yes"

  → Listing goes live
  → Indexed in Elasticsearch
  → Available for buyer searches
  → Seller notified when someone swipes right

  ↓ SPONSOR: Elastic (indexing), Supabase (storage)
```

---

## 🛠️ BACKEND IMPLEMENTATION GUIDE

### **What You Need to Build**

#### **1. Conversational Search API**

**Endpoint**: `POST /api/search/conversation`

```python
# Flow:
# 1. User sends message
# 2. Check if we have all required parameters
# 3. If missing params, ask follow-up question
# 4. Once all params collected, run search

REQUIRED_PARAMS = [
    "location",      # Where?
    "dates",         # When? (check-in, check-out)
    "guests",        # How many people?
    "price_max",     # Budget?
]

OPTIONAL_PARAMS = [
    "bedrooms",
    "amenities",
    "property_type"
]

# SPONSORS:
# - Anthropic Claude: Conversation management
# - Groq: Fast parameter extraction
# - Letta: Remember user's past preferences
```

**Response**:
```json
{
  "message": "What's your budget per night?",
  "missing_params": ["price_max"],
  "extracted_so_far": {
    "location": "California coast",
    "dates": {"check_in": "2025-11-01", "check_out": "2025-11-03"},
    "guests": 3
  },
  "suggestions": ["Under $200", "$200-$300", "$300-$500", "$500+"]
}
```

---

#### **2. Intelligent Matching with Threshold**

**Endpoint**: `POST /api/search/execute`

```python
# Once all params collected:
# 1. Generate semantic embedding from query
# 2. Search Elasticsearch with filters
# 3. Calculate relevance scores
# 4. Return only matches above threshold (e.g., 80%)
# 5. Use Maps API to filter by radius

# SPONSORS:
# - Elastic: Vector search + filters
# - Maps API: Geo radius
# - Fetch.ai: Search agent coordination
```

**Response**:
```json
{
  "matches": [
    {
      "id": "listing-123",
      "relevance_score": 0.94,
      "title": "Beachfront Villa",
      "price": 280,
      "distance_miles": 2.3,
      "photos": ["url1", "url2"],
      "amenities": ["pool", "hot_tub", "beach_access"],
      "beds": 3,
      "baths": 2,
      "rating": 4.8
    }
  ],
  "total_matches": 15,
  "hardcoded_radius_miles": 25
}
```

---

#### **3. Swipe Tracking & Learning**

**Endpoint**: `POST /api/swipe`

```python
# Track every swipe:
# 1. Store swipe right in user's saved listings
# 2. Send to Letta for preference learning
# 3. Analyze patterns (likes pools, prefers modern, etc.)
# 4. Use patterns to boost future search results

# SPONSORS:
# - Letta: Learn preferences from swipes
# - Supabase: Store swipe history
```

**Request**:
```json
{
  "user_id": "user-abc",
  "listing_id": "listing-123",
  "action": "like",  // or "pass"
  "metadata": {
    "price": 280,
    "amenities": ["pool", "hot_tub"],
    "property_type": "villa"
  }
}
```

---

#### **4. Auto-Organized Saved Listings**

**Endpoint**: `GET /api/saved-listings/{user_id}`

```python
# Get all swipe-right listings
# Sort by:
# 1. Original search relevance
# 2. Learned preferences
# 3. Availability
# 4. Price changes

# SPONSOR: Anthropic Claude (re-ranking with reasoning)
```

**Response**:
```json
{
  "saved_listings": [
    {
      "id": "listing-123",
      "rank": 1,
      "rank_reason": "Matches your preference for pools and modern design. Price just dropped $20.",
      "original_relevance": 0.94,
      "availability": "available",
      ...
    }
  ]
}
```

---

#### **5. Real-Time AR Scanning (Seller Flow)**

**Endpoint**: `POST /api/scan/stream` (WebSocket or SSE)

```python
# AS SELLER SCANS WITH SPECTACLES:
# 1. Receive video stream from Lens Studio
# 2. Run real-time object detection
# 3. Send back AR labels to display
# 4. Store detected amenities
# 5. Quality-score each frame

# TECHNICAL:
# - WebSocket for bidirectional streaming
# - OR: Server-Sent Events for AR labels
# - Claude Vision API for object detection
# - Store best frames for final listing

# SPONSORS:
# - Snap: Spectacles + Lens Studio
# - Anthropic Vision: Object detection
# - Supabase: Store images
```

**Flow**:
```
SELLER SENDS (via WebSocket):
{
  "type": "frame",
  "image": "base64_encoded_image",
  "timestamp": "...",
  "depth_data": {...}  // from AR
}

BACKEND RESPONDS:
{
  "type": "ar_labels",
  "detected": [
    {"object": "pool", "confidence": 0.95, "bbox": [x, y, w, h]},
    {"object": "ocean_view", "confidence": 0.88, "bbox": [...]}
  ],
  "feedback": "Good coverage. Move to bedroom next."
}
```

---

#### **6. Image Quality Filtering**

**Endpoint**: `POST /api/scan/finalize`

```python
# After scan complete:
# 1. Get all captured frames
# 2. Filter blurry images (sharpness score)
# 3. Remove duplicates (image similarity)
# 4. Select best angles (composition score)
# 5. Return top 10-15 photos

# SPONSOR: Anthropic Claude Vision (quality scoring)
```

---

#### **7. Seller Chatbot Onboarding**

**Endpoint**: `POST /api/listing/chatbot`

```python
# Conversational flow:
# 1. Generate initial listing from scan data
# 2. Present to seller for review
# 3. Accept natural language edits
# 4. Update listing in real-time
# 5. Confirm each section before moving to next

# SPONSOR: Anthropic Claude (conversational agent)
```

**Example conversation**:
```json
// Initial
{
  "message": "Here's your listing. Want to make changes?",
  "generated_listing": {
    "title": "Modern Beachfront Villa with Pool",
    "description": "...",
    "amenities": ["pool", "hot_tub", "ocean_view"],
    "photos": [...]
  }
}

// Seller response
{
  "user_message": "Change title to include 'luxury'"
}

// Chatbot updates
{
  "message": "Updated to 'Luxury Beachfront Villa with Pool'. Anything else?",
  "updated_listing": {...}
}
```

---

#### **8. AI Pricing with Calendar**

**Endpoint**: `POST /api/pricing/suggest`

```python
# Input: dates, location, amenities, property_type
#
# AI analyzes:
# 1. Market rates for similar properties
# 2. Demand by date (weekends vs weekdays)
# 3. Seasonal pricing (holidays, summer, etc.)
# 4. Historical booking rates
# 5. Competitive positioning
#
# Output: Suggested price per date range with reasoning

# SPONSORS:
# - Groq: Fast market analysis
# - Fetch.ai: Pricing agent
```

**Response**:
```json
{
  "pricing_suggestions": [
    {
      "date_range": "Nov weekends",
      "suggested_price": 380,
      "reasoning": "High demand (85% booking rate), weekend premium",
      "comparable_properties": [
        {"listing": "abc", "price": 400},
        {"listing": "def", "price": 350}
      ]
    },
    {
      "date_range": "Dec 15-30",
      "suggested_price": 450,
      "reasoning": "Holiday season, premium location, high demand"
    }
  ],
  "market_position": "luxury",
  "confidence": 0.89
}
```

---

#### **9. Booking & Messaging**

**Endpoints**:
```python
POST /api/booking/create     # Reserve dates, process payment
POST /api/messages/send      # Buyer-seller messaging
GET  /api/calendar/{listing_id}  # Availability calendar
```

**Sponsors**: TBD (Stripe for payments?)

---

## 📊 SPONSOR TRACK MAPPING

### **Required for Each Sponsor**

| Sponsor | Where Used | Feature |
|---------|-----------|---------|
| **Anthropic** | Conversation, Vision, Ranking | Claude for conversational search, chatbot, object detection, quality scoring |
| **Groq** | Filter extraction, Content gen | Fast parameter extraction, listing title/description, market analysis |
| **Letta** | User memory | Learn preferences from searches and swipes |
| **Elastic** | Search engine | Vector embeddings + filters for semantic search |
| **Snap** | AR scanning | Spectacles + Lens Studio for seller property scanning with real-time object detection |
| **Supabase** | Database | Store listings, users, swipes, messages |
| **Fetch.ai** | Agents | Search Agent, Pricing Agent, Q&A Agent on Agentverse |
| **Postman** | Orchestration | AI Agent block coordinating APIs |
| **Vapi** (optional) | Voice search | Voice input instead of text |
| **LiveKit** (optional) | Live tours | Optional video tours feature |
| **Toolhouse** | Tool management | Function calling for agents |
| **Arize** | Monitoring | Trace AI decisions, detect hallucinations |

---

## 📁 PROJECT STRUCTURE

```
vibe/
├── frontend/                    # Next.js + Tailwind
│   ├── app/
│   │   ├── search/             # Conversational search UI
│   │   ├── swipe/              # Tinder-style cards
│   │   ├── saved/              # Auto-organized saved listings
│   │   ├── listing/[id]/       # Details + booking
│   │   ├── messages/           # Buyer-seller chat
│   │   └── host/
│   │       ├── scan/           # AR scanning flow
│   │       ├── chatbot/        # Listing review chatbot
│   │       └── calendar/       # Availability + pricing
│   └── components/
│       ├── SwipeCard.tsx       # Tinder card
│       ├── ConversationalSearch.tsx
│       └── ARScanFeedback.tsx
│
├── backend/                     # FastAPI
│   ├── main.py
│   ├── services/
│   │   ├── conversation_service.py   # NEW: Conversational search
│   │   ├── groq_service.py           # Filter extraction
│   │   ├── vision_service.py         # Object detection + quality
│   │   ├── letta_service.py          # Preference learning
│   │   ├── pricing_service.py        # Calendar-based pricing
│   │   ├── booking_service.py        # NEW: Reservations
│   │   └── messaging_service.py      # NEW: Chat
│   ├── websockets/
│   │   └── scan_stream.py            # NEW: Real-time AR scanning
│   ├── agents/
│   │   └── fetch_agents/
│   │       ├── search_agent.py
│   │       ├── pricing_agent.py
│   │       └── qa_agent.py
│   └── utils/
│       ├── elastic_client.py
│       ├── supabase_client.py
│       └── image_processing.py       # NEW: Filter/quality
│
├── lens-studio/                 # Snap AR Lens
│   └── vibe-seller-scan/
│       ├── Scripts/
│       │   ├── ARObjectDetector.js   # Real-time labels
│       │   └── ScanGuidance.js       # User feedback
│       └── vibe-scan.lsproj
│
└── README.md
```

---

## 🚀 GETTING STARTED

### 1. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add API keys
uvicorn main:app --reload
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Lens Studio (Seller Scanning)
- Open `lens-studio/vibe-seller-scan.lsproj`
- Build AR lens with real-time object detection
- Connect to backend WebSocket for labels

---

## 🎬 DEMO FLOW

### Buyer Side:
1. Open app → "I want a beach house"
2. AI asks follow-ups → fills in location, dates, guests, budget
3. Shows 15 Tinder cards matching criteria
4. Swipe right on 3 properties
5. View auto-organized saved list
6. Click card → message seller OR book directly

### Seller Side:
1. Put on Spectacles
2. App guides scanning: "Point at each room"
3. AR labels appear in real-time: "Pool ✓", "Kitchen ✓"
4. Scan completes → best photos auto-selected
5. Chatbot shows listing → seller makes tweaks
6. Select available dates in calendar
7. AI suggests prices → seller confirms
8. Publish → listing goes live

---

Built with ❤️ for CalHacks 2025
