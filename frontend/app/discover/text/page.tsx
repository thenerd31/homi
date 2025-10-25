'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check } from 'lucide-react';

export default function TextInputPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');

  const handleSubmit = () => {
    if (inputText.trim()) {
      // TODO: Handle text submission
      console.log('Submitted:', inputText);
      router.push('/discover/swipe');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center pt-4 pb-2 relative">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Go back"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span className="text-white text-lg font-medium">Type</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pt-8">
        <div>
          <p className="text-white/60 text-base mb-3">
            What kind of place feels right for you?
          </p>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Think: San Francisco, city loft, seaside studio..."
            className="w-full bg-transparent text-white text-2xl font-light resize-none outline-none placeholder:text-white/30 min-h-[200px]"
            autoFocus
          />
        </div>
      </div>

      {/* Submit Button */}
      {inputText.trim() && (
        <div className="fixed bottom-24 right-6">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all shadow-lg"
            aria-label="Submit"
          >
            <Check className="w-7 h-7 text-white" strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
}
