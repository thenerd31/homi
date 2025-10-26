"""
Q&A Service - Intelligent listing question answering
Uses Claude for context-aware responses
"""

import os
from typing import Dict, Any, List
from anthropic import Anthropic


class QAService:
    """
    Intelligent Q&A service for listing questions

    Features:
    - Answers guest questions about listings
    - Generates common Q&A pairs for new listings
    - Context-aware responses based on listing data
    - Confidence scoring
    """

    def __init__(self):
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.model = "claude-sonnet-4-5-20250929"

    async def answer_question(
        self,
        question: str,
        listing_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Answer a guest's question about a specific listing

        Args:
            question: The guest's question
            listing_data: Full listing information

        Returns:
            {
                "answer": str,
                "confidence": float,
                "sources": List[str]  # What data was used to answer
            }
        """
        # Build context from listing data
        context = self._build_listing_context(listing_data)

        # Create prompt for Claude
        prompt = f"""You are a helpful AI assistant for a vacation rental platform called VIBE.

A guest is asking a question about a listing. Use the listing information provided to give an accurate, helpful answer.

Listing Information:
{context}

Guest Question: {question}

Instructions:
1. Answer the question accurately based ONLY on the listing information provided
2. If the information isn't available, say "I don't have that specific information, but I recommend contacting the host directly"
3. Be friendly, concise, and helpful
4. Don't make up information
5. If relevant, suggest what makes this listing special

Your answer:"""

        # Call Claude
        response = self.client.messages.create(
            model=self.model,
            max_tokens=500,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        answer = response.content[0].text

        # Calculate confidence based on whether we had relevant data
        confidence = self._calculate_confidence(question, listing_data, answer)

        # Identify which data sources were used
        sources = self._identify_sources(question, listing_data)

        return {
            "answer": answer,
            "confidence": confidence,
            "sources": sources
        }

    async def generate_qa_pairs(
        self,
        listing_data: Dict[str, Any],
        num_pairs: int = 10
    ) -> List[Dict[str, str]]:
        """
        Generate common Q&A pairs for a listing

        This creates a knowledge base of frequently asked questions
        that guests can browse without waiting for answers.

        Args:
            listing_data: Full listing information
            num_pairs: Number of Q&A pairs to generate

        Returns:
            List of {"question": str, "answer": str} dicts
        """
        context = self._build_listing_context(listing_data)

        prompt = f"""You are creating a FAQ section for a vacation rental listing.

Listing Information:
{context}

Generate {num_pairs} common questions that guests typically ask, along with accurate answers based on the listing information.

Focus on:
- Practical questions (parking, check-in, wifi, pets, etc.)
- Amenity-specific questions
- Location questions (nearby attractions, beach distance, etc.)
- Rules and policies
- Unique features of this property

Format your response as a JSON array:
[
  {{"question": "...", "answer": "..."}},
  ...
]

Only include questions that can be answered from the listing information. Be specific and helpful.
"""

        response = self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        # Parse the JSON response
        import json
        try:
            qa_pairs = json.loads(response.content[0].text)
            return qa_pairs
        except json.JSONDecodeError:
            # Fallback if response isn't valid JSON
            return self._generate_basic_qa_pairs(listing_data)

    def _build_listing_context(self, listing_data: Dict[str, Any]) -> str:
        """Build a text context from listing data"""
        parts = []

        if listing_data.get("title"):
            parts.append(f"Title: {listing_data['title']}")

        if listing_data.get("description"):
            parts.append(f"Description: {listing_data['description']}")

        if listing_data.get("location"):
            parts.append(f"Location: {listing_data['location']}")

        if listing_data.get("property_type"):
            parts.append(f"Property Type: {listing_data['property_type']}")

        if listing_data.get("suggested_price") or listing_data.get("price"):
            price = listing_data.get("suggested_price") or listing_data.get("price")
            parts.append(f"Price: ${price}/night")

        if listing_data.get("amenities"):
            amenities = listing_data["amenities"]
            if isinstance(amenities, list):
                parts.append(f"Amenities: {', '.join(amenities)}")
            else:
                parts.append(f"Amenities: {amenities}")

        if listing_data.get("bedrooms"):
            parts.append(f"Bedrooms: {listing_data['bedrooms']}")

        if listing_data.get("bathrooms"):
            parts.append(f"Bathrooms: {listing_data['bathrooms']}")

        if listing_data.get("max_guests"):
            parts.append(f"Max Guests: {listing_data['max_guests']}")

        if listing_data.get("house_rules"):
            parts.append(f"House Rules: {listing_data['house_rules']}")

        if listing_data.get("check_in"):
            parts.append(f"Check-in: {listing_data['check_in']}")

        if listing_data.get("check_out"):
            parts.append(f"Check-out: {listing_data['check_out']}")

        return "\n".join(parts)

    def _calculate_confidence(
        self,
        question: str,
        listing_data: Dict[str, Any],
        answer: str
    ) -> float:
        """
        Calculate confidence score based on available data

        Returns float between 0.0 and 1.0
        """
        # High confidence if answer doesn't say "I don't have"
        if "don't have" in answer.lower() or "contact the host" in answer.lower():
            return 0.3

        # Medium-high confidence if we have relevant data
        question_lower = question.lower()

        # Check for keyword matches
        high_confidence_keywords = {
            "pet": "amenities",
            "wifi": "amenities",
            "pool": "amenities",
            "parking": "amenities",
            "kitchen": "amenities",
            "price": "suggested_price",
            "cost": "suggested_price",
            "location": "location",
            "bedroom": "bedrooms",
            "bathroom": "bathrooms",
            "check": "check_in"
        }

        for keyword, field in high_confidence_keywords.items():
            if keyword in question_lower and listing_data.get(field):
                return 0.9

        # Default medium confidence
        return 0.7

    def _identify_sources(
        self,
        question: str,
        listing_data: Dict[str, Any]
    ) -> List[str]:
        """Identify which listing fields were likely used to answer"""
        sources = []
        question_lower = question.lower()

        source_keywords = {
            "amenities": ["pet", "wifi", "pool", "parking", "kitchen", "gym", "amenity"],
            "description": ["about", "like", "describe", "what"],
            "price": ["price", "cost", "expensive", "cheap", "budget"],
            "location": ["where", "location", "near", "close", "distance"],
            "bedrooms": ["bedroom", "bed", "sleep"],
            "bathrooms": ["bathroom", "shower", "bath"],
            "house_rules": ["rule", "allow", "policy"]
        }

        for source, keywords in source_keywords.items():
            if any(kw in question_lower for kw in keywords):
                if listing_data.get(source):
                    sources.append(source)

        return sources or ["description"]  # Default to description

    def _generate_basic_qa_pairs(self, listing_data: Dict[str, Any]) -> List[Dict[str, str]]:
        """Fallback Q&A generation if JSON parsing fails"""
        qa_pairs = []

        # Basic questions based on available data
        if listing_data.get("amenities"):
            amenities = listing_data["amenities"]
            if isinstance(amenities, list) and "wifi" in [a.lower() for a in amenities]:
                qa_pairs.append({
                    "question": "Is there WiFi available?",
                    "answer": "Yes, this property includes WiFi."
                })

            if isinstance(amenities, list) and "parking" in [a.lower() for a in amenities]:
                qa_pairs.append({
                    "question": "Is parking available?",
                    "answer": "Yes, parking is available at this property."
                })

        if listing_data.get("suggested_price"):
            qa_pairs.append({
                "question": "What is the nightly rate?",
                "answer": f"The nightly rate is ${listing_data['suggested_price']}."
            })

        if listing_data.get("location"):
            qa_pairs.append({
                "question": "Where is this property located?",
                "answer": f"This property is located in {listing_data['location']}."
            })

        return qa_pairs

    async def health(self) -> bool:
        """Health check"""
        return bool(os.getenv("ANTHROPIC_API_KEY"))
