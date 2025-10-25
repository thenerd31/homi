'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// TODO: Replace with actual wishlist data from backend/API
const WISHLIST_LISTINGS = [
  {
    id: 1,
    title: 'Golden Gateway Penthouse',
    images: [
      '/images/golden-gateway/golden-gateway1.avif',
      '/images/golden-gateway/golden-gateway2.avif',
      '/images/golden-gateway/golden-gateway3.avif',
    ],
    price: 450,
    location: 'San Francisco, CA',
    availability: 'Available Dec 20-27',
    beds: 2,
    baths: 2,
  },
  {
    id: 2,
    title: 'Moroccan Dream Home',
    images: [
      '/images/morrocan-home/morrocan-home1.avif',
      '/images/morrocan-home/morrocan-home2.avif',
      '/images/morrocan-home/morrocan-home3.avif',
    ],
    price: 320,
    location: 'Palm Springs, CA',
    availability: 'Available Jan 5-12',
    beds: 3,
    baths: 2,
  },
  {
    id: 3,
    title: 'Ritzy Modern Suite',
    images: [
      '/images/ritzy-room/ritzy-room1.avif',
      '/images/ritzy-room/ritzy-room2.avif',
      '/images/ritzy-room/ritzy-room3.avif',
    ],
    price: 280,
    location: 'Los Angeles, CA',
    availability: 'Available Dec 15-22',
    beds: 1,
    baths: 1,
  },
  {
    id: 4,
    title: 'Victorian Home Retreat',
    images: [
      '/images/victorian-home/victorian_home1.avif',
      '/images/victorian-home/victorian_home2.avif',
      '/images/victorian-home/victorian_home3.avif',
    ],
    price: 380,
    location: 'San Francisco, CA',
    availability: 'Available Jan 10-17',
    beds: 2,
    baths: 1,
  },
  {
    id: 5,
    title: 'Ocean Beach Escape',
    images: [
      '/images/peaceful-private-room-B-3-min-walk-to-ocean-beach/ocean_beach_1.avif',
      '/images/peaceful-private-room-B-3-min-walk-to-ocean-beach/ocean_beach_2.avif',
    ],
    price: 220,
    location: 'San Diego, CA',
    availability: 'Available Dec 28-Jan 4',
    beds: 1,
    baths: 1,
  },
  {
    id: 6,
    title: 'West LA Classic Room',
    images: [
      '/images/classic-private-room-in-west-LA/west_la_1.avif',
    ],
    price: 180,
    location: 'Los Angeles, CA',
    availability: 'Available Year Round',
    beds: 1,
    baths: 1,
  },
];

