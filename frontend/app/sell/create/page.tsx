'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, List } from 'lucide-react';

export default function CreateListingPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [detectedAmenities, setDetectedAmenities] = useState<string[]>([
    'TV',
    'WiFi',
  ]);
  const [showAmenitiesList, setShowAmenitiesList] = useState(false);

  // Request camera access
  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Unable to access camera. Please grant camera permissions.');
      }
    };

    initCamera();

    return () => {
      // Cleanup camera stream on unmount
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Update video ref when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleDismissInstructions = () => {
    setShowInstructions(false);
  };

  const handleBack = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    router.push('/sell');
  };

  const handleCapture = () => {
    console.log('Photo captured');
    // TODO: Implement photo capture logic
  };

  const handleRecordToggle = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      console.log('Recording started');
      // TODO: Implement recording start logic
      // TODO: implement furniture/object detection for detecting amenities
      // Simulate detecting amenities during recording
      setTimeout(() => {
        setDetectedAmenities((prev) => [...prev, 'Kitchen']);
      }, 2000);
    } else {
      console.log('Recording stopped');
      // TODO: Implement recording stop logic
      // TODO: generate description for listing
    }
  };

  const handleShowAmenities = () => {
    setShowAmenitiesList(!showAmenitiesList);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Live Camera Feed Background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay for better visibility */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Back Button - Top Left */}
      {!showInstructions && (
        <button
          type="button"
          onClick={handleBack}
          className="absolute top-6 left-6 z-50 w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
        </button>
      )}

      {/* Instructions Popup - Phase 1 */}
      {showInstructions && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-6">
          <div className="relative w-full max-w-sm mx-auto">
            {/* Liquid Glass Card */}
            <div className="relative rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl p-10 pb-12 overflow-hidden min-h-[550px]">
              {/* Shimmer effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />

              {/* Content */}
              <div className="relative z-10">
                <h2 className="text-3xl font-hind text-white mb-6 text-center">
                  Capture your space
                </h2>

                <p className="text-white/90 font-hind text-base leading-relaxed mb-2">
                  Walk slowly, keep the Spectacles glasses steady, and make sure there's good light.
                </p>
                <p className="text-white/90 font-hind text-base leading-relaxed">
                  We'll automatically detect rooms, furniture, and amenities.
                </p>

                {/* Icon */}
                <div className="flex justify-center my-10">
                  <svg
                    className="w-32 h-32 text-white"
                    viewBox="0 0 200 200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* House icon */}
                    <path d="M100 40 L160 80 L160 160 L40 160 L40 80 Z" />
                    <path d="M70 100 L130 100 L130 160 L70 160 Z" />
                    <rect x="85" y="120" width="30" height="20" />
                    <path d="M100 40 L100 60" />
                    <circle cx="100" cy="30" r="8" />
                    {/* Roof detail */}
                    <path d="M30 80 L100 30 L170 80" />
                    <path d="M50 90 L100 50 L150 90" fill="none" />
                  </svg>
                </div>

                {/* Arrow Button */}
                <div className="flex justify-center mt-10">
                  <button
                    type="button"
                    onClick={handleDismissInstructions}
                    className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/40 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
                    aria-label="Start capturing"
                  >
                    <svg
                      className="w-6 h-6 text-white"
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
            </div>
          </div>
        </div>
      )}

      {/* Camera Controls - Phase 2 & 3 */}
      {!showInstructions && (
        <>
          {/* Bottom Control Buttons */}
          <div className="absolute bottom-12 left-0 right-0 z-30 flex items-center justify-center gap-12 px-6">
            {/* Camera Button - Left */}
            <button
              type="button"
              onClick={handleCapture}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
              aria-label="Take photo"
            >
              <Camera className="w-7 h-7 text-white" strokeWidth={2} />
            </button>

            {/* Record Button - Center */}
            <button
              type="button"
              onClick={handleRecordToggle}
              className={`w-20 h-20 rounded-full backdrop-blur-xl border-4 border-white/50 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95 ${
                isRecording ? 'bg-red-500/80' : 'bg-white/20'
              }`}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              <div
                className={`transition-all duration-300 ${
                  isRecording
                    ? 'w-6 h-6 rounded-sm bg-white'
                    : 'w-16 h-16 rounded-full border-4 border-white'
                }`}
              />
            </button>

            {/* Amenities List Button - Right */}
            <button
              type="button"
              onClick={handleShowAmenities}
              className="relative w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
              aria-label="View detected amenities"
            >
              <List className="w-7 h-7 text-white" strokeWidth={2} />
              {detectedAmenities.length > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {detectedAmenities.length}
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* Amenities List Panel */}
          {showAmenitiesList && (
            <div className="absolute bottom-32 right-6 z-40 w-64">
              <div className="rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl p-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />

                <div className="relative z-10">
                  <h3 className="text-xl font-melodrame italic text-white mb-4">
                    Detected Amenities
                  </h3>

                  {detectedAmenities.length > 0 ? (
                    <ul className="space-y-2">
                      {detectedAmenities.map((amenity, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-3 text-white/90 font-hind"
                        >
                          <div className="w-2 h-2 rounded-full bg-white" />
                          <span>{amenity}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-white/70 font-hind text-sm">
                      No amenities detected yet. Start recording to scan your space.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Recording Indicator */}
          {isRecording && (
            <div className="absolute top-6 right-6 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/80 backdrop-blur-xl border border-white/30">
              <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
              <span className="text-white font-hind text-sm font-semibold">
                Recording
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
