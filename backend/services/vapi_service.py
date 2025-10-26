"""
Vapi Voice AI Integration
Provides voice-based conversational search using Vapi's Web SDK
"""

import os
import requests
from typing import Dict, Any, Optional

class VapiService:
    """
    Manages Vapi voice assistant integration

    Flow:
    1. Create assistant with conversational search context
    2. Frontend uses Vapi Web SDK to handle voice I/O
    3. Vapi calls our webhook with transcribed speech
    4. We process with conversation_service
    5. Return response for Vapi to speak
    """

    def __init__(self):
        self.api_key = os.getenv("VAPI_API_KEY", "demo-key")
        self.base_url = "https://api.vapi.ai"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def create_assistant(self) -> Dict[str, Any]:
        """
        Create a Vapi assistant for vacation rental search

        Returns assistant configuration including:
        - assistant_id: ID to use in frontend
        - model: LLM configuration
        - voice: Voice settings
        """

        assistant_config = {
            "name": "VIBE Vacation Rental Assistant",
            "model": {
                "provider": "anthropic",
                "model": "claude-sonnet-4-5-20250929",
                "messages": [
                    {
                        "role": "system",
                        "content": """You are a friendly vacation rental assistant helping users find their perfect place to stay.

Your job is to have a natural conversation to gather these details:
1. Location - Where do they want to stay?
2. Dates - When are they visiting? (check-in and check-out)
3. Guests - How many people?
4. Budget - Maximum price per night?

Optional details:
- Bedrooms needed
- Amenities (pool, hot tub, wifi, etc.)
- Property type (house, apartment, villa, etc.)

Be conversational and friendly. Ask one question at a time. When you have all required info, say "Great! Let me search for perfect places for you."

Keep responses concise and natural for voice interaction."""
                    }
                ],
                "temperature": 0.7,
                "maxTokens": 250
            },
            "voice": {
                "provider": "11labs",
                "voiceId": "21m00Tcm4TlvDq8ikWAM",  # Rachel - warm, friendly
                "stability": 0.5,
                "similarityBoost": 0.75
            },
            "firstMessage": "Hi! I'm here to help you find the perfect vacation rental. Where would you like to stay?",
            "serverUrl": f"{os.getenv('BACKEND_URL', 'http://localhost:8000')}/api/vapi/webhook",
            "endCallFunctionEnabled": False,
            "recordingEnabled": False,
            "hipaaEnabled": False,
            "clientMessages": [
                "conversation-update",
                "function-call",
                "hang",
                "metadata",
                "model-output",
                "speech-update",
                "status-update",
                "transcript",
                "tool-calls",
                "user-interrupted",
                "voice-input"
            ],
            "serverMessages": [
                "conversation-update",
                "end-of-call-report",
                "function-call",
                "hang",
                "speech-update",
                "status-update",
                "tool-calls",
                "transfer-destination-request"
            ]
        }

        return assistant_config

    def get_public_key(self) -> str:
        """Get Vapi public key for frontend Web SDK"""
        try:
            response = requests.get(
                f"{self.base_url}/account",
                headers=self.headers,
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("publicKey", "")
            return ""
        except Exception as e:
            print(f"Error getting Vapi public key: {e}")
            return ""

    async def handle_webhook(
        self,
        event_type: str,
        message: Dict[str, Any],
        user_id: str = "voice-user"
    ) -> Dict[str, Any]:
        """
        Handle webhook from Vapi during voice conversation

        Args:
            event_type: Type of webhook event
            message: Event payload from Vapi
            user_id: User identifier

        Returns:
            Response to send back to Vapi
        """

        # Handle different event types
        if event_type == "assistant-request":
            # Vapi requesting assistant config
            return self.create_assistant()

        elif event_type == "function-call":
            # Vapi calling a function we defined
            function_name = message.get("functionCall", {}).get("name")
            parameters = message.get("functionCall", {}).get("parameters", {})

            if function_name == "search_rentals":
                # User has provided all search parameters via voice
                return {
                    "results": [
                        {
                            "result": "I found several great options! Let me show them to you on screen."
                        }
                    ]
                }

        elif event_type == "status-update":
            # Call status changed
            status = message.get("status")
            print(f"Vapi call status: {status}")

        elif event_type == "transcript":
            # Speech was transcribed
            transcript = message.get("transcript", {})
            print(f"Transcript: {transcript}")

        elif event_type == "end-of-call-report":
            # Call ended, get summary
            summary = message.get("summary", "")
            print(f"Call ended. Summary: {summary}")

        return {"received": True}

    async def health(self) -> bool:
        """Health check"""
        return True


# Singleton instance
_vapi_service = None

def get_vapi_service() -> VapiService:
    """Get or create VapiService singleton"""
    global _vapi_service
    if _vapi_service is None:
        _vapi_service = VapiService()
    return _vapi_service
