# 👥 Team Task Breakdown

## Overview
This document breaks down all tasks for a 4-person team. Estimate: 36-48 hours of work.

---

## 🎨 Person 1: Frontend Lead

### Priority 1: Core UI (12 hours)

**Setup** (1 hour)
- [ ] Initialize Next.js 14 with App Router
- [ ] Set up Tailwind CSS + ShadCN UI
- [ ] Create basic layout and routing
- [ ] Set up environment variables

**Tinder-Style Swipe Interface** (6 hours) 🔥 **CORE FEATURE**
- [ ] Install `react-tinder-card` or `framer-motion`
- [ ] Create `SwipeCard.tsx` component
  - Card shows: photo, title, price, quick summary
  - Swipe left = pass, right = like
  - Bottom buttons for like/pass/superlike
- [ ] Create `SwipeStack.tsx` - manages card stack
- [ ] Add swipe animations
- [ ] Connect to backend `/api/search` and `/api/swipe`
- [ ] Store liked listings in local state

**Search Interface** (3 hours)
- [ ] Create search page with text input
- [ ] Add "natural language" prompt examples
- [ ] Loading states while AI processes
- [ ] Display extracted filters (show what AI understood)
- [ ] Connect to `/api/search`

**Listing Detail Page** (2 hours)
- [ ] Photo gallery
- [ ] Full description
- [ ] Amenities list with icons
- [ ] Q&A section (chat interface)
- [ ] "Try in AR" button
- [ ] "Start Virtual Tour" button

### Priority 2: Voice & AR Integration (6 hours)

**Vapi Voice Search** (3 hours) 🎤 **SPONSOR TRACK**
- [ ] Install Vapi SDK: `npm install @vapi-ai/web`
- [ ] Create `VoiceSearch.tsx` component
  - Microphone button
  - Recording indicator
  - Transcription display
- [ ] Set up Vapi assistant in Vapi dashboard
- [ ] Connect to backend `/api/voice-search`
- [ ] Add voice feedback ("Searching for...")

**AR Button Integration** (3 hours) 🥽 **SNAP TRACK**
- [ ] Create `ARPreview.tsx` component
- [ ] Add "View in AR" button on listing pages
- [ ] Fetch AR data from `/api/listings/{id}/ar-data`
- [ ] Generate deep link to Snap Lens
- [ ] If on Spectacles: direct AR launch
- [ ] If on phone: QR code to Lens

### Priority 3: Host Dashboard (4 hours)

**Photo Upload & Optimization** (4 hours)
- [ ] Create `/host/new-listing` page
- [ ] Drag-and-drop photo upload (use `react-dropzone`)
- [ ] Image preview grid
- [ ] Location & property type inputs
- [ ] "Optimize My Listing" button
- [ ] Results display:
  - Generated title
  - Generated description (editable)
  - Detected amenities (chips)
  - Suggested price with range
  - Auto-generated Q&A pairs
- [ ] Connect to `/api/optimize-listing`

---

## 🔧 Person 2: Backend Lead

### Priority 1: Core API (10 hours)

**FastAPI Setup** (1 hour)
- [ ] Set up FastAPI with proper structure
- [ ] CORS configuration
- [ ] Environment variable management
- [ ] Health check endpoint

**Search Service** (4 hours) 🔥 **CORE FEATURE**
- [ ] Implement `groq_service.py` for filter extraction
  - Natural language → structured JSON
  - Example: "beach house under $300" → `{location: "beach", price_max: 300}`
- [ ] Create `elastic_client.py` for vector search
  - Set up Elastic Cloud connection
  - Create listings index with vector field
  - Implement semantic search
- [ ] Implement `/api/search` endpoint
  - Call Groq for filters
  - Query Elastic
  - Re-rank with Claude
- [ ] Add Arize Phoenix tracing to search flow

**Letta Integration** (3 hours) 🧠 **MEMORY**
- [ ] Set up Letta client
- [ ] Create `letta_service.py`
  - `get_user_context()` - fetch user preferences
  - `update_search_history()` - store searches
  - `record_swipe_action()` - learn from swipes
- [ ] Create user memory agent for each user
- [ ] Integrate into search flow

