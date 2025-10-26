'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Square, List } from 'lucide-react';

interface Detection {
  object: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
}

export default function RealtimeScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedAmenities, setDetectedAmenities] = useState<Set<string>>(new Set());
  const [currentDetections, setCurrentDetections] = useState<Detection[]>([]);
  const [frameCount, setFrameCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAmenitiesList, setShowAmenitiesList] = useState(false);
  const [newAmenityToast, setNewAmenityToast] = useState<string | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [navigationGuide, setNavigationGuide] = useState<string | null>(null);
  const [roomCounts, setRoomCounts] = useState({ bedrooms: 0, bathrooms: 0, beds: 0 });
  const [userLocation, setUserLocation] = useState<{ address: string; coords: { lat: number; lng: number } } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

    if (!showInstructions) {
      initCamera();
    }

    return () => {
      // Cleanup camera stream on unmount
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [showInstructions]);

  // Update video ref when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Auto-capture frames every 1 second for real-time feel
  useEffect(() => {
    if (isScanning && videoRef.current && canvasRef.current) {
      intervalRef.current = setInterval(() => {
        captureAndDetect();
      }, 1000); // Every 1 second (1000ms) - faster for real-time detection

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isScanning]);

  // Draw bounding boxes and labels on overlay canvas (Figma style)
  useEffect(() => {
    if (!overlayCanvasRef.current || !videoRef.current) return;

    const overlayCanvas = overlayCanvasRef.current;
    const video = videoRef.current;
    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;

    // Match overlay canvas size to video display size
    overlayCanvas.width = video.clientWidth;
    overlayCanvas.height = video.clientHeight;

    // Clear previous drawings
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Calculate scale factors (video element size vs actual video size)
    const scaleX = video.clientWidth / video.videoWidth;
    const scaleY = video.clientHeight / video.videoHeight;

    // Draw each detection with Figma-style clean design
    currentDetections.forEach((detection) => {
      const [x1, y1, x2, y2] = detection.bbox;

      // Scale bounding box to match display size
      const scaledX1 = x1 * scaleX;
      const scaledY1 = y1 * scaleY;
      const scaledX2 = x2 * scaleX;
      const scaledY2 = y2 * scaleY;
      const width = scaledX2 - scaledX1;
      const height = scaledY2 - scaledY1;

      // Draw clean white bounding box (sharp corners, Figma style)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.strokeRect(scaledX1, scaledY1, width, height);

      // Draw simple label with small circle indicator (Figma style)
      const labelX = scaledX1 + width / 2;
      const labelY = scaledY1 - 25;

      // Small white circle indicator
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(labelX - 35, labelY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Object name text (clean, simple)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(detection.object.charAt(0).toUpperCase() + detection.object.slice(1), labelX - 25, labelY);
    });
  }, [currentDetections]);

  const handleDismissInstructions = () => {
    setShowInstructions(false);

    // Get user's location when starting scan
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Reverse geocode to get address
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();

            const address = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setUserLocation({
              address,
              coords: { lat: latitude, lng: longitude }
            });
          } catch (error) {
            console.error('Geocoding error:', error);
            setUserLocation({
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              coords: { lat: latitude, lng: longitude }
            });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  const handleBack = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    router.push('/sell');
  };

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    setIsProcessing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 image
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    try {
      // Send to real-time detection API
      const response = await fetch('http://localhost:8000/api/realtime-detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
        }),
      });

      if (!response.ok) {
        throw new Error('Detection failed');
      }

      const data = await response.json();

      if (data.success && data.amenities) {
        // Add new amenities to set and show toast for new ones
        setDetectedAmenities((prev) => {
          const newSet = new Set(prev);
          const previousSize = prev.size;
          data.amenities.forEach((amenity: string) => newSet.add(amenity));

          // Show toast if new amenity detected
          if (newSet.size > previousSize) {
            const newAmenities = data.amenities.filter((a: string) => !prev.has(a));
            if (newAmenities.length > 0) {
              setNewAmenityToast(newAmenities[0]);
              setTimeout(() => setNewAmenityToast(null), 2000);
            }
          }

          return newSet;
        });

        // Store current frame detections with bounding boxes
        if (data.detections && Array.isArray(data.detections)) {
          setCurrentDetections(data.detections);

          // Check for door detection and provide navigation
          const hasDoor = data.detections.some((d: Detection) => d.object.toLowerCase() === 'door');
          if (hasDoor && !navigationGuide) {
            setNavigationGuide("Door detected! Try going through to capture more rooms.");
            setTimeout(() => setNavigationGuide(null), 5000);
          }

          // Auto-capture good quality photos (every 3 frames with detections)
          if (frameCount % 3 === 0 && data.detections.length > 0) {
            setCapturedPhotos(prev => {
              if (prev.length < 5) {
                return [...prev, imageData];
              }
              return prev;
            });
          }

          // Count room types
          const bedDetected = data.detections.some((d: Detection) => d.object.toLowerCase().includes('bed'));
          const toiletDetected = data.detections.some((d: Detection) =>
            d.object.toLowerCase().includes('toilet') || d.object.toLowerCase().includes('sink')
          );

          if (bedDetected) {
            setRoomCounts(prev => ({ ...prev, bedrooms: Math.max(prev.bedrooms, 1), beds: Math.max(prev.beds, 1) }));
          }
          if (toiletDetected) {
            setRoomCounts(prev => ({ ...prev, bathrooms: Math.max(prev.bathrooms, 1) }));
          }
        }

        setFrameCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Detection error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCameraClick = () => {
    // Manual capture when camera button is clicked
    if (!isScanning) {
      setIsScanning(true);
    } else {
      captureAndDetect();
    }
  };

  const handleStopScanning = async () => {
    setIsScanning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Store results and navigate to review
    if (detectedAmenities.size > 0) {
      // Generate smart title based on detected amenities
      const amenitiesArray = Array.from(detectedAmenities);

      // Step 1: Factual room information (based on actual detections)
      const roomType = roomCounts.bedrooms > 1 ? `${roomCounts.bedrooms}-Bedroom` : roomCounts.bedrooms === 1 ? '1-Bedroom' : 'Studio';

      // Step 2: Style descriptor (independent of room count)
      let styleDescriptor = 'Modern';
      const luxuryAmenities = ['pool', 'jacuzzi', 'spa', 'hot tub'];
      const cozyAmenities = ['couch', 'fireplace', 'sofa'];
      const hasLuxury = amenitiesArray.some(a => luxuryAmenities.some(lux => a.toLowerCase().includes(lux)));
      const hasCozy = amenitiesArray.some(a => cozyAmenities.some(cozy => a.toLowerCase().includes(cozy)));

      if (hasLuxury) {
        styleDescriptor = 'Luxury';
      } else if (hasCozy) {
        styleDescriptor = 'Cozy';
      }

      // Step 3: Combine room type + style + top amenities
      const topAmenities = amenitiesArray.slice(0, 2).join(' & ');
      const generatedTitle = `${roomType} ${styleDescriptor} Retreat${topAmenities ? ` with ${topAmenities}` : ''}`;

      // Generate AI description
      const hasLuxuryItems = hasLuxury;
      const descriptionStyle = hasLuxuryItems ? 'upscale' : 'welcoming';
      const description = `${descriptionStyle === 'upscale' ? 'An exquisite' : 'A welcoming'} ${roomType.toLowerCase()} featuring ${amenitiesArray.slice(0, 3).join(', ')}${amenitiesArray.length > 3 ? ', and more premium amenities' : ''}. Perfect for ${roomCounts.bedrooms > 1 ? 'families or groups' : 'individuals or couples'} seeking a ${descriptionStyle} experience.`;

      // Call Fetch.ai pricing agent for AI-powered pricing
      let suggestedPrice = 150; // Default fallback
      let pricingSource = 'default';
      try {
        const pricingResponse = await fetch('http://localhost:8000/api/seller/analyze-pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: userLocation?.address || 'Unknown Location',
            property_type: roomCounts.bedrooms > 0 ? 'apartment' : 'studio',
            amenities: amenitiesArray,
            bedrooms: roomCounts.bedrooms || 1,
            bathrooms: roomCounts.bathrooms || 1
          })
        });

        if (pricingResponse.ok) {
          const pricingData = await pricingResponse.json();
          suggestedPrice = pricingData.suggested_price || suggestedPrice;
          pricingSource = pricingData.source || 'unknown';
          console.log('💰 Pricing from:', pricingSource, '- $', suggestedPrice);
        }
      } catch (error) {
        console.error('Pricing agent error:', error);
      }

      const listingData = {
        amenities_detected: amenitiesArray,
        photos: capturedPhotos, // Include auto-captured photos
        title: generatedTitle,
        description: description,
        suggested_price: suggestedPrice,
        pricing_source: pricingSource, // Track if it came from Fetch.ai agent or fallback
        location: userLocation?.address || 'Location not available',
        location_coords: userLocation?.coords || null,
        property_type: roomCounts.bedrooms > 0 ? 'apartment' : 'studio',
        guests: Math.max(roomCounts.bedrooms * 2, 2),
        bedrooms: roomCounts.bedrooms || 1,
        beds: roomCounts.beds || 1,
        bathrooms: roomCounts.bathrooms || 1,
      };

      localStorage.setItem('detected_listing', JSON.stringify(listingData));
      router.push('/sell/review');
    }
  };

  const handleToggleList = () => {
    setShowAmenitiesList((prev) => !prev);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Instructions Popup */}
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
                  Real-Time Room Scan
                </h2>

                <p className="text-white/90 font-hind text-base leading-relaxed mb-2">
                  Walk slowly through your property with your phone.
                </p>
                <p className="text-white/90 font-hind text-base leading-relaxed mb-2">
                  We'll automatically detect amenities in real-time using AI.
                </p>
                <p className="text-white/90 font-hind text-base leading-relaxed">
                  No need to take photos manually!
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
                    {/* Video camera icon */}
                    <rect x="40" y="70" width="100" height="80" rx="8" />
                    <path d="M140 90 L170 70 L170 150 L140 130" />
                    <circle cx="80" cy="110" r="15" />
                    <path d="M90 95 L110 110 L90 125" fill="none" />
                  </svg>
                </div>

                {/* Start Button */}
                <div className="flex justify-center mt-10">
                  <button
                    type="button"
                    onClick={handleDismissInstructions}
                    className="w-full py-4 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/40 hover:scale-105 transition-all duration-300 shadow-lg active:scale-95"
                  >
                    <span className="text-white font-hind font-semibold text-lg">
                      Start Scanning
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera View */}
      {!showInstructions && (
        <>
          {/* Live Camera Feed Background */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Overlay canvas for bounding boxes and labels */}
          <canvas
            ref={overlayCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
          />

          {/* Back Button - Top Left */}
          <button
            type="button"
            onClick={handleBack}
            className="absolute top-6 left-6 z-50 w-12 h-12 rounded-full bg-black/50 backdrop-blur-xl border border-white/30 hover:bg-black/70 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
          </button>

          {/* Scanning Status Indicator - Top Right */}
          {isScanning && (
            <div className="absolute top-6 right-6 z-30 px-4 py-2 rounded-full bg-red-500/80 backdrop-blur-xl border border-white/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-white font-hind text-xs font-semibold">
                  REC
                </span>
              </div>
            </div>
          )}

          {/* New Amenity Toast Notification */}
          {newAmenityToast && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 px-6 py-3 rounded-full bg-white/90 backdrop-blur-xl border border-white/30 shadow-lg animate-fade-in">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-black font-hind text-sm font-semibold">
                  {newAmenityToast} detected!
                </span>
              </div>
            </div>
          )}

          {/* Navigation Guide */}
          {navigationGuide && (
            <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-30 px-6 py-3 rounded-2xl bg-blue-500/90 backdrop-blur-xl border border-blue-400/30 shadow-lg max-w-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-white font-hind text-sm">
                  {navigationGuide}
                </span>
              </div>
            </div>
          )}

          {/* Processing indicator when detecting */}
          {isProcessing && (
            <div className="absolute top-6 left-6 z-30 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-white font-hind text-xs">
                  Analyzing...
                </span>
              </div>
            </div>
          )}

          {/* 3-Button Bottom Controls */}
          <div className="absolute bottom-12 left-0 right-0 z-30 px-6">
            <div className="flex items-center justify-center gap-8">
              {/* Camera Button - Manual Capture */}
              <button
                type="button"
                onClick={handleCameraClick}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
                aria-label="Capture frame"
              >
                <Camera className="w-7 h-7 text-white" strokeWidth={2} />
              </button>

              {/* Stop Button - Finalize and Navigate */}
              <button
                type="button"
                onClick={handleStopScanning}
                disabled={detectedAmenities.size === 0}
                className="w-16 h-16 rounded-full bg-red-500/80 backdrop-blur-xl border border-white/30 hover:bg-red-500 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Stop and finalize"
              >
                <Square className="w-7 h-7 text-white fill-white" strokeWidth={2} />
              </button>

              {/* List Button - Toggle Amenities Panel */}
              <button
                type="button"
                onClick={handleToggleList}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
                aria-label="Show amenities list"
              >
                <List className="w-7 h-7 text-white" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Slide-up Amenities Panel */}
          <div
            className={`absolute left-0 right-0 bottom-0 z-40 transition-transform duration-300 ease-in-out ${
              showAmenitiesList ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            <div className="bg-black/90 backdrop-blur-2xl border-t border-white/20 rounded-t-3xl p-6 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-melodrame italic text-white">
                  Detected Amenities
                </h3>
                <button
                  type="button"
                  onClick={handleToggleList}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 rotate-90" />
                </button>
              </div>

              <p className="text-white/60 font-hind text-sm mb-4">
                {detectedAmenities.size} amenities detected from {frameCount} frames
              </p>

              {detectedAmenities.size > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from(detectedAmenities).map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/20"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                      <span className="text-white font-hind text-sm truncate">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/50 font-hind text-sm text-center py-8">
                  Start scanning to detect amenities
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
