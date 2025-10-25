'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
  MessageCircle,
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
  const listing = SAMPLE_LISTING;

  const goPrev = () =>
    setImageIndex((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1));
  const goNext = () =>
    setImageIndex((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1));

  return (
    <div className="min-h-screen bg-[#DFDFD3] flex flex-col">
      {/* Top section: Slideshow */}
      <div className="relative w-full h-[400px] overflow-hidden">
        <Image
          src={listing.images[imageIndex]}
          alt={listing.title}
          fill
          className="object-cover transition-all duration-500 ease-in-out"
          priority
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* TODO: on click start AR glasses */}
        <div className="absolute top-8 right-4 z-20">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
            <Glasses className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Header buttons */}
        <div className="absolute top-6 left-6 flex items-center gap-3 z-20">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-stone-900 hover:bg-white transition-all"
            aria-label="Go back"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Image nav arrows */}
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-md p-3 rounded-full shadow-md hover:scale-105 transition-all"
          aria-label="Previous image"
          title="Previous image"
        >
          <ChevronLeft className="w-5 h-5 text-stone-900" />
        </button>
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-md p-3 rounded-full shadow-md hover:scale-105 transition-all"
          aria-label="Next image"
          title="Next image"
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

      {/* Scrollable bottom section */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
        {/* Title and short desc */}
        <div>
          <h1 className="text-3xl font-melodrame italic text-stone-900 mb-2">
            {listing.title}
          </h1>
          <p className="text-stone-700 font-hind text-sm leading-relaxed">
            {listing.shortDescription}
          </p>
        </div>

        {/* Rating + Host section */}
        <div className="flex items-center justify-between border-y border-stone-300 py-4">
          <div className="flex items-center gap-2 text-stone-800">
            <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
            <span className="font-semibold">{listing.rating}</span>
            <span className="text-stone-500 text-sm">· 120 reviews</span>
          </div>

          <div className="flex items-center gap-3">
            <Image
              src={listing.host.avatar}
              alt={listing.host.name}
              width={40}
              height={40}
              className="rounded-full object-cover border border-stone-300"
            />
            <div>
              <p className="text-sm font-medium text-stone-900">
                Hosted by {listing.host.name}
              </p>
              {listing.host.isSuperhost && (
                <p className="text-xs text-stone-600 italic">Superhost</p>
              )}
            </div>
          </div>
        </div>

        {/* Long Description */}
        <div>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">
            About this place
          </h2>
          <p className="text-stone-700 text-sm leading-relaxed font-hind">
            {listing.longDescription}
          </p>

          <button
            className="mt-4 flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-full hover:bg-stone-800 transition-all text-sm font-medium"
            aria-label="Message host"
            title="Message host"
          >
            <MessageCircle className="w-4 h-4" />
            Message Host
          </button>
        </div>

        {/* Amenities */}
        <div>
          <h2 className="text-xl font-semibold text-stone-900 mb-4">
            Amenities
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {listing.amenities.map((amenity, index) => (
              <div
                key={index}
                className="text-sm text-stone-700 font-hind bg-white/70 backdrop-blur-sm px-3 py-2 rounded-lg border border-stone-200 shadow-sm"
              >
                {amenity}
              </div>
            ))}
          </div>
        </div>

        {/* Reserve Section */}
        <div className="sticky bottom-0 bg-[#DFDFD3] pt-4 pb-8 border-t border-stone-300">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-stone-900">
                ${listing.pricePerNight}
              </span>
              <span className="text-stone-600 text-sm"> / night</span>
            </div>
            <button
              className="bg-stone-900 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-stone-800 transition-all"
              aria-label="Reserve listing"
              title="Reserve listing"
            >
              Reserve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
