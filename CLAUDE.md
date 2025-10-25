# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VIBE is an AI-native home sharing platform that reimagines Airbnb with conversational search, Tinder-style swiping, and AR-powered listing creation. Built for CalHacks 2025 to demonstrate how a travel platform would be designed today using modern AI capabilities.

**Core Innovation**: Replace traditional filter UIs with natural conversation, replace endless scrolling with intelligent swiping, and replace manual listing creation with AR-powered scanning.

## Architecture

### Monorepo Structure

- **`backend/`** - FastAPI backend (Python)
- **`frontend/`** - Next.js 16 frontend (TypeScript, React 19, Tailwind 4)
- **`backend/agents/fetch_agents/`** - Fetch.ai autonomous agents (separate processes)
- **`docs/`** - Documentation and planning files

### Backend Architecture (FastAPI)

**Entry Point**: `backend/main.py` - Main FastAPI application with all route handlers

**Services** (`backend/services/`):
- `conversation_service.py` - Multi-turn conversational search with parameter extraction
- `groq_service.py` - Fast inference for parameter extraction and content generation
- `vision_service.py` - Anthropic Claude Vision for AR object detection and image quality scoring
- `letta_service.py` - User preference learning and memory management
- `qa_service.py` - Conversational Q&A about listings
- `pricing_service.py` - AI-powered dynamic pricing with market analysis
- `voice_service.py` - Groq Whisper for voice-to-text transcription
- `livekit_service.py` - Real-time video tours
- `saved_listings_service.py` - Auto-organized saved listings with intelligent ranking
- `seller_chatbot_service.py` - Conversational listing creation and editing
- `image_filter_service.py` - Quality filtering and image selection
- `preference_analysis_service.py` - Analyze user swipe patterns

**Utilities** (`backend/utils/`):
- `elastic_client.py` - Elasticsearch integration for semantic search with vector embeddings
- `supabase_client.py` - Database and storage operations

**Fetch.ai Agents** (`backend/agents/fetch_agents/`):
Run as separate processes. Each agent is autonomous:
- `search_agent.py` - Coordinate search operations
- `pricing_agent.py` - Market analysis and pricing recommendations
- `qa_agent.py` - Answer questions about listings
- `vibe_check_ai.py` - Overall platform intelligence coordinator

To run an agent: `cd backend/agents/fetch_agents && python search_agent.py`

### Frontend Architecture (Next.js)

**App Router Structure** (`frontend/app/`):
- `page.tsx` - Landing page
- `discover/` - Buyer flow
  - `page.tsx` - Search mode selection (text, voice, multimodal)
  - `text/page.tsx` - Text-based conversational search
  - `voice/page.tsx` - Voice input for search
  - `multimodal/page.tsx` - Combined text + voice + image search
  - `swipe/page.tsx` - Tinder-style property swiping interface
- `sell/page.tsx` - Seller flow (AR scanning simulation, listing creation)
- `components/` - Shared UI components

**Key Technologies**:
- Framer Motion for animations (Tinder-style swipe gestures)
- Lucide React for icons
- Tailwind 4 for styling with `class-variance-authority` for component variants
- Server and client components (careful with `'use client'` directive)

## Development Workflow

### Running the Application

