'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import ListingCard from '../../components/ui/listing-card';
import { api } from '../../../lib/api';

// TODO: make swiping smoother & perhaps include more
// TODO: slight error
const SAMPLE_LISTINGS = [
  {
    id: 1,
    images: [
      '/images/golden-gateway/golden-gateway1.avif',
      '/images/golden-gateway/golden-gateway2.avif',
      '/images/golden-gateway/golden-gateway3.avif',
      '/images/golden-gateway/golden-gateway4.avif',
    ],
    price: 150,
    location: 'San Francisco, CA',
    availability: 'Available Dec 15-22',
    beds: 2,
    baths: 2,
  },
  {
    id: 2,
    images: [
      '/images/morrocan-home/morrocan-home1.avif',
      '/images/morrocan-home/morrocan-home2.avif',
      '/images/morrocan-home/morrocan-home3.avif',
    ],
    price: 225,
    location: 'Los Angeles, CA',
    availability: 'Available Jan 1-8',
    beds: 3,
    baths: 2,
  },
  {
    id: 3,
    images: [
      '/images/ritzy-room/ritzy-room1.avif',
      '/images/ritzy-room/ritzy-room2.avif',
      '/images/ritzy-room/ritzy-room3.avif',
    ],
    price: 189,
    location: 'Beverly Hills, CA',
    availability: 'Available Now',
    beds: 1,
    baths: 1,
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
    price: 275,
    location: 'San Francisco, CA',
    availability: 'Available Dec 20-27',
    beds: 4,
    baths: 3,
  },
];

export default function SwipePage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId] = useState('demo-user-' + Math.random().toString(36).substr(2, 9));

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
    setTimeout(() => {
      setExitDirection(null);

      if (currentIndex < SAMPLE_LISTINGS.length - 1) {
        // Move to next listing
        setCurrentIndex(currentIndex + 1);
      } else {
        // ✅ No more listings → go to wishlist
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
              price={currentListing.price}
              location={currentListing.location}
              availability={currentListing.availability}
              beds={currentListing.beds}
              baths={currentListing.baths}
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
