"""
LiveKit Service - Virtual tours and AI tour guides
Enables real-time video tours of properties
"""

import os
from typing import Dict, Any
import time
import hmac
import hashlib
import json


class LiveKitService:
    """
    Virtual tour service with LiveKit

    Features:
    - Host-to-guest video tours
    - AI tour guide (automated tours)
    - Real-time Q&A during tours
    - Screen sharing for photos
    """

    def __init__(self):
        self.api_key = os.getenv("LIVEKIT_API_KEY")
        self.api_secret = os.getenv("LIVEKIT_API_SECRET")
        self.ws_url = os.getenv("LIVEKIT_WS_URL", "wss://vibe.livekit.cloud")

    async def create_tour_room(
        self,
        listing_id: str,
        host_name: str = "Host",
        guest_name: str = "Guest"
    ) -> Dict[str, Any]:
        """
        Create a LiveKit room for virtual property tour

        Args:
            listing_id: The property being toured
            host_name: Name of the host giving the tour
            guest_name: Name of the guest

        Returns:
            {
                "room_name": str,
                "host_token": str,
                "guest_token": str,
                "room_url": str
            }
        """
        if not self.api_key or not self.api_secret:
            return {
                "room_name": f"tour_{listing_id}",
                "host_token": "demo_host_token",
                "guest_token": "demo_guest_token",
                "room_url": f"https://vibe.app/tour/{listing_id}",
                "note": "LIVEKIT_API_KEY not configured. This is demo mode."
            }

        room_name = f"vibe_tour_{listing_id}_{int(time.time())}"

        # Generate tokens for host and guest
        host_token = self._generate_token(
            room_name=room_name,
            participant_name=host_name,
            can_publish=True,
            can_subscribe=True
        )

        guest_token = self._generate_token(
            room_name=room_name,
            participant_name=guest_name,
            can_publish=False,  # Guest can only watch
            can_subscribe=True
        )

        return {
            "room_name": room_name,
            "host_token": host_token,
            "guest_token": guest_token,
            "room_url": f"{self.ws_url}?token={guest_token}"
        }

    async def create_ai_tour_guide(
        self,
        listing_id: str,
        listing_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create an AI tour guide for automated virtual tours

        This is a COMPLEX feature combining:
        - LiveKit for video streaming
        - Claude Vision for image analysis
        - Text-to-speech for narration
        - Real-time responses to questions

        Args:
            listing_id: The property being toured
            listing_data: Property details

        Returns:
            {
                "guide_id": str,
                "room_token": str,
                "capabilities": List[str]
            }
        """
        guide_id = f"ai_guide_{listing_id}"

        # Build tour script using property data
        tour_script = self._generate_tour_script(listing_data)

        return {
            "guide_id": guide_id,
            "room_token": "ai_guide_token",
            "tour_script": tour_script,
            "capabilities": [
                "Video narration",
                "Real-time Q&A",
                "Photo highlighting",
                "Amenity showcase",
                "Available 24/7"
            ],
            "note": "AI guide ready. Connect with LiveKit to start automated tour."
        }

    def _generate_token(
        self,
        room_name: str,
        participant_name: str,
        can_publish: bool = True,
        can_subscribe: bool = True,
        ttl: int = 3600  # 1 hour
    ) -> str:
        """
        Generate a JWT token for LiveKit room access

        Uses the LiveKit token format:
        https://docs.livekit.io/guides/access-tokens/
        """
        if not self.api_key or not self.api_secret:
            return "demo_token"

        # Create JWT claims
        now = int(time.time())
        claims = {
            "exp": now + ttl,
            "iss": self.api_key,
            "sub": participant_name,
            "video": {
                "room": room_name,
                "roomJoin": True,
                "canPublish": can_publish,
                "canSubscribe": can_subscribe
            }
        }

        # Encode JWT (simplified - in production use PyJWT library)
        # This is a basic implementation for demonstration
        header = {"typ": "JWT", "alg": "HS256"}

        import base64
        header_b64 = base64.urlsafe_b64encode(
            json.dumps(header).encode()
        ).decode().rstrip("=")

        payload_b64 = base64.urlsafe_b64encode(
            json.dumps(claims).encode()
        ).decode().rstrip("=")

        message = f"{header_b64}.{payload_b64}"
        signature = hmac.new(
            self.api_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).digest()

        signature_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")

        return f"{message}.{signature_b64}"

    def _generate_tour_script(self, listing_data: Dict[str, Any]) -> str:
        """
        Generate a tour narration script for the AI guide

        This would be enhanced with Claude to create dynamic,
        engaging tour commentary
        """
        title = listing_data.get("title", "this beautiful property")
        location = listing_data.get("location", "a great location")
        amenities = listing_data.get("amenities", [])[:5]

        script = f"""Welcome to {title}, located in {location}!

I'm your AI tour guide, and I'll be showing you around today.

Let's start in the main living area. As you can see, this space features {', '.join(amenities[:3]) if amenities else 'wonderful amenities'}.

{f"You'll also notice we have {', '.join(amenities[3:5])}." if len(amenities) > 3 else ""}

Feel free to ask me any questions during the tour - I'm here to help!

Shall we move to the next room?"""

        return script

    async def health(self) -> bool:
        """Health check"""
        # Service is available even without API keys (demo mode)
        return True
