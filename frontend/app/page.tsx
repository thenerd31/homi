'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#DFDFD3] flex flex-col">
      {/* Header */}
      <div className="pt-12 px-6 text-center">
        <h1 className="text-4xl font-melodrame italic text-stone-900 mb-4">
          Seller or Buyer?
        </h1>
      </div>

      {/* Buttons Container */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="flex flex-col gap-6 w-full max-w-xs">
          {/* Buyer Button */}
          <button
            type="button"
            onClick={() => router.push('/discover')}
            className="w-full py-6 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
            aria-label="Buyer"
          >
            <span className="text-2xl font-hind font-medium text-white">
              Buyer
            </span>
          </button>

          {/* Seller Button */}
          <button
            type="button"
            onClick={() => router.push('/sell')}
            className="w-full py-6 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
            aria-label="Seller"
          >
            <span className="text-2xl font-hind font-medium text-white">
              Seller
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
