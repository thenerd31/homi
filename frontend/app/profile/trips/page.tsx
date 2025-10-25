'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Menu, X } from 'lucide-react';
import Image from 'next/image';

// TODO: Replace with actual past trips data from API
const PAST_TRIPS_2025 = [
  {
    id: 1,
    title: 'Trip',
    date: 'Aug 1 - 4, 2025',
    image: '/images/peaceful-private-room-B-3-min-walk-to-ocean-beach/ocean_beach_1.avif',
  },
];

const PAST_TRIPS_2023 = [
  {
    id: 2,
    title: 'Winhall',
    date: 'Dec 19 - 21, 2023',
    image: '/images/classic-private-room-in-west-LA/west_la_1.avif',
  },
  {
    id: 3,
    title: 'Experience in Porto',
    date: 'May 3, 2023',
    image: '/images/suite-A-Azure-Anticipation/suite-1.avif',
  },
  {
    id: 4,
    title: 'Experience in Lisbon',
    date: 'May 1, 2023',
    image: '/images/peaceful-private-room-B-3-min-walk-to-ocean-beach/ocean_beach_2.avif',
  },
  {
    id: 5,
    title: 'Seville',
    date: 'Apr 29 - May 1, 2023',
    image: '/images/peaceful-private-room-B-3-min-walk-to-ocean-beach/ocean_beach_1.avif',
  },
];

// TODO: Replace with actual canceled reservations data
const CANCELED_RESERVATIONS = [
  {
    id: 6,
    title: 'Apartment in Providence',
    date: 'Nov 22 - 26, 2023',
    status: 'Canceled',
    image: '/images/classic-private-room-in-west-LA/west_la_1.avif',
  },
];

export default function PastTripsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#DFDFD3] relative pb-20">
      {/* Header with Back Button */}
      <div className="pt-6 px-6 flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 text-stone-900 hover:bg-stone-300 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-stone-900 hover:bg-stone-300 rounded-full transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Title */}
      <div className="px-6 mb-8">
        <h1 className="text-4xl font-melodrame italic text-stone-900">
          Past trips
        </h1>
      </div>

      {/* 2025 Trips */}
      {PAST_TRIPS_2025.length > 0 && (
        <div className="px-6 mb-8">
          <div className="space-y-4">
            {PAST_TRIPS_2025.map((trip) => (
              <div
                key={trip.id}
                className="bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl p-4 shadow-lg cursor-pointer hover:bg-white/50 transition-all"
                onClick={() => router.push(`/trips/${trip.id}`)}
              >
                <div className="flex items-center gap-4">
                  {/* Trip Image */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={trip.image}
                      alt={trip.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Trip Info */}
                  <div className="flex-1">
                    <h3 className="text-stone-900 font-semibold text-base mb-1">
                      {trip.title}
                    </h3>
                    <p className="text-stone-600 text-sm font-hind">
                      {trip.date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2023 Section */}
      <div className="px-6 mb-8">
        <h2 className="text-2xl font-melodrame italic text-stone-900 mb-4">
          2023
        </h2>
        <div className="space-y-4">
          {PAST_TRIPS_2023.map((trip) => (
            <div
              key={trip.id}
              className="bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl p-4 shadow-lg cursor-pointer hover:bg-white/50 transition-all"
              onClick={() => router.push(`/trips/${trip.id}`)}
            >
              <div className="flex items-center gap-4">
                {/* Trip Image */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={trip.image}
                    alt={trip.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Trip Info */}
                <div className="flex-1">
                  <h3 className="text-stone-900 font-semibold text-base mb-1">
                    {trip.title}
                  </h3>
                  <p className="text-stone-600 text-sm font-hind">
                    {trip.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Canceled Reservations Section */}
      {CANCELED_RESERVATIONS.length > 0 && (
        <div className="px-6 mb-8">
          <h2 className="text-2xl font-melodrame italic text-stone-900 mb-4">
            Canceled reservations
          </h2>
          <div className="space-y-4">
            {CANCELED_RESERVATIONS.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl p-4 shadow-lg"
              >
                <div className="flex items-center gap-4">
                  {/* Reservation Image */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={reservation.image}
                      alt={reservation.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Reservation Info */}
                  <div className="flex-1">
                    <h3 className="text-stone-900 font-semibold text-base mb-1">
                      {reservation.title}
                    </h3>
                    <p className="text-stone-600 text-sm font-hind mb-2">
                      {reservation.date}
                    </p>
                    {/* Status Bar */}
                    <div className="w-full h-1 bg-stone-400 rounded-full">
                      <div className="h-full w-full bg-stone-600 rounded-full" />
                    </div>
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
                  router.push('/trips');
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
