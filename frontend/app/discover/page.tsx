'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Pencil, Mic, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function DiscoverPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative bg-[#DFDFD3]">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="absolute top-6 right-6 z-30 p-2 text-stone-900 hover:bg-stone-300 rounded-full transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* header */}
      <div className="pt-12 px-6 text-center">
        <h1 className="text-4xl font-melodrame italic text-stone-900 mb-4">
          Describe Your Perfect Place
        </h1>
      </div>

      {/* listing placeholder card */}
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="relative w-full max-w-md aspect-[8/16] rounded-3xl shadow-2xl overflow-hidden">
          {/* Background Image */}
          <Image
            src="/images/placeholder-card.png"
            alt="Placeholder"
            fill
            className="object-cover"
            priority
          />

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-between p-8">
            <div className="flex-1 flex items-end pb-12">
              <div className="text-white">
                <p className="text-lg mb-2 font-hind font-regular">Welcome!</p>
                <h2 className="text-3xl font-semibold leading-tight">
                  Where would you like to live?
                </h2>
              </div>
            </div>

            {/* input buttons */}
            <div className="flex gap-6 pb-8">
            <button
              type="button"
              onClick={() => router.push('/discover/text')}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
              aria-label="Type your preference"
            >
              <Pencil className="w-6 h-6 text-white" strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={() => router.push('/discover/voice')}
              className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
              aria-label="Speak your preference"
            >
              <Mic className="w-8 h-8 text-white" strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={() => router.push('/discover/multimodal')}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
              aria-label="Upload images"
            >
              <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
            </button>
            </div>
          </div>
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
        <nav className="pt-24 px-8">
          <ul className="space-y-8">
            <li>
              <button
                type="button"
                onClick={() => {
                  router.push('/discover');
                  setSidebarOpen(false);
                }}
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 transition-colors"
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
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 transition-colors"
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
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 transition-colors"
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
                className="text-4xl font-melodrame italic text-stone-900 hover:text-stone-600 transition-colors"
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