**Backend**:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Configure API keys
uvicorn main:app --reload  # Runs on http://localhost:8000
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:3000
```

**Fetch.ai Agents** (optional):
```bash
cd backend/agents/fetch_agents
python search_agent.py  # Run each agent in separate terminal
```

### Testing

Backend has extensive test coverage in `backend/test_*.py` files:
- `test_buyer_seller_flows.py` - End-to-end flow testing
- `test_comprehensive.py` - Comprehensive API testing
- `test_integration.py` - Integration tests
- `test_real_apis.py` - Tests against real external APIs

Run tests: `cd backend && python test_buyer_seller_flows.py`

### API Keys and Environment

**Required API Keys** (see `backend/.env.example`):
- `ANTHROPIC_API_KEY` - Claude for conversations, vision, and reasoning
- `GROQ_API_KEY` - Fast inference for parameter extraction
- `SUPABASE_URL` + `SUPABASE_KEY` - Database and storage
- `ELASTIC_CLOUD_ID` + `ELASTIC_API_KEY` - Semantic search

**Optional API Keys**:
- `LETTA_API_KEY` - User memory and preference learning
- `VAPI_API_KEY` - Real-time voice conversations
- `LIVEKIT_API_KEY` - Video tours
- `TOOLHOUSE_API_KEY` - Tool management for agents
- `ARIZE_API_KEY` - AI monitoring and observability

All services gracefully degrade when API keys are missing (mock mode).

## Key Flows

### Buyer Flow (Conversational Search → Swipe → Save)

1. User enters natural language query (text or voice)
2. `ConversationService` extracts parameters (location, dates, guests, budget) using Groq
3. Missing parameters trigger follow-up questions via Claude
4. When complete, `ElasticClient` performs semantic search with vector embeddings
5. Results displayed in Tinder-style swipeable cards (`frontend/app/discover/swipe/`)
6. Swipe right saves listing, swipe left passes
7. `LettaService` learns preferences from swipe patterns
8. `SavedListingsService` auto-organizes saved listings with intelligent ranking

### Seller Flow (AR Scan → AI Generation → Review)

1. Seller initiates AR scanning flow (`frontend/app/sell/`)
2. In production: Snap Spectacles stream video → `VisionService` detects objects
3. Current demo: Upload photos → `ImageFilterService` selects best images
4. `VisionService` detects amenities (pool, ocean view, etc.)
5. `SellerChatbotService` generates listing (title, description, amenities)
6. Conversational refinement: seller makes edits via natural language
7. `PricingService` suggests dynamic pricing based on market analysis
8. Listing published to Elasticsearch + Supabase

## Sponsor Integration Points

This project integrates multiple sponsor technologies:

- **Anthropic Claude**: Conversational search, vision processing, ranking logic
- **Groq**: Fast parameter extraction, content generation, Whisper for voice
- **Elasticsearch**: Vector search with semantic embeddings and filtering
- **Supabase**: Primary database for listings, users, swipes, messages
- **Letta**: User preference memory and learning from behavior
- **Fetch.ai**: Autonomous agents for search, pricing, and Q&A coordination
- **Snap**: AR Spectacles for seller property scanning (planned)
- **Vapi**: Real-time voice conversations (optional)
- **LiveKit**: Video tours (optional)
- **Toolhouse**: Function calling and tool management for agents
- **Arize Phoenix**: AI observability and monitoring

Each service has fallback/mock mode when API keys are unavailable.

## Important Patterns

### Service Initialization
All services are initialized in `backend/main.py` at application startup. Services handle their own error states and fallback to mock implementations when external dependencies are unavailable.

### Async/Await
Backend extensively uses `async`/`await` for I/O operations. Most service methods are async and should be awaited.

### Error Handling
Services log errors and return sensible defaults rather than crashing. Mock data is provided when real services are unavailable.

### CORS
Backend has permissive CORS (`allow_origins=["*"]`) for development. Restrict this in production.

### Image Processing
Images can be handled as base64 strings or URLs. The `ImageFilterService` scores quality based on sharpness, composition, and variety.

### Voice Integration
Two voice modes (see `backend/VOICE_INTEGRATION.md`):
1. **Groq Whisper** - Audio file transcription for search input
2. **Vapi** - Real-time voice conversations for Q&A

## Code Style

- Backend: Python with FastAPI, type hints (Pydantic models), snake_case
- Frontend: TypeScript, React functional components, camelCase, Tailwind classes
- Use descriptive variable names related to domain (listings, swipes, amenities)
- Services are stateless and dependency-inject clients

## Common Tasks

### Adding a New API Endpoint

1. Define Pydantic model in `backend/main.py` (MODELS section)
2. Implement service logic in `backend/services/` (or add to existing service)
3. Add route handler in `backend/main.py` with `@app.post` or `@app.get`
4. Update frontend to call new endpoint

### Adding a New Frontend Page

1. Create page in `frontend/app/[route]/page.tsx`
2. Use App Router conventions (Server Components by default)
3. Add `'use client'` if using hooks, state, or interactivity
4. Import shared components from `frontend/app/components/`

### Working with Elasticsearch

The `ElasticClient` handles semantic search with embeddings:
- Uses Elastic's AI Agent Builder capabilities
- Automatically generates embeddings from listing text
- Supports hybrid search (semantic + keyword + filters)
- Falls back to mock data when unavailable

### Adding Fetch.ai Agent Functionality

1. Create new agent file in `backend/agents/fetch_agents/`
2. Inherit from `Agent` base class (from `uagents`)
3. Define message handlers with `@agent.on_message()`
4. Run agent as separate process: `python new_agent.py`

## Testing Strategy

- Backend tests use `httpx` for API testing
- Test files follow `test_*.py` naming convention
- Mock external services when API keys unavailable
- Focus on end-to-end flows (buyer/seller journeys)

## Deployment Considerations

- Backend: Deploy FastAPI with `uvicorn` (containerize with Docker)
- Frontend: Next.js supports Vercel deployment out of the box
- Fetch.ai agents: Deploy as separate long-running processes
- Environment variables: Secure API keys, use different keys per environment
- CORS: Restrict origins in production
- Rate limiting: Add for production API endpoints
