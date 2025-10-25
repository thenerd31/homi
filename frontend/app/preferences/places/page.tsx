'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';

const PLACE_TYPES = [
  { id: 'mountains', label: 'Mountains', emoji: '⛰️' },
  { id: 'beaches', label: 'Beaches', emoji: '🏖️' },
  { id: 'cities', label: 'Big Cities', emoji: '🌆' },
  { id: 'countryside', label: 'Countryside', emoji: '🌾' },
  { id: 'islands', label: 'Islands', emoji: '🏝️' },
  { id: 'deserts', label: 'Deserts', emoji: '🏜️' },
  { id: 'forests', label: 'Forests', emoji: '🌲' },
  { id: 'lakes', label: 'Lakes', emoji: '🏞️' },
  { id: 'towns', label: 'Small Towns', emoji: '🏘️' },
  { id: 'tropical', label: 'Tropical', emoji: '🌴' },
];

export default function PlacesPage() {
  const router = useRouter();
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);

  const togglePlace = (placeId: string) => {
    if (selectedPlaces.includes(placeId)) {
      setSelectedPlaces(selectedPlaces.filter(id => id !== placeId));
    } else {
      setSelectedPlaces([...selectedPlaces, placeId]);
    }
  };

  const handleNext = () => {
    // Save to localStorage or state management
    localStorage.setItem('preferredPlaces', JSON.stringify(selectedPlaces));
    router.push('/preferences/activities');
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
            onClick={() => router.push('/discover')}
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
          What kind of places are you hoping to visit?
        </h1>
        <p className="text-stone-600 font-hind text-base mb-8">
          Select all that interest you
        </p>
      </div>

      {/* Places Grid */}
      <div className="flex-1 px-6 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {PLACE_TYPES.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => togglePlace(place.id)}
              className={`p-6 rounded-2xl border-2 transition-all ${
                selectedPlaces.includes(place.id)
                  ? 'bg-stone-900 border-stone-900 text-white'
                  : 'bg-white/40 backdrop-blur-xl border-white/30 text-stone-900 hover:bg-white/50'
              }`}
            >
              <div className="text-4xl mb-2">{place.emoji}</div>
              <div className="text-sm font-semibold">{place.label}</div>
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
          disabled={selectedPlaces.length === 0}
          className={`px-8 py-3 rounded-full font-semibold transition-all ${
            selectedPlaces.length === 0
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
