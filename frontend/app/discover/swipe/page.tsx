'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
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

    // Send to backend as regular like (super like = like with higher priority)
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
    setExitDirection(null);
    if (currentIndex < SAMPLE_LISTINGS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more cards
      console.log('No more listings!');
      setCurrentIndex(0); // Loop back for demo
    }
    x.set(0);
  };

  const swipeLeft = () => {
    setExitDirection('left');
    setTimeout(handlePass, 300);
  };

  const swipeRight = () => {
    setExitDirection('right');
    setTimeout(handleLike, 300);
  };

  if (!currentListing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-200 flex items-center justify-center">
        <p className="text-stone-600 text-xl">No more listings!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-200 flex flex-col">
      {/* Header */}
      <div className="pt-8 px-6 text-center">
        <h1 className="text-3xl font-melodrame italic text-stone-900">
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
    </div>
  );
}
