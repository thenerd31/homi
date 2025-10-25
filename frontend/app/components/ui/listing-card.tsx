'use client';

import { useState } from 'react';
import { X, Heart, Shuffle } from 'lucide-react';
import Image from 'next/image';

interface ListingCardProps {
  images: string[];
  className?: string;
  onPass?: () => void;
  onLike?: () => void;
  onSuperLike?: () => void;
  showButtons?: boolean;
}

export default function ListingCard({
  images,
  className = '',
  onPass,
  onLike,
  onSuperLike,
  showButtons = true
}: ListingCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <div className={`relative w-full h-full bg-stone-200 rounded-3xl flex items-center justify-center ${className}`}>
        <p className="text-stone-400">No images available</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full rounded-3xl overflow-hidden shadow-2xl ${className}`}>
      {/* Image Display */}
      <div className="relative w-full h-full pointer-events-none">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={image}
              alt={`Listing image ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Spread Slider at Top */}
      {images.length > 1 && (
        <div className="absolute top-4 left-0 right-0 px-2 flex gap-1.5 z-20 pointer-events-none">
          {images.map((_, index) => (
            <button
              type="button"
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
              }}
              className="flex-1 h-1 rounded-full overflow-hidden bg-white/30 backdrop-blur-sm pointer-events-auto"
              aria-label={`Go to image ${index + 1}`}
            >
              <div
                className={`h-full bg-white transition-all duration-300 ${
                  index === currentImageIndex ? 'w-full' : 'w-0'
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Invisible tap zones for navigation */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
            }}
            className="absolute left-0 top-16 bottom-32 w-1/3 z-10 pointer-events-auto touch-none"
            aria-label="Previous image"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
            }}
            className="absolute right-0 top-16 bottom-32 w-1/3 z-10 pointer-events-auto touch-none"
            aria-label="Next image"
          />
        </>
      )}

      {/* Incognito Icon - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
          </svg>
        </div>
      </div>

      {/* Action Buttons - Inside Card at Bottom */}
      {showButtons && (
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6 pb-8 z-20 pointer-events-none">
          {/* Pass Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPass?.();
            }}
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95 pointer-events-auto touch-none"
            aria-label="Pass"
          >
            <X className="w-6 h-6 text-white" strokeWidth={2} />
          </button>

          {/* Like Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLike?.();
            }}
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95 pointer-events-auto touch-none"
            aria-label="Like"
          >
            <Heart className="w-8 h-8 text-white" strokeWidth={2} />
          </button>

          {/* Super Like Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSuperLike?.();
            }}
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95 pointer-events-auto touch-none"
            aria-label="Super Like"
          >
            <Shuffle className="w-6 h-6 text-white" strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
