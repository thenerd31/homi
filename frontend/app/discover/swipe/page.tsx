'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import ListingCard from '../../components/ui/listing-card';
import { api } from '../../../lib/api';

// Sample listings data
const SAMPLE_LISTINGS = [
  {
    id: 1,
    images: [
      '/images/peaceful-private-room-B-3-min-walk-to-ocean-beach/ocean_beach_1.avif',
      '/images/peaceful-private-room-B-3-min-walk-to-ocean-beach/ocean_beach_2.avif',
      '/images/peaceful-private-room-B-3-min-walk-to-ocean-beach/ocean_beach_3.avif',
    ],
  },
  {
    id: 2,
    images: [
      '/images/classic-private-room-in-west-LA/west_la_1.avif',
      '/images/classic-private-room-in-west-LA/west_la_2.avif',
      '/images/classic-private-room-in-west-LA/west_la_3.avif',
    ],
  },
  {
    id: 3,
    images: [
      '/images/suite-A-Azure-Anticipation/suite-1.avif',
      '/images/suite-A-Azure-Anticipation/suite-2.avif',
      '/images/suite-A-Azure-Anticipation/suite-3.avif',
    ],
  },
];

export default function SwipePage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId] = useState('demo-user-' + Math.random().toString(36).substr(2, 9)); // Generate random user ID for demo

  const currentListing = SAMPLE_LISTINGS[currentIndex];
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
      if (currentIndex < SAMPLE_LISTINGS.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // No more cards
        console.log('No more listings!');
        setCurrentIndex(0); // Loop back for demo
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

  if (!currentListing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-200 flex items-center justify-center">
        <p className="text-stone-600 text-xl">No more listings!</p>
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
          {/* Next card preview (underneath) */}
          {currentIndex < SAMPLE_LISTINGS.length - 1 && (
            <div className="absolute inset-0 scale-95 opacity-50 pointer-events-none">
              <ListingCard
                images={SAMPLE_LISTINGS[currentIndex + 1].images}
                className="pointer-events-none"
              />
            </div>
          )}

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
          {currentIndex + 1} / {SAMPLE_LISTINGS.length}
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
