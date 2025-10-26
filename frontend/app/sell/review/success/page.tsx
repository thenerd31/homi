'use client';

import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import PropertyMap from '../../../components/PropertyMap';

export default function SuccessPage() {
  const router = useRouter();
  const [listingData, setListingData] = useState<any>(null);

  useEffect(() => {
    // Get listing data from localStorage
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('propertyData');
      if (storedData) {
        setListingData(JSON.parse(storedData));
      }
    }
  }, []);

  // Sample data - in a real app, this would come from the listing data
  const listing = {
    title: listingData?.title || "Penthouse Loft in SF",
    location: listingData?.location || "8375 Fremont St, San Francisco, CA, 00000",
    guests: listingData?.guests || 5,
    bedrooms: listingData?.bedrooms || 1,
    bathrooms: listingData?.bathrooms || 1,
    rating: 4.99,
    // You can add the actual image URL here
    coverImage: "/api/placeholder/400/600"
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-light mb-12" style={{ fontFamily: 'serif', fontStyle: 'italic' }}>
        Your listing is live!
      </h1>

      <div className="w-full max-w-md mb-12">
        <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Listing Image */}
          <div className="relative h-96 bg-gray-700">
            {/* Placeholder image - replace with actual image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-gray-500 text-sm">Listing Photo</div>
            </div>

            {/* Info Overlay */}
            <div className="absolute top-4 left-4 right-4">
              <h2 className="text-white text-lg font-medium mb-1">{listing.title}</h2>
              <p className="text-gray-300 text-sm">
                {listing.guests} guests | {listing.bedrooms} bedroom | {listing.bathrooms} bath
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm">{listing.rating}</span>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="p-6">
            <h3 className="text-lg font-light mb-3">Location</h3>
            <p className="text-gray-400 text-sm mb-4">{listing.location}</p>
            <PropertyMap location={listing.location} className="w-full h-64" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-4">
        <button
          onClick={() => router.push('/listing/' + 'sample-id')}
          className="w-full py-4 bg-transparent border-2 border-white text-white rounded-full font-medium hover:bg-white hover:text-black transition"
        >
          View Listing
        </button>

        <button
          onClick={() => router.push('/sell/review')}
          className="w-full py-4 bg-transparent border-2 border-white text-white rounded-full font-medium hover:bg-white hover:text-black transition"
        >
          Manage Listing
        </button>
      </div>
    </div>
  );
}
