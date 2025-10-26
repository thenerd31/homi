'use client';

import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Sample data - in a real app this would come from API/database/URL params
const BOOKING_DATA = {
  listing: {
    id: 1,
    title: 'Sunny Studio in Downtown SF',
    subtitle: 'Entire Studio in San Francisco, California',
    guests: 5,
    bedrooms: 1,
    bathrooms: 1,
    rating: 4.99,
    image: '/images/golden-gateway/golden-gateway1.avif',
  },
  booking: {
    checkIn: 'Oct 18',
    checkOut: 'Oct 21',
    year: '2025',
    numGuests: 1,
    nights: 2,
    pricePerNight: 114.12,
  },
};

export default function ConfirmPayPage() {
  const router = useRouter();
  const { listing, booking } = BOOKING_DATA;

  const subtotal = booking.nights * booking.pricePerNight;
  const taxes = subtotal * 0.16; // 16% tax
  const totalPrice = subtotal + taxes;

  const handleConfirmAndPay = () => {
    router.push('/discover');
  };

  return (
    <div className="min-h-screen bg-[#DFDFD3] text-stone-900">
      {/* Header */}
      <div className="sticky top-0 bg-[#DFDFD3] border-b border-stone-200 z-10">
        <div className="flex items-center px-6 py-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="flex-1 text-center text-2xl font-melodrame italic font-hind">
            Stay in San Francisco | {booking.checkIn} - {booking.checkOut}
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 space-y-6 pb-32">
        {/* Property card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200">
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
              <h2 className="text-lg font-hind mb-1">{listing.title}</h2>
              <p className="text-sm text-stone-600 mb-2">
                {listing.guests} guests | {listing.bedrooms} bedroom | {listing.bathrooms} bath
              </p>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm font-hind">{listing.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-400"></div>

        {/* Dates */}
        <div>
          <h3 className="text-xl font-hind-bold mb-3">Dates</h3>
          <p className="text-stone-600">
            {booking.checkIn} - {booking.checkOut}, {booking.year}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-400"></div>

        {/* Guests */}
        <div>
          <h3 className="text-xl font-hind-bold mb-3">Guests</h3>
          <p className="text-stone-600">{booking.numGuests} adult</p>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-400"></div>

        {/* Price Details */}
        <div>
          <h3 className="text-xl font-hind-bold mb-4">Price Details</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-stone-600">
                {booking.nights} nights x ${booking.pricePerNight.toFixed(2)}
              </span>
              <span className="font-hind">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600">Taxes</span>
              <span className="font-hind">${taxes.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-400"></div>

        {/* Total */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-hind-bold">Total</h3>
          <span className="text-xl font-hind">${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#DFDFD3] border-t border-stone-200 px-6 py-4">
        <button
          type="button"
          onClick={handleConfirmAndPay}
          className="w-full bg-stone-900 text-white py-4 rounded-full text-lg font-hind hover:bg-stone-800 transition-all shadow-lg"
        >
          Confirm and Pay
        </button>
      </div>
    </div>
  );
}
