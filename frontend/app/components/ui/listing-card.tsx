'use client';

import { useState } from 'react';
import { X, Heart, Shuffle, MapPin, Calendar, BedDouble, Bath, Glasses } from 'lucide-react';
import Image from 'next/image';

interface ListingCardProps {
  images: string[];
  className?: string;
  onPass?: () => void;
  onLike?: () => void;
  onShuffle?: () => void;
  showButtons?: boolean;
  price?: number;
  location?: string;
  availability?: string;
  beds?: number;
  baths?: number;
  showDetails?: boolean;
}

export default function ListingCard({
  images,
  className = '',
  onPass,
  onLike,
  onShuffle,
  showButtons = true,
  price,
  location,
  availability,
  beds,
  baths,
  showDetails = true
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
              sizes="(max-width: 768px) 100vw, 50vw"
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

      {/* Glasses Icon - Top Right */}
      <div className="absolute top-8 right-4 z-20">
        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
          <Glasses className="w-7 h-7 text-white" strokeWidth={2} />
        </div>
      </div>

      {/* Action Buttons - Above Listing Details */}
      {showButtons && (
        <div className="absolute bottom-42 left-0 right-0 flex items-center justify-center gap-6 z-20 pointer-events-none">
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

          {/* Shuffle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShuffle?.();
            }}
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95 pointer-events-auto touch-none"
            aria-label="Shuffle"
          >
            <Shuffle className="w-6 h-6 text-white" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Listing Details - Bottom Border */}
      {showDetails && (price || location || availability || beds || baths) && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 pb-8 z-10">
          <div className="space-y-3">
            {/* Price */}
            {price !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-white text-2xl font-bold">${price}</span>
                <span className="text-white/80 text-sm">per night</span>
              </div>
            )}

            {/* Location */}
            {location && (
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{location}</span>
              </div>
            )}

            {/* Availability */}
            {availability && (
              <div className="flex items-center gap-2 text-white/90">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{availability}</span>
              </div>
            )}

            {/* Beds & Baths */}
            {(beds !== undefined || baths !== undefined) && (
              <div className="flex items-center gap-4 text-white/90">
                {beds !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4" />
                    <span className="text-sm">{beds} {beds === 1 ? 'bed' : 'beds'}</span>
                  </div>
                )}
                {baths !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4" />
                    <span className="text-sm">{baths} {baths === 1 ? 'bath' : 'baths'}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
