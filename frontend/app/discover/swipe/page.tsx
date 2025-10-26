'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import ListingCardDynamic from '../../components/ui/listing-card-dynamic';

interface Listing {
  id: string;
  name: string;
  description: string;
  picture_url: string;
  price: number;
  property_type: string;
  accommodates: number;
  bedrooms: number;
  beds: number;
  bathrooms_text: string;
  neighbourhood: string;
  amenities: string[];
  rating: number;
}

export default function SwipeClaudePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [swipedIndices, setSwipedIndices] = useState<Set<number>>(new Set());
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userId] = useState(() => {
    // Get existing user ID from localStorage or create a new one
    if (typeof window !== 'undefined') {
      const existingUserId = localStorage.getItem('vibe_user_id');
      if (existingUserId) {
        return existingUserId;
      }
      const newUserId = 'demo-user-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('vibe_user_id', newUserId);
      return newUserId;
    }
    return 'demo-user-' + Math.random().toString(36).substr(2, 9);
  });

  // Get search parameters from URL
  const query = searchParams.get('query') || '';
  const location = searchParams.get('location') || '';
  const guests = searchParams.get('guests') || '';
  const budget = searchParams.get('budget') || '';

  // Fetch listings using Claude search
  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);

        const response = await fetch('http://localhost:8000/api/claude-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query || 'Find me a great place to stay',
            location: location || undefined,
            guests: guests ? parseInt(guests) : undefined,
            budget: budget ? parseFloat(budget) : undefined,
            limit: 20,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }

        const data = await response.json();
        setListings(data.listings);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [query, location, guests, budget]);

  const currentListing = listings[currentIndex];
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 0.5, 1, 0.5, 0]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;

    if (Math.abs(info.offset.x) > threshold) {
      // Swiped far enough
      setExitDirection(info.offset.x > 0 ? 'right' : 'left');

      setTimeout(() => {
        if (info.offset.x > 0) {
          handleLike();
        } else {
          handlePass();
        }
      }, 300);
    }
  };

  const handlePass = async () => {
    console.log('Passed listing:', currentListing.id);

    // Mark this index as swiped
    setSwipedIndices((prev) => new Set(prev).add(currentIndex));

    // Send to backend (optional - using existing swipe endpoint)
    try {
      await fetch('http://localhost:8000/api/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          listing_id: currentListing.id,
          action: 'pass',
        }),
      });
    } catch (error) {
      console.error('Failed to record swipe:', error);
    }

    moveToNext();
  };

  const handleLike = async () => {
    console.log('Liked listing:', currentListing.id);

    // Mark this index as swiped
    setSwipedIndices((prev) => new Set(prev).add(currentIndex));

    // Save to localStorage for wishlist
    try {
      const existingWishlist = localStorage.getItem('claude_wishlist');
      const wishlist = existingWishlist ? JSON.parse(existingWishlist) : [];

      // Add current listing to wishlist if not already there
      const isAlreadySaved = wishlist.some((item: Listing) => item.id === currentListing.id);
      if (!isAlreadySaved) {
        wishlist.push(currentListing);
        localStorage.setItem('claude_wishlist', JSON.stringify(wishlist));
        console.log('Added to wishlist:', currentListing.id);
      }
    } catch (error) {
      console.error('Failed to save to wishlist:', error);
    }

    // Send to backend
    try {
      const response = await fetch('http://localhost:8000/api/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          listing_id: currentListing.id,
          action: 'like',
        }),
      });
      const result = await response.json();
      console.log('Saved!', result.message);
    } catch (error) {
      console.error('Failed to record swipe:', error);
    }

    moveToNext();
  };

  const handleShuffle = () => {
    console.log('Shuffled listing:', currentListing.id);

    // Get indices of cards that haven't been swiped yet
    const remainingIndices = listings
      .map((_, index) => index)
      .filter((index) => !swipedIndices.has(index) && index !== currentIndex);

    if (remainingIndices.length === 0) {
      console.log('No more cards to shuffle!');
      return;
    }

    // Pick random index from remaining cards
    const randomIndex = remainingIndices[Math.floor(Math.random() * remainingIndices.length)];
    setExitDirection('left');
    setTimeout(() => {
      setExitDirection(null);
      setCurrentIndex(randomIndex);
      x.set(0);
    }, 300);
  };

  const moveToNext = () => {
    setTimeout(() => {
      setExitDirection(null);

      if (currentIndex < listings.length - 1) {
        // Move to next listing
        setCurrentIndex(currentIndex + 1);
      } else {
        // No more listings → go to wishlist
        console.log('No more listings! Redirecting...');
        router.push('/discover/swipe/wishlist');
      }

      x.set(0);
    }, 100);
  };

  const swipeLeft = () => {
    setExitDirection('left');
    setTimeout(handlePass, 300);
  };

  const swipeRight = () => {
    setExitDirection('right');
    setTimeout(handleLike, 300);
  };

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent action if card is already exiting
      if (exitDirection) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        swipeLeft();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        swipeRight();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        handleShuffle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exitDirection, currentListing]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#DFDFD3] flex items-center justify-center">
        <div className="text-3xl font-melodrame italic text-stone-900">
          Finding perfect matches...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#DFDFD3] flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-melodrame italic text-stone-900 mb-4">
            {error}
          </div>
          <button
            type="button"
            onClick={() => router.push('/discover')}
            className="text-stone-600 hover:text-stone-900"
          >
            Try a new search
          </button>
        </div>
      </div>
    );
  }

  if (!currentListing || listings.length === 0) {
    return (
      <div className="min-h-screen bg-[#DFDFD3] flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600 text-xl mb-4">No listings found!</p>
          <button
            type="button"
            onClick={() => router.push('/discover')}
            className="text-stone-900 hover:underline"
          >
            Try a different search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DFDFD3] flex flex-col relative">
      {/* Hamburger Menu */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="absolute top-6 right-6 z-30 p-2 text-stone-900 hover:bg-stone-300 rounded-full transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Header */}
      <div className="pt-12 px-6 text-center">
        <h1 className="text-4xl font-melodrame italic text-stone-900 mb-2">
          Find Your Perfect Place
        </h1>
      </div>

      {/* Swipeable Card Container */}
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="relative w-full max-w-md aspect-[8/16]">
          {/* Current card (swipeable) */}
          <motion.div
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            onDragEnd={handleDragEnd}
            animate={
              exitDirection
                ? {
                    x: exitDirection === 'right' ? 500 : -500,
                    rotate: exitDirection === 'right' ? 25 : -25,
                    opacity: 0,
                    transition: {
                      duration: 0.4,
                      ease: [0.32, 0.72, 0, 1],
                    },
                  }
                : {}
            }
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          >
            <ListingCardDynamic
              listingId={currentListing.id}
              images={currentListing.picture_url ? [currentListing.picture_url] : []}
              onPass={swipeLeft}
              onLike={swipeRight}
              onShuffle={handleShuffle}
              price={currentListing.price}
              location={currentListing.neighbourhood}
              beds={currentListing.beds}
              baths={parseInt(currentListing.bathrooms_text) || 0}
              name={currentListing.name}
              guests={currentListing.accommodates}
              rating={currentListing.rating}
              clickable={false}
            />
          </motion.div>
        </div>
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
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 transition-colors"
              >
                Discover
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  router.push('/discover/swipe/wishlist');
                  setSidebarOpen(false);
                }}
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 transition-colors"
              >
                Wishlist
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  router.push('/map');
                  setSidebarOpen(false);
                }}
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 transition-colors"
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
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 transition-colors"
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
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 transition-colors"
              >
                Account
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
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              Switch to Hosting
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
