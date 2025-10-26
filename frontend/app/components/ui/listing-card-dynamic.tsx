'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Heart, Shuffle, Users, BedDouble, Bath, Star } from 'lucide-react';
import Image from 'next/image';

// TODO: fix bc the swiping mechanism is janky and ugly and delayed
interface ListingCardDynamicProps {
  listingId: string;
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
  name?: string;
  clickable?: boolean;
  guests?: number;
  rating?: number;
}

export default function ListingCardDynamic({
  listingId,
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
  showDetails = true,
  name,
  clickable = true,
  guests,
  rating,
}: ListingCardDynamicProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleCardClick = () => {
    if (clickable) {
      router.push(`/listing-detail/${listingId}`);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className={`relative w-full h-full bg-stone-200 rounded-3xl flex items-center justify-center ${className}`}>
        <p className="text-stone-400">No images available</p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-black ${clickable ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleCardClick}
    >
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
              alt={name || `Listing image ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Progress Sliders at Top - Always show, divided by number of images */}
      <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-30 pointer-events-none">
        {images.map((_, index) => (
          <button
            type="button"
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              if (images.length > 1) {
                goToSlide(index);
              }
            }}
            className="flex-1 h-0.5 rounded-full bg-white/30 backdrop-blur-sm pointer-events-auto overflow-hidden"
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

      {/* Compact Info at Top - Below Sliders - NO BACKGROUND */}
      {showDetails && (
        <div className="absolute top-8 left-4 right-16 z-30 pointer-events-none">
          {/* Title */}
          {name && (
            <h3 className="text-white text-lg font-hind mb-2 drop-shadow-lg">
              {name}
            </h3>
          )}

          {/* Compact Stats Row */}
          <div className="flex items-center gap-3 text-white/90 text-sm drop-shadow-lg">
            {guests !== undefined && (
              <div className="flex font-hind items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{guests} guest{guests !== 1 ? 's' : ''}</span>
              </div>
            )}
            {beds !== undefined && (
              <div className="flex font-hind items-center gap-1">
                <BedDouble className="w-4 h-4" />
                <span>{beds} bedroom{beds !== 1 ? 's' : ''}</span>
              </div>
            )}
            {baths !== undefined && (
              <div className="flex font-hind items-center gap-1">
                <Bath className="w-4 h-4" />
                <span>{baths} bath{baths !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Rating */}
          {rating !== undefined && rating > 0 && (
            <div className="flex items-center gap-1 mt-2 drop-shadow-lg">
              <Star className="w-4 h-4 fill-white text-white" />
              <span className="text-white text-sm font-medium">{rating.toFixed(2)}</span>
            </div>
          )}
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
            className="absolute left-0 top-32 bottom-32 w-1/3 z-10 pointer-events-auto touch-none"
            aria-label="Previous image"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
            }}
            className="absolute right-0 top-32 bottom-32 w-1/3 z-10 pointer-events-auto touch-none"
            aria-label="Next image"
          />
        </>
      )}

      {/* Action Buttons at Bottom - ENHANCED LIQUID GLASS */}
      {showButtons && (
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6 z-30 pointer-events-none">
          {/* Pass Button (X) - Enhanced Liquid Glass */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPass?.();
            }}
            className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-2xl border-2 border-white/40 hover:bg-white/25 hover:border-white/50 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-2xl active:scale-95 pointer-events-auto touch-none"
            aria-label="Pass"
          >
            <X className="w-7 h-7 text-white drop-shadow-lg" strokeWidth={2.5} />
          </button>

          {/* Like Button (Heart) - Enhanced Liquid Glass */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLike?.();
            }}
            className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-2xl border-2 border-white/40 hover:bg-white/25 hover:border-white/50 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-2xl active:scale-95 pointer-events-auto touch-none"
            aria-label="Like"
          >
            <Heart className="w-9 h-9 text-white drop-shadow-lg" strokeWidth={2.5} />
          </button>

          {/* Shuffle Button - Enhanced Liquid Glass */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShuffle?.();
            }}
            className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-2xl border-2 border-white/40 hover:bg-white/25 hover:border-white/50 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-2xl active:scale-95 pointer-events-auto touch-none"
            aria-label="Shuffle - Find similar listings"
            title="Find similar listings"
          >
            <Shuffle className="w-7 h-7 text-white drop-shadow-lg" strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}
