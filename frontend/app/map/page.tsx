'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, MapPin, Star } from 'lucide-react';
import Image from 'next/image';

// TODO: Replace with actual recommendations from backend based on user preferences
const LOCATION_RECOMMENDATIONS = [
  {
    id: 1,
    name: 'Ocean Beach House',
    location: 'San Francisco, CA',
    lat: 37.7749,
    lng: -122.4194,
    image: '/images/peaceful-private-room-B-3-min-walk-to-ocean-beach/ocean_beach_1.avif',
    rating: 4.98,
    price: 250,
    matchScore: 95,
  },
  {
    id: 2,
    name: 'Mountain Retreat',
    location: 'Lake Tahoe, CA',
    lat: 39.0968,
    lng: -120.0324,
    image: '/images/classic-private-room-in-west-LA/west_la_1.avif',
    rating: 4.92,
    price: 320,
    matchScore: 88,
  },
  {
    id: 3,
    name: 'Desert Oasis',
    location: 'Palm Springs, CA',
    lat: 33.8303,
    lng: -116.5453,
    image: '/images/suite-A-Azure-Anticipation/suite-1.avif',
    rating: 4.89,
    price: 180,
    matchScore: 82,
  },
  {
    id: 4,
    name: 'Coastal Villa',
    location: 'Big Sur, CA',
    lat: 36.2704,
    lng: -121.8081,
    image: '/images/peaceful-private-room-B-3-min-walk-to-ocean-beach/ocean_beach_2.avif',
    rating: 4.95,
    price: 420,
    matchScore: 91,
  },
];

export default function MapPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [userPreferences, setUserPreferences] = useState({
    tripTypes: [] as string[],
    places: [] as string[],
    activities: [] as string[],
  });

  useEffect(() => {
    // Load user preferences from localStorage
    const tripTypes = JSON.parse(localStorage.getItem('tripTypes') || '[]');
    const places = JSON.parse(localStorage.getItem('preferredPlaces') || '[]');
    const activities = JSON.parse(localStorage.getItem('preferredActivities') || '[]');

    setUserPreferences({ tripTypes, places, activities });
  }, []);

  const hasPreferences =
    userPreferences.tripTypes.length > 0 ||
    userPreferences.places.length > 0 ||
    userPreferences.activities.length > 0;

  return (
    <div className="min-h-screen bg-[#DFDFD3] relative">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="absolute top-6 right-6 z-30 p-2 text-stone-900 hover:bg-stone-300 rounded-full transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Header */}
      <div className="pt-12 px-6 mb-6">
        <h1 className="text-4xl font-melodrame italic text-stone-900 mb-2">
          Discover Places
        </h1>
        {hasPreferences && (
          <p className="text-stone-600 font-hind text-sm">
            Based on your preferences
          </p>
        )}
      </div>

      {/* No Preferences Message */}
      {!hasPreferences && (
        <div className="px-6 mb-6">
          <div className="bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              Tell us what you're looking for
            </h3>
            <p className="text-stone-600 font-hind text-sm mb-4">
              Answer a few questions to get personalized recommendations
            </p>
            <button
              type="button"
              onClick={() => router.push('/preferences/trip-type')}
              className="w-full bg-stone-900 text-white rounded-full py-3 px-6 font-semibold hover:bg-stone-800 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Map Container - Simplified visual representation */}
      <div className="px-6 mb-6">
        <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 via-green-50 to-yellow-50 rounded-3xl overflow-hidden shadow-xl">
          {/* Simplified map background with location markers */}
          <div className="absolute inset-0">
            {LOCATION_RECOMMENDATIONS.map((location, index) => {
              // Calculate pseudo positions based on lat/lng for visual effect
              const top = `${20 + (index * 15)}%`;
              const left = `${15 + (index * 20)}%`;

              return (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => setSelectedLocation(location.id)}
                  className="absolute group"
                  style={{ top, left }}
                  aria-label={`View ${location.name}`}
                >
                  {/* Pulsing ring animation */}
                  <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping" />

                  {/* Marker dot */}
                  <div className={`relative w-8 h-8 rounded-full transition-all duration-300 ${
                    selectedLocation === location.id
                      ? 'bg-rose-600 scale-125 shadow-lg'
                      : 'bg-rose-500 group-hover:scale-110 shadow-md'
                  }`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-stone-900 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                      {location.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Map overlay text */}
          <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2">
            <p className="text-xs font-semibold text-stone-900">
              {LOCATION_RECOMMENDATIONS.length} places match your preferences
            </p>
          </div>
        </div>
      </div>

      {/* Location Cards */}
      <div className="px-6 pb-20">
        <h2 className="text-2xl font-melodrame italic text-stone-900 mb-4">
          Recommended for You
        </h2>
        <div className="space-y-4">
          {LOCATION_RECOMMENDATIONS.map((location) => (
            <div
              key={location.id}
              className={`bg-white/40 backdrop-blur-xl border-2 rounded-2xl overflow-hidden shadow-lg cursor-pointer transition-all ${
                selectedLocation === location.id
                  ? 'border-rose-500 scale-[1.02]'
                  : 'border-white/30 hover:bg-white/50'
              }`}
              onClick={() => {
                setSelectedLocation(location.id);
                router.push(`/listing/${location.id}`);
              }}
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="relative w-32 h-32 flex-shrink-0">
                  <Image
                    src={location.image}
                    alt={location.name}
                    fill
                    className="object-cover"
                  />
                  {/* Match Score Badge */}
                  <div className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {location.matchScore}% match
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 py-4 pr-4">
                  <h3 className="text-lg font-semibold text-stone-900 mb-1">
                    {location.name}
                  </h3>
                  <div className="flex items-center gap-1 text-stone-600 text-sm mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-hind">{location.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-stone-900">
                        {location.rating}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-stone-900">
                        ${location.price}
                      </span>
                      <span className="text-sm text-stone-600 font-hind">
                        {' '}/ night
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
                  router.push('/user-profile/trips');
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
                  router.push('/user-profile');
                  setSidebarOpen(false);
                }}
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 hover:bg-black/10 transition-all px-4 py-2 rounded-lg w-full text-left"
              >
                Profile
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
