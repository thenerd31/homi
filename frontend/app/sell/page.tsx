'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Eye, Sparkles, Heart } from 'lucide-react';
import StarIcon from "@mui/icons-material/Star";
import Image from 'next/image';

// TODO: change hardcoded data
const USER_LISTINGS = [
  {
    id: 1,
    title: 'Penthouse Loft in SF',
    guests: 5,
    bedrooms: 1,
    bathrooms: 1,
    rating: 4.99,
    image: '/images/golden-gateway/golden-gateway1.avif',
  },
  {
    id: 2,
    title: 'Entire Suite in Los Angeles',
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    rating: 4.97,
    image: '/images/morrocan-home/morrocan-home1.avif',
  },
  {
    id: 3,
    title: 'Treehouse in Brea',
    guests: 5,
    bedrooms: 1,
    bathrooms: 1,
    rating: 4.99,
    image: '/images/ritzy-room/ritzy-room1.avif',
  },
  {
    id: 4,
    title: 'Tiny Home in Topanga',
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    rating: 4.97,
    image: '/images/victorian-home/victorian_home1.avif',
  },
];

export default function SellPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black relative">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="absolute top-6 right-6 z-30 p-2 text-white hover:bg-stone-800 rounded-full transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* header */}
      <div className="pt-12 px-6">
        <h1 className="text-4xl font-melodrame italic text-white mb-4">
          Start Listing
        </h1>
      </div>

      {/* placeholder */}
      <div className="px-6 pb-8">
        <div className="relative w-full max-w-md mx-auto aspect-[8/16] rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-b from-stone-300 to-stone-500">
          <Image
            src="/images/placeholder-card.png"
            alt="Start Listing"
            fill
            className="object-cover"
            priority
          />

          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />

          {/* content */}
          <div className="relative h-full flex flex-col items-start justify-center p-8">
            <div className="flex-1 flex items-center">
              <div className="text-white">
                <p className="text-lg mb-2 font-hind font-light">Ready to Host?</p>
                <h2 className="text-3xl font-semibold leading-tight mb-1">
                  Let's Turn Your Place
                </h2>
                <h2 className="text-3xl font-semibold leading-tight">
                  into Stay with <span className="font-melodrame italic">Spectacles</span>
                </h2>
              </div>
            </div>

            {/* action buttons */}
            <div className="flex gap-8 pb-8 mx-auto">
              <button
                type="button"
                onClick={() => router.push('/sell/create')}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
                aria-label="Browse listings"
              >
                <Eye className="w-6 h-6 text-white" strokeWidth={2} />
              </button>

              <button
                type="button"
                onClick={() => router.push('/sell/create')}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
                aria-label="Create with AI"
              >
                <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* listings */}
      <div className="px-6 pb-24">
        <h2 className="text-3xl font-melodrame italic text-white mb-6">
          Your Listings
        </h2>

        {/* Pinterest-style Masonry Grid */}
        <div className="grid grid-cols-2 gap-4">
          {USER_LISTINGS.map((listing) => (
            <div
              key={listing.id}
              className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={() => router.push(`/listing`)}
            >
              {/* Image */}
              <div className="relative w-full aspect-[3/4]">
                <Image
                  src={listing.image}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />

                <button
                  type="button"
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Favorited:', listing.id);
                  }}
                  aria-label="Favorite listing"
                >
                  <Heart className="w-5 h-5 text-white" strokeWidth={2} />
                </button>
              </div>

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4">
                <h3 className="text-white font-semibold text-base mb-1 line-clamp-1">
                  {listing.title}
                </h3>
                <p className="text-white/80 text-sm mb-2">
                  {listing.guests} guests, {listing.bedrooms} bedroom{listing.bedrooms > 1 ? 's' : ''}, {listing.bathrooms} bath{listing.bathrooms > 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-white text-sm font-semibold"></span>
                  <span className="text-white text-sm font-semibold">{listing.rating} <StarIcon sx={{ fontSize: "0.85em", color: "#facc15", verticalAlign: "middle" }} /> </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* dark overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-black shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* close button */}
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="absolute top-6 left-6 p-2 text-white hover:bg-stone-800 rounded-full transition-colors"
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
                className="text-4xl font-melodrame italic text-white hover:text-stone-400 hover:bg-white/20 transition-all px-4 py-2 rounded-lg w-full text-left"
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
                className="text-4xl font-melodrame italic text-white hover:text-stone-400 hover:bg-white/20 transition-all px-4 py-2 rounded-lg w-full text-left"
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
                className="text-4xl font-melodrame italic text-white hover:text-stone-400 hover:bg-white/20 transition-all px-4 py-2 rounded-lg w-full text-left"
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
                className="text-4xl font-melodrame italic text-white hover:text-stone-400 hover:bg-white/20 transition-all px-4 py-2 rounded-lg w-full text-left"
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