**Listing Optimization** (2 hours)
- [ ] Implement `/api/optimize-listing` endpoint
- [ ] Photo upload handling (Supabase Storage)
- [ ] Call Claude Vision for amenity detection
- [ ] Call Groq for title/description generation
- [ ] Price suggestion logic

### Priority 2: Supabase & Database (4 hours)

**Supabase Setup** (2 hours)
- [ ] Create Supabase project
- [ ] Set up database schema:
  ```sql
  -- listings table
  CREATE TABLE listings (
    id UUID PRIMARY KEY,
    title TEXT,
    description TEXT,
    photos JSONB,
    amenities TEXT[],
    price DECIMAL,
    location TEXT,
    embedding VECTOR(1536),
    created_at TIMESTAMP
  );

  -- user_preferences table (for Letta)
  CREATE TABLE user_preferences (
    user_id TEXT PRIMARY KEY,
    liked_listings UUID[],
    search_history JSONB,
    preferences JSONB
  );

  -- qa_pairs table
  CREATE TABLE qa_pairs (
    id UUID PRIMARY KEY,
    listing_id UUID REFERENCES listings(id),
    question TEXT,
    answer TEXT
  );
  ```
- [ ] Enable Supabase Storage for photos
- [ ] Create `supabase_client.py` helper

**Vector Embeddings** (2 hours)
- [ ] Generate embeddings for listings (use Groq or OpenAI)
- [ ] Store in Supabase pgvector or Elastic
- [ ] Implement similarity search

### Priority 3: Monitoring & Tools (2 hours)

**Arize Phoenix** (1 hour) 📊 **OBSERVABILITY**
- [ ] Sign up for Phoenix Cloud (free tier)
- [ ] Install: `pip install arize-phoenix`
- [ ] Create `arize_logger.py`
- [ ] Add tracing to:
  - Search queries
  - LLM calls (Groq, Claude)
  - Agent decisions
- [ ] Set up eval for hallucination detection

**Toolhouse Integration** (1 hour)
- [ ] Sign up for Toolhouse
- [ ] Apply coupon code from sponsor pack
- [ ] Install SDK
- [ ] Connect tools for agents (web search, etc.)

---

## 🤖 Person 3: Fetch.ai Agent Specialist

### Priority 1: Core Agents (8 hours) 💰 **$5K TRACK**

**Setup Fetch.ai Environment** (1 hour)
- [ ] Install: `pip install uagents cosmpy`
- [ ] Create Fetch.ai account
- [ ] Set up Agentverse account
- [ ] Get testnet tokens

**Search Agent** (2 hours)
- [ ] Create `search_agent.py`
- [ ] Agent receives search query
- [ ] Uses Claude (via Anthropic API) to understand intent
- [ ] Queries Elastic/Supabase for listings
- [ ] Returns ranked results
- [ ] Register on Agentverse
- [ ] Enable Chat Protocol

**Pricing Agent** (2 hours)
- [ ] Create `pricing_agent.py`
- [ ] Agent receives: location, amenities, property type
- [ ] Uses Claude to analyze competitive listings
- [ ] Calculates suggested price
- [ ] Returns price range + reasoning
- [ ] Register on Agentverse
- [ ] Enable Chat Protocol

**Q&A Agent** (2 hours)
- [ ] Create `qa_agent.py`
- [ ] Agent receives: listing details + guest question
- [ ] Uses Claude to generate accurate answer
- [ ] Checks listing data for factual accuracy
- [ ] Returns answer with confidence score
- [ ] Register on Agentverse
- [ ] Enable Chat Protocol

**Generate Q&A Pairs** (1 hour)
- [ ] Add method to generate common questions
- [ ] Use Claude to create 10-15 Q&A pairs per listing
- [ ] Store in Supabase

### Priority 2: Viral Personal AI (4 hours) 🎭 **$1K TRACK**

**"Vibe Check" AI** (4 hours)
- [ ] Create `vibe_check_ai.py` - a Personal AI with PERSONALITY
- [ ] Make it funny/sarcastic/charming
- [ ] It roasts your listing choices
- [ ] Give it viral catchphrases
- [ ] Examples:
  - User: "Find me cheap place in SF"
  - AI: "Cheap? In SF? Bestie, let me find you a tent in Golden Gate Park 💀"
