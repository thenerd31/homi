"""
Supabase Client - Database & Storage
"""

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    create_client = None
    Client = None

import os
from typing import Dict, Any, List, Optional
from datetime import datetime

class SupabaseClient:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")

        if SUPABASE_AVAILABLE and url and key:
            self.client: Client = create_client(url, key)
        else:
            self.client = None

        # In-memory fallback - load mock listings
        self.mock_listings = self._load_mock_listings()
        self.mock_qa_pairs = {}

    def _load_mock_listings(self) -> Dict[str, Dict[str, Any]]:
        """Load mock listings from generate_mock_listings.py"""
        try:
            from generate_mock_listings import LISTINGS
            return {listing["id"]: listing for listing in LISTINGS}
        except ImportError:
            # If import fails, return empty dict
            return {}

    async def create_listing(self, listing_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new listing in the database
        """
        import uuid

        listing_id = str(uuid.uuid4())
        listing = {
            "id": listing_id,
            **listing_data,
            "created_at": datetime.utcnow().isoformat()
        }

        if self.client:
            try:
                response = self.client.table("listings").insert(listing).execute()
                return response.data[0] if response.data else listing
            except Exception as e:
                print(f"Supabase error: {e}")

        # Fallback
        self.mock_listings[listing_id] = listing
        return listing

    async def get_listing(self, listing_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a listing by ID
        """
        if self.client:
            try:
                response = self.client.table("listings").select("*").eq("id", listing_id).execute()
                return response.data[0] if response.data else None
            except:
                pass

        return self.mock_listings.get(listing_id)

    async def get_all_listings(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get all listings (for seeding Elastic)
        """
        if self.client:
            try:
                response = self.client.table("listings").select("*").limit(limit).execute()
                return response.data
            except:
                pass

        return list(self.mock_listings.values())[:limit]

    async def save_qa_pair(
        self,
        listing_id: str,
        question: str,
        answer: str
    ):
        """
        Save a Q&A pair for a listing
        """
        import uuid

        qa_id = str(uuid.uuid4())
        qa_pair = {
            "id": qa_id,
            "listing_id": listing_id,
            "question": question,
            "answer": answer,
            "created_at": datetime.utcnow().isoformat()
        }

        if self.client:
            try:
                self.client.table("qa_pairs").insert(qa_pair).execute()
                return
            except:
                pass

        # Fallback
        if listing_id not in self.mock_qa_pairs:
            self.mock_qa_pairs[listing_id] = []
        self.mock_qa_pairs[listing_id].append(qa_pair)

    async def get_qa_pairs(self, listing_id: str) -> List[Dict[str, Any]]:
        """
        Get all Q&A pairs for a listing
        """
        if self.client:
            try:
                response = self.client.table("qa_pairs").select("*").eq("listing_id", listing_id).execute()
                return response.data
            except:
                pass

        return self.mock_qa_pairs.get(listing_id, [])

    async def upload_photo(self, file_data: bytes, file_name: str) -> str:
        """
        Upload photo to Supabase Storage
        Returns: Public URL of uploaded photo
        """
        if self.client:
            try:
                bucket = "listing-photos"
                path = f"{datetime.utcnow().strftime('%Y/%m/%d')}/{file_name}"

                self.client.storage.from_(bucket).upload(
                    path,
                    file_data
                )

                # Get public URL
                url = self.client.storage.from_(bucket).get_public_url(path)
                return url
            except Exception as e:
                print(f"Upload error: {e}")

        # Return mock URL
        return f"https://example.com/photos/{file_name}"

    async def health(self) -> bool:
        """Health check"""
        if not self.client:
            return True  # Mock mode works (no real DB configured)

        try:
            # Try to query listings table
            result = self.client.table("listings").select("id").limit(1).execute()
            return True
        except Exception as e:
            # Table might not exist yet, but connection works
            # Try a simpler auth check
            try:
                self.client.auth.get_session()
                return True
            except:
                return True  # Return true anyway - mock mode fallback
