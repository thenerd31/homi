"""
Extended Main File - Adds Claude CSV Search Routes

Import this after the main app initialization to add new routes
"""

from fastapi import FastAPI
from services.csv_search_service import CSVSearchService
from pydantic import BaseModel
from typing import Optional
from fastapi import HTTPException

# This will be called from main.py
def add_claude_search_routes(app: FastAPI):
    """Add Claude CSV search routes to the FastAPI app"""

    csv_search_service = CSVSearchService()

    class ClaudeSearchRequest(BaseModel):
        """Request for Claude-powered CSV search"""
        query: str
        location: Optional[str] = None
        guests: Optional[int] = None
        budget: Optional[float] = None
        limit: int = 20

    @app.post("/api/claude-search")
    async def claude_search(request: ClaudeSearchRequest):
        """
        Claude-powered search through CSV listings

        Uses Claude to intelligently match user preferences with CSV data
        Returns top 20 (or specified limit) listings
        """
        try:
            listings = await csv_search_service.search_with_claude(
                user_query=request.query,
                location=request.location,
                guests=request.guests,
                budget=request.budget,
                limit=request.limit
            )

            return {
                "success": True,
                "listings": listings,
                "count": len(listings)
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.get("/api/listing/{listing_id}")
    async def get_listing_detail(listing_id: str):
        """
        Get detailed information for a specific listing by ID

        Searches through all CSV files to find the listing
        """
        try:
            listing = await csv_search_service.get_listing_by_id(listing_id)

            if not listing:
                raise HTTPException(status_code=404, detail="Listing not found")

            return {
                "success": True,
                "listing": listing
            }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    print("✅ Claude CSV search routes added successfully")
