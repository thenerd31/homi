# 🌟 VIBE - AI-Native Home Sharing Platform

> **"Find your vibe, instantly"**

Reimagining Airbnb as if it were founded today - voice-first, AI-native, and immersive.

## 🎯 YC Track: Disrupting Airbnb with AI

**Thesis**: If Airbnb were founded in 2025, it wouldn't have filter dropdowns - it would have conversations. It wouldn't have endless scrolling - it would have intelligent swiping. It wouldn't have static photos - it would have AR previews.

### The Problem with 2008 Airbnb:
- 😫 Complex filter UIs with 50+ options
- 📜 Reading through 30+ listings manually
- 🤷 No idea what a place really looks like
- ⏰ Hosts spend hours crafting listings
- 📸 Bad photos = no bookings

### Our AI-Native Solution:
- 🗣️ **Voice/Text Search**: "Find me a cozy beach house in Malibu under $300 with a hot tub"
- 👆 **Tinder-Style Swipe**: AI-curated matches, swipe right to book
- 🥽 **AR Preview**: Point your Snap Spectacles at any space to see it furnished
- 🤖 **Auto-Optimize Listings**: Upload photos → AI writes everything + prices it
- 💬 **Per-Listing AI Assistant**: Ask anything about the property

---

## 🏆 Sponsor Track Strategy

### Primary Tracks (Focus Here!)

#### 1. **Fetch.ai** ($5,000 potential) 🔥
**Requirement**: Register agents on Agentverse + Claude reasoning

**Our Agents**:
- 🔍 **Search Agent**: Coordinates listing discovery
- 💰 **Pricing Agent**: Competitive market analysis
- 💬 **Q&A Agent**: Answers guest questions
- 🎭 **"Vibe Check" Personal AI**: Funny/viral AI with personality (for viral track)

**Implementation**: `agents/fetch_agents/`

#### 2. **Anthropic** 🧠
**Usage**:
- Vision API for photo analysis
- Claude as reasoning engine for all Fetch.ai agents
- Complex ranking and content generation

**Implementation**: `backend/services/vision_service.py`, `backend/services/claude_service.py`

#### 3. **Postman**
**Requirement**: AI Agent block orchestrating 2+ APIs

**Our Flow**:
```
User Input → AI Agent (decides APIs to call) →
[Supabase, Claude Vision, Pricing API, Elastic] →
Structured Result
```

**Implementation**: `postman-flows/main-orchestration.json`

#### 4. **LiveKit** (3 Prize Categories) 🎥
**Feature**: Virtual property tours with live video
- Host-to-guest video tours
- AI-powered tour guide agent

**Prize Categories**:
- Most Complex: Real-time AI tour guide agent
- Most Creative: AR + video hybrid tours
- Best Startup Idea: Monetizable "instant tours"

**Implementation**: `backend/services/livekit_service.py`

#### 5. **Snap** 🥽
**You have Spectacles!** This is a HUGE differentiator.

**Features**:
- Point Spectacles at a room → see listing overlay
- Virtual furniture placement
- Amenity highlights in AR

**Implementation**: `lens-studio/vibe-ar-lens/`

### Secondary Tracks (High Value, Less Work)

#### 6. **Groq** ⚡
Fast inference for real-time search filter extraction

#### 7. **Letta** 🧠
Stateful memory - learns user preferences over time

#### 8. **Elastic** 🔍
Vector search for semantic listing matching

#### 9. **Vapi** 🎤
Voice search interface

#### 10. **Toolhouse** 🛠️
Tool/function management for agents

#### 11. **Arize Phoenix** 📊
Observability - trace agent decisions, track hallucinations

