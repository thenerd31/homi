'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ACTIVITIES = [
  { id: 'hiking', label: 'Hiking', emoji: '🥾' },
  { id: 'swimming', label: 'Swimming', emoji: '🏊' },
  { id: 'museums', label: 'Museums & Galleries', emoji: '🖼️' },
  { id: 'dining', label: 'Fine Dining', emoji: '🍽️' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🎉' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'skiing', label: 'Skiing/Snowboarding', emoji: '⛷️' },
  { id: 'surfing', label: 'Surfing', emoji: '🏄' },
  { id: 'yoga', label: 'Yoga & Meditation', emoji: '🧘' },
  { id: 'photography', label: 'Photography', emoji: '📷' },
  { id: 'wine', label: 'Wine Tasting', emoji: '🍷' },
  { id: 'biking', label: 'Biking', emoji: '🚴' },
];

export default function ActivitiesPage() {
  const router = useRouter();
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const toggleActivity = (activityId: string) => {
    if (selectedActivities.includes(activityId)) {
      setSelectedActivities(selectedActivities.filter(id => id !== activityId));
    } else {
      setSelectedActivities([...selectedActivities, activityId]);
    }
  };

  const handleNext = () => {
    // Save to localStorage or state management
    localStorage.setItem('preferredActivities', JSON.stringify(selectedActivities));
    // Redirect to map with recommendations
    router.push('/map');
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
          What activities are you hoping to do?
        </h1>
        <p className="text-stone-600 font-hind text-base mb-8">
          Select all that you're interested in
        </p>
      </div>

      {/* Activities Grid */}
      <div className="flex-1 px-6 pb-8 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          {ACTIVITIES.map((activity) => (
            <button
              key={activity.id}
              type="button"
              onClick={() => toggleActivity(activity.id)}
              className={`p-6 rounded-2xl border-2 transition-all ${
                selectedActivities.includes(activity.id)
                  ? 'bg-stone-900 border-stone-900 text-white'
                  : 'bg-white/40 backdrop-blur-xl border-white/30 text-stone-900 hover:bg-white/50'
              }`}
            >
              <div className="text-4xl mb-2">{activity.emoji}</div>
              <div className="text-sm font-semibold">{activity.label}</div>
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
          disabled={selectedActivities.length === 0}
          className={`px-8 py-3 rounded-full font-semibold transition-all ${
            selectedActivities.length === 0
              ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
              : 'bg-stone-900 text-white hover:bg-stone-800'
          }`}
        >
          Show me places
        </button>
      </div>
    </div>
  );
}
