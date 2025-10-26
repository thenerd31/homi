"""
VIBE - AI-Native Home Sharing Platform
Main FastAPI Application
"""

# ARIZE PHOENIX - Observability & Tracing
# Must be imported BEFORE any Anthropic SDK usage
try:
    from phoenix.otel import register
    from openinference.instrumentation.anthropic import AnthropicInstrumentor

    # Register Phoenix tracing
    tracer_provider = register(
        project_name="vibe-ai-platform",
        endpoint="http://localhost:6006/v1/traces"
    )

    # Instrument Anthropic SDK to trace all Claude API calls
    AnthropicInstrumentor().instrument(tracer_provider=tracer_provider)
    print("✓ Phoenix observability enabled")
except ImportError:
    print("⚠ Phoenix not installed - running without observability")

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import httpx
from dotenv import load_dotenv
import base64

# Import our modules
# from services.search_service import SearchService  # Placeholder service
from services.vision_service import VisionService
from services.letta_service import LettaService
from services.groq_service import GroqService
from services.qa_service import QAService
from services.pricing_service import PricingService
from services.voice_service import VoiceService
from services.conversation_service import ConversationService
from services.saved_listings_service import SavedListingsService
from services.seller_chatbot_service import SellerChatbotService
from services.image_filter_service import ImageFilterService
from services.preference_analysis_service import PreferenceAnalysisService
from services.vapi_service import VapiService, get_vapi_service
from services.geocoding_service import GeocodingService
from services.yolo_service import YOLOService
# Fetch.ai agents are separate processes - see agents/fetch_agents/
from utils.elastic_client import ElasticClient
from utils.supabase_client import SupabaseClient
# from monitoring.arize_logger import ArizeLogger  # Placeholder service

load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="VIBE API",
    description="AI-Native Home Sharing Platform",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
# search_service = SearchService()  # Placeholder
vision_service = VisionService()
letta_service = LettaService()
groq_service = GroqService()
qa_service = QAService()
pricing_service = PricingService()
voice_service = VoiceService()
conversation_service = ConversationService()
saved_listings_service = SavedListingsService()
seller_chatbot_service = SellerChatbotService()
image_filter_service = ImageFilterService()
preference_analysis_service = PreferenceAnalysisService()
vapi_service = get_vapi_service()
geocoding_service = GeocodingService()
yolo_service = YOLOService(model_path="yolov8n.pt")
elastic_client = ElasticClient()
supabase_client = SupabaseClient()
# arize_logger = ArizeLogger()  # Placeholder

# Fetch.ai agents run as separate processes
# See backend/agents/fetch_agents/ - run each agent with: python search_agent.py
# search_agent = SearchAgent()
# pricing_agent = PricingAgent()
# qa_agent = QAAgent()


# ============================================================================
# MODELS
# ============================================================================

class SearchRequest(BaseModel):
    query: str
    user_id: Optional[str] = None
    voice_mode: bool = False

class ListingOptimizeRequest(BaseModel):
    photos: List[str]  # Base64 or URLs
    location: str
    property_type: str

class QuestionRequest(BaseModel):
    listing_id: str
    question: str
    user_id: Optional[str] = None

class SwipeAction(BaseModel):
    listing_id: str
    action: str  # "like" or "pass"
    user_id: str

class ConversationRequest(BaseModel):
    user_message: str
    user_id: Optional[str] = None
    conversation_history: List[Dict[str, str]] = []
    extracted_so_far: Dict[str, Any] = {}

class SearchExecuteRequest(BaseModel):
    extracted_params: Dict[str, Any]
    user_id: Optional[str] = None
    relevance_threshold: float = 0.8  # Only return matches above this score

class SellerChatRequest(BaseModel):
    seller_message: str
    listing_id: Optional[str] = None  # If editing existing listing
    current_listing: Dict[str, Any] = {}
    conversation_history: List[Dict[str, str]] = []
    current_stage: str = "review_listing"

class SetAvailabilityRequest(BaseModel):
    listing_id: str
    dates: List[Dict[str, str]]  # [{"start": "2025-11-01", "end": "2025-11-30"}]

class ConfirmPricingRequest(BaseModel):
    listing_id: str
    pricing: Dict[str, Any]  # Pricing data (can be AI-suggested or manual)
    availability: List[Dict[str, str]]


# ============================================================================
# GUEST FLOW - SEARCH & DISCOVER
# ============================================================================

@app.post("/api/search")
async def natural_language_search(request: SearchRequest):
    """
    🎯 CORE FEATURE: Natural language search with Letta memory

    Sponsors: Anthropic, Groq, Letta, Elastic, Fetch.ai, Arize

    Example: "Find me a beachfront villa in Malibu under $300/night
              with a hot tub for next weekend"
    """
    try:
        # Log to Arize
        # arize_logger.log_search(request.query, request.user_id)

        # Step 1: Use Letta to maintain user search history & preferences
        user_context = await letta_service.get_user_context(request.user_id or "guest")

        # Step 2: Extract structured filters with Groq (ultra-fast)
        filters = await groq_service.extract_search_filters(
            query=request.query,
            user_history=user_context
        )

        # Step 3: Use Fetch.ai Search Agent to coordinate search
        # search_results = await search_agent.coordinate_search(filters)  # TODO: Implement Fetch.ai agent

        # Step 4: Semantic search with Elastic vector DB
        listings = await elastic_client.semantic_search(
            query_text=request.query,
            filters=filters,
            limit=50
        )

        # Step 5: Re-rank with Claude (complex reasoning)
        # ranked_listings = await vision_service.rank_by_relevance(  # TODO: Implement ranking
        #     listings=listings,
        #     user_query=request.query,
        #     user_preferences=user_context
        # )
        ranked_listings = listings  # Use unranked for now

        # Step 6: Update Letta memory
        await letta_service.update_search_history(
            user_id=request.user_id or "guest",
            query=request.query,
            filters=filters
        )

        return {
            "success": True,
            "listings": ranked_listings[:20],  # Top 20 for Tinder swipe
            "filters_extracted": filters,
            "personalized": bool(user_context)
        }

    except Exception as e:
        # arize_logger.log_error("search", str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/search/conversation")
