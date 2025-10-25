'use client';

import { useRouter } from 'next/navigation';
import { Pencil, Mic, Images } from 'lucide-react';

export default function DiscoverPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-200 flex flex-col">
      {/* Header */}
      <div className="pt-12 px-6 text-center">
        <h1 className="text-4xl font-serif italic text-stone-900 mb-4">
          Describe Your Perfect Place
        </h1>
      </div>

      {/* listing card */}
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md aspect-[9/16] bg-gradient-to-b from-stone-400 to-stone-200 rounded-3xl shadow-2xl flex flex-col items-center justify-between p-8">
          <div className="flex-1 flex items-end pb-12">
            <div className="text-white">
              <p className="text-lg mb-2">Welcome!</p>
              <h2 className="text-3xl font-semibold leading-tight">
                Where would you like to live?
              </h2>
            </div>
          </div>

          {/* input buttons */}
          <div className="flex gap-6 pb-8">
            <button
              onClick={() => router.push('/discover/text')}
              className="w-16 h-16 rounded-full bg-stone-600 hover:bg-stone-700 transition-all flex items-center justify-center shadow-lg active:scale-95"
              aria-label="Type your preference"
            >
              <Pencil className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={() => router.push('/discover/voice')}
              className="w-20 h-20 rounded-full bg-stone-700 hover:bg-stone-800 transition-all flex items-center justify-center shadow-lg active:scale-95"
              aria-label="Speak your preference"
            >
              <Mic className="w-8 h-8 text-white" />
            </button>

            <button
              onClick={() => router.push('/discover/multimodal')}
              className="w-16 h-16 rounded-full bg-stone-600 hover:bg-stone-700 transition-all flex items-center justify-center shadow-lg active:scale-95"
              aria-label="Upload images"
            >
              <Images className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
