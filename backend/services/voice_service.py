"""
Voice Service - Vapi + Groq integration
- Vapi: Real-time voice conversations with listings
- Groq: Audio file transcription for search input
"""

import os
from typing import Dict, Any
import httpx
from groq import Groq


class VoiceService:
    """
    Voice-powered features:
    - Vapi Web SDK for real-time voice Q&A with listings
    - Groq Whisper for audio file transcription (voice search input)
    """

    def __init__(self):
        self.vapi_api_key = os.getenv("VAPI_API_KEY", "")
        self.vapi_base_url = "https://api.vapi.ai"
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    async def transcribe(self, audio_file: Any) -> str:
        """
        Transcribe audio file to text using Groq Whisper
        Used for voice search input (upload audio → transcribe → search)

        Args:
            audio_file: Audio file (WAV, MP3, M4A, etc.)

        Returns:
            Transcribed text
        """
        # Read audio data
        audio_data = await audio_file.read()

        # Save to temporary file (Groq SDK requires file path)
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{audio_file.filename.split('.')[-1]}") as temp_file:
            temp_file.write(audio_data)
            temp_path = temp_file.name

        try:
            # Use Groq Whisper for transcription
            with open(temp_path, "rb") as audio:
                transcription = self.groq_client.audio.transcriptions.create(
                    file=audio,
                    model="whisper-large-v3",
                    response_format="json",
                    language="en",
                    temperature=0.0
                )

            return transcription.text

        finally:
            # Clean up temp file
            import os as os_module
            try:
                os_module.unlink(temp_path)
            except:
                pass

    async def create_assistant(self, listing_data: Dict[str, Any]) -> Dict[str, str]:
        """
        Create a Vapi AI assistant for a specific listing

        This creates a conversational AI that can:
        - Answer questions about the listing
        - Handle booking inquiries
        - Provide local recommendations

        Args:
            listing_data: Listing information

        Returns:
            {
                "assistant_id": str,
                "phone_number": str  # Optional phone number for voice calls
            }
        """
        if not self.vapi_api_key:
            return {
                "assistant_id": "demo_assistant",
                "note": "VAPI_API_KEY not configured. This is a demo mode."
            }

        # Build assistant context
        context = f"""You are a helpful AI assistant for a vacation rental listing.

Listing Details:
- Title: {listing_data.get('title', 'Vacation Rental')}
- Location: {listing_data.get('location', 'N/A')}
- Price: ${listing_data.get('suggested_price', listing_data.get('price', 'N/A'))}/night
- Amenities: {', '.join(listing_data.get('amenities', [])[:10])}
- Description: {listing_data.get('description', 'N/A')}

Answer guest questions helpfully and accurately. If you don't know something, be honest and suggest contacting the host."""

        # Create Vapi assistant
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {self.vapi_api_key}",
                "Content-Type": "application/json"
            }

            payload = {
                "name": f"VIBE Assistant - {listing_data.get('title', 'Listing')}",
                "model": {
                    "provider": "openai",
                    "model": "gpt-4",
                    "systemPrompt": context
                },
                "voice": {
                    "provider": "11labs",
                    "voiceId": "sarah"  # Professional, friendly voice
                }
            }

            async with session.post(
                f"{self.vapi_base_url}/assistant",
                headers=headers,
                json=payload
            ) as response:
                if response.status in [200, 201]:
                    result = await response.json()
                    return {
                        "assistant_id": result.get("id"),
                        "phone_number": result.get("phoneNumber")
                    }
                else:
                    # Return demo mode if API fails
                    return {
                        "assistant_id": "demo_assistant",
                        "note": f"Vapi assistant creation failed: {response.status}"
                    }

    async def health(self) -> bool:
        """Health check"""
        # Service is available even without API key (demo mode)
        return True
