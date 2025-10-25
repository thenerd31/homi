'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../../lib/api';

export default function MultimodalResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [humanizedText, setHumanizedText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFirstMessage, setShowFirstMessage] = useState(true);
  const [fadeOutFirstMessage, setFadeOutFirstMessage] = useState(false);
  const [showSecondMessage, setShowSecondMessage] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const loadHumanizedPreferences = async () => {
      // Get extracted preferences from URL params
      const extractedPrefs = searchParams.get('preferences');

      if (extractedPrefs) {
        try {
          const parsed = JSON.parse(decodeURIComponent(extractedPrefs));

          // Call the humanize API
          const result = await api.humanizePreferences(parsed);

          if (result.success && result.humanized_text) {
            setHumanizedText(result.humanized_text);
          } else {
            // Fallback
            setHumanizedText('beautiful spaces, great design, and comfortable stays');
          }
        } catch (error) {
          console.error('Failed to humanize preferences:', error);
          // Fallback to generic message
          setHumanizedText('beautiful spaces, great design, and comfortable stays');
        }
      } else {
        // Fallback if no preferences provided
        setHumanizedText('beautiful spaces, great design, and comfortable stays');
      }

      setIsLoading(false);
    };

    loadHumanizedPreferences();

    // Show first message for 4.5 seconds, then start fade out
    const firstTimer = setTimeout(() => {
      setFadeOutFirstMessage(true);
      // After fade out animation completes, hide first and show second
      setTimeout(() => {
        setShowFirstMessage(false);
        setShowSecondMessage(true);
      }, 700);
    }, 4500);

    // Navigate after showing second message
    const secondTimer = setTimeout(() => {
      setIsNavigating(true);
      setTimeout(() => {
        router.push('/discover/swipe');
      }, 600);
    }, 7000);

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(secondTimer);
    };
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#DFDFD3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-stone-300 border-t-stone-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600 text-lg">Analyzing your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DFDFD3] flex flex-col items-center justify-center px-6">
      {/* First message: "So you like..." */}
      {showFirstMessage && (
        <div className={`text-center transition-opacity duration-700 ease-out ${
          fadeOutFirstMessage ? 'opacity-0' : 'opacity-100'
        }`}>
          <h1 className="text-5xl font-melodrame italic text-stone-900 mb-6">
            So you like
          </h1>
          <div className="overflow-hidden max-w-3xl mx-auto">
            <p className="text-2xl font-melodrame italic text-stone-900 leading-relaxed reveal-text">
              {humanizedText}
            </p>
          </div>
        </div>
      )}

      {/* Second message: "Here's what we think you'll like..." */}
      {showSecondMessage && (
        <div className={`text-center transition-opacity duration-700 ease-in ${
          isNavigating ? 'opacity-0' : 'opacity-100'
        }`}>
          <h1 className="text-5xl font-melodrame italic text-stone-900">
            Here's what we think you'll like...
          </h1>
        </div>
      )}

      <style jsx>{`
        @keyframes reveal-left-to-right {
          from {
            clip-path: inset(0 100% 0 0);
          }
          to {
            clip-path: inset(0 0 0 0);
          }
        }
        .reveal-text {
          animation: reveal-left-to-right 3.5s ease-out;
        }
      `}</style>
    </div>
  );
}
