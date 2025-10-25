'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import ListingCard from '../../components/ui/listing-card';
import { api } from '../../../lib/api';

// Sample listings data (fallback)
const SAMPLE_LISTINGS = [
  {
    id: 1,
    images: [
      '/images/golden-gateway/golden-gateway1.avif',
      '/images/golden-gateway/golden-gateway2.avif',
      '/images/golden-gateway/golden-gateway3.avif',
      '/images/golden-gateway/golden-gateway4.avif',
    ],
  },
  {
    id: 2,
    images: [
      '/images/morrocan-home/morrocan-home1.avif',
      '/images/morrocan-home/morrocan-home2.avif',
      '/images/morrocan-home/morrocan-home3.avif',
    ],
  },
  {
    id: 3,
    images: [
      '/images/ritzy-room/ritzy-room1.avif',
      '/images/ritzy-room/ritzy-room2.avif',
      '/images/ritzy-room/ritzy-room3.avif',
    ],
  },
  {
    id: 4,
    images: [
      '/images/victorian-home/victorian_home1.avif',
      '/images/victorian-home/victorian_home2.avif',
      '/images/victorian-home/victorian_home3.avif',
      '/images/victorian-home/victorian_home4.avif',
      '/images/victorian-home/victorian_home5.avif',
    ],
  },
];

export default function SwipePage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId] = useState(() => {
    // Try to get userId from localStorage, or generate new one
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vibe_user_id') || 'demo-user-' + Math.random().toString(36).substr(2, 9);
    }
    return 'demo-user-' + Math.random().toString(36).substr(2, 9);
  });
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load search results from localStorage on mount
  useEffect(() => {
    try {
      // Try to get search results from localStorage
      const storedResults = localStorage.getItem('vibe_search_results');
      const storedUserId = localStorage.getItem('vibe_user_id');

      if (storedResults) {
        const parsedResults = JSON.parse(storedResults);
        console.log('Loaded search results from localStorage:', parsedResults.length, 'listings');
        setListings(parsedResults);
      } else {
        console.log('No search results found in localStorage, using sample listings');
        setListings(SAMPLE_LISTINGS);
      }
    } catch (error) {
      console.error('Failed to load listings:', error);
      console.log('Using sample listings as fallback');
      setListings(SAMPLE_LISTINGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

    // Send to backend
    try {
      await api.swipe({
        user_id: userId,
        listing_id: `listing-${currentListing.id}`,
        action: 'pass'
      });
    } catch (error) {
      console.error('Failed to record swipe:', error);
    }

    moveToNext();
  };

  const handleLike = async () => {
    console.log('Liked listing:', currentListing.id);

    // Send to backend
    try {
      const result = await api.swipe({
        user_id: userId,
        listing_id: `listing-${currentListing.id}`,
        action: 'like'
      });
      console.log('Saved!', result.message);
    } catch (error) {
      console.error('Failed to record swipe:', error);
    }

    moveToNext();
  };

  const handleSuperLike = async () => {
    console.log('Super liked listing:', currentListing.id);

    // send to backend as regular like (super like = like with higher priority)
    try {
      await api.swipe({
        user_id: userId,
        listing_id: `listing-${currentListing.id}`,
        action: 'like'
      });
    } catch (error) {
      console.error('Failed to record swipe:', error);
    }

    moveToNext();
  };

  const moveToNext = () => {
    // Wait for exit animation to complete before changing card
    setTimeout(() => {
      setExitDirection(null);
      if (currentIndex < listings.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // No more cards
        console.log('No more listings!');
        // Don't loop - show "no more listings" state
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
        handleSuperLike();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exitDirection]); // Re-attach listener when exitDirection changes

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#DFDFD3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-900 text-xl font-melodrame italic">Loading your matches...</p>
        </div>
      </div>
    );
  }

  // No more listings state
  if (!currentListing) {
    return (
      <div className="min-h-screen bg-[#DFDFD3] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-3xl font-melodrame italic text-stone-900 mb-2">
            You've seen them all!
          </h2>
          <p className="text-stone-600 mb-8">
            No more listings to show. Try a new search?
          </p>
          <button
            type="button"
            onClick={() => router.push('/discover/text')}
            className="px-8 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors"
          >
            New Search
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
        <h1 className="text-4xl font-melodrame italic text-stone-900 mb-4">
          Find Your Perfect Place
        </h1>
      </div>

      {/* Swipeable Card Container */}
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="relative w-full max-w-md aspect-[8/16]">
<<<<<<< Updated upstream
=======
          {/* Next card preview (underneath) */}
          {currentIndex < listings.length - 1 && (
            <div className="absolute inset-0 scale-95 opacity-50 pointer-events-none">
              <ListingCard
                images={listings[currentIndex + 1].images}
                className="pointer-events-none"
              />
            </div>
          )}

>>>>>>> Stashed changes
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
                      ease: [0.32, 0.72, 0, 1]
                    },
                  }
                : {}
            }
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            <ListingCard
              images={currentListing.images}
              onPass={swipeLeft}
              onLike={swipeRight}
              onSuperLike={handleSuperLike}
            />
          </motion.div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="px-6 pb-4 text-center">
        <p className="text-stone-600 text-sm">
          {currentIndex + 1} / {listings.length}
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
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 transition-colors"
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
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 transition-colors"
              >
                Map
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  router.push('/trips');
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
                  router.push('/account');
                  setSidebarOpen(false);
                }}
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 transition-colors"
              >
                Account
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
