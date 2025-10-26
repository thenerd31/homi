"""
Seller Chatbot Service
Conversational interface for sellers to review and edit their listings
"""

import os
from typing import Dict, Any, List
import json
from datetime import date
from anthropic import Anthropic

class SellerChatbotService:
    """
    Conversational chatbot for seller onboarding

    Flow:
    1. Show generated listing to seller
    2. Accept natural language edits ("Change title to include luxury")
    3. Update listing in real-time
    4. Confirm each section (photos, title, description, amenities, location)
    5. Move to pricing and availability
    6. Final publish confirmation
    """

    def __init__(self):
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.model = "claude-sonnet-4-5-20250929"

    async def start_listing_review(
        self,
        generated_listing: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Start the listing review conversation

        Args:
            generated_listing: AI-generated listing data from scan

        Returns:
            {
                "message": "Here's your listing. Want to make changes?",
                "listing": {...},
                "stage": "review_listing",
                "suggestions": ["Looks good", "Change title", "Edit photos"]
            }
        """

        message = f"""**Here's your auto-generated listing!**

**Title:** {generated_listing.get('title', 'N/A')}

**Description:**
{generated_listing.get('description', 'N/A')[:200]}...

**Amenities Detected:** {len(generated_listing.get('amenities', []))} amenities
{', '.join(generated_listing.get('amenities', [])[:10])}...

**Photos:** {len(generated_listing.get('photos', []))} photos selected

Would you like to make any changes?"""

        return {
            "message": message,
            "listing": generated_listing,
            "stage": "review_listing",
            "suggestions": [
                "Looks good, continue",
                "Change the title",
                "Edit description",
                "Remove some photos"
            ]
        }

    async def process_seller_message(
        self,
        seller_message: str,
        current_listing: Dict[str, Any],
        conversation_history: List[Dict[str, str]] = [],
        current_stage: str = "review_listing"
    ) -> Dict[str, Any]:
        """
        Process seller's message and update listing

        Stages:
        - review_listing: General review
        - edit_title: Editing title
        - edit_description: Editing description
        - edit_amenities: Editing amenities
        - edit_photos: Selecting/removing photos
        - set_dates: Setting availability
        - set_pricing: Reviewing pricing
        - final_confirmation: Ready to publish

        Returns:
            {
                "message": "AI response",
                "listing": {...updated listing...},
                "stage": "...",
                "suggestions": [...],
                "changes_made": ["Updated title to include 'luxury'"]
            }
        """

        # Build context for Claude
        # Strip out base64 photo data to avoid token limit (photos can be 100k+ tokens each)
        listing_for_context = {k: v for k, v in current_listing.items() if k != 'photos'}
        if 'photos' in current_listing:
            listing_for_context['photos_count'] = len(current_listing.get('photos', []))

        context = f"""You are a helpful assistant helping a seller review their vacation rental listing.

**Current Listing Data:**
```json
{json.dumps(listing_for_context, indent=2)}
```

**Current Stage:** {current_stage}

**Available Context:**
- If seller has pricing suggestions from analysis, reference them when explaining pricing
- Use specific numbers and comparisons to justify the suggested price

**Conversation History:**
{self._format_history(conversation_history)}

**Seller's Message:** "{seller_message}"

Your task:
1. Understand what the seller wants to change
2. If it's a specific edit (e.g., "change title to include luxury"), extract the edit
3. If it's approval (e.g., "looks good"), move to next stage
4. If in set_dates stage and seller provides dates, extract them
5. If in set_pricing stage and seller asks "why" or "explain", provide detailed pricing reasoning:
   - Compare to similar properties in the area
   - Consider amenities value (e.g., "Properties with pool and fitness center in this area average $230-270/night")
   - Factor in location desirability
   - Mention seasonal demand if applicable
6. If seller wants to change the price (e.g., "change to 180", "i want 260"), extract the number as price
7. If unclear, ask for clarification

Return ONLY JSON:
{{
  "action": "edit" | "approve" | "clarify",
  "message": "Your friendly response to the seller",
  "edits": {{
    "field": "title" | "description" | "amenities" | "photos" | "availability" | "price",
    "new_value": "..." or ["..."] or {{"start_date": "...", "end_date": "..."}} or number
  }},
  "next_stage": "review_listing" | "set_dates" | "set_pricing" | "final_confirmation",
  "suggestions": ["Option 1", "Option 2", "Option 3"]
}}

Examples:
- Seller: "Change title to include oceanfront"
  → action: "edit", field: "title", new_value: "Oceanfront Modern Villa with Pool"

- Seller: "Looks good"
  → action: "approve", next_stage: "set_dates"

- Seller: "Make it sound more luxury"
  → action: "edit", field: "description", enhance with luxury language

- Seller (in set_dates stage): "next friday to the friday after"
  → action: "edit", field: "availability", new_value: {{"start_date": "2025-11-01", "end_date": "2025-11-08"}}, next_stage: "set_pricing"

- Seller: "change to 180" or "i want 260"
  → action: "edit", field: "price", new_value: 180 (or 260), message: "Got it! I've updated your nightly rate to $180."

**Important Date Validation:**
- Today's date is: {date.today().isoformat()} (YYYY-MM-DD format)
- A date is "in the future" if it comes AFTER today chronologically
- A date is "in the past" if it comes BEFORE today chronologically

**Rules:**
1. Start date MUST be today or later (start_date >= {date.today().isoformat()})
   - If start_date < {date.today().isoformat()}, reject with: "The start date is in the past. Please provide a date from today ({date.today().strftime('%B %d, %Y')}) onwards."

2. End date MUST be after start date (end_date > start_date)
   - If end_date <= start_date, reject with: "The end date must be after the start date."

3. If BOTH conditions pass, accept the dates and set next_stage to "set_pricing"

**Example:**
- Today is 2025-10-26
- User says "November 1st to 5th, 2025" → start: 2025-11-01, end: 2025-11-05
- Check: 2025-11-01 >= 2025-10-26? YES (November is AFTER October)
- Check: 2025-11-05 > 2025-11-01? YES
- Result: VALID, accept and proceed to set_pricing

For amenities, use these exact IDs: "tv", "kitchen", "projector", "laundry", "pool", "fitness", "parking"
Be conversational and helpful!
"""

        # Get Claude's response
        response = self.client.messages.create(
            model=self.model,
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": context
            }]
        )

        response_text = response.content[0].text

        # Parse response
        try:
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            ai_response = json.loads(response_text)

        except Exception as e:
            print(f"Parse error: {e}")
            # Fallback response
            return {
                "message": "I didn't quite understand. Can you rephrase that?",
                "listing": current_listing,
                "stage": current_stage,
                "suggestions": ["Change title", "Edit description", "Looks good"],
                "changes_made": []
            }

        # Apply edits if any
        updated_listing = current_listing.copy()
        changes_made = []
        field = None
        new_value = None

        if ai_response.get("action") == "edit" and ai_response.get("edits"):
            edits = ai_response["edits"]
            field = edits.get("field")
            new_value = edits.get("new_value")

            if field and new_value:
                updated_listing[field] = new_value
                changes_made.append(f"Updated {field}")

        # Determine next stage
        next_stage = ai_response.get("next_stage", current_stage)

        # Auto-transition to pricing if dates were just set
        if field == "availability" and new_value:
            next_stage = "set_pricing"

        # Initialize message and suggestions with defaults from AI response
        message = ai_response.get("message", "Got it!")
        suggestions = ai_response.get("suggestions", [])

        # If moving to next stage, update message
        if next_stage == "set_dates" and current_stage != "set_dates":
            message = "Great! Now, what dates are you available to host?"
            suggestions = ["Weekends only", "All of November", "Specific dates", "Year-round"]

        elif next_stage == "set_pricing" and current_stage != "set_pricing":
            message = "Perfect! Let me analyze competitive pricing for your property..."
            suggestions = ["See pricing suggestions", "Set my own price"]

        elif next_stage == "final_confirmation":
            message = "Your listing is ready! Ready to publish?"
            suggestions = ["Yes, publish it!", "Let me review one more time"]

        # Check if user approved final confirmation (publish)
        if current_stage == "final_confirmation" and ai_response.get("action") == "approve":
            updated_listing["status"] = "published"
            next_stage = "published"
            message = "🎉 Congratulations! Your listing has been published successfully!"
            suggestions = []

        return {
            "message": message,
            "listing": updated_listing,
            "stage": next_stage,
            "suggestions": suggestions,
            "changes_made": changes_made
        }

    async def generate_pricing_suggestions(
        self,
        listing: Dict[str, Any],
        date_range_start: str,  # "2025-11-01"
        date_range_end: str,    # "2025-11-30"
        pricing_service = None,  # PricingService instance
        elastic_client = None    # ElasticClient for competitor data
    ) -> Dict[str, Any]:
        """
        Generate comprehensive pricing suggestions for date range

        Integrates with pricing_service.py for dynamic pricing analysis
        including day-of-week, seasonality, holidays, and competitive data

        Args:
            listing: Property data (location, type, amenities, etc.)
            date_range_start: Start date (YYYY-MM-DD)
            date_range_end: End date (YYYY-MM-DD)
            pricing_service: PricingService instance (optional)
            elastic_client: ElasticClient for competitor data (optional)

        Returns:
            {
                "daily_prices": [...],  # Full pricing breakdown per day
                "summary": {"avg_price": 250, "total_revenue_estimate": 7500, ...},
                "competitive_analysis": {...},
                "recommendations": [...]
            }
        """
        # Use dynamic pricing service if available
        if pricing_service:
            try:
                pricing_analysis = await pricing_service.analyze_dynamic_pricing_for_dates(
                    listing_data=listing,
                    date_range_start=date_range_start,
                    date_range_end=date_range_end,
                    elastic_client=elastic_client
                )
                return pricing_analysis
            except Exception as e:
                print(f"Pricing service error: {e}")
                # Fall through to mock data

        # Fallback mock data
        return {
            "daily_prices": [
                {
                    "date": date_range_start,
                    "day_of_week": "Friday",
                    "final_price": 320,
                    "reasoning": "Weekend premium + Peak season"
                }
            ],
            "summary": {
                "avg_price": 280,
                "total_revenue_estimate": 8400,
                "number_of_nights": 30
            },
            "competitive_analysis": {"status": "unavailable"},
            "recommendations": [
                "Pricing is competitive for this market",
                "Consider minimum 2-night stay for weekends"
            ]
        }

    async def finalize_listing(
        self,
        listing: Dict[str, Any],
        pricing: Dict[str, Any],
        availability: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Prepare final listing for publication

        Returns complete listing data ready to be indexed
        """

        final_listing = {
            **listing,
            "pricing": pricing,
            "availability": availability,
            "status": "published",
            "created_at": "now"  # Would use actual timestamp
        }

        return final_listing

    def _format_history(self, history: List[Dict[str, str]]) -> str:
        """Format conversation history for Claude context"""
        formatted = []
        for msg in history[-5:]:  # Last 5 messages
            role = msg.get("role", "user")
            content = msg.get("content", "")
            formatted.append(f"{role.capitalize()}: {content}")
        return "\n".join(formatted) if formatted else "No history yet"

    async def health(self) -> bool:
        """Health check"""
        return True
