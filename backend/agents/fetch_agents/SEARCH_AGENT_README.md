# VIBE Search Agent

**Agent Handle:** `vibe-search-agent`

**Agent Address:** `agent1qghc7aa9yhhfjuxap2j0k7l2qpjrnd0ppwtgzxqgznj25mlt9kqluvqmkft`

## 🔍 Purpose

The VIBE Search Agent is an intelligent vacation rental search assistant that understands natural language queries and extracts structured search criteria. Powered by Anthropic's Claude, it specializes in helping users find the perfect vacation rental by understanding their needs conversationally.

## ✨ Functionalities

### Natural Language Understanding
- Extracts location, price range, number of bedrooms, guest count, and amenities from conversational queries
- Understands flexible phrasing like "beach house under $300/night" or "3-bedroom apartment in SF for next weekend"
- Identifies property types (house, apartment, villa, cabin) and special features (ocean view, mountain access, etc.)

### Structured Output
- Returns JSON-formatted search filters for integration with vacation rental platforms
- Provides clear summaries of extracted search criteria
- Handles ambiguous queries gracefully

### Subject Matter Expertise
- **Specialization:** Vacation rentals, Airbnb, hotels, and travel accommodations only
- Politely declines queries outside of travel and accommodation topics
- Maintains focus on helping users find their ideal vacation rental

## 📖 Usage Guidelines

### Example Queries

**Simple Search:**
```
"Find me a beach house in Malibu"
```

**Detailed Search:**
```
"I need a 3-bedroom apartment in San Francisco under $250/night with parking and a hot tub"
```

**Complex Requirements:**
```
"Show me luxury villas in Cabo with ocean view, pool, and at least 4 bedrooms for 8 guests"
```

### Response Format

The agent responds with:
1. Extracted search criteria (location, price, bedrooms, amenities)
2. Property type and style recommendations
3. A natural language summary of your search intent

### Best Practices

- Be as specific or general as you like - the agent adapts to your level of detail
- Include budget, location, and must-have amenities for best results
- Ask follow-up questions to refine your search criteria

## 🤖 Technical Details

- **Framework:** Fetch.ai uAgents
- **AI Model:** Anthropic Claude 3.5 Sonnet
- **Protocol:** ASI:One Chat Protocol
- **Availability:** 24/7 via Agentverse Mailbox

## 🏆 Integration

Part of the **VIBE Platform** - an AI-native home sharing platform that reimagines vacation rentals with conversational search, intelligent swiping, and AR-powered listing creation.

**Related Agents:**
- VIBE Pricing Agent (`vibe-pricing-agent`) - Competitive pricing analysis
- VIBE Q&A Agent (`vibe-qa-agent`) - Guest question answering

## 📄 License

MIT License - Open source and free to use.

## 🙏 Acknowledgments

Built for **CalHacks 2025** using:
- **Anthropic Claude** - Advanced natural language understanding
- **Fetch.ai** - Autonomous agent framework and ASI:One integration
- **VIBE Team** - Reimagining travel booking with AI

## 📞 Contact

- **Project:** VIBE Platform
- **GitHub:** [vibe-platform](https://github.com)
- **Built for:** CalHacks 2025
- **Sponsors:** Anthropic, Fetch.ai, Elasticsearch, Supabase

## 🚀 Try It Now

Ask ASI:One Chat: *"Find me an agent that helps with vacation rental searches"*

Then try queries like:
- "Find me a cozy cabin in Lake Tahoe with a fireplace"
- "I need a pet-friendly apartment in Austin for under $150/night"
- "Show me beachfront properties in Miami with 5+ bedrooms"

---

*Powered by Anthropic Claude & Fetch.ai | ASI:One Compatible*
