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
- `yolo_service.py` - YOLOv8 real-time object detection for Spectacles AR scanning
- `letta_service.py` - User preference learning and memory management
- `qa_service.py` - Conversational Q&A about listings
- `pricing_service.py` - AI-powered dynamic pricing with market analysis
- `voice_service.py` - Groq Whisper for voice-to-text transcription
- `vapi_service.py` - Vapi integration for real-time voice conversations
- `livekit_service.py` - Real-time video tours
- `saved_listings_service.py` - Auto-organized saved listings with intelligent ranking
- `seller_chatbot_service.py` - Conversational listing creation and editing
- `image_filter_service.py` - Quality filtering and image selection
- `preference_analysis_service.py` - Analyze user swipe patterns
- `geocoding_service.py` - Address geocoding and location services
- `search_service.py` - Core search orchestration

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
  - `swipe/wishlist/page.tsx` - Saved listings wishlist view
- `sell/page.tsx` - Seller flow (AR scanning simulation, listing creation)
- `listing/[id]/page.tsx` - Individual listing detail page
- `map/page.tsx` - Map view of listings
- `preferences/page.tsx` - User preference management
- `user-profile/page.tsx` - User profile and settings
- `seller-profile/page.tsx` - Seller dashboard
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
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configure API keys
uvicorn main:app --reload  # Runs on http://localhost:8000

# For Spectacles/network access:
uvicorn main:app --reload --host 0.0.0.0
```

**Backend with Arize Phoenix Monitoring** (optional):
```bash
# Terminal 1: Start Phoenix UI
python -m phoenix.server.main serve

# Terminal 2: Start backend (Phoenix traces at http://localhost:6006)
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:3000
npm run build  # Build for production
npm run lint  # Run linting
```

**Fetch.ai Agents** (optional):
```bash
cd backend/agents/fetch_agents
python search_agent.py  # Run each agent in separate terminal
python pricing_agent.py
python qa_agent.py
```

### Testing

**Backend Tests** (`backend/test_*.py`):
```bash
cd backend
source venv/bin/activate

# End-to-end flows (recommended starting point)
python test_buyer_seller_flows.py

# Comprehensive API testing
python test_comprehensive.py

# Integration tests
python test_integration.py

# Real API tests (requires API keys)
python test_real_apis.py

# Voice transcription test
python test_voice_manual.py path/to/audio.mp3

# YOLO object detection test
python test_yolo_standalone.py 'https://image-url.jpg'

# Image filtering test
python test_image_filter.py
```

**Interactive API Documentation**:
```bash
# Start backend, then visit:
# http://localhost:8000/docs  (Swagger UI)
# http://localhost:8000/redoc  (ReDoc)
```

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

## Key Backend Endpoints

The backend exposes a comprehensive REST API. Key endpoint groups:

**Search & Discovery**:
- `POST /api/search/conversation` - Multi-turn conversational search with parameter extraction
- `POST /api/search/execute` - Execute search with complete parameters
- `POST /api/swipe` - Track user swipes (like/pass) for preference learning
- `GET /api/saved-listings/{user_id}` - Get auto-organized saved listings

**Seller Onboarding**:
- `POST /api/listing/scan` - Upload images for AR-style property scanning
- `POST /api/listing/chatbot` - Conversational listing creation/editing
- `POST /api/pricing/suggest` - AI-powered dynamic pricing suggestions
- `POST /api/listing/publish` - Publish listing to Elasticsearch

**Spectacles AR Integration**:
- `POST /api/spectacles/scan-session` - Start new AR scanning session
- `POST /api/spectacles/detect` - Real-time YOLO object detection from Spectacles camera
- `POST /api/spectacles/finalize` - Finalize scan and generate listing

**Voice Integration**:
- `POST /api/voice-to-text` - Groq Whisper transcription (upload audio file)
- `POST /api/vapi/call/start` - Start Vapi real-time voice conversation
- `GET /api/vapi/context/{listing_id}` - Get listing context for Vapi assistant

**Listing Q&A**:
- `POST /api/qa/ask` - Ask questions about a specific listing
- `POST /api/listing/{id}/details` - Get detailed listing information

**User Preferences**:
- `POST /api/preferences/analyze` - Analyze user swipe patterns
- `GET /api/preferences/{user_id}` - Get learned user preferences

**Health & Monitoring**:
- `GET /health` - Health check endpoint
- `GET /docs` - Swagger UI (interactive API documentation)
- `GET /redoc` - ReDoc documentation

All services gracefully handle missing API keys by falling back to mock implementations.

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
Two complementary voice technologies (see `backend/VOICE_INTEGRATION.md` for details):
1. **Groq Whisper** - Audio file transcription for search input via `POST /api/voice-to-text`
2. **Vapi** - Real-time voice conversations for Q&A with listings via `POST /api/vapi/call/start`

### Snap Spectacles Integration

The platform includes a complete Lens Studio implementation for Snap Spectacles that enables hands-free property scanning with real-time YOLO object detection.

**Location**: `lens-studio/vibe-property-scanner/`

**Key Components**:
- **TypeScript Scripts**: 6 scripts for camera capture, networking, AR rendering, and UI
- **Real-time Detection**: Auto-captures frames every 2s and sends to backend YOLO API
- **AR Overlays**: Displays 3D bounding boxes and text labels for detected objects
- **Session Management**: Tracks entire scanning session with progress feedback

**Backend Endpoints for Spectacles**:
- `POST /api/spectacles/scan-session` - Start new scan session, returns session_id
- `POST /api/spectacles/detect` - Send base64 image for YOLO detection, returns objects with bounding boxes
- `POST /api/spectacles/finalize` - Finalize session and get complete property analysis

**Setup Requirements**:
1. Backend must run with `--host 0.0.0.0` to accept network requests
2. Spectacles and computer must be on same WiFi network
3. Update `Config.ts` with local IP address (e.g., `http://192.168.1.5:8000`)
4. Install `ultralytics` for YOLO: `pip install ultralytics`

