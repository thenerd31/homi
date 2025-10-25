/**
 * VIBE API Client
 * Connects frontend to FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SearchRequest {
  query: string;
  user_id?: string;
  voice_mode?: boolean;
}

export interface SearchResponse {
  success: boolean;
  listings: any[];
  filters_extracted: Record<string, any>;
  personalized?: boolean;
  user_context?: Record<string, any>;
}

export interface ListingOptimizeRequest {
  photos: string[];
  location: string;
  property_type: string;
}

export interface ListingOptimizeResponse {
  success: boolean;
  listing_id: string;
  title: string;
  description: string;
  amenities_detected: string[];
  suggested_price: number;
  competitive_analysis: Record<string, any>;
  qa_pairs: any[];
}

// Conversational Search
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ConversationSearchRequest {
  user_message: string;
  user_id?: string;
  conversation_history?: ConversationMessage[];
  extracted_so_far?: Record<string, any>;
}

export interface ConversationSearchResponse {
  status: 'collecting' | 'ready_to_search';
  message: string;
  extracted_params: Record<string, any>;
  missing_params: string[];
  suggestions: string[];
}

export interface SearchExecuteRequest {
  extracted_params: Record<string, any>;
  user_id?: string;
  relevance_threshold?: number;
}

export interface SearchExecuteResponse {
  success: boolean;
  matches: any[];
  total_matches: number;
  threshold: number;
  hardcoded_radius_miles: number;
}

// Swipe
export interface SwipeRequest {
  user_id: string;
  listing_id: string;
  action: 'like' | 'pass';
}

// Saved Listings
export interface SavedListingsResponse {
  success: boolean;
  total: number;
  saved_listings: any[];
}

// Image Filtering
export interface ImageFilterRequest {
  photo_urls: string[];
  max_photos?: number;
}

export interface ImageFilterResponse {
  success: boolean;
  selected_photos: any[];
  rejected_photos: any[];
  room_coverage: Record<string, number>;
  total_analyzed: number;
  total_selected: number;
}

export class VibeAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // ========== Buyer Flow ==========

  async conversationSearch(request: ConversationSearchRequest): Promise<ConversationSearchResponse> {
    const response = await fetch(`${this.baseUrl}/api/search/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Conversation search failed: ${response.statusText}`);
    }

    return response.json();
  }

  async executeSearch(request: SearchExecuteRequest): Promise<SearchExecuteResponse> {
    const response = await fetch(`${this.baseUrl}/api/search/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Search execution failed: ${response.statusText}`);
    }

    return response.json();
  }

  async swipe(request: SwipeRequest): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/api/swipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Swipe failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getSavedListings(userId: string): Promise<SavedListingsResponse> {
    const response = await fetch(`${this.baseUrl}/api/saved-listings/${userId}`);

    if (!response.ok) {
      throw new Error(`Get saved listings failed: ${response.statusText}`);
    }

    return response.json();
  }

  async voiceToText(audioFile: File): Promise<{ success: boolean; text: string }> {
    const formData = new FormData();
    formData.append('audio_file', audioFile);

    const response = await fetch(`${this.baseUrl}/api/voice-to-text`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Voice transcription failed: ${response.statusText}`);
    }

    return response.json();
  }

  // ========== Seller Flow ==========

  async filterPhotos(request: ImageFilterRequest): Promise<ImageFilterResponse> {
    const response = await fetch(`${this.baseUrl}/api/filter-photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Photo filtering failed: ${response.statusText}`);
    }

    return response.json();
  }

  async optimizeListing(request: ListingOptimizeRequest): Promise<ListingOptimizeResponse> {
    const response = await fetch(`${this.baseUrl}/api/optimize-listing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Listing optimization failed: ${response.statusText}`);
    }

    return response.json();
  }

  // ========== Legacy Endpoints ==========

  async search(request: SearchRequest): Promise<SearchResponse> {
    const response = await fetch(`${this.baseUrl}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    return response.json();
  }

  async analyzePreferences(imageFiles: File[], textDescription: string = ''): Promise<{
    success: boolean;
    extracted_preferences: Record<string, any>;
    search_query: string;
    reasoning: string;
  }> {
    // Convert image files to data URLs for Claude Vision
    const imageUrls = await Promise.all(
      imageFiles.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })
    );

    const response = await fetch(`${this.baseUrl}/api/analyze-preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_urls: imageUrls,
        text_description: textDescription,
      }),
    });

    if (!response.ok) {
      throw new Error(`Preference analysis failed: ${response.statusText}`);
    }

    return response.json();
  }

  async health(): Promise<{ status: string; services: Record<string, boolean> }> {
    const response = await fetch(`${this.baseUrl}/health`);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const api = new VibeAPI();