export default function WishlistPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? WISHLIST_LISTINGS.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === WISHLIST_LISTINGS.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (sidebarOpen) return; // Don't navigate when sidebar is open

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNext();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        router.push(`/listing/${WISHLIST_LISTINGS[currentIndex].id}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, sidebarOpen]);

  // Touch/Swipe gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // Minimum distance for a swipe

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swiped left - go to next
        goToNext();
      } else {
        // Swiped right - go to previous
        goToPrevious();
      }
    }

    // Reset values
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const currentListing = WISHLIST_LISTINGS[currentIndex];
  const previousIndex = currentIndex === 0 ? WISHLIST_LISTINGS.length - 1 : currentIndex - 1;
  const nextIndex = currentIndex === WISHLIST_LISTINGS.length - 1 ? 0 : currentIndex + 1;

  return (
    <div className="min-h-screen bg-[#DFDFD3] relative overflow-hidden">
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
          transform-style: preserve-3d;
        }
      `}</style>
      {/* Header */}
      <div className="pt-6 px-6 flex items-center justify-between mb-6 relative z-30">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 text-stone-900 hover:bg-stone-300 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-stone-900 hover:bg-stone-300 rounded-full transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Title */}
      <div className="px-6 mb-8 relative z-30">
        <h1 className="text-4xl font-melodrame italic text-stone-900 mb-2">
          Wishlist
        </h1>
        <p className="text-stone-600 font-hind text-sm">
          {WISHLIST_LISTINGS.length} saved {WISHLIST_LISTINGS.length === 1 ? 'place' : 'places'}
        </p>
      </div>

      {/* Carousel Container */}
      <div
        className="relative h-[500px] flex items-center justify-center perspective-1000 overflow-visible"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Far Left Card */}
        <div
          className="absolute w-40 h-64 transition-all duration-500 ease-out cursor-pointer"
          style={{
            left: '-5%',
            top: '50%',
            transform: 'translateY(-50%) rotateY(60deg) translateZ(-300px) scale(0.6)',
            opacity: 0.25,
            zIndex: 1,
          }}
          onClick={goToPrevious}
        >
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={WISHLIST_LISTINGS[previousIndex === 0 ? WISHLIST_LISTINGS.length - 1 : previousIndex - 1].images[0]}
              alt="Previous listing"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        </div>

        {/* Previous Card (Left) */}
        <div
          className="absolute w-52 h-80 transition-all duration-500 ease-out cursor-pointer"
          style={{
            left: '8%',
            top: '50%',
            transform: 'translateY(-50%) rotateY(50deg) translateZ(-200px) scale(0.75)',
            opacity: 0.4,
            zIndex: 3,
          }}
          onClick={goToPrevious}
        >
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={WISHLIST_LISTINGS[previousIndex].images[0]}
              alt={WISHLIST_LISTINGS[previousIndex].title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        </div>

        {/* Center Card (Current) - Full ListingCard */}
        <div
          className="absolute w-64 h-96 transition-all duration-500 ease-out"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) rotateY(0deg) scale(1)',
            opacity: 1,
            zIndex: 20,
          }}
        >
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
            {/* Background Image with all listing card details */}
            <div className="relative w-full h-full">
              <Image
                src={currentListing.images[0]}
                alt={currentListing.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            {/* Listing Details - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 z-10">
              <div className="space-y-2">
                {/* Title */}
                <h2 className="text-white text-lg font-bold line-clamp-1">
                  {currentListing.title}
                </h2>

                {/* Price */}
                <div className="flex items-baseline gap-1">
                  <span className="text-white text-2xl font-bold">
                    ${currentListing.price}
                  </span>
                  <span className="text-white/80 text-xs">/ night</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-white/90">
                  <svg
                    className="w-3.5 h-3.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-xs font-medium line-clamp-1">{currentListing.location}</span>
                </div>

                {/* Beds & Baths */}
                <div className="flex items-center gap-3 text-white/90">
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    <span className="text-xs">
                      {currentListing.beds} {currentListing.beds === 1 ? 'bed' : 'beds'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                      />
                    </svg>
                    <span className="text-xs">
                      {currentListing.baths} {currentListing.baths === 1 ? 'bath' : 'baths'}
                    </span>
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  type="button"
                  onClick={() => router.push(`/listing`)}
                  className="w-full mt-3 bg-white text-stone-900 rounded-full py-2.5 px-4 text-sm font-semibold hover:bg-white/90 transition-colors shadow-lg"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Next Card (Right) */}
        <div
          className="absolute w-52 h-80 transition-all duration-500 ease-out cursor-pointer"
          style={{
            right: '8%',
            top: '50%',
            transform: 'translateY(-50%) rotateY(-50deg) translateZ(-200px) scale(0.75)',
            opacity: 0.4,
            zIndex: 3,
          }}
          onClick={goToNext}
        >
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={WISHLIST_LISTINGS[nextIndex].images[0]}
              alt={WISHLIST_LISTINGS[nextIndex].title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        </div>

        {/* Far Right Card */}
        <div
          className="absolute w-40 h-64 transition-all duration-500 ease-out cursor-pointer"
          style={{
            right: '-5%',
            top: '50%',
            transform: 'translateY(-50%) rotateY(-60deg) translateZ(-300px) scale(0.6)',
            opacity: 0.25,
            zIndex: 1,
          }}
          onClick={goToNext}
        >
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={WISHLIST_LISTINGS[nextIndex === WISHLIST_LISTINGS.length - 1 ? 0 : nextIndex + 1].images[0]}
              alt="Next listing"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={goToPrevious}
          className="absolute left-4 z-20 p-3 bg-white/80 backdrop-blur-sm rounded-full text-stone-900 hover:bg-white hover:scale-110 transition-all shadow-lg"
          aria-label="Previous listing"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={goToNext}
          className="absolute right-4 z-20 p-3 bg-white/80 backdrop-blur-sm rounded-full text-stone-900 hover:bg-white hover:scale-110 transition-all shadow-lg"
          aria-label="Next listing"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Carousel Indicators */}
      <div className="flex justify-center gap-2 mt-8 px-6 relative z-30">
        {WISHLIST_LISTINGS.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-stone-900'
                : 'w-2 bg-stone-400 hover:bg-stone-600'
            }`}
            aria-label={`Go to listing ${index + 1}`}
          />
        ))}
      </div>

      {/* Counter and Keyboard Hint */}
      <div className="text-center mt-4 px-6 relative z-30">
        <p className="text-stone-600 font-hind text-sm mb-2">
          {currentIndex + 1} of {WISHLIST_LISTINGS.length}
        </p>
        <p className="text-stone-500 font-hind text-xs">
          Use ← → arrow keys or swipe to navigate
        </p>
      </div>

      {/* Dark overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[#DFDFD3] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="absolute top-6 left-6 p-2 text-stone-900 hover:bg-stone-200 rounded-full transition-colors"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Menu items */}
        <nav className="pt-24 px-8">
          <ul className="space-y-8">
            <li>
              <button
                type="button"
                onClick={() => {
                  router.push('/discover');
                  setSidebarOpen(false);
                }}
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 hover:bg-black/10 transition-all px-4 py-2 rounded-lg w-full text-left"
              >
                Discover
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  router.push('/map');
                  setSidebarOpen(false);
                }}
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 hover:bg-black/10 transition-all px-4 py-2 rounded-lg w-full text-left"
              >
                Map
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  router.push('/profile/trips');
                  setSidebarOpen(false);
                }}
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 hover:bg-black/10 transition-all px-4 py-2 rounded-lg w-full text-left"
              >
                Trips
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  router.push('/profile');
                  setSidebarOpen(false);
                }}
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 hover:bg-black/10 transition-all px-4 py-2 rounded-lg w-full text-left"
              >
                Profile
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
