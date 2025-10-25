'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, MapPin, Calendar, Star, Home } from 'lucide-react';
import Image from 'next/image';

// TODO: Replace with actual user data from API/auth
const USER_DATA = {
  name: 'Qian',
  role: 'Guest',
  avatar: '/images/placeholder-card.png', // Replace with actual avatar
  trips: 5,
  reviews: 2,
  yearsOnPlatform: 3,
  isSeller: true, // Change to true if user is already a host/seller
};

// TODO: Replace with actual past trips data
const PAST_TRIPS = [
  {
    id: 1,
    title: 'Cozy Beach House',
    location: 'Malibu, CA',
    date: 'Dec 2024',
    image: '/images/peaceful-private-room-B-3-min-walk-to-ocean-beach/ocean_beach_1.avif',
  },
  {
    id: 2,
    title: 'Mountain Cabin',
    location: 'Lake Tahoe, CA',
    date: 'Nov 2024',
    image: '/images/classic-private-room-in-west-LA/west_la_1.avif',
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#DFDFD3] relative pb-20">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="absolute top-6 right-6 z-30 p-2 text-stone-900 hover:bg-stone-300 rounded-full transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Header */}
      <div className="pt-12 px-6">
        <h1 className="text-4xl font-melodrame italic text-stone-900 mb-8">
          Profile
        </h1>
      </div>

      {/* Main Profile Card */}
      <div className="px-6 mb-8">
        <div className="bg-white/40 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-lg">
          {/* User Info Section */}
          <div className="flex items-start gap-6 mb-6">
            {/* Avatar */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-white/50 shadow-lg flex-shrink-0">
              <Image
                src={USER_DATA.avatar}
                alt={USER_DATA.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Stats Grid */}
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-stone-900 mb-1">
                {USER_DATA.name}
              </h2>
              <p className="text-stone-600 font-hind mb-4">{USER_DATA.role}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-stone-900">
                    {USER_DATA.trips}
                  </div>
                  <div className="text-xs text-stone-600 font-hind">Trips</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-stone-900">
                    {USER_DATA.reviews}
                  </div>
                  <div className="text-xs text-stone-600 font-hind">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-stone-900">
                    {USER_DATA.yearsOnPlatform}
                  </div>
                  <div className="text-xs text-stone-600 font-hind">
                    Years on Airbnb
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-2 gap-4">
          {/* Past Trips Card - Display Only */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-stone-900/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-stone-900" />
              </div>
              <span className="text-base font-semibold text-stone-900">
                Past trips
              </span>
            </div>
          </div>

          {/* Connections Card - Display Only */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-stone-900/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-stone-900" />
              </div>
              <span className="text-base font-semibold text-stone-900">
                Connections
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Become a Host Section - Only show if user is not a seller */}
      {!USER_DATA.isSeller && (
        <div className="px-6 mb-8">
          <div className="bg-gradient-to-br from-stone-900 to-stone-700 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
                <Home className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-melodrame italic text-white mb-1">
                  Become a host
                </h3>
                <p className="text-white/80 text-sm font-hind">
                  It's easy to start hosting and earn extra income
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push('/sell')}
              className="w-full bg-white text-stone-900 rounded-full py-3 px-6 font-semibold hover:bg-white/90 transition-colors shadow-lg"
            >
              Switch to hosting
            </button>
          </div>
        </div>
      )}

      {/* Recent Trips Preview */}
      {PAST_TRIPS.length > 0 && (
        <div className="px-6">
          <h2 className="text-2xl font-melodrame italic text-stone-900 mb-4">
            Recent Stays
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {PAST_TRIPS.map((trip) => (
              <div
                key={trip.id}
                className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300"
              >
                <div className="relative w-full aspect-square">
                  <Image
                    src={trip.image}
                    alt={trip.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">
                      {trip.title}
                    </h3>
                    <div className="flex items-center gap-1 text-white/90 text-xs mb-1">
                      <MapPin className="w-3 h-3" />
                      <span>{trip.location}</span>
                    </div>
                    <p className="text-white/70 text-xs">{trip.date}</p>
                  </div>
                </div>
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
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 hover:bg-black/10 transition-all px-4 py-2 rounded-lg w-full text-left"
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
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 hover:bg-black/10 transition-all px-4 py-2 rounded-lg w-full text-left"
              >
                Map
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  router.push('/profile/trips');
                  setSidebarOpen(false);
                }}
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 hover:bg-black/10 transition-all px-4 py-2 rounded-lg w-full text-left"
              >
                Trips
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  router.push('/profile');
                  setSidebarOpen(false);
                }}
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 hover:bg-black/10 transition-all px-4 py-2 rounded-lg w-full text-left"
              >
                Profile
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
