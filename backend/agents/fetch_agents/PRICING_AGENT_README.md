# VIBE Pricing Agent

**Agent Handle:** `vibe-pricing-agent`

**Agent Address:** `agent1qfsn3ug6pskuzqvzkr5yzkyvxc23yvnvrzlyp3h8v7padr99ml9s55eqctl`

## 💰 Purpose

The VIBE Pricing Agent is an expert pricing analyst for vacation rentals that provides competitive market analysis and optimal pricing recommendations. Powered by Anthropic's Claude, it helps property owners maximize their revenue while staying competitive in their local market.

## ✨ Functionalities

### Competitive Pricing Analysis
- Analyzes market rates based on location, property type, bedrooms, bathrooms, and amenities
- Provides optimal nightly price recommendations backed by reasoning
- Calculates competitive price ranges (minimum and maximum)

### Strategic Recommendations
- Market positioning advice (budget, mid-range, luxury)
- Pricing strategies for maximizing bookings and revenue
- Seasonal and demand-based insights

### Comprehensive Evaluation
- Weighs premium amenities (pool, hot tub, ocean view, etc.)
- Considers property size and guest capacity
- Factors in location desirability and competition

### Subject Matter Expertise
- **Specialization:** Vacation rental pricing, Airbnb pricing strategy, hotel rate analysis
- Politely declines queries outside of accommodation pricing
- Maintains focus on helping hosts optimize their rental income

## 📖 Usage Guidelines

### Example Queries

**Simple Pricing:**
```
"What should I charge for my 2-bedroom apartment in San Francisco?"
```

**Detailed Analysis:**
```
"Analyze pricing for my 3-bedroom villa in Malibu with pool, ocean view, and hot tub"
```

**JSON Format (for integration):**
```json
{
  "location": "Miami Beach",
  "property_type": "apartment",
  "bedrooms": 2,
  "bathrooms": 2,
  "amenities": ["pool", "gym", "parking", "beachfront"]
}
```

### Response Format

The agent provides:
1. **Suggested Nightly Rate** - Optimal price point
2. **Competitive Range** - Min/max pricing boundaries
3. **Reasoning** - Detailed explanation of pricing factors
4. **Market Positioning** - How your property compares to similar listings
5. **Pricing Strategy** - Recommendations for maximizing bookings

### Best Practices

- Provide accurate property details (location, size, amenities)
- Include all premium features (pool, view, parking, etc.)
- Ask for seasonal pricing variations if needed
- Use recommendations as a starting point and adjust based on local events/demand

## 🤖 Technical Details

- **Framework:** Fetch.ai uAgents
- **AI Model:** Anthropic Claude 3.5 Sonnet
- **Protocol:** ASI:One Chat Protocol
- **Availability:** 24/7 via Agentverse Mailbox

## 🏆 Integration

Part of the **VIBE Platform** - an AI-native home sharing platform that reimagines vacation rentals with conversational search, intelligent swiping, and AR-powered listing creation.

**Related Agents:**
- VIBE Search Agent (`vibe-search-agent`) - Natural language rental search
- VIBE Q&A Agent (`vibe-qa-agent`) - Guest question answering

## 📊 Pricing Methodology

The agent considers:
- **Location Premium** - Market demand by area
- **Property Size** - Bedrooms, bathrooms, square footage
- **Amenities Weight** - Pool (+15-25%), Ocean View (+20-35%), Hot Tub (+10-15%)
- **Property Type** - House, apartment, villa, cabin variations
- **Competitive Analysis** - Similar listings in the area
- **Market Positioning** - Budget, mid-range, or luxury tier

## 📄 License

MIT License - Open source and free to use.

## 🙏 Acknowledgments

Built for **CalHacks 2025** using:
- **Anthropic Claude** - Advanced market analysis and reasoning
- **Fetch.ai** - Autonomous agent framework and ASI:One integration
- **VIBE Team** - Empowering hosts with AI-powered pricing

## 📞 Contact

- **Project:** VIBE Platform
- **GitHub:** [vibe-platform](https://github.com)
- **Built for:** CalHacks 2025
- **Sponsors:** Anthropic, Fetch.ai, Elasticsearch, Supabase

## 🚀 Try It Now

Ask ASI:One Chat: *"Find me an agent that analyzes vacation rental pricing"*

Then try queries like:
- "What should I charge for my beach house in Santa Monica with 4 bedrooms and a pool?"
- "Analyze pricing for a studio apartment in NYC with gym and doorman"
- "Help me price my luxury villa in Cabo with ocean view and private chef"

---

*Powered by Anthropic Claude & Fetch.ai | ASI:One Compatible*
