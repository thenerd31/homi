'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<'guest' | 'host'>('guest');

  const isGuest = mode === 'guest';

  const handleProceed = () => {
    if (isGuest) {
      router.push('/discover');
    } else {
      router.push('/sell');
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        isGuest ? 'bg-[#C5C5BA]' : 'bg-[#1a1a1a]'
      }`}
    >
      {/* Header */}
      <div className="pt-12 px-6 text-center">
        <h1 className={`text-4xl font-melodrame italic mb-4 transition-colors duration-500 ${
          isGuest ? 'text-stone-900' : 'text-[#E8E4D9]'
        }`}>
          What Brings You Here?
        </h1>
      </div>

      {/* Toggle Buttons Container */}
      <div className="flex items-center justify-center px-6 mt-32">
        <div className="flex gap-8">
          {/* Guest Button */}
          <button
            type="button"
            onClick={() => setMode('guest')}
            className={`w-40 h-40 rounded-3xl transition-all duration-300 flex items-center justify-center ${
              isGuest
                ? 'bg-black border-4 border-black'
                : 'bg-transparent border-2 border-[#E8E4D9]'
            }`}
            aria-label="Guest mode"
          >
            <span className={`text-3xl font-melodrame italic transition-colors duration-300 ${
              isGuest ? 'text-[#E8E4D9]' : 'text-[#E8E4D9]'
            }`}>
              Guest
            </span>
          </button>

          {/* Host Button */}
          <button
            type="button"
            onClick={() => setMode('host')}
            className={`w-40 h-40 rounded-full transition-all duration-300 flex items-center justify-center ${
              !isGuest
                ? 'bg-[#E8E4D9] border-4 border-[#E8E4D9]'
                : 'bg-transparent border-4 border-transparent ring-2 ring-black-500'
            }`}
            aria-label="Host mode"
          >
            <span className={`text-3xl font-melodrame italic transition-colors duration-300 ${
              !isGuest ? 'text-black' : 'text-black'
            }`}>
              Host
            </span>
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="flex-1 flex flex-col items-center justify-start px-6 mt-12">
        <div className="text-center max-w-md">
          <p className={`text-xl font-hind mb-2 transition-colors duration-500 ${
            isGuest ? 'text-stone-800' : 'text-[#E8E4D9]'
          }`}>
            {isGuest ? 'Describe your dream home' : 'Scan your room'}
          </p>
          <p className={`text-xl font-hind transition-colors duration-500 ${
            isGuest ? 'text-stone-800' : 'text-[#E8E4D9]'
          }`}>
            {isGuest
              ? "We'll find spaces that match your vibe"
              : "We'll turn it into a beautiful listing"
            }
          </p>
        </div>

        {/* Liquid Glass Arrow Button */}
        <button
          type="button"
          onClick={handleProceed}
          className={`mt-24 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95`}
          aria-label="Proceed"
        >
          <svg
            className={`w-8 h-8 transition-colors duration-500 ${
              isGuest ? 'text-white' : 'text-white'
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
