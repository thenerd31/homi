'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ChevronLeft, ChevronRight, Star, Glasses } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Sample data - in a real app this would come from API/database
const LISTING_DATA = {
  id: 1,
  title: 'Sunny Studio in Downtown SF',
  subtitle: 'Entire Studio in San Francisco, California',
  guests: 5,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  rating: 4.99,
  images: [
    '/images/golden-gateway/golden-gateway1.avif',
    '/images/golden-gateway/golden-gateway2.avif',
    '/images/golden-gateway/golden-gateway3.avif',
  ],
  amenities: [
    { icon: '📺', name: 'TV' },
    { icon: '🍳', name: 'Kitchen' },
    { icon: '📽️', name: 'Projector' },
    { icon: '🍳', name: 'Kitchen' },
    { icon: '📺', name: 'TV' },
    { icon: '📽️', name: 'Projector' },
  ],
  location: 'San Francisco, California, United States',
  availability: 'Oct 12 - 29 | November 01 - December 25',
};

export default function ListingDetailPage() {
  const router = useRouter();
  const [imageIndex, setImageIndex] = useState(0);
  const listing = LISTING_DATA;

  const goPrev = () =>
    setImageIndex((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1));
  const goNext = () =>
    setImageIndex((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1));

  const handleReserve = () => {
    router.push(`/listing/${listing.id}/confirm`);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-stone-900">
      {/* Back button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Image Section */}
      <div className="relative w-full h-[500px] overflow-hidden">
        <Image
          src={listing.images[imageIndex]}
          alt={listing.title}
          fill
          className="object-cover"
          priority
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />

        {/* AR Glasses icon */}
        <div className="absolute top-6 right-6 z-20">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
            <Glasses className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Property info overlay */}
        <div className="absolute top-24 left-8 z-10 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl">
          <h1 className="text-xl font-semibold mb-1">{listing.title}</h1>
          <p className="text-sm text-stone-600">{listing.subtitle}</p>
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-4 h-4 fill-stone-900 text-stone-900" />
            <span className="text-sm font-medium">{listing.rating}</span>
          </div>
        </div>

        {/* Image navigation */}
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-md p-3 rounded-full shadow-md hover:scale-105 transition-all z-10"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5 text-stone-900" />
        </button>
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-md p-3 rounded-full shadow-md hover:scale-105 transition-all z-10"
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5 text-stone-900" />
        </button>

        {/* Image indicator dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {listing.images.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === imageIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 py-8 space-y-8 pb-32">
        {/* Property details */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-stone-600 text-sm mb-2">{listing.subtitle}</p>
          <p className="text-stone-800">
            {listing.guests} guests | {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''} | {listing.beds} bed{listing.beds !== 1 ? 's' : ''} | {listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Amenities */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
          <div className="grid grid-cols-3 gap-4">
            {listing.amenities.map((amenity, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border-2 border-stone-200 p-6 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-3xl">{amenity.icon}</span>
                <span className="text-sm text-center font-medium">{amenity.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Location</h2>
          <p className="text-stone-600 mb-4">{listing.location}</p>
          <div className="w-full h-64 bg-stone-200 rounded-2xl relative overflow-hidden shadow-sm">
            {/* Simple map placeholder with pin */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <line x1="0" y1="0" x2="100" y2="0" stroke="#999" strokeWidth="0.5"/>
                <line x1="0" y1="25" x2="100" y2="25" stroke="#999" strokeWidth="0.5"/>
                <line x1="0" y1="50" x2="100" y2="50" stroke="#999" strokeWidth="0.5"/>
                <line x1="0" y1="75" x2="100" y2="75" stroke="#999" strokeWidth="0.5"/>
                <line x1="25" y1="0" x2="25" y2="100" stroke="#999" strokeWidth="0.5"/>
                <line x1="50" y1="0" x2="50" y2="100" stroke="#999" strokeWidth="0.5"/>
                <line x1="75" y1="0" x2="75" y2="100" stroke="#999" strokeWidth="0.5"/>
              </svg>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-10 h-10 bg-stone-900 rounded-full border-4 border-white shadow-lg"></div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-8 bg-stone-900"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Availability</h2>
          <p className="text-stone-600">{listing.availability}</p>
        </div>
      </div>

      {/* Fixed bottom reserve button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F5F5F0] border-t border-stone-200 p-6">
        <button
          onClick={handleReserve}
          className="w-full bg-stone-900 text-white py-4 rounded-full text-lg font-semibold hover:bg-stone-800 transition-all shadow-lg"
        >
          Reserve
        </button>
      </div>
    </div>
  );
}
