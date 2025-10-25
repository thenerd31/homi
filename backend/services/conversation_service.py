"""
Conversational Search Service
Manages multi-turn conversations to collect search parameters
"""

import os
from typing import Dict, Any, List, Optional
import json
from anthropic import Anthropic

class ConversationService:
    """
    Handles conversational search with follow-up questions

    Flow:
    1. User sends message
    2. Extract parameters from message
    3. Check if all required params collected
    4. If missing, ask follow-up question
    5. Once complete, signal ready to search
    """

    REQUIRED_PARAMS = [
        "location",      # Where?
        "dates",         # When? (check-in, check-out)
        "guests",        # How many people?
        "price_max"      # Budget?
    ]

    OPTIONAL_PARAMS = [
        "bedrooms",
        "amenities",
        "property_type"
    ]

    def __init__(self):
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.model = "claude-sonnet-4-5-20250929"

    async def process_message(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]] = [],
        extracted_so_far: Dict[str, Any] = {}
    ) -> Dict[str, Any]:
        """
        Process user message and determine next step

        Returns:
        {
            "status": "collecting" | "ready_to_search",
            "message": "AI response to user",
            "extracted_params": {...},
            "missing_params": [...],
            "suggestions": [...]  # Optional quick-reply suggestions
        }
        """

        # Build conversation context
        messages = []

        # Add history
        for msg in conversation_history:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })

        # Add current message
        messages.append({
            "role": "user",
            "content": user_message
        })

        # Extract parameters from conversation
        from datetime import datetime
        today = datetime.now().strftime("%Y-%m-%d")
        day_of_week = datetime.now().strftime("%A")

        extraction_prompt = f"""You are helping a user search for vacation rentals. Extract search parameters from this conversation.

TODAY'S DATE: {today} ({day_of_week})

REQUIRED parameters (must have ALL of these):
- location: Where do they want to stay? (city, region, landmark)
- dates: When? (check-in and check-out dates in YYYY-MM-DD format)
  * "next weekend" = next Saturday to next Sunday (calculate from today's date)
  * "this weekend" = this Saturday to this Sunday
  * "next week" = 7 days from today
  * Convert all relative dates to specific YYYY-MM-DD format
- guests: How many people? (integer)
- price_max: Maximum price per night? (integer, in USD)

OPTIONAL parameters:
- bedrooms: Number of bedrooms (integer)
- amenities: List of amenities they mentioned (pool, hot tub, wifi, etc.)
- property_type: Type of property (apartment, house, villa, cabin, etc.)

Currently extracted parameters:
{json.dumps(extracted_so_far, indent=2)}

New user message: "{user_message}"

Extract any NEW parameters from this message and merge with existing.

Return ONLY a JSON object:
{{
  "extracted_params": {{
    "location": "...",
    "dates": {{"check_in": "YYYY-MM-DD", "check_out": "YYYY-MM-DD"}},
    "guests": 3,
    "price_max": 300,
    "bedrooms": 2,  // optional
    "amenities": ["pool", "wifi"],  // optional
    "property_type": "villa"  // optional
  }},
  "confidence": 0.9  // how confident you are about the extractions
}}

If a parameter is mentioned but unclear, don't include it. Only include what you're confident about.
"""

        # Extract parameters using Claude
        extraction_response = self.client.messages.create(
            model=self.model,
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": extraction_prompt
            }]
        )

        extraction_text = extraction_response.content[0].text

        # Parse extraction
        try:
            if "```json" in extraction_text:
                extraction_text = extraction_text.split("```json")[1].split("```")[0].strip()
            elif "```" in extraction_text:
                extraction_text = extraction_text.split("```")[1].split("```")[0].strip()

            extraction_result = json.loads(extraction_text)
            new_params = extraction_result.get("extracted_params", {})

            # Merge with existing
            extracted_params = {**extracted_so_far, **new_params}

        except Exception as e:
            print(f"Extraction error: {e}")
            extracted_params = extracted_so_far

        # Check which params are missing
        missing_params = []
        for param in self.REQUIRED_PARAMS:
            if param not in extracted_params or not extracted_params[param]:
                missing_params.append(param)

        # If all params collected, ready to search
        if not missing_params:
            return {
                "status": "ready_to_search",
                "message": "Great! Let me find the perfect places for you...",
                "extracted_params": extracted_params,
                "missing_params": [],
                "suggestions": []
            }

        # Otherwise, ask for next missing parameter
        next_param = missing_params[0]

        # Generate follow-up question
        followup_prompt = f"""You are a friendly vacation rental assistant. The user is searching for a place to stay.

You've collected so far:
{json.dumps(extracted_params, indent=2)}

You still need to ask about: {next_param}

Generate a friendly, natural follow-up question to ask about "{next_param}".

Also provide 3-4 quick-reply suggestions the user can tap.

Return ONLY JSON:
{{
  "message": "Your friendly question here",
  "suggestions": ["Option 1", "Option 2", "Option 3"]
}}

Examples:
- For location: "Where would you like to stay?" Suggestions: ["Malibu, CA", "Miami, FL", "Austin, TX"]
- For dates: "When are you planning to visit?" Suggestions: ["This weekend", "Next weekend", "Next month"]
- For guests: "How many guests?" Suggestions: ["Just me", "2 guests", "3-4 guests", "5+ guests"]
- For price_max: "What's your budget per night?" Suggestions: ["Under $200", "$200-$300", "$300-$500", "$500+"]

Be conversational and friendly!
"""

        followup_response = self.client.messages.create(
            model=self.model,
            max_tokens=512,
            messages=[{
                "role": "user",
                "content": followup_prompt
            }]
        )

        followup_text = followup_response.content[0].text

        try:
            if "```json" in followup_text:
                followup_text = followup_text.split("```json")[1].split("```")[0].strip()
            elif "```" in followup_text:
                followup_text = followup_text.split("```")[1].split("```")[0].strip()

            followup_result = json.loads(followup_text)
            message = followup_result.get("message", "Can you tell me more?")
            suggestions = followup_result.get("suggestions", [])

        except:
            # Fallback questions
            fallback_questions = {
                "location": {
                    "message": "Where would you like to stay?",
                    "suggestions": ["California coast", "Miami, FL", "Austin, TX", "New York, NY"]
                },
                "dates": {
                    "message": "When are you planning to visit?",
                    "suggestions": ["This weekend", "Next weekend", "Next month", "Custom dates"]
                },
                "guests": {
                    "message": "How many guests?",
                    "suggestions": ["Just me", "2 guests", "3-4 guests", "5+ guests"]
                },
                "price_max": {
                    "message": "What's your budget per night?",
                    "suggestions": ["Under $200", "$200-$300", "$300-$500", "$500+"]
                }
            }

            fallback = fallback_questions.get(next_param, {
                "message": f"Can you tell me about {next_param}?",
                "suggestions": []
            })
            message = fallback["message"]
            suggestions = fallback["suggestions"]

        return {
            "status": "collecting",
            "message": message,
            "extracted_params": extracted_params,
            "missing_params": missing_params,
            "suggestions": suggestions
        }

    async def parse_quick_reply(
        self,
        quick_reply: str,
        param_type: str
    ) -> Any:
        """
        Parse a quick-reply button selection into a parameter value

        Examples:
        - "Under $200" -> {"price_max": 200}
        - "3-4 guests" -> {"guests": 4}
        - "This weekend" -> {"dates": {"check_in": "2025-11-01", "check_out": "2025-11-03"}}
        """

        # Use Claude to parse the quick reply
        parse_prompt = f"""Parse this user selection into a structured parameter.

Parameter type: {param_type}
User selected: "{quick_reply}"

Return ONLY JSON with the parsed value:
{{
  "value": ...
}}

Examples:
- "Under $200" for price_max -> {{"value": 200}}
- "3-4 guests" for guests -> {{"value": 4}}
- "$300-$500" for price_max -> {{"value": 500}}
- "This weekend" for dates -> {{"value": {{"check_in": "2025-11-01", "check_out": "2025-11-03"}}}}
- "Next weekend" for dates -> {{"value": {{"check_in": "2025-11-08", "check_out": "2025-11-10"}}}}

Use today's date context if needed. Today is 2025-10-25.
"""

        response = self.client.messages.create(
            model=self.model,
            max_tokens=256,
            messages=[{
                "role": "user",
                "content": parse_prompt
            }]
        )

        text = response.content[0].text

        try:
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()

            result = json.loads(text)
            return result.get("value")
        except:
            return quick_reply  # Return raw if parsing fails

    async def health(self) -> bool:
        """Health check"""
        return True
