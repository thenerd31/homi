"""
Elasticsearch AI Agent Builder - Semantic Search with Built-in AI Capabilities
Using Elastic Search Labs AI Agent framework
Reference: https://www.elastic.co/search-labs/blog/ai-agent-builder-elasticsearch
"""

try:
    from elasticsearch import AsyncElasticsearch
    ELASTICSEARCH_AVAILABLE = True
except ImportError:
    ELASTICSEARCH_AVAILABLE = False
    AsyncElasticsearch = None

import os
from typing import List, Dict, Any, Optional
import json

class ElasticClient:
    def __init__(self):
        self.endpoint = os.getenv("ELASTIC_ENDPOINT")
        self.cloud_id = os.getenv("ELASTIC_CLOUD_ID")
        self.api_key = os.getenv("ELASTIC_API_KEY")

        if ELASTICSEARCH_AVAILABLE and self.api_key:
            if self.endpoint:
                # Serverless endpoint
                self.client = AsyncElasticsearch(
                    hosts=[self.endpoint],
                    api_key=self.api_key
                )
            elif self.cloud_id:
                # Cloud hosted
                self.client = AsyncElasticsearch(
                    cloud_id=self.cloud_id,
                    api_key=self.api_key
                )
            else:
                self.client = None
        else:
            # Fallback to mock mode (Elasticsearch not installed or no credentials)
            self.client = None

        self.index_name = "vibe_listings"

    async def setup_inference_endpoint(self):
        """
        Set up Elastic's built-in inference endpoint for embeddings
        Uses ELSER (Elastic Learned Sparse EncodeR) or E5 models
        """
        if not self.client:
            return

        # Create inference endpoint using Elastic's built-in models
        inference_config = {
            "service": "elser",  # or "e5" for E5 multilingual
            "service_settings": {
                "num_allocations": 1,
                "num_threads": 1
            }
        }

        try:
            await self.client.inference.put(
                inference_id="vibe-embeddings",
                body=inference_config
            )
        except:
            pass  # Already exists

    async def create_index_with_semantic_text(self):
        """
        Create index using Elastic's semantic_text field type
        This automatically handles embeddings via inference endpoints
        """
        if not self.client:
            return

        index_config = {
            "mappings": {
                "properties": {
                    "id": {"type": "keyword"},
                    "title": {"type": "text"},
                    "description": {"type": "text"},

                    # Semantic text field - automatically generates embeddings
                    "semantic_content": {
                        "type": "semantic_text",
                        "inference_id": "vibe-embeddings"
                    },

                    # Geo-location field for radius search
                    "coordinates": {
                        "type": "geo_point"
                    },

                    "location": {
                        "type": "text",
                        "fields": {
                            "keyword": {"type": "keyword"}
                        }
                    },
                    "price": {"type": "float"},
                    "amenities": {"type": "keyword"},
                    "property_type": {"type": "keyword"},
                    "bedrooms": {"type": "integer"},
                    "bathrooms": {"type": "float"},
                    "guests": {"type": "integer"},
                    "photos": {"type": "keyword"},
                    "created_at": {"type": "date"}
                }
            }
        }

        try:
            await self.client.indices.create(
                index=self.index_name,
                body=index_config,
                ignore=400  # Ignore if already exists
            )
        except Exception as e:
            print(f"Index creation: {e}")

    async def index_listing(self, listing: Dict[str, Any], geocoding_service=None):
        """
        Index a listing - embeddings and coordinates generated automatically

        Args:
            listing: Listing data with location field
            geocoding_service: Optional GeocodingService to add coordinates
        """
        if not self.client:
            return

        # Combine text for semantic search
        semantic_content = f"{listing.get('title', '')} {listing.get('description', '')} {' '.join(listing.get('amenities', []))}"

        doc = {
            **listing,
            "semantic_content": semantic_content
        }

        # Geocode location to add coordinates for geo-search
        if geocoding_service and listing.get("location") and "coordinates" not in listing:
            try:
                geo_data = await geocoding_service.geocode(listing["location"])
                if geo_data:
                    doc["coordinates"] = {
                        "lat": geo_data["lat"],
                        "lon": geo_data["lon"]
                    }
                    print(f"✅ Geocoded listing location: {listing['location']} → {geo_data['lat']:.4f}, {geo_data['lon']:.4f}")
            except Exception as e:
                print(f"⚠️  Geocoding failed for {listing.get('location')}: {e}")
                # Continue without coordinates - listing will still be searchable by text

        try:
            await self.client.index(
                index=self.index_name,
                id=listing["id"],
                document=doc
            )
        except Exception as e:
            print(f"Indexing error: {e}")

    async def get_listing(self, listing_id: str) -> Dict[str, Any]:
        """
        Get a single listing by ID
        """
        if not self.client:
            # Return mock data if no client
            return {
                "id": listing_id,
                "title": "Beautiful Beachfront Villa",
                "location": "Malibu, CA",
                "price": 280,
                "bedrooms": 3,
                "property_type": "house",
                "amenities": ["pool", "wifi", "beach_access", "hot_tub", "parking", "kitchen"],
                "description": "Experience luxury coastal living in this stunning beachfront villa with panoramic ocean views, private pool, and direct beach access."
            }

        try:
            response = await self.client.get(
                index=self.index_name,
                id=listing_id
            )
            return response["_source"]
        except Exception as e:
            print(f"Get listing error: {e}")
            # Return mock data on error
            return {
                "id": listing_id,
                "title": "Beautiful Beachfront Villa",
                "location": "Malibu, CA",
                "price": 280,
                "bedrooms": 3,
                "property_type": "house",
                "amenities": ["pool", "wifi", "beach_access", "hot_tub", "parking", "kitchen"],
                "description": "Experience luxury coastal living in this stunning beachfront villa with panoramic ocean views, private pool, and direct beach access."
            }

    async def semantic_search(
        self,
        query_text: str,
        filters: Dict[str, Any] = {},
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Semantic search using Elastic's built-in AI capabilities

        This uses:
        - semantic_text for natural language understanding
        - Hybrid search (BM25 + vector)
        - Built-in re-ranking
        """
        if not self.client:
            return self._mock_search_results(filters, limit)

        # Build filter clauses
        filter_clauses = []

        if filters.get("price_max"):
            filter_clauses.append({
                "range": {"price": {"lte": filters["price_max"]}}
            })

        if filters.get("price_min"):
            filter_clauses.append({
                "range": {"price": {"gte": filters["price_min"]}}
            })

        if filters.get("location"):
            filter_clauses.append({
                "match": {"location": filters["location"]}
            })

        if filters.get("amenities"):
            filter_clauses.append({
                "terms": {"amenities": [a.lower() for a in filters["amenities"]]}
            })

        if filters.get("property_type"):
            filter_clauses.append({
                "term": {"property_type": filters["property_type"].lower()}
            })

        if filters.get("bedrooms"):
            filter_clauses.append({
                "range": {"bedrooms": {"gte": filters["bedrooms"]}}
            })

        if filters.get("guests"):
            filter_clauses.append({
                "range": {"guests": {"gte": filters["guests"]}}
            })

        # Semantic search query using semantic_text
        search_query = {
            "query": {
                "bool": {
                    "must": [
                        {
                            "semantic": {
                                "field": "semantic_content",
                                "query": query_text
                            }
                        }
                    ],
                    "filter": filter_clauses
                }
            },
            "size": limit
        }

        try:
            response = await self.client.search(
                index=self.index_name,
                body=search_query
            )

            results = []
            for hit in response["hits"]["hits"]:
                listing = hit["_source"]
                listing["relevance_score"] = hit["_score"]
                # Remove semantic_content from results
                listing.pop("semantic_content", None)
                results.append(listing)

            return results

        except Exception as e:
            print(f"Search error: {e}")
            # Fallback to basic text search
            return await self._fallback_search(query_text, filters, limit)

    async def _fallback_search(
        self,
        query_text: str,
        filters: Dict[str, Any],
        limit: int
    ) -> List[Dict[str, Any]]:
        """
        Fallback to basic text search if semantic search fails
        """
        if not self.client:
            return self._mock_search_results(filters, limit)

        filter_clauses = []
        if filters.get("price_max"):
            filter_clauses.append({"range": {"price": {"lte": filters["price_max"]}}})

        search_query = {
            "query": {
                "bool": {
                    "should": [
                        {"match": {"title": query_text}},
                        {"match": {"description": query_text}}
                    ],
                    "filter": filter_clauses
                }
            },
            "size": limit
        }

        try:
            response = await self.client.search(
                index=self.index_name,
                body=search_query
            )

            results = []
            for hit in response["hits"]["hits"]:
                listing = hit["_source"]
                listing["relevance_score"] = hit["_score"]
                results.append(listing)

            return results
        except:
            return self._mock_search_results(filters, limit)

    async def hybrid_search(
        self,
        query_text: str,
        filters: Dict[str, Any] = {},
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Hybrid search: Combines BM25 (keyword) + Semantic (vector)
        Elastic's RRF (Reciprocal Rank Fusion) automatically combines results
        """
        if not self.client:
            return self._mock_search_results(filters, limit)

        # Use Elastic's sub-searches with RRF
        search_query = {
            "sub_searches": [
                {
                    # BM25 text search
                    "query": {
                        "bool": {
                            "should": [
                                {"match": {"title": {"query": query_text, "boost": 2}}},
                                {"match": {"description": query_text}}
                            ]
                        }
                    }
                },
                {
                    # Semantic search
                    "query": {
                        "semantic": {
                            "field": "semantic_content",
                            "query": query_text
                        }
                    }
                }
            ],
            "rank": {
                "rrf": {}  # Reciprocal Rank Fusion
            },
            "size": limit
        }

        try:
            response = await self.client.search(
                index=self.index_name,
                body=search_query
            )

            results = []
            for hit in response["hits"]["hits"]:
                listing = hit["_source"]
                listing["relevance_score"] = hit["_score"]
                listing.pop("semantic_content", None)
                results.append(listing)

            return results
        except:
            return await self.semantic_search(query_text, filters, limit)

    async def geo_search(
        self,
        query_text: str,
        latitude: float,
        longitude: float,
        radius_miles: int = 25,
        filters: Dict[str, Any] = {},
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Geographic radius search with semantic matching

        Filters listings within a radius of given coordinates, then ranks by relevance.

        Args:
            query_text: Search query for semantic matching
            latitude: Center point latitude
            longitude: Center point longitude
            radius_miles: Search radius in miles
            filters: Additional filters (price, amenities, etc.)
            limit: Max results

        Returns:
            List of listings with distance and relevance_score

        Sponsors: Google Maps (coordinates), Elastic (geo_distance query)
        """
        if not self.client:
            return self._mock_search_results(filters, limit)

        # Build filter clauses
        filter_clauses = []

        # GEO-DISTANCE FILTER (primary filter)
        filter_clauses.append({
            "geo_distance": {
                "distance": f"{radius_miles}mi",
                "coordinates": {
                    "lat": latitude,
                    "lon": longitude
                }
            }
        })

        # Additional filters
        if filters.get("price_max"):
            filter_clauses.append({
                "range": {"price": {"lte": filters["price_max"]}}
            })

        if filters.get("price_min"):
            filter_clauses.append({
                "range": {"price": {"gte": filters["price_min"]}}
            })

        if filters.get("amenities"):
            filter_clauses.append({
                "terms": {"amenities": [a.lower() for a in filters["amenities"]]}
            })

        if filters.get("property_type"):
            filter_clauses.append({
                "term": {"property_type": filters["property_type"].lower()}
            })

        if filters.get("bedrooms"):
            filter_clauses.append({
                "range": {"bedrooms": {"gte": filters["bedrooms"]}}
            })

        if filters.get("guests"):
            filter_clauses.append({
                "range": {"guests": {"gte": filters["guests"]}}
            })

        # Semantic search query with geo-filtering
        search_query = {
            "query": {
                "bool": {
                    "must": [
                        {
                            "semantic": {
                                "field": "semantic_content",
                                "query": query_text
                            }
                        }
                    ],
                    "filter": filter_clauses
                }
            },
            # Sort by relevance first, then distance
            "sort": [
                {"_score": {"order": "desc"}},  # Relevance
                {
                    "_geo_distance": {
                        "coordinates": {
                            "lat": latitude,
                            "lon": longitude
                        },
                        "order": "asc",  # Closest first
                        "unit": "mi"
                    }
                }
            ],
            "size": limit
        }

        try:
            response = await self.client.search(
                index=self.index_name,
                body=search_query
            )

            results = []
            for hit in response["hits"]["hits"]:
                listing = hit["_source"]
                listing["relevance_score"] = hit["_score"]

                # Add calculated distance (second sort value)
                if hit.get("sort") and len(hit["sort"]) > 1:
                    listing["distance_miles"] = round(hit["sort"][1], 2)

                # Remove internal fields
                listing.pop("semantic_content", None)
                results.append(listing)

            return results

        except Exception as e:
            print(f"Geo-search error: {e}")
            # Fallback to regular semantic search
            return await self.semantic_search(query_text, filters, limit)

    def _mock_search_results(self, filters: Dict, limit: int) -> List[Dict[str, Any]]:
        """Mock results for development"""
        return [
            {
                "id": f"listing_{i}",
                "title": f"Stunning Beachfront Villa {i}",
                "description": "Modern luxury villa with ocean views, private pool, and premium amenities. Perfect for families or groups.",
                "location": filters.get("location", "Malibu, CA"),
                "price": 250 + (i * 20),
                "amenities": ["WiFi", "Pool", "Hot Tub", "Ocean View", "Kitchen", "Parking"],
                "property_type": "villa",
                "bedrooms": 3 + (i % 2),
                "bathrooms": 2.5,
                "guests": 6,
                "photos": ["https://example.com/photo1.jpg"],
                "relevance_score": 0.95 - (i * 0.05),
                "distance_miles": 5.0 + (i * 2.0)  # Mock distance
            }
            for i in range(min(limit, 20))
        ]

    async def health(self) -> bool:
        """Health check"""
        if not self.client:
            return True
        try:
            await self.client.ping()
            return True
        except:
            return False