#### 12. **Sui** ⛓️
On-chain reviews (tamper-proof reputation)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│         USER INTERFACES                             │
│  • Voice (Vapi) - "Find beach house under $200"    │
│  • Web (Next.js) - Tinder swipe interface          │
│  • AR (Snap Spectacles) - Immersive preview        │
│  • Video (LiveKit) - Live virtual tours            │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│         POSTMAN FLOWS (Orchestration)               │
│  Routes requests to appropriate services            │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│         FETCH.AI AGENTS (on Agentverse)             │
│  • Search Agent - finds listings                    │
│  • Pricing Agent - market analysis                  │
│  • Q&A Agent - guest questions                      │
│  • Vibe Check AI - viral personality                │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│         AI LAYER                                    │
│  • Letta (memory) • Groq (speed)                   │
│  • Anthropic (reasoning) • Toolhouse (tools)       │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│         DATA LAYER                                  │
│  • Elastic (vector search) • Supabase (storage)    │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
vibe/
├── frontend/                    # Next.js + Tailwind
│   ├── app/
│   │   ├── search/             # Voice/text search
│   │   ├── swipe/              # Tinder-style UI
│   │   ├── listing/[id]/       # Listing details
│   │   └── host/               # Host dashboard
│   ├── components/
│   │   ├── SwipeCard.tsx       # Tinder card component
│   │   ├── VoiceSearch.tsx     # Vapi integration
│   │   └── ARButton.tsx        # Snap Spectacles trigger
│   └── package.json
│
├── backend/                     # FastAPI
│   ├── main.py                 # Main API routes
│   ├── services/
│   │   ├── groq_service.py     # Fast inference
│   │   ├── vision_service.py   # Claude Vision
│   │   ├── letta_service.py    # Stateful memory
│   │   ├── vapi_service.py     # Voice interface
│   │   └── livekit_service.py  # Video tours
│   ├── agents/
│   │   └── fetch_agents/       # Fetch.ai uAgents
│   │       ├── search_agent.py
│   │       ├── pricing_agent.py
│   │       ├── qa_agent.py
│   │       └── vibe_check_ai.py
│   ├── utils/
│   │   ├── elastic_client.py   # Vector search
│   │   ├── supabase_client.py  # Database
│   │   └── toolhouse_client.py # Tool management
│   ├── monitoring/
│   │   └── arize_logger.py     # Phoenix tracing
│   └── requirements.txt
│
├── lens-studio/                 # Snap AR Lens
│   └── vibe-ar-lens/
│       ├── Assets/
│       ├── Scripts/
│       │   └── listing_overlay.js
│       └── vibe-lens.lsproj
│
├── postman-flows/               # Postman orchestration
│   ├── main-flow.json          # Main AI orchestration
│   ├── search-flow.json        # Search workflow
│   └── optimize-flow.json      # Listing optimization
│
├── blockchain/                  # Sui smart contracts
│   └── contracts/
│       └── review_system.move
│
├── docs/
│   ├── BRAINSTORM.md           # Ideas & planning
│   ├── TASKS.md                # Team task breakdown
│   ├── SPONSOR_REQUIREMENTS.md # Checklist
│   └── API.md                  # API documentation
│
└── README.md                    # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Snap Spectacles (for AR)
- API keys (see `.env.example`)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
cp .env.example .env
# Add your API keys to .env
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Add your API keys
npm run dev
```

### 3. Fetch.ai Agents
```bash
cd backend/agents/fetch_agents
python search_agent.py  # Runs and registers on Agentverse
```

### 4. Snap Lens
Open `lens-studio/vibe-ar-lens.lsproj` in Lens Studio

---

## 👥 Team Task Breakdown

See [TASKS.md](docs/TASKS.md) for detailed task assignments.

**Suggested Split**:
- **Person 1**: Frontend (Next.js, Tinder UI, Vapi voice)
- **Person 2**: Backend (FastAPI, Groq, Claude, Letta)
- **Person 3**: Fetch.ai Agents (uAgents on Agentverse)
- **Person 4**: AR Lens (Snap Lens Studio, LiveKit integration)

---

## 📊 Sponsor Checklist

Track progress: [SPONSOR_REQUIREMENTS.md](docs/SPONSOR_REQUIREMENTS.md)

---

## 🎬 Demo Flow

1. **Voice Search**: "Hey VIBE, find me a beach house in Malibu under $300"
2. **AI Processing**: Letta remembers you like modern design → filters applied
3. **Tinder Swipe**: See top 20 matches, swipe through
4. **Swipe Right**: Like a listing
5. **Ask Questions**: "Is this pet-friendly?" → Fetch.ai Q&A Agent responds
6. **AR Preview**: Put on Spectacles → see listing overlay in real space
7. **Virtual Tour**: Start LiveKit video call with host
8. **Book**: On-chain review posted to Sui

---

## 📝 API Endpoints

### Guest Endpoints
- `POST /api/search` - Natural language search
- `POST /api/voice-search` - Voice search (Vapi)
- `POST /api/swipe` - Track swipe actions
- `POST /api/listings/{id}/ask` - Q&A bot
- `GET /api/listings/{id}/ar-data` - AR overlay data
- `POST /api/listings/{id}/start-tour` - LiveKit video tour

### Host Endpoints
- `POST /api/optimize-listing` - Auto-optimize from photos
- `GET /api/pricing/analyze` - Competitive pricing

---

## 🏅 Judging Criteria Alignment

### YC Track
- ✅ Reimagines pre-2022 company (Airbnb)
- ✅ AI-native from ground up
- ✅ Solves real pain points

### Fetch.ai
- ✅ Multiple agents on Agentverse
- ✅ Claude as reasoning engine
- ✅ Viral Personal AI ("Vibe Check")

### Postman
- ✅ AI Agent orchestration
- ✅ Multi-API coordination
- ✅ Error handling & transparency

### LiveKit
- ✅ Technical complexity: AI tour guide
- ✅ Creative: AR + video hybrid
- ✅ Startup viability: Monetizable

---

## 📞 Support

- Discord: [Join our server](#)
- Issues: GitHub Issues
- Docs: `/docs` folder

---

Built with ❤️ at CalHacks 2025