- [ ] Register as Personal AI on Agentverse
- [ ] Enable discovery
- [ ] Create social media content showing interactions
- [ ] Post on X/TikTok with demo

### Priority 3: Agent Communication (2 hours)

**Inter-Agent Protocol** (2 hours)
- [ ] Set up agents to communicate with each other
- [ ] Example flow:
  1. Search Agent gets query
  2. Asks Pricing Agent for budget suggestions
  3. Asks Q&A Agent to pre-generate FAQs
  4. Returns comprehensive result
- [ ] Document agent addresses

**Agentverse Deployment** (1 hour)
- [ ] Deploy all 4 agents to Agentverse
- [ ] Test chat protocol on each
- [ ] Make all discoverable
- [ ] Create good descriptions/metadata
- [ ] Add documentation

---

## 🥽 Person 4: AR & Video Lead

### Priority 1: Snap Lens Development (10 hours) 🥽 **SNAP TRACK**

**Lens Studio Setup** (1 hour)
- [ ] Download Lens Studio
- [ ] Create new project "VIBE AR"
- [ ] Set up Spectacles preview
- [ ] Connect to Snapchat account

**Basic AR Overlay** (4 hours)
- [ ] Create main scene
- [ ] Add image tracking for room detection
- [ ] Design UI overlay:
  - Listing title (3D text)
  - Price tag (floating)
  - Amenity icons (3D objects)
  - "Book Now" button
- [ ] Add animations (fade in, floating effects)

**API Integration** (3 hours)
- [ ] Set up Remote Service Module in Lens Studio
- [ ] Fetch listing data from backend
  - URL: `https://your-api.com/api/listings/{id}/ar-data`
- [ ] Parse JSON response
- [ ] Dynamically populate overlay with listing data
- [ ] Handle loading states

**Advanced Features** (2 hours)
- [ ] Object detection (detect furniture in room)
- [ ] Use Snap ML template
- [ ] Virtual furniture placement
- [ ] Room measurement (use depth API)
- [ ] Highlight amenity locations (AR markers)

**Testing & Publishing** (1 hour)
- [ ] Test on Spectacles hardware
- [ ] Test on phone (Snapchat app)
- [ ] Create QR code/deep link
- [ ] Publish Lens
- [ ] Create demo video

### Priority 2: LiveKit Integration (6 hours) 🎥 **3 PRIZES**

**LiveKit Setup** (1 hour)
- [ ] Create LiveKit Cloud account
- [ ] Get API keys
- [ ] Install SDK: `npm install livekit-client`
- [ ] Set up backend service

**Virtual Tour Feature** (3 hours)
- [ ] Create `/tour/[listingId]` page in Next.js
- [ ] Host joins as "guide"
- [ ] Guest joins as "viewer"
- [ ] Video + audio streams
- [ ] Screen share for photos
- [ ] Chat sidebar

**AI Tour Guide Agent** (2 hours) 🤖 **MOST COMPLEX PRIZE**
- [ ] Create AI agent that gives automated tours
- [ ] Agent has voice (use ElevenLabs or LiveKit TTS)
- [ ] Agent describes rooms as camera pans
- [ ] Agent answers questions in real-time
- [ ] Uses Claude to generate contextual descriptions

**Testing** (1 hour)
- [ ] Test host-guest connection
- [ ] Test AI agent tour
- [ ] Record demo video

---

## 🌐 Person 5 (Optional): Postman & Blockchain

### Postman Flows (4 hours) 📮 **SPONSOR TRACK**

**Main Orchestration Flow** (3 hours)
- [ ] Create Postman workspace
- [ ] Create new Flow
- [ ] Add AI Agent block (this is KEY)
- [ ] Configure HTTP blocks for:
  1. POST to Claude (extract filters)
  2. GET from Elastic (search listings)
  3. POST to Groq (generate summary)
  4. POST to Supabase (save results)
- [ ] Add error handling (retry logic, timeouts)
- [ ] Add data transformations
- [ ] Test full flow

**Deploy as Action** (1 hour)
- [ ] Convert Flow to Action
- [ ] Get public URL
- [ ] Test with curl
- [ ] Document input/output format
- [ ] Create README in Postman workspace

