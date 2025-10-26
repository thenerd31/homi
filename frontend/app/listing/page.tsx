'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Glasses,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const SAMPLE_LISTING = {
  id: 1,
  title: 'Golden Gateway Penthouse',
  shortDescription:
    'A luxurious penthouse with breathtaking views of the San Francisco Bay.',
  longDescription:
    'Experience ultimate comfort in this elegant penthouse located in the heart of San Francisco. Features panoramic windows, a modern kitchen, spacious living room, and a private rooftop terrace. Perfect for couples, professionals, or solo travelers seeking style and convenience.',
  rating: 4.9,
  host: {
    name: 'Sophia Kim',
    avatar: '/images/stock_pfp.webp',
    isSuperhost: true,
  },
  amenities: [
    'Wi-Fi',
    'Air Conditioning',
    'Washer',
    'Dryer',
    'Kitchen',
    'TV',
    'Dedicated Workspace',
    'Free Parking',
    'Balcony',
    'Rooftop Access',
  ],
  pricePerNight: 450,
  images: [
    '/images/golden-gateway/golden-gateway1.avif',
    '/images/golden-gateway/golden-gateway2.avif',
    '/images/golden-gateway/golden-gateway3.avif',
  ],
};

export default function ListingPage() {
  const router = useRouter();
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const listing = SAMPLE_LISTING;

  const goPrev = () =>
    setImageIndex((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1));
  const goNext = () =>
    setImageIndex((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1));

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

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
            Stay in San Francisco
          </h1>
        </div>
      </div>

      {/* Top section: Image with overlay */}
      <div className="px-6 pt-4">
        <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-xl">
          <Image
            src={listing.images[imageIndex]}
            alt={listing.title}
            fill
            className="object-cover transition-all duration-500 ease-in-out"
            priority
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/10" />

          {/* TODO: implement backend for AR glasses*/}
          <button
            type="button"
            className="absolute top-8 right-8 w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
            aria-label="View in AR"
          >
            <Glasses className="w-7 h-7 text-white" strokeWidth={2} />
          </button>

          {/* Image nav arrows */}
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

          {/* Image indicator bars */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {listing.images.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === imageIndex ? 'w-8 bg-white' : 'w-8 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable bottom section */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        {/* Property Details Card */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-stone-900 mb-3">
            {listing.title}
          </h2>
          <p className="text-stone-600 text-sm mb-2">
            Entire Studio in San Francisco, California
          </p>
          <p className="text-stone-800 text-sm">
            2 guests | 2 bedrooms | 4 beds | 2 baths
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-400 mb-3"></div>

        {/* Amenities */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-stone-900 mb-4">
            Amenities
          </h2>
          <p className="text-stone-600 text-sm mb-2">
            Select amenities that're available in your property.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {/* TV */}
            <button
              type="button"
              onClick={() => toggleAmenity('tv')}
              className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                selectedAmenities.includes('tv')
                  ? 'border-stone-900 bg-stone-900/5'
                  : 'border-stone-300 bg-transparent'
              }`}
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="13" rx="2" />
                <line x1="17" y1="21" x2="7" y2="21" />
              </svg>
              <span className="text-xs text-center font-medium">TV</span>
            </button>

            {/* Kitchen */}
            <button
              type="button"
              onClick={() => toggleAmenity('kitchen')}
              className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                selectedAmenities.includes('kitchen')
                  ? 'border-stone-900 bg-stone-900/5'
                  : 'border-stone-300 bg-transparent'
              }`}
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="6" height="6" rx="1" />
                <rect x="15" y="3" width="6" height="6" rx="1" />
                <rect x="3" y="15" width="6" height="6" rx="1" />
                <rect x="15" y="15" width="6" height="6" rx="1" />
              </svg>
              <span className="text-xs text-center font-medium">Kitchen</span>
            </button>

            {/* Projector */}
            <button
              type="button"
              onClick={() => toggleAmenity('projector')}
              className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                selectedAmenities.includes('projector')
                  ? 'border-stone-900 bg-stone-900/5'
                  : 'border-stone-300 bg-transparent'
              }`}
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="8" width="16" height="10" rx="2" />
                <circle cx="10" cy="13" r="3" />
                <path d="M18 13h4" />
                <path d="M20 15l2 2" />
                <path d="M20 11l2-2" />
              </svg>
              <span className="text-xs text-center font-medium">Projector</span>
            </button>

            {/* Laundry */}
            <button
              type="button"
              onClick={() => toggleAmenity('laundry')}
              className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                selectedAmenities.includes('laundry')
                  ? 'border-stone-900 bg-stone-900/5'
                  : 'border-stone-300 bg-transparent'
              }`}
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="2" width="18" height="20" rx="2" />
                <circle cx="12" cy="13" r="5" />
                <circle cx="8" cy="6" r="1" fill="currentColor"/>
                <circle cx="12" cy="6" r="1" fill="currentColor"/>
              </svg>
              <span className="text-xs text-center font-medium">Laundry</span>
            </button>

            {/* WiFi */}
            <button
              type="button"
              onClick={() => toggleAmenity('wifi')}
              className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                selectedAmenities.includes('wifi')
                  ? 'border-stone-900 bg-stone-900/5'
                  : 'border-stone-300 bg-transparent'
              }`}
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <circle cx="12" cy="20" r="1" fill="currentColor"/>
              </svg>
              <span className="text-xs text-center font-medium">WiFi</span>
            </button>

            {/* Parking */}
            <button
              type="button"
              onClick={() => toggleAmenity('parking')}
              className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                selectedAmenities.includes('parking')
                  ? 'border-stone-900 bg-stone-900/5'
                  : 'border-stone-300 bg-transparent'
              }`}
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 7h4a3 3 0 0 1 0 6H9V7z" />
                <path d="M9 13v4" />
              </svg>
              <span className="text-xs text-center font-medium">Parking</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-400 mb-3"></div>

        {/* Location */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-stone-900 mb-4">
            Location
          </h2>
          <p className="text-stone-600 text-sm mb-4">
            San Francisco, California, United States
          </p>
          <div className="w-full h-64 bg-stone-200 rounded-2xl relative overflow-hidden shadow-sm">
            <Image
              src="/images/placeholder_location.png"
              alt="Location map"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-400 mb-3"></div>

        {/* Availability */}
        <div>
          <h2 className="text-2xl font-semibold text-stone-900 mb-4">
            Availability
          </h2>
          <p className="text-stone-600 text-sm">
            Oct 12 - 29 | November 01 - December 25
          </p>
        </div>
      </div>

      {/* Fixed bottom Reserve button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#DFDFD3] border-t border-stone-200 px-6 py-4">
        <button
          type="button"
          onClick={() => router.push('/listing/confirm-pay')}
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
