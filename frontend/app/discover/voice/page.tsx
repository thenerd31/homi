'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Mic } from 'lucide-react';

export default function VoiceInputPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center pt-4 pb-2 relative">
        <button
          onClick={() => router.back()}
          className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Go back"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-3 bg-white rounded-full"></div>
            <div className="w-0.5 h-4 bg-white rounded-full"></div>
            <div className="w-0.5 h-5 bg-white rounded-full"></div>
            <div className="w-0.5 h-4 bg-white rounded-full"></div>
            <div className="w-0.5 h-3 bg-white rounded-full"></div>
          </div>
          <span className="text-white text-lg font-medium">Transcribe</span>
        </div>
      </div>

      {/* Main Content Area with Gradient */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Radial gradient effect */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            isRecording ? 'opacity-100' : 'opacity-60'
          }`}
          style={{
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, rgba(0,0,0,0) 60%)',
          }}
        />

        {/* Recording indicator pulse effect */}
        {isRecording && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 rounded-full bg-white/20 animate-ping"></div>
          </div>
        )}

        {/* Microphone Button - Center Lower */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10">
          <button
            type="button"
            onClick={handleMicClick}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110'
                : 'bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30'
            }`}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            <Mic className={`w-10 h-10 ${isRecording ? 'text-white' : 'text-white'}`} strokeWidth={2} />
          </button>

          {/* Recording text */}
          {isRecording && (
            <p className="text-white text-sm text-center mt-4 animate-pulse">
              Recording...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
