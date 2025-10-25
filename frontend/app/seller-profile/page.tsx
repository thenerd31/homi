'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Star } from 'lucide-react';
import StarIcon from "@mui/icons-material/Star";
import Image from 'next/image';

// TODO: Replace with actual seller data from API/auth
const SELLER_DATA = {
  name: 'Qian',
  role: 'Host',
  avatar: '/images/placeholder-card.png', // Replace with actual avatar
  listings: 4,
  reviews: 12,
  rating: 4.98,
  yearsHosting: 2,
};

// TODO: Replace with actual reviews data
// TODO: add change profile button and messages
const SELLER_REVIEWS = [
  {
    id: 1,
    guestName: 'Sarah M.',
    guestAvatar: '/images/peaceful-private-room-B-3-min-walk-to-ocean-beach/ocean_beach_1.avif',
    rating: 5.0,
    date: 'January 2025',
    comment: 'Amazing place! The listing was exactly as described. Qian was a wonderful host and very responsive.',
    propertyName: 'Penthouse Loft in SF',
  },
  {
    id: 2,
    guestName: 'Michael K.',
    guestAvatar: '/images/classic-private-room-in-west-LA/west_la_1.avif',
    rating: 4.9,
    date: 'December 2024',
    comment: 'Great stay! The space was clean and well-maintained. Would definitely recommend.',
    propertyName: 'Entire Suite in Los Angeles',
  },
  {
    id: 3,
    guestName: 'Emily R.',
    guestAvatar: '/images/suite-A-Azure-Anticipation/suite-1.avif',
    rating: 5.0,
    date: 'November 2024',
    comment: 'Fantastic experience! The amenities were top-notch and the location was perfect.',
    propertyName: 'Treehouse in Brea',
  },
];

export default function SellerProfilePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black relative pb-20">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="absolute top-6 right-6 z-30 p-2 text-white hover:bg-stone-800 rounded-full transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Header */}
      <div className="pt-12 px-6">
        <h1 className="text-4xl font-melodrame italic text-white mb-8">
          Profile
        </h1>
      </div>

      {/* Main Profile Card */}
      <div className="px-6 mb-8">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-lg">
          {/* User Info Section */}
          <div className="flex items-start gap-6 mb-6">
            {/* Avatar */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-white/30 shadow-lg flex-shrink-0">
              <Image
                src={SELLER_DATA.avatar}
                alt={SELLER_DATA.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Stats Grid */}
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-white mb-1">
                {SELLER_DATA.name}
              </h2>
              <p className="text-white/70 font-hind mb-4">{SELLER_DATA.role}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {SELLER_DATA.listings}
                  </div>
                  <div className="text-xs text-white/60 font-hind">Listings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {SELLER_DATA.reviews}
                  </div>
                  <div className="text-xs text-white/60 font-hind">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {SELLER_DATA.yearsHosting}
                  </div>
                  <div className="text-xs text-white/60 font-hind">
                    Years Hosting
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Just Reviews */}
      <div className="px-6 mb-8">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">
                    {SELLER_DATA.rating}
                  </span>
                  <StarIcon sx={{ fontSize: "1.2em", color: "#facc15" }} />
                </div>
                <span className="text-sm font-hind text-white/70">
                  {SELLER_DATA.reviews} Reviews
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {SELLER_REVIEWS.length > 0 && (
        <div className="px-6">
          <h2 className="text-2xl font-melodrame italic text-white mb-6">
            Recent Reviews
          </h2>
          <div className="space-y-4">
            {SELLER_REVIEWS.map((review) => (
              <div
                key={review.id}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-lg"
              >
                {/* Reviewer Info */}
                <div className="flex items-start gap-4 mb-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/30 flex-shrink-0">
                    <Image
                      src={review.guestAvatar}
                      alt={review.guestName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-semibold">
                        {review.guestName}
                      </h3>
                      <div className="flex items-center gap-1">
                        <span className="text-white text-sm font-semibold">
                          {review.rating}
                        </span>
                        <StarIcon sx={{ fontSize: "0.9em", color: "#facc15" }} />
                      </div>
                    </div>
                    <p className="text-white/60 text-xs font-hind mb-1">
                      {review.propertyName}
                    </p>
                    <p className="text-white/50 text-xs font-hind">
                      {review.date}
                    </p>
                  </div>
                </div>

                {/* Review Comment */}
                <p className="text-white/80 font-hind text-sm leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dark overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-black shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="absolute top-6 left-6 p-2 text-white hover:bg-stone-800 rounded-full transition-colors"
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
                  router.push('/sell');
                  setSidebarOpen(false);
                }}
                className="text-4xl font-melodrame italic text-white hover:text-stone-400 hover:bg-white/20 transition-all px-4 py-2 rounded-lg w-full text-left"
              >
                Create
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  router.push('/seller-profile');
                  setSidebarOpen(false);
                }}
                className="text-4xl font-melodrame italic text-white hover:text-stone-400 hover:bg-white/20 transition-all px-4 py-2 rounded-lg w-full text-left"
              >
                Account
              </button>
            </li>
          </ul>

          {/* Switch to Guest Mode Button */}
          <div className="pb-8">
            <button
              type="button"
              onClick={() => {
                router.push('/discover');
                setSidebarOpen(false);
              }}
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl py-4 px-6 font-semibold hover:bg-white/20 hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Switch to Browsing
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
