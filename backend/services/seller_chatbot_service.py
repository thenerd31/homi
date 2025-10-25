"""
Seller Chatbot Service
Conversational interface for sellers to review and edit their listings
"""

import os
from typing import Dict, Any, List
import json
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
        context = f"""You are a helpful assistant helping a seller review their vacation rental listing.

**Current Listing Data:**
```json
{json.dumps(current_listing, indent=2)}
```

**Current Stage:** {current_stage}

**Conversation History:**
{self._format_history(conversation_history)}

**Seller's Message:** "{seller_message}"

Your task:
1. Understand what the seller wants to change
2. If it's a specific edit (e.g., "change title to include luxury"), extract the edit
3. If it's approval (e.g., "looks good"), move to next stage
4. If unclear, ask for clarification

Return ONLY JSON:
{{
  "action": "edit" | "approve" | "clarify",
  "message": "Your friendly response to the seller",
  "edits": {{
    "field": "title" | "description" | "amenities" | "photos",
    "new_value": "..." or ["..."]
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

        if ai_response.get("action") == "edit" and ai_response.get("edits"):
            edits = ai_response["edits"]
            field = edits.get("field")
            new_value = edits.get("new_value")

            if field and new_value:
                updated_listing[field] = new_value
                changes_made.append(f"Updated {field}")

        # Determine next stage
        next_stage = ai_response.get("next_stage", current_stage)

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

        else:
            message = ai_response.get("message", "Got it!")
            suggestions = ai_response.get("suggestions", [])

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
        dates: List[Dict[str, str]]  # [{"start": "2025-11-01", "end": "2025-11-30"}]
    ) -> Dict[str, Any]:
        """
        Generate pricing suggestions based on dates

        This would integrate with the pricing_service.py
        """
        # TODO: Call pricing_service.analyze_pricing()
        # For now, return mock data

        return {
            "suggestions": [
                {
                    "date_range": "Weekends in November",
                    "suggested_price": 380,
                    "reasoning": "High weekend demand, premium location"
                },
                {
                    "date_range": "Weekdays in November",
                    "suggested_price": 280,
                    "reasoning": "Lower weekday demand"
                }
            ],
            "market_position": "luxury",
            "confidence": 0.89
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