**Detection Flow**:
```
Spectacles Camera → Capture (2s intervals) → Base64 JPEG →
NetworkManager → Backend YOLO → Detections →
AROverlayRenderer → 3D Boxes + Labels in AR space
```

**See**: `lens-studio/vibe-property-scanner/SETUP.md` for complete setup instructions

**Testing Standalone YOLO**:
```bash
cd backend
python test_yolo_standalone.py 'https://url-to-airbnb-image.jpg'
```

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

## Debugging and Troubleshooting

**Backend Issues**:
```bash
# Check if all services initialized properly
curl http://localhost:8000/health

# View detailed API docs and test endpoints
open http://localhost:8000/docs

# Enable Arize Phoenix tracing for AI observability
python -m phoenix.server.main serve
# Then visit http://localhost:6006 for traces
```

**Common Issues**:
- **Import errors**: Ensure virtual environment is activated (`source venv/bin/activate`)
- **Port already in use**: Kill existing process or use different port (`uvicorn main:app --port 8001`)
- **API key errors**: Services fall back to mock mode - check `.env` file for missing keys
- **CORS errors**: Backend allows all origins in dev mode; check browser console
- **Elasticsearch connection**: Service falls back to mock data if unavailable
- **Frontend build errors**: Clear `.next` directory and rebuild (`rm -rf .next && npm run build`)

**Spectacles AR Debugging**:
- Backend must run with `--host 0.0.0.0` for network access
- Check WiFi: Spectacles and computer must be on same network
- Test connectivity: `curl http://<YOUR_IP>:8000/health` from phone
- View Lens Studio logs: Logger panel shows all print statements
- YOLO model: Downloads automatically on first use (~6MB `yolov8n.pt`)

## Git Workflow

**Current Branch**: `object-detection-feature` (working on YOLO integration for Spectacles)
**Main Branch**: `main` - use for pull requests

The project uses feature branches for development. Key branches include:
- `backend-api` - Backend API development
- `AR` - AR/Spectacles integration
- `make-better-home` - UI/UX improvements

**Testing Before Commits**:
```bash
# Backend: Run at least the buyer/seller flow tests
cd backend && python test_buyer_seller_flows.py

# Frontend: Check build
cd frontend && npm run build
```

## Deployment Considerations

- Backend: Deploy FastAPI with `uvicorn` (containerize with Docker)
- Frontend: Next.js supports Vercel deployment out of the box
- Fetch.ai agents: Deploy as separate long-running processes
- Environment variables: Secure API keys, use different keys per environment
- CORS: Restrict origins in production
- Rate limiting: Add for production API endpoints
