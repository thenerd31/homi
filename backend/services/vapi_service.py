"""
Vapi Service Stub - Voice AI integration
(Minimal implementation for backend to start)
"""

class VapiService:
    def __init__(self):
        self.available = False

    async def health(self):
        return False

    def create_assistant(self):
        return {"error": "Vapi not configured"}

    async def handle_webhook(self, event_type, message, user_id):
        return {"error": "Vapi not configured"}


def get_vapi_service():
    """Get Vapi service instance"""
    return VapiService()
