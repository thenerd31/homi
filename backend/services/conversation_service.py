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
        try:
            extraction_response = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                messages=[{
                    "role": "user",
                    "content": extraction_prompt
                }]
            )

            extraction_text = extraction_response.content[0].text
        except Exception as e:
            # Anthropic/Claude error (network, auth, billing, etc.) — return a graceful response
            print(f"Anthropic extraction error: {e}")
            return {
                "status": "collecting",
                "message": "Sorry — the AI service is temporarily unavailable (billing or auth issue). Please try again later.",
                "extracted_params": extracted_so_far,
                "missing_params": self.REQUIRED_PARAMS,
                "suggestions": []
            }

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

        # Validate extracted parameters
        validation_result = self._validate_params(extracted_params, user_message)

        # If validation failed, ask user to correct
        if not validation_result["valid"]:
            return {
                "status": "collecting",
                "message": validation_result["error_message"],
                "extracted_params": validation_result["corrected_params"],
                "missing_params": [],
                "suggestions": validation_result.get("suggestions", [])
            }

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

        try:
            followup_response = self.client.messages.create(
                model=self.model,
                max_tokens=512,
                messages=[{
                    "role": "user",
                    "content": followup_prompt
                }]
            )

            followup_text = followup_response.content[0].text
        except Exception as e:
            print(f"Anthropic followup error: {e}")
            # Fallback: ask a simple, local question for the missing param
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

    def _validate_params(self, params: Dict[str, Any], user_message: str) -> Dict[str, Any]:
        """
        Validate extracted parameters for reasonableness

        Returns:
        {
            "valid": bool,
            "error_message": str (if invalid),
            "corrected_params": dict (params with invalid ones removed),
            "suggestions": list (alternative options)
        }
        """
        corrected_params = params.copy()

        # Validate location - should be a single location
        if "location" in params:
            location = params["location"]
            # Check if multiple locations mentioned (contains comma separating cities)
            if isinstance(location, str):
                # Check for multiple distinct cities
                location_parts = [p.strip() for p in location.split(',')]
                # If more than 2 parts, or if contains "and" or "or", might be multiple locations
                if len(location_parts) > 2 or ' and ' in location.lower() or ' or ' in location.lower():
                    # Check if it's actually multiple cities vs "City, State"
                    possible_cities = []
                    for part in location_parts:
                        # Common city indicators
                        if any(word in part.lower() for word in ['francisco', 'luis obispo', 'angeles', 'diego', 'jose', 'york', 'miami', 'austin', 'beach']):
                            possible_cities.append(part)

                    if len(possible_cities) > 1:
                        corrected_params.pop("location", None)
                        return {
                            "valid": False,
                            "error_message": "I can only search one location at a time. Which city would you like to focus on?",
                            "corrected_params": corrected_params,
                            "suggestions": possible_cities[:4]  # Show up to 4 options
                        }

        # Validate guests - should be reasonable (1-20)
        if "guests" in params:
            guests = params["guests"]
            if isinstance(guests, (int, float)):
                if guests > 20:
                    corrected_params.pop("guests", None)
                    return {
                        "valid": False,
                        "error_message": "That's a lot of people! Most rentals accommodate up to 20 guests. How many guests will there be?",
                        "corrected_params": corrected_params,
                        "suggestions": ["2 guests", "4-6 guests", "8-10 guests", "15-20 guests"]
                    }
                elif guests < 1:
                    corrected_params.pop("guests", None)
                    return {
                        "valid": False,
                        "error_message": "You need at least 1 guest! How many people will be staying?",
                        "corrected_params": corrected_params,
                        "suggestions": ["Just me", "2 guests", "3-4 guests", "5+ guests"]
                    }

        # Validate price_max - should be reasonable ($50-$10000)
        if "price_max" in params:
            price = params["price_max"]
            if isinstance(price, (int, float)):
                if price > 10000:
                    corrected_params.pop("price_max", None)
                    return {
                        "valid": False,
                        "error_message": "That budget is quite high! What's a reasonable nightly rate you're comfortable with?",
                        "corrected_params": corrected_params,
                        "suggestions": ["$500/night", "$1000/night", "$2000/night", "$5000/night"]
                    }
                elif price < 20:
                    corrected_params.pop("price_max", None)
                    return {
                        "valid": False,
                        "error_message": "That budget might be too low for most rentals. What's your budget per night?",
                        "corrected_params": corrected_params,
                        "suggestions": ["Under $100", "$100-$200", "$200-$500", "$500+"]
                    }

        # Validate bedrooms - should be reasonable (0-15)
        if "bedrooms" in params:
            bedrooms = params["bedrooms"]
            if isinstance(bedrooms, (int, float)):
                if bedrooms > 15:
                    corrected_params.pop("bedrooms", None)
                    return {
                        "valid": False,
                        "error_message": "That's a mansion! Most rentals have up to 10 bedrooms. How many bedrooms do you need?",
                        "corrected_params": corrected_params,
                        "suggestions": ["Studio", "1-2 bedrooms", "3-4 bedrooms", "5+ bedrooms"]
                    }

        # All validations passed
        return {
            "valid": True,
            "error_message": "",
            "corrected_params": corrected_params,
            "suggestions": []
        }

    async def health(self) -> bool:
        """Health check"""
        return True
