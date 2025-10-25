'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { api } from '../../../../lib/api';

export default function WishlistPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wishlistListings, setWishlistListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Load saved listings from backend
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        // Get user ID from localStorage (set during swipe session)
        const userId = localStorage.getItem('vibe_user_id') || 'demo-user-' + Math.random().toString(36).substr(2, 9);

        console.log('Loading wishlist for user:', userId);
        const response = await api.getSavedListings(userId);

        if (response.success && response.saved_listings) {
          // Transform backend format to UI format
          const transformed = response.saved_listings.map((listing: any) => ({
            id: listing.id || listing.listing_id,
            title: listing.title || listing.name || 'Untitled Listing',
            images: listing.photos || listing.images || ['/images/golden-gateway/golden-gateway1.avif'],
            price: listing.price || 0,
            location: listing.location || 'Unknown',
            availability: 'Available Now',
            beds: listing.bedrooms || listing.beds || 1,
            baths: listing.bathrooms || listing.baths || 1,
          }));

          setWishlistListings(transformed);
          console.log(`Loaded ${transformed.length} saved listings`);
        } else {
          setWishlistListings([]);
          console.log('No saved listings found');
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
        setWishlistListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? wishlistListings.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === wishlistListings.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (sidebarOpen || wishlistListings.length === 0) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNext();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        router.push(`/listing/${wishlistListings[currentIndex].id}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, sidebarOpen, wishlistListings]);

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

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#DFDFD3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-stone-300 border-t-stone-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600 text-lg">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (wishlistListings.length === 0) {
    return (
      <div className="min-h-screen bg-[#DFDFD3] relative">
        {/* Header */}
        <div className="pt-6 px-6 flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 text-stone-900 hover:bg-stone-300 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Empty state message */}
        <div className="flex flex-col items-center justify-center px-6" style={{ minHeight: 'calc(100vh - 120px)' }}>
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-melodrame italic text-stone-900 mb-4">
              Wishlist
            </h1>
            <p className="text-stone-600 font-hind text-lg mb-6">
              You haven't saved any places yet. Start swiping to find your perfect stay!
            </p>
            <button
              type="button"
              onClick={() => router.push('/discover/swipe')}
              className="bg-stone-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-stone-800 transition-colors"
            >
              Start Swiping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentListing = wishlistListings[currentIndex];
  const previousIndex = currentIndex === 0 ? wishlistListings.length - 1 : currentIndex - 1;
  const nextIndex = currentIndex === wishlistListings.length - 1 ? 0 : currentIndex + 1;

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
          {wishlistListings.length} saved {wishlistListings.length === 1 ? 'place' : 'places'}
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
              src={wishlistListings[previousIndex === 0 ? wishlistListings.length - 1 : previousIndex - 1].images[0]}
              alt="Previous listing"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
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
              src={wishlistListings[previousIndex].images[0]}
              alt={wishlistListings[previousIndex].title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
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
                sizes="(max-width: 768px) 100vw, 50vw"
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
              src={wishlistListings[nextIndex].images[0]}
              alt={wishlistListings[nextIndex].title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
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
              src={wishlistListings[nextIndex === wishlistListings.length - 1 ? 0 : nextIndex + 1].images[0]}
              alt="Next listing"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
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
        {wishlistListings.map((_, index) => (
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
          {currentIndex + 1} of {wishlistListings.length}
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
        <nav className="pt-24 px-8 flex flex-col h-full">
          <ul className="space-y-8 flex-1">
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
                  router.push('/user-profile/trips');
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
                  router.push('/user-profile');
                  setSidebarOpen(false);
                }}
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 hover:bg-black/10 transition-all px-4 py-2 rounded-lg w-full text-left"
              >
                Profile
              </button>
            </li>
          </ul>

          {/* Switch to Host Mode Button */}
          <div className="pb-8">
            <button
              type="button"
              onClick={() => {
                router.push('/sell');
                setSidebarOpen(false);
              }}
              className="w-full bg-white/20 backdrop-blur-xl border border-white/30 text-stone-900 rounded-2xl py-4 px-6 font-semibold hover:bg-white/30 hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Switch to Hosting
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