async def conversational_search(request: ConversationRequest):
    """
    💬 NEW: Conversational search with follow-up questions

    Sponsors: Anthropic (Claude conversation), Groq (extraction), Letta (memory)

    Multi-turn conversation that collects:
    - Location
    - Dates
    - Number of guests
    - Budget

    Returns follow-up questions until all params collected.
    """
    try:
        # Get user's past preferences from Letta
        user_context = {}
        if request.user_id:
            user_context = await letta_service.get_user_context(request.user_id)

        # Process conversation
        result = await conversation_service.process_message(
            user_message=request.user_message,
            conversation_history=request.conversation_history,
            extracted_so_far=request.extracted_so_far
        )

        # If user has preferences, merge them
        if user_context and result["status"] == "collecting":
            # Suggest user's past preferences
            extracted = result["extracted_params"]

            if not extracted.get("location") and user_context.get("preferred_locations"):
                result["suggestions"].insert(0, user_context["preferred_locations"][0])

            if not extracted.get("price_max") and user_context.get("price_range", {}).get("max"):
                result["suggestions"].insert(0, f"Around ${user_context['price_range']['max']}")

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/search/execute")
async def execute_search(request: SearchExecuteRequest):
    """
    🔍 NEW: Execute search with relevance threshold

    Sponsors: Elastic (vector search), Anthropic (ranking)

    Only returns listings above relevance threshold (default 0.8).
    Uses hybrid search (BM25 + semantic vectors).
    """
    try:
        params = request.extracted_params

        # Build search query from parameters
        query_parts = []
        if params.get("property_type"):
            query_parts.append(f"{params['property_type']}")
        if params.get("location"):
            query_parts.append(f"in {params['location']}")
        if params.get("amenities"):
            query_parts.append(f"with {', '.join(params['amenities'])}")

        query_text = " ".join(query_parts) if query_parts else params.get("location", "")

        # Build filters
        filters = {}
        if params.get("price_max"):
            filters["price_max"] = params["price_max"]
        if params.get("guests"):
            filters["guests"] = params["guests"]
        if params.get("bedrooms"):
            filters["bedrooms"] = params["bedrooms"]
        if params.get("amenities"):
            filters["amenities"] = params["amenities"]
        if params.get("location"):
            filters["location"] = params["location"]

        # Use hybrid search for better results
        listings = await elastic_client.hybrid_search(
            query_text=query_text,
            filters=filters,
            limit=100  # Get more, then filter by threshold
        )

        # Filter by relevance threshold
        threshold = request.relevance_threshold
        filtered_listings = [
            listing for listing in listings
            if listing.get("relevance_score", 0) >= threshold
        ]

        # Update Letta memory
        if request.user_id:
            await letta_service.update_search_history(
                user_id=request.user_id,
                query=query_text,
                filters=filters
            )

        return {
            "success": True,
            "matches": filtered_listings,
            "total_matches": len(filtered_listings),
            "threshold": threshold,
            "hardcoded_radius_miles": 25  # TODO: Implement Maps API radius
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/voice-to-text")
async def voice_to_text(audio_file: UploadFile = File(...)):
    """
    🎤 Voice-to-text transcription with Vapi

    Sponsor: Vapi

    Transcribes audio to text for use in conversational search.
    Frontend can then send transcription to /api/search/conversation.

    This separates voice transcription from search logic,
    allowing users to switch between voice and text input seamlessly.
    """
    try:
        # Transcribe audio to text with Vapi
        transcription = await voice_service.transcribe(audio_file)

        return {
            "success": True,
            "text": transcription,
            "note": "Send this text to /api/search/conversation to continue"
        }

    except ValueError as e:
        # Vapi not configured - return helpful error
        raise HTTPException(
            status_code=501,
            detail=str(e) + " Voice transcription requires VAPI_API_KEY in .env"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/voice-search")
async def voice_search(audio_file: UploadFile = File(...), user_id: Optional[str] = None):
    """
    🎤 DEPRECATED: Use /api/voice-to-text + /api/search/conversation instead

    This endpoint is kept for backward compatibility.
    Converts voice directly to old-style single-shot search.

    For conversational voice search:
    1. POST /api/voice-to-text → get transcription
    2. POST /api/search/conversation → start conversation with transcription
    """
    try:
        # Transcribe audio to text with Vapi
        transcription = await voice_service.transcribe(audio_file)

        # Use old single-shot natural language search
        search_request = SearchRequest(
            query=transcription,
            user_id=user_id,
            voice_mode=True
        )

        result = await natural_language_search(search_request)

        # Add transcription to response
        result["transcription"] = transcription

        return result

    except ValueError as e:
        raise HTTPException(
            status_code=501,
            detail=str(e) + " Voice search requires VAPI_API_KEY in .env"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/swipe")
async def handle_swipe(swipe: SwipeAction):
    """
    ❤️ Tinder-style swipe tracking

    Sponsors: Letta (learns preferences), Supabase (storage), Arize (tracking)

    Learns what users like/pass to improve future recommendations.
    Stores liked listings for later retrieval.
    """
    try:
        # Update Letta with preference
        await letta_service.record_swipe_action(
            user_id=swipe.user_id,
            listing_id=swipe.listing_id,
            action=swipe.action
        )

        # Log engagement to Arize
        # arize_logger.log_engagement(swipe.user_id, swipe.action)

        # If user liked, store the listing
        if swipe.action == "like":
            # Get full listing details
            listing = await supabase_client.get_listing(swipe.listing_id)

            if listing:
                # Store as saved listing in Supabase
                # (In production, you'd have a separate saved_listings table)
                # For now, we'll track this in Letta memory
                pass

            return {
                "success": True,
                "message": "Listing saved to your favorites!"
            }

        return {"success": True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/saved-listings/{user_id}")
async def get_saved_listings(user_id: str):
    """
    📋 NEW: Get user's saved listings (swipe-right properties)

    Sponsors: Anthropic (AI ranking), Letta (learned preferences), Supabase (storage)

    Auto-organizes saved listings by:
    - Original search relevance
    - Learned preferences from swipes
    - Availability
    - Price changes

    Each listing includes AI-generated reasoning for its rank.
    """
    try:
        # Get user's context from Letta
        user_context = await letta_service.get_user_context(user_id)

        # Get liked listing IDs from Letta memory
        liked_listing_ids = user_context.get("liked_listings", [])

        if not liked_listing_ids:
            return {
                "success": True,
                "saved_listings": [],
                "total": 0,
                "message": "You haven't saved any listings yet. Start swiping!"
            }

        # Fetch full listing details from Supabase
        saved_listings = []
        for listing_id in liked_listing_ids:
            listing = await supabase_client.get_listing(listing_id)
            if listing:
                saved_listings.append(listing)

        # Re-rank using AI
        ranked_listings = await saved_listings_service.get_and_rank_saved_listings(
            user_id=user_id,
            saved_listings=saved_listings,
            user_preferences=user_context,
            original_search_query=user_context.get("search_history", [{}])[-1].get("query", "") if user_context.get("search_history") else ""
        )

        return {
            "success": True,
            "saved_listings": ranked_listings,
            "total": len(ranked_listings),
            "personalization_data": {
                "total_swipes": user_context.get("swipe_patterns", {}).get("likes", 0),
                "engagement_score": user_context.get("engagement_score", 0)
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/listings/{listing_id}/ask")
async def ask_listing_question(listing_id: str, question: QuestionRequest):
    """
    💬 Q&A bot for each listing with AI

    Sponsors: Anthropic, Groq, Toolhouse

    Guest asks: "Is this place pet-friendly?"
    → Gets intelligent, context-aware answer from Claude
    """
    try:
        # Get listing details
        listing = await supabase_client.get_listing(listing_id)

        # Use intelligent Q&A service (Claude-powered)
        qa_result = await qa_service.answer_question(
            question=question.question,
            listing_data=listing
        )

        # Save Q&A pair for future reference
        await supabase_client.save_qa_pair(
            listing_id=listing_id,
            question=question.question,
            answer=qa_result["answer"]
        )

        return {
            "answer": qa_result["answer"],
            "confidence": qa_result["confidence"],
            "sources": qa_result.get("sources", [])
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# HOST FLOW - LISTING OPTIMIZATION
# ============================================================================

class ImageFilterRequest(BaseModel):
    """Request to filter and rank photos"""
    photo_urls: List[str]
    max_photos: Optional[int] = 20

class QuickCheckRequest(BaseModel):
    """Request to check a single photo quality"""
    photo_url: str

class PreferenceAnalysisRequest(BaseModel):
    """Request to analyze user preference images"""
    image_urls: List[str]
    text_description: Optional[str] = ""

class HumanizePreferencesRequest(BaseModel):
    """Request to convert raw preferences to human-readable text"""
    preferences: Dict[str, Any]

class AnalyzeScanRequest(BaseModel):
    """Request to analyze YOLO scan data and generate listing"""
    scan_data: Dict[str, Any]
    location: str

@app.post("/api/filter-photos")
async def filter_photos(request: ImageFilterRequest):
    """
    📸 Filter and rank photos from AR scan

    Sponsor: Anthropic (Claude Vision)

    Use case: Seller scans property with Spectacles →
    Backend analyzes photos → Selects best ones for listing

    Features:
    - Quality assessment (blur, lighting, composition)
    - Room type detection
    - Duplicate filtering
    - Best shot selection per room
    """
    try:
        result = await image_filter_service.analyze_photo_batch(
            photo_urls=request.photo_urls,
            max_photos=request.max_photos
        )

        return {
            "success": True,
            **result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/check-photo-quality")
async def check_photo_quality(request: QuickCheckRequest):
    """
    🔍 Quick quality check for single photo

    Sponsor: Anthropic (Claude Vision)

    Use case: Real-time feedback during AR scanning
    """
    try:
        result = await image_filter_service.quick_quality_check(request.photo_url)

        return {
            "success": True,
            **result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-preferences")
async def analyze_preferences(request: PreferenceAnalysisRequest):
    """
    🖼️ BUYER FEATURE: Analyze preference images

    Sponsor: Anthropic (Claude Vision)

    Use case: Buyer uploads photos of places they love →
    AI extracts visual preferences → Converts to search criteria

    Features:
    - Style detection (modern, rustic, beachy, etc.)
    - Amenity extraction (pool, fireplace, etc.)
    - Atmosphere analysis (cozy, spacious, bright, etc.)
    - Location type inference (urban, coastal, etc.)
    """
    try:
        result = await preference_analysis_service.analyze_preference_images(
            image_urls=request.image_urls,
            text_description=request.text_description
        )

        return {
            "success": True,
            **result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/humanize-preferences")
async def humanize_preferences(request: HumanizePreferencesRequest):
    """
    ✨ Convert raw preference data to human-readable text

    Sponsor: Groq (fast inference)

    Takes structured preference data and converts it to natural language
    for displaying to users.
    """
    try:
        prompt = f"""Convert these preference data into a natural, human-readable list of 3-5 short phrases that describe what the user likes. Make it sound natural and conversational.

Preference data: {request.preferences}

Guidelines:
- Convert technical terms to natural language (e.g., "architectural_style: modern" → "modern architecture")
- Combine related items naturally (e.g., "pool, deck, windows" → "outdoor entertaining spaces with pools")
- Keep each phrase short and punchy (3-6 words)
- Focus on the most distinctive/interesting preferences
- Return ONLY a comma-separated list, no explanations

Example output: "contemporary architectural design, luxury modern spaces, natural light"
"""

        response = await groq_service.generate_completion(
            prompt=prompt,
            temperature=0.7,
            max_tokens=100
        )

        # Clean up the response
        humanized_text = response.strip()

        return {
            "success": True,
            "humanized_text": humanized_text
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-scan")
async def analyze_scan(request: AnalyzeScanRequest):
    """
    🤖 AI Analysis of YOLO Scan Data

    Sponsor: Anthropic (Claude), Groq (title generation), Pricing Service

    Takes raw YOLO scan data and generates:
    - Compelling listing title from detected objects
    - Pricing suggestion based on amenities and location
    - Mapped amenities for UI
    """
    try:
        scan_data = request.scan_data
        location = request.location

        # Extract key info from scan
        amenities_detected = scan_data.get("amenities_detected", [])
        property_type = scan_data.get("property_type", "apartment")
        bedrooms = scan_data.get("bedrooms", 1)
        bathrooms = scan_data.get("bathrooms", 1)
        objects_detected = scan_data.get("objects_detected", {})
        room_breakdown = scan_data.get("room_breakdown", {})

        print(f"🔍 Analyzing scan: {property_type}, {bedrooms}BR/{bathrooms}BA")
        print(f"📋 Amenities detected: {amenities_detected}")
        print(f"🏠 Room breakdown: {room_breakdown}")

        # Step 1: Generate compelling title with Groq
        title_prompt = f"""Generate a short, compelling Airbnb listing title (max 8 words) for this property:

Property Type: {property_type}
Bedrooms: {bedrooms}
Bathrooms: {bathrooms}
Location: {location}
Detected Amenities: {', '.join(amenities_detected[:10])}
Rooms Scanned: {', '.join(room_breakdown.keys())}

Guidelines:
- Focus on the most appealing features
- Be specific and descriptive
- Include location neighborhood if in title (SF → "Downtown SF", "SoMa", etc.)
- Make it sound inviting
- Keep it under 8 words

Return ONLY the title, nothing else."""

        title_response = await groq_service.generate_completion(
            prompt=title_prompt,
            temperature=0.7,
            max_tokens=50
        )

        generated_title = title_response.strip().strip('"')
        print(f"📝 Generated title: {generated_title}")

        # Step 2: Map YOLO amenities to UI amenity IDs
        # UI expects: tv, kitchen, projector, laundry, pool, fitness, parking
        amenity_mapping = {
            "TV": "tv",
            "entertainment": "tv",
            "full kitchen": "kitchen",
            "kitchen": "kitchen",
            "cooking facilities": "kitchen",
            "kitchen appliances": "kitchen",
            "Laundry": "laundry",
            "washing machine": "laundry",
            "Swimming Pool": "pool",
            "pool": "pool",
            "Gym": "fitness",
            "fitness": "fitness",
            "workout": "fitness",
            "Parking": "parking",
            "parking": "parking",
            "car": "parking",
            "garage": "parking",
        }

        ui_amenities = set()
        for amenity in amenities_detected:
            amenity_lower = amenity.lower()
            # Check for exact matches first
            if amenity in amenity_mapping:
                ui_amenities.add(amenity_mapping[amenity])
            # Then check if any mapping key is in the amenity string
            else:
                for key, value in amenity_mapping.items():
                    if key.lower() in amenity_lower:
                        ui_amenities.add(value)
                        break

        mapped_amenities = list(ui_amenities)
        print(f"🏷️ Mapped to UI amenities: {mapped_amenities}")

        # Step 3: Get AI pricing suggestion
        pricing_data = await pricing_service.analyze_pricing(
            location=location,
            property_type=property_type,
            amenities=amenities_detected,
            bedrooms=bedrooms,
            bathrooms=bathrooms
        )

        suggested_price = pricing_data.get("suggested_price", 168)
        print(f"💰 Suggested price: ${suggested_price}/night")

        return {
            "success": True,
            "title": generated_title,
            "suggested_price": suggested_price,
            "amenities": mapped_amenities,
            "pricing_data": pricing_data,
            "property_analysis": {
                "property_type": property_type,
                "bedrooms": bedrooms,
                "bathrooms": bathrooms,
                "rooms_detected": len(room_breakdown),
                "total_amenities": len(amenities_detected)
            }
        }

    except Exception as e:
        print(f"❌ Error analyzing scan: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/optimize-listing")
async def optimize_listing(request: ListingOptimizeRequest):
    """
    🏠 HOST FEATURE: Auto-optimize listing with AI

    Sponsors: Anthropic (vision), Groq (pricing + content), Claude (Q&A)

    Host uploads photos → AI generates everything:
    - Detects amenities from photos
    - Analyzes competitive pricing
    - Writes compelling title & description
    - Creates Q&A bot knowledge base
    """
    try:
        # Step 1: Analyze photos with Claude Vision
        amenities = await vision_service.detect_amenities(request.photos)

        # Step 2: AI-powered competitive pricing analysis
        pricing_data = await pricing_service.analyze_pricing(
            location=request.location,
            property_type=request.property_type,
            amenities=amenities
        )

        # Step 3: Generate title & description with Groq (fast)
        content = await groq_service.generate_listing_content(
            amenities=amenities,
            pricing=pricing_data
        )

        # Step 4: Create listing data for Q&A generation
        listing_data = {
            "title": content.get("title", "Beautiful Property"),
            "description": content.get("description", "A wonderful place to stay"),
            "amenities": amenities,
            "suggested_price": pricing_data["suggested_price"],
            "price_range": pricing_data["price_range"],
            "location": request.location,
            "property_type": request.property_type
        }

        # Step 5: Generate Q&A pairs with AI (creates instant knowledge base)
        qa_pairs = await qa_service.generate_qa_pairs(
            listing_data=listing_data,
            num_pairs=10
        )

        # Step 6: Save to Supabase
        listing_data["photos"] = request.photos
        listing_data["qa_pairs"] = qa_pairs
        listing = await supabase_client.create_listing(listing_data)

        # Step 7: Index in Elastic for semantic search
        await elastic_client.index_listing(listing)

        return {
            "success": True,
            "listing_id": listing["id"],
            "title": listing_data["title"],
            "description": listing_data["description"],
            "amenities_detected": amenities,
            "suggested_price": pricing_data["suggested_price"],
            "competitive_analysis": pricing_data,
            "qa_pairs": qa_pairs,
            "qa_count": len(qa_pairs)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/seller/chat")
async def seller_chatbot(request: SellerChatRequest):
    """
    💬 NEW: Seller chatbot for listing review

    Sponsors: Anthropic (Claude conversation), Groq (pricing)

    Conversational interface for sellers to review AI-generated listing.

    Flow:
    1. Show generated listing
    2. Seller makes natural language edits
    3. Chatbot updates listing in real-time
    4. Confirm basic info (location, amenities, photos)
    5. Ask for availability dates
    6. Suggest pricing based on dates
    7. Final confirmation and publish
    """
    try:
        # Process seller's message
        result = await seller_chatbot_service.process_seller_message(
            seller_message=request.seller_message,
            current_listing=request.current_listing,
            conversation_history=request.conversation_history,
            current_stage=request.current_stage
        )

        # If moving to pricing stage, get AI pricing suggestions
        if result["stage"] == "set_pricing":
            # Get availability dates from updated listing
            availability = result["listing"].get("availability", [])

            # Get AI pricing suggestions (whether or not dates are set)
            pricing_suggestions = await pricing_service.analyze_pricing(
                location=result["listing"].get("location", ""),
                property_type=result["listing"].get("property_type", "apartment"),
                amenities=result["listing"].get("amenities", []),
                bedrooms=result["listing"].get("bedrooms", 2),
                bathrooms=result["listing"].get("bathrooms", 1)
            )

            result["pricing_suggestions"] = pricing_suggestions

            # Update message to include pricing info
            suggested_price = pricing_suggestions.get("suggested_price", 150)
            result["message"] = f"Based on your location, amenities, and comparable listings, I suggest pricing at ${suggested_price}/night. You can adjust this if you'd like!"
            result["suggestions"] = [f"Use ${suggested_price}/night", "Set my own price", "Tell me more about pricing"]

        return result

    except Exception as e:
        print(f"❌ Seller chatbot error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/seller/start-review")
async def start_seller_review(listing_data: Dict[str, Any]):
    """
    🏁 NEW: Start seller listing review

    Sponsors: Anthropic (Claude)

    Called after AR scan is complete and listing is generated.
    Returns initial chatbot message showing the generated listing.
    """
    try:
        result = await seller_chatbot_service.start_listing_review(
            generated_listing=listing_data
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/seller/set-availability")
async def set_availability(request: SetAvailabilityRequest):
    """
    📅 NEW: Set listing availability dates

    Updates listing with seller's available dates.
    Triggers pricing suggestions based on dates.
    """
    try:
        # Get listing
        listing = await supabase_client.get_listing(request.listing_id)

        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")

        # Update with availability
        listing["availability"] = request.dates

        # Get pricing suggestions for these specific dates
        pricing_suggestions = await pricing_service.analyze_pricing(
            location=listing.get("location", ""),
            property_type=listing.get("property_type", ""),
            amenities=listing.get("amenities", [])
        )

        return {
            "success": True,
            "listing": listing,
            "pricing_suggestions": pricing_suggestions,
            "message": "Based on your dates, here's what we recommend..."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/seller/publish")
async def publish_listing(request: ConfirmPricingRequest):
    """
    🚀 NEW: Publish listing

    Final step - seller confirms pricing and publishes listing.
    Indexes in Elasticsearch and makes it searchable.
    """
    try:
        # Get listing
        listing = await supabase_client.get_listing(request.listing_id)

        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")

        # Update with final pricing and availability
        listing["pricing"] = request.pricing
        listing["availability"] = request.availability
        listing["status"] = "published"

        # Save to Supabase (would update in real implementation)
        # await supabase_client.update_listing(request.listing_id, listing)

        # Index in Elasticsearch for searchability
        await elastic_client.index_listing(listing)

        return {
            "success": True,
            "listing_id": request.listing_id,
            "message": "🎉 Your listing is now live!",
            "listing_url": f"/listings/{request.listing_id}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# AR & IMMERSIVE FEATURES
# ============================================================================

@app.get("/api/listings/{listing_id}/ar-data")
async def get_ar_data(listing_id: str):
    """
    🥽 AR data for Snap Spectacles

    Sponsors: Snap, Anthropic (Claude Vision)

    Returns 3D placement data for AR overlay
    - Room layout analysis
    - Amenity positioning
    - AR anchor points for Spectacles
    """
    listing = await supabase_client.get_listing(listing_id)

    # Generate AR room layout using Claude Vision
    room_layout = await vision_service.generate_ar_layout(
        listing.get("photos", [])
    )

    # Detect feature positions for AR markers
    feature_positions = await vision_service.detect_feature_positions(
        listing.get("photos", [])
    )

    # Generate AR metadata
    ar_data = {
        "listing_id": listing_id,
        "title": listing.get("title", "Property"),
        "price": listing.get("suggested_price", 0),
        "amenities": listing.get("amenities", []),
        "room_layout": room_layout,
        "overlay_positions": feature_positions,
        "ar_ready": bool(room_layout)  # Indicates if AR data is available
    }

    return ar_data


# ============================================================================
# VAPI VOICE CONVERSATIONS (Real-time voice Q&A with listings)
# ============================================================================

class VapiCallRequest(BaseModel):
    """Request to start a Vapi web call"""
    assistantId: Optional[str] = None
    assistant: Optional[Dict[str, Any]] = None

class VapiStopRequest(BaseModel):
    """Request to stop a Vapi call"""
    call_id: str

@app.get("/api/vapi/public-key")
async def get_vapi_public_key():
    """
    🔑 Get Vapi public key for frontend SDK initialization

    Sponsor: Vapi

    Returns the Vapi public key that can be safely used in the frontend.
    """
    vapi_public_key = os.getenv("VAPI_PUBLIC_KEY", "")

    if not vapi_public_key:
        # Return a demo key or empty string for development
        return {
            "success": True,
            "public_key": "",
            "note": "VAPI_PUBLIC_KEY not configured. Voice features will use demo mode."
        }

    return {
        "success": True,
        "public_key": vapi_public_key
    }


@app.post("/api/vapi/call/start")
async def vapi_start_call(request: VapiCallRequest):
    """
    🎤 Start a Vapi web call (real-time voice conversation)

    Sponsor: Vapi

    This proxies the request to Vapi API to bypass CORS.
    Frontend uses Vapi Web SDK to connect to this call.

    Use case: User clicks "Talk to AI" on a listing to ask questions via voice.
    """
    vapi_api_key = os.getenv("VAPI_API_KEY", "")
    if not vapi_api_key:
        raise HTTPException(status_code=501, detail="VAPI_API_KEY not configured")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.vapi.ai/call/web",
                headers={
                    "Authorization": f"Bearer {vapi_api_key}",
                    "Content-Type": "application/json"
                },
                json=request.dict(exclude_none=True),
                timeout=30.0
            )

            if response.status_code in [200, 201]:
                return response.json()
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Vapi error: {response.text}"
                )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/vapi/call/stop")
async def vapi_stop_call(request: VapiStopRequest):
    """
    🛑 Stop an active Vapi call

    Sponsor: Vapi
    """
    vapi_api_key = os.getenv("VAPI_API_KEY", "")
    if not vapi_api_key:
        raise HTTPException(status_code=501, detail="VAPI_API_KEY not configured")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://api.vapi.ai/call/{request.call_id}/stop",
                headers={
                    "Authorization": f"Bearer {vapi_api_key}",
                },
                timeout=10.0
            )

            if response.status_code == 200:
                return {"success": True}
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Vapi error: {response.text}"
                )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/vapi/call/{call_id}")
async def vapi_get_call(call_id: str):
    """
    📞 Get Vapi call details

    Sponsor: Vapi
    """
    vapi_api_key = os.getenv("VAPI_API_KEY", "")
    if not vapi_api_key:
        raise HTTPException(status_code=501, detail="VAPI_API_KEY not configured")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.vapi.ai/call/{call_id}",
                headers={
                    "Authorization": f"Bearer {vapi_api_key}",
                },
                timeout=10.0
            )

            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Vapi error: {response.text}"
                )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/vapi/context/{listing_id}")
async def vapi_get_listing_context(listing_id: str):
    """
    📋 Get listing context for Vapi assistant

    Sponsor: Vapi

    Returns listing data formatted for Vapi assistant system prompt.
    Frontend calls this before starting a Vapi call to get context.
    """
    try:
        # Get listing from Elasticsearch
        listing = await elastic_client.get_listing(listing_id)

        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")

        # Format context for Vapi assistant
        context = {
            "vapi_message": f"""You are a helpful AI assistant for a vacation rental listing.

**Property Details:**
- Title: {listing.get('title', 'N/A')}
- Location: {listing.get('location', 'N/A')}
- Price: ${listing.get('price', 'N/A')}/night
- Bedrooms: {listing.get('bedrooms', 'N/A')}
- Property Type: {listing.get('property_type', 'N/A')}

**Amenities:**
{', '.join(listing.get('amenities', [])[:15])}

**Description:**
{listing.get('description', 'N/A')[:300]}...

**Instructions:**
- Answer questions about this property helpfully and accurately
- If you don't know something, be honest and suggest contacting the host
- Be friendly and conversational
- Help users understand if this property meets their needs
""",
            "listing_data": {
                "id": listing_id,
                "title": listing.get('title'),
                "location": listing.get('location'),
                "price": listing.get('price'),
                "amenities": listing.get('amenities', [])[:15],
                "bedrooms": listing.get('bedrooms'),
                "property_type": listing.get('property_type')
            }
        }

        return context

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# REAL-TIME YOLO DETECTION (WebSocket)
# ============================================================================

@app.websocket("/ws/scan")
async def websocket_scan(websocket: WebSocket):
    """
    🎥 Real-time YOLO object detection via WebSocket with session management

    Use case: Phone camera streaming for property scanning

    Protocol:
    - Client sends: {"type": "start"} to begin session
    - Client sends: {"type": "frame", "image": "base64_jpeg_data"}
    - Server responds: {"type": "detection", "objects": [...], "amenities": [...]}
    - Client sends: {"type": "finalize"} to get aggregated results
    """
    await websocket.accept()
    session_id = None
    frame_count = 0

    try:
        print("📱 Phone connected to WebSocket")

        # Create session
        session_id = yolo_service.create_session()

        await websocket.send_json({
            "type": "connected",
            "session_id": session_id,
            "message": "Ready to scan! Point camera at rooms in your property"
        })

        while True:
            # Receive message from phone
            data = await websocket.receive_json()

            if data.get("type") == "frame":
                frame_count += 1

                # Decode base64 image
                image_base64 = data.get("image", "")
                if not image_base64:
                    await websocket.send_json({"error": "No image data"})
                    continue

                # Check if this should be stored as a photo
                store_image = data.get("store_image", False)

                # Remove data URL prefix if present
                image_data_uri = image_base64
                if "," in image_base64:
                    image_base64 = image_base64.split(",")[1]

                image_bytes = base64.b64decode(image_base64)

                # Run YOLO detection
                result = await yolo_service.detect_realtime(image_bytes)

                # Add to session (stores image only when store_image=True)
                yolo_service.add_frame_to_session(
                    session_id,
                    result,
                    image_data_uri if store_image else None,
                    store_image
                )

                # Send results back to phone
                await websocket.send_json({
                    "type": "detection",
                    "frame": frame_count,
                    "session_id": session_id,
                    **result
                })

                # Log photo captures and periodic updates
                if store_image:
                    session_info = yolo_service.get_session(session_id)
                    print(f"📸 Photo captured! Total: {session_info['images_captured']} images, Room: {result.get('room_type')}")
                elif frame_count % 20 == 0:
                    session_info = yolo_service.get_session(session_id)
                    print(f"🔄 Frame {frame_count} - Amenities: {len(session_info['amenities'])}, Images: {session_info['images_captured']}")

            elif data.get("type") == "finalize":
                # Get aggregated results
                final_result = yolo_service.finalize_session(session_id)

                await websocket.send_json({
                    "type": "finalized",
                    "data": final_result
                })

                print(f"✅ Session {session_id} finalized - {frame_count} frames, {len(final_result['amenities'])} amenities")
                break

            elif data.get("type") == "ping":
                # Keep-alive ping
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        print(f"📱 Phone disconnected after {frame_count} frames")
        if session_id:
            yolo_service.delete_session(session_id)
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        if session_id:
            yolo_service.delete_session(session_id)
        try:
            await websocket.send_json({"error": str(e)})
        except:
            pass
    finally:
        try:
            await websocket.close()
        except:
            pass


# ============================================================================
# SCAN SESSION ENDPOINTS
# ============================================================================

@app.get("/api/scan/session/{session_id}")
async def get_scan_session(session_id: str):
    """
    Get current scan session data

    Returns aggregated amenities, room detections, and image count
    """
    try:
        session_data = yolo_service.get_session(session_id)
        return {"success": True, "data": session_data}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/api/scan/finalize/{session_id}")
async def finalize_scan_session(session_id: str):
    """
    Finalize scan session and get complete results

    Returns:
    - All detected amenities
    - Room breakdown (bedrooms, bathrooms, etc.)
    - Property type inference
    - Top 20 detected objects with counts
    - Images captured (every 10 frames with base64)
    - Summary statistics

    Use this data to create listing with pricing endpoint
    """
    try:
        final_result = yolo_service.finalize_session(session_id)

        if "error" in final_result:
            raise HTTPException(status_code=404, detail=final_result["error"])

        # DON'T delete session yet - keep it for frontend to retrieve
        # yolo_service.delete_session(session_id)

        return {
            "success": True,
            "data": final_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Temporary storage for scan results (cross-origin workaround)
scan_results_cache = {}

@app.post("/api/scan/store-temp/{session_id}")
async def store_temp_scan(session_id: str, scan_data: Dict[str, Any]):
    """
    Temporarily store scan results for cross-origin access

    camera_scan.html (port 8000) can't share localStorage with frontend (port 3000),
    so we store the data here temporarily for the frontend to fetch.
    """
    scan_results_cache[session_id] = scan_data
    print(f"💾 Stored scan data for session {session_id}")
    return {"success": True, "message": "Scan data stored"}


@app.get("/api/scan/retrieve/{session_id}")
async def retrieve_temp_scan(session_id: str):
    """
    Retrieve temporarily stored scan results

    Frontend calls this with the session_id from URL params to get the scan data.
    """
    if session_id in scan_results_cache:
        data = scan_results_cache[session_id]
        print(f"📤 Retrieved scan data for session {session_id}")

        # Clean up after retrieval
        del scan_results_cache[session_id]

        # Also clean up YOLO session if it still exists
        yolo_service.delete_session(session_id)

        return {
            "success": True,
            "data": data
        }
    else:
        # Try to get from YOLO service sessions
        try:
            session_data = yolo_service.get_session(session_id)
            if "error" not in session_data:
                # Finalize and return
                final_result = yolo_service.finalize_session(session_id)
                yolo_service.delete_session(session_id)
                return {
                    "success": True,
                    "data": final_result
                }
        except:
            pass

        raise HTTPException(status_code=404, detail="Scan session not found or expired")


# ============================================================================
# MONITORING & HEALTH
# ============================================================================

# ============================================================================
# 🎙️ VAPI VOICE AI ENDPOINTS
# ============================================================================

@app.get("/api/vapi/assistant")
async def get_vapi_assistant():
    """
    🎙️ Get Vapi assistant configuration

    Sponsor: Vapi

    Returns assistant config for frontend Web SDK
    """
    try:
        config = vapi_service.create_assistant()
        return {
            "success": True,
            "assistant": config
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/vapi/webhook")
async def vapi_webhook(request: Dict[str, Any]):
    """
    🎙️ Webhook for Vapi voice calls

    Sponsor: Vapi

    Handles events from Vapi during voice conversations:
    - assistant-request: Vapi requesting assistant config
    - function-call: Execute function from voice command
    - transcript: Speech transcription
    - end-of-call-report: Call summary
    """
    try:
        event_type = request.get("message", {}).get("type", "")
        message = request.get("message", {})

        response = await vapi_service.handle_webhook(
            event_type=event_type,
            message=message,
            user_id=request.get("call", {}).get("customer", {}).get("number", "voice-user")
        )

        return response

    except Exception as e:
        print(f"Vapi webhook error: {e}")
        return {"error": str(e)}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "elastic": await elastic_client.health(),
            "supabase": await supabase_client.health(),
            "letta": await letta_service.health(),
            "qa": await qa_service.health(),
            "pricing": await pricing_service.health(),
            "voice": await voice_service.health(),
            "vapi": await vapi_service.health()
        }
    }


@app.get("/api/geocode")
async def geocode_location(location: str):
    """
    Geocode a location string to lat/lng coordinates

    Args:
        location: Location string (e.g., "San Francisco, CA")

    Returns:
        {"lat": float, "lon": float, "location": str}
    """
    from utils.geocoding import geocode

    coords = geocode(location)

    if coords:
        return {
            "lat": coords[0],
            "lon": coords[1],
            "location": location
        }
    else:
        # Return a default SF location if geocoding fails
        return {
            "lat": 37.7749,
            "lon": -122.4194,
            "location": location,
            "fallback": True
        }


@app.get("/phone_test.html")
async def phone_test():
    """Serve phone camera test page (requires HTTPS for video)"""
    return FileResponse("phone_test.html")


@app.get("/phone_test_simple.html")
async def phone_test_simple():
    """Serve simple photo upload test page (works over HTTP)"""
    return FileResponse("phone_test_simple.html")


@app.get("/camera_scan.html")
async def camera_scan():
    """Serve real-time camera scanning page with YOLO object detection"""
    return FileResponse("camera_scan.html")


@app.get("/")
async def root():
    return {
        "app": "VIBE - AI-Native Home Sharing",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
