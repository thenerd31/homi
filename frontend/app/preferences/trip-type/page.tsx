'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TRIP_TYPES = [
  { id: 'adventure', label: 'Adventure & Outdoor', emoji: '🏔️' },
  { id: 'relaxation', label: 'Relaxation & Wellness', emoji: '🧘' },
  { id: 'cultural', label: 'Cultural & Historical', emoji: '🏛️' },
  { id: 'city', label: 'City Exploration', emoji: '🏙️' },
  { id: 'beach', label: 'Beach & Coastal', emoji: '🏖️' },
  { id: 'nature', label: 'Nature & Wildlife', emoji: '🌲' },
  { id: 'food', label: 'Food & Wine', emoji: '🍷' },
  { id: 'romantic', label: 'Romantic Getaway', emoji: '💑' },
];

export default function TripTypePage() {
  const router = useRouter();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const toggleType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      setSelectedTypes(selectedTypes.filter(id => id !== typeId));
    } else {
      setSelectedTypes([...selectedTypes, typeId]);
    }
  };

  const handleNext = () => {
    // Save to localStorage or state management
    localStorage.setItem('tripTypes', JSON.stringify(selectedTypes));
    router.push('/preferences/places');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-[#DFDFD3] flex flex-col">
      {/* Header */}
      <div className="pt-12 px-6">
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-3 bg-white/40 backdrop-blur-xl border border-white/30 rounded-full text-stone-900 font-semibold hover:bg-white/50 transition-all"
          >
            Save & exit
          </button>
          <button
            type="button"
            className="px-6 py-3 text-stone-900 font-semibold hover:underline"
          >
            Questions?
          </button>
        </div>

        <h1 className="text-4xl font-melodrame italic text-stone-900 mb-4">
          What kind of trip are you hoping to go on?
        </h1>
        <p className="text-stone-600 font-hind text-base mb-8">
          Select all that apply
        </p>
      </div>

      {/* Trip Types Grid */}
      <div className="flex-1 px-6 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {TRIP_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => toggleType(type.id)}
              className={`p-6 rounded-2xl border-2 transition-all ${
                selectedTypes.includes(type.id)
                  ? 'bg-stone-900 border-stone-900 text-white'
                  : 'bg-white/40 backdrop-blur-xl border-white/30 text-stone-900 hover:bg-white/50'
              }`}
            >
              <div className="text-4xl mb-2">{type.emoji}</div>
              <div className="text-sm font-semibold">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-6 pb-8 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="text-stone-900 font-semibold text-lg hover:underline"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={selectedTypes.length === 0}
          className={`px-8 py-3 rounded-full font-semibold transition-all ${
            selectedTypes.length === 0
              ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
              : 'bg-stone-900 text-white hover:bg-stone-800'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