### Sui Blockchain (3 hours) ⛓️ **SUI TRACK**

**Smart Contract** (2 hours)
- [ ] Set up Sui development environment
- [ ] Create `review_system.move` contract
  - Store reviews on-chain
  - Link to listing ID
  - Prevent tampering
  - Reputation scoring
- [ ] Deploy to Sui testnet

**Frontend Integration** (1 hour)
- [ ] Install Sui wallet SDK
- [ ] Add "Submit Review" button
- [ ] Sign transaction with wallet
- [ ] Display on-chain reviews

---

## 📅 Recommended Timeline (48 hours)

### Day 1 (Saturday) - CORE FEATURES
**Morning (8am-12pm)**
- Everyone: Setup environments, install dependencies
- Person 1: Basic Next.js setup + search UI
- Person 2: FastAPI setup + Groq search
- Person 3: Fetch.ai setup + first agent
- Person 4: Lens Studio setup

**Afternoon (1pm-6pm)**
- Person 1: Start Tinder swipe UI
- Person 2: Elastic + Supabase setup
- Person 3: All 3 core agents (search, pricing, Q&A)
- Person 4: Basic AR overlay

**Evening (7pm-11pm)**
- Person 1: Connect swipe UI to backend
- Person 2: Full search endpoint working
- Person 3: Register agents on Agentverse
- Person 4: API integration in Lens

### Day 2 (Sunday) - POLISH & SPONSORS
**Morning (8am-12pm)**
- Person 1: Voice search (Vapi)
- Person 2: Letta memory integration
- Person 3: Viral Personal AI
- Person 4: LiveKit tours

**Afternoon (1pm-6pm)**
- Person 1: Listing optimization UI
- Person 2: Arize monitoring
- Person 3: Social media for viral AI
- Person 4: AI tour guide agent

**Evening (7pm-9pm) - DEMO PREP**
- Everyone: Test end-to-end
- Record demo video
- Create pitch deck
- Deploy to Vercel/Railway
- Submit to sponsor tracks

---

## ✅ Pre-Submission Checklist

### YC Track
- [ ] Clear demo showing AI-native Airbnb
- [ ] Highlight what's different from 2008 Airbnb

### Fetch.ai ($5k potential)
- [ ] ✅ 3+ agents registered on Agentverse
- [ ] ✅ Chat protocol enabled on all
- [ ] ✅ Claude as reasoning engine
- [ ] ✅ Good documentation
- [ ] ✅ Viral Personal AI posted on socials

### Anthropic
- [ ] Vision API used for amenity detection
- [ ] Claude used extensively in agents

### Postman
- [ ] Flow deployed as Action
- [ ] Public URL working
- [ ] README with sample input/output

### LiveKit (3 prizes)
- [ ] Virtual tours working
- [ ] AI agent giving automated tours
- [ ] Demo video recorded

### Snap
- [ ] Lens published
- [ ] Works on Spectacles
- [ ] Demo video with hardware

### Arize
- [ ] Phoenix tracing implemented
- [ ] Evals set up

### Sui
- [ ] Smart contract deployed
- [ ] Reviews on-chain

---

## 🚨 Critical Path (Must-Haves)

1. **Tinder Swipe UI** (Person 1) - Core UX differentiator
2. **Natural Language Search** (Person 2) - Core AI feature
3. **Fetch.ai Agents on Agentverse** (Person 3) - $5k track
4. **AR Lens** (Person 4) - Unique, have hardware
5. **Postman Flow** (Anyone) - Required for track

Everything else is bonus points!

---

## 💡 Tips

- **Start with MVPs**: Get basic versions working first
- **Deploy Early**: Don't wait until last minute
- **Record Everything**: Take screenshots/videos as you go
- **Test on Real Devices**: Especially AR Lens on Spectacles
- **API Keys**: Keep them in `.env`, never commit
- **Use Discord**: Sponsor mentors are there to help!

---

## 🆘 If You Get Stuck

1. **Check sponsor docs**: Most have quick starts
2. **Ask in Discord**: Mentors are helpful
3. **Use Claude/ChatGPT**: They know these APIs
4. **Simplify**: Cut features if needed
5. **Focus on demo**: What looks impressive?

---

Good luck team! 🚀
