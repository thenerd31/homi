'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Sample data - in a real app this would come from API/database
const LISTING_DATA = {
  id: 1,
  title: 'Sunny Studio in Downtown SF',
  subtitle: 'Entire Studio in San Francisco, California',
  guests: 5,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  rating: 4.99,
  image: '/images/golden-gateway/golden-gateway1.avif',
  checkIn: 'Oct 18',
  checkOut: 'Oct 21',
  year: '2025',
  numGuests: 1,
  nights: 3,
  pricePerNight: 91.51,
};

export default function ConfirmPage() {
  const router = useRouter();
  const listing = LISTING_DATA;
  const totalPrice = listing.nights * listing.pricePerNight;

  const handleConfirmAndPay = () => {
    // In a real app, this would handle payment processing
    router.push('/user-profile/trips');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-stone-900">
      {/* Header */}
      <div className="sticky top-0 bg-[#F5F5F0] border-b border-stone-200 z-10">
        <div className="flex items-center p-6">
          <button
            onClick={() => router.back()}
            className="p-2"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="flex-1 text-center text-lg font-medium italic font-melodrame">
            Stay in San Francisco | {listing.checkIn} - {listing.checkOut}
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 space-y-8 pb-32">
        {/* Property card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-md">
          <div className="flex items-start gap-4 p-4">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={listing.image}
                alt={listing.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-1">{listing.title}</h2>
              <p className="text-sm text-stone-600 mb-2">
                {listing.guests} guests | {listing.bedrooms} bedroom | {listing.beds} bath
              </p>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm font-medium">{listing.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Dates</h3>
          <p className="text-stone-600">
            {listing.checkIn} - {listing.checkOut}, {listing.year}
          </p>
        </div>

        {/* Guests */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Guests</h3>
          <p className="text-stone-600">{listing.numGuests} adult</p>
        </div>

        {/* Total Price */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Total Price</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">${totalPrice.toFixed(2)}</span>
          </div>
          <p className="text-sm text-stone-500 mt-2">
            ${listing.pricePerNight.toFixed(2)} × {listing.nights} nights
          </p>
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F5F5F0] border-t border-stone-200 p-6">
        <button
          onClick={handleConfirmAndPay}
          className="w-full bg-stone-900 text-white py-4 rounded-full text-lg font-semibold hover:bg-stone-800 transition-all shadow-lg"
        >
          Confirm and Pay
        </button>
      </div>
    </div>
  );
}
