'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Glasses,
  MapPin,
  Star,
  Users,
} from 'lucide-react';

interface ListingData {
  id: string;
  name: string;
  description: string;
  picture_url: string;
  host_name: string;
  host_location: string;
  host_picture_url: string;
  amenities: string[];
  price: number;
  property_type: string;
  room_type: string;
  accommodates: number;
  bedrooms: number;
  beds: number;
  bathrooms_text: string;
  neighbourhood: string;
  latitude: string;
  longitude: string;
  rating: number;
  number_of_reviews: number;
}

export default function DynamicListingPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [listing, setListing] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Fetch listing data from backend
  useEffect(() => {
    async function fetchListing() {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/listing/${listingId}`);

        if (!response.ok) {
          throw new Error('Listing not found');
        }

        const data = await response.json();
        setListing(data.listing);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load listing');
      } finally {
        setLoading(false);
      }
    }

    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  const goPrev = () => {
    if (listing) {
      setImageIndex((prev) => (prev === 0 ? 0 : prev - 1));
    }
  };

  const goNext = () => {
    if (listing) {
      setImageIndex((prev) => (prev === 0 ? 1 : prev));
    }
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#DFDFD3] flex items-center justify-center">
        <div className="text-2xl font-melodrame italic text-stone-900">
          Loading...
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#DFDFD3] flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-melodrame italic text-stone-900 mb-4">
            {error || 'Listing not found'}
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-stone-600 hover:text-stone-900"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const images = listing.picture_url ? [listing.picture_url] : [];

  return (
    <div className="min-h-screen bg-[#DFDFD3] flex flex-col">
      {/* Header with back button and title */}
      <div className="sticky top-0 bg-[#DFDFD3] z-20 px-6 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2"
            aria-label="Go back"
            title="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-stone-900" />
          </button>
          <h1 className="text-2xl font-medium italic font-melodrame">
            {listing.neighbourhood || 'Listing Details'}
          </h1>
        </div>
      </div>

      {/* Top section: Image with overlay */}
      <div className="px-6 pt-4">
        <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-xl">
          {images.length > 0 ? (
            <Image
              src={listing.picture_url}
              alt={listing.name}
              fill
              className="object-cover transition-all duration-500 ease-in-out"
              priority
            />
          ) : (
            <div className="w-full h-full bg-stone-300 flex items-center justify-center">
              <span className="text-stone-500">No image available</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/10" />

          {/* AR Glasses Button */}
          <button
            type="button"
            className="absolute top-8 right-8 w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
            aria-label="View in AR"
          >
            <Glasses className="w-7 h-7 text-white" strokeWidth={2} />
          </button>

          {/* Image nav arrows - only show if multiple images */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
                aria-label="Previous image"
                title="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
                aria-label="Next image"
                title="Next image"
              >
                <ChevronRight className="w-6 h-6 text-white" strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Scrollable bottom section */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        {/* Property Details Card */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-stone-900 mb-3">
            {listing.name}
          </h2>
          <p className="text-stone-600 text-sm mb-2">
            {listing.property_type} in {listing.neighbourhood}
          </p>

          {/* Host Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-stone-300 overflow-hidden">
              {listing.host_picture_url ? (
                <Image
                  src={listing.host_picture_url}
                  alt={listing.host_name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-500">
                  <Users className="w-5 h-5" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-stone-900">
                Hosted by {listing.host_name}
              </p>
              <p className="text-xs text-stone-600">{listing.host_location}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4">
            {listing.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-stone-900 text-stone-900" />
                <span className="text-sm font-medium">{listing.rating.toFixed(1)}</span>
                <span className="text-sm text-stone-600">
                  ({listing.number_of_reviews} reviews)
                </span>
              </div>
            )}
          </div>

          <p className="text-stone-800 text-sm">
            {listing.accommodates} guests | {listing.bedrooms} bedrooms | {listing.beds} beds | {listing.bathrooms_text}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-400 mb-6"></div>

        {/* Description */}
        {listing.description && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-stone-900 mb-4">
                About this place
              </h2>
              <p className="text-stone-700 text-sm leading-relaxed">
                {listing.description}
              </p>
            </div>
            <div className="border-t border-stone-400 mb-6"></div>
          </>
        )}

        {/* Amenities */}
        {listing.amenities && listing.amenities.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-stone-900 mb-4">
                Amenities
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {listing.amenities.slice(0, 10).map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-stone-700 text-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-stone-900"></div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-stone-400 mb-6"></div>
          </>
        )}

        {/* Location */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-stone-900 mb-4">
            Location
          </h2>
          <div className="flex items-center gap-2 text-stone-700 mb-4">
            <MapPin className="w-5 h-5" />
            <span className="text-sm">
              {listing.neighbourhood}
              {listing.host_location && ` - ${listing.host_location}`}
            </span>
          </div>
          {listing.latitude && listing.longitude && (
            <p className="text-xs text-stone-500">
              Coordinates: {listing.latitude}, {listing.longitude}
            </p>
          )}
        </div>
      </div>

      {/* Fixed bottom Reserve button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#DFDFD3] border-t border-stone-200 px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-2xl font-bold text-stone-900">
              ${listing.price}
            </span>
            <span className="text-sm text-stone-600"> / night</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/listing/confirm-pay/${listingId}`)}
          className="w-full bg-stone-900 text-white py-4 rounded-full text-lg font-semibold hover:bg-stone-800 transition-all shadow-lg"
          aria-label="Reserve listing"
          title="Reserve listing"
        >
          Reserve
        </button>
      </div>
    </div>
  );
}
