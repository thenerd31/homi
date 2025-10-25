# 🤖 VIBE Fetch.ai Agents

![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)
![tag:hackathon](https://img.shields.io/badge/hackathon-5F43F1)

**Four AI agents for VIBE - the AI-native home sharing platform**

All agents use **Claude (Anthropic)** as their reasoning engine and are registered on **Agentverse** with **Chat Protocol** enabled for ASI:One discoverability.

---

## 🎯 Agents

### 1. Search Agent
**Purpose**: Coordinates listing discovery using natural language
**Port**: 8001
**File**: `search_agent.py`

**What it does**:
- Takes natural language queries like "Find me a beach house in Malibu under $300/night"
- Uses Claude to extract structured filters
- Returns search criteria for the backend to execute

**Run**:
```bash
python search_agent.py
```

**Agent Address**: _(will be displayed on startup)_

---

### 2. Pricing Agent
**Purpose**: Competitive pricing analysis
**Port**: 8002
**File**: `pricing_agent.py`

**What it does**:
- Analyzes property details (location, amenities, type)
- Uses Claude for market rate analysis
- Returns suggested pricing + competitive insights

**Run**:
```bash
python pricing_agent.py
```

**Agent Address**: _(will be displayed on startup)_

---

### 3. Q&A Agent
**Purpose**: Answers guest questions about listings
**Port**: 8003
**File**: `qa_agent.py`

**What it does**:
- Receives listing data + guest question
- Uses Claude to generate accurate, helpful answers
- Handles questions like "Is this pet-friendly?" or "How far from the beach?"

**Run**:
```bash
python qa_agent.py
```

**Agent Address**: _(will be displayed on startup)_

---

### 4. Vibe Check AI (Personal AI) ✨
**Purpose**: Viral-worthy Personal AI with personality
**Port**: 8004
**File**: `vibe_check_ai.py`

**What it does**:
- Sarcastic but helpful AI assistant
- Roasts unrealistic expectations then actually helps
- Gen Z energy, uses emojis and slang
- Built for the "Most Viral ASI:One Personal AI" track

**Personality Examples**:
```
User: "Find me the cheapest place in Manhattan"
Vibe Check: "Bestie, the cheapest place in Manhattan is New Jersey 💀
             But fr, here's a cozy spot in Washington Heights..."

User: "I want a luxury villa for $50/night"
Vibe Check: "And I want a pet unicorn 🦄 Let's be realistic, luv..."
```

**Run**:
```bash
python vibe_check_ai.py
```

**Agent Address**: _(will be displayed on startup)_

**Share on socials**:
- Twitter/X: #VibeCheckAI
- TikTok: Demo the funny interactions
- Instagram: Screenshot the best roasts

---

## 🚀 Setup & Installation

### Prerequisites
```bash
pip install uagents anthropic python-dotenv
```

### Environment Variables
Create a `.env` file in the backend directory:
```bash
ANTHROPIC_API_KEY=your_anthropic_key_here
```

### Running All Agents
You can run all agents simultaneously in different terminals:

**Terminal 1**:
```bash
python search_agent.py
```

**Terminal 2**:
```bash
python pricing_agent.py
```

**Terminal 3**:
```bash
python qa_agent.py
```

**Terminal 4**:
```bash
python vibe_check_ai.py
```

---

## 📝 Registering on Agentverse

After starting each agent, you'll see its address printed in the console.

1. Go to [https://agentverse.ai](https://agentverse.ai)
2. Click "Add Agent"
3. Enter the agent address (shown in terminal)
4. Enable **Chat Protocol**
5. Make agent **discoverable**
6. Categorize under **Innovation Lab**

**Important**: All agents use the Chat Protocol and are ASI:One compatible!

---

## 🔗 Agent Communication

Agents can communicate with each other using the uAgents protocol:

```python
# Example: Search Agent can query Pricing Agent
pricing_response = await ctx.send(pricing_agent_address, {
    "location": "Malibu, CA",
    "amenities": ["pool", "hot tub"]
})
```

---

## 🏆 Fetch.ai Track Alignment

### Best Use of Fetch.ai ($2,500)
✅ All agents registered on Agentverse
✅ Chat Protocol enabled
✅ Claude as reasoning engine
✅ Solves real problems (search, pricing, Q&A)
✅ Exceptional UX

### Best Deployment of Agentverse ($1,500)
✅ 4 useful, discoverable agents
✅ Well-documented
✅ Easy for others to find and use
✅ Categorized under Innovation Lab

### Most Viral ASI:One Personal AI ($1,000)
✅ Vibe Check AI has unique personality
✅ Viral-worthy responses
✅ Shareable on socials
✅ Internet presence

---

## 📊 Agent Details

| Agent | Purpose | Port | Model | Status |
|-------|---------|------|-------|--------|
| Search | NL query parsing | 8001 | Claude Sonnet | 🟢 Active |
| Pricing | Market analysis | 8002 | Claude Sonnet | 🟢 Active |
| Q&A | Guest questions | 8003 | Claude Haiku | 🟢 Active |
| Vibe Check | Viral Personal AI | 8004 | Claude Sonnet | 🟢 Active |

---

## 🛠️ Development

### Testing Locally
You can send messages to agents locally using the uAgents framework:

```python
from uagents import Bureau

# Create a bureau to manage multiple agents
bureau = Bureau()
bureau.add(search_agent)
bureau.add(pricing_agent)
bureau.add(qa_agent)
bureau.add(vibe_check)

bureau.run()
```

### Debugging
- Check agent logs in the terminal
- Agents print received messages and responses
- Each agent has health logging every 60 seconds

---

## 📦 Integration with VIBE Backend

These agents are integrated into the main VIBE FastAPI backend:

```python
# backend/main.py
from agents.fetch_agents import SearchAgent, PricingAgent, QAAgent

# Initialize agents
search_agent = SearchAgent()
pricing_agent = PricingAgent()
qa_agent = QAAgent()

# Use in endpoints
@app.post("/api/search")
async def search(query: str):
    filters = await search_agent.coordinate_search(query)
    ...
```

---

## 🎬 Demo Video Script

1. **Start all 4 agents**
2. **Show agent addresses**
3. **Test Search Agent**:
   - Send: "Find beach house under $300"
   - Show: Extracted filters
4. **Test Pricing Agent**:
   - Send: Property details
   - Show: Suggested price + analysis
5. **Test Q&A Agent**:
   - Send: "Is this pet-friendly?"
   - Show: Helpful answer
6. **Test Vibe Check AI**:
   - Send: "Find cheapest place in SF"
   - Show: Funny roast + actual help
7. **Show Agentverse registration**
8. **Demo agent-to-agent communication**

---

## 📄 License

MIT - CalHacks 2025

---

## 👥 Team

Built by Aswin Surya, Victor Desouza, Yuxin Zeng, and Alistar Qian Xiao for CalHacks 2025

**Tracks**: YC, Fetch.ai, Anthropic, Postman, LiveKit, Snap, Groq, Letta, Elastic, Vapi, Toolhouse, Arize

---

For more details, see the main project README: [../../README.md](../../README.md)
