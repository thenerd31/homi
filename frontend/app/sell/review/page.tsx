'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Minus, Check, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyMap from '../../components/PropertyMap';

// Icons for amenities
const TVIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="2" y="7" width="20" height="13" rx="2" strokeWidth="2"/>
    <line x1="17" y1="21" x2="7" y2="21" strokeWidth="2"/>
  </svg>
);

const KitchenIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="3" width="6" height="6" rx="1" strokeWidth="2"/>
    <rect x="15" y="3" width="6" height="6" rx="1" strokeWidth="2"/>
    <rect x="3" y="15" width="6" height="6" rx="1" strokeWidth="2"/>
    <rect x="15" y="15" width="6" height="6" rx="1" strokeWidth="2"/>
  </svg>
);

const ProjectorIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="2" y="8" width="16" height="10" rx="2" strokeWidth="2"/>
    <circle cx="10" cy="13" r="3" strokeWidth="2"/>
    <path d="M18 13h4" strokeWidth="2"/>
    <path d="M20 15l2 2" strokeWidth="2"/>
    <path d="M20 11l2-2" strokeWidth="2"/>
  </svg>
);

const LaundryIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="2" width="18" height="20" rx="2" strokeWidth="2"/>
    <circle cx="12" cy="13" r="5" strokeWidth="2"/>
    <circle cx="8" cy="6" r="1" fill="currentColor"/>
    <circle cx="12" cy="6" r="1" fill="currentColor"/>
  </svg>
);

const PoolIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M2 15c1.67 0 2.5.83 4.17.83S8.33 15 10 15s2.5.83 4.17.83S16.33 15 18 15s2.5.83 4.17.83" strokeWidth="2"/>
    <path d="M2 19c1.67 0 2.5.83 4.17.83S8.33 19 10 19s2.5.83 4.17.83S16.33 19 18 19s2.5.83 4.17.83" strokeWidth="2"/>
    <path d="M14 10l-4-4 4-4" strokeWidth="2"/>
  </svg>
);

const FitnessIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" strokeWidth="2"/>
    <circle cx="6.5" cy="6.5" r="2.5" strokeWidth="2"/>
    <circle cx="17.5" cy="6.5" r="2.5" strokeWidth="2"/>
    <circle cx="6.5" cy="17.5" r="2.5" strokeWidth="2"/>
    <circle cx="17.5" cy="17.5" r="2.5" strokeWidth="2"/>
  </svg>
);

const ParkingIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
    <path d="M9 7h4a3 3 0 010 6H9V7zM9 13v4" strokeWidth="2"/>
  </svg>
);

interface RoomData {
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
}

interface Amenity {
  id: string;
  name: string;
  icon: JSX.Element;
}

const allAmenities: Amenity[] = [
  { id: 'tv', name: 'TV', icon: <TVIcon /> },
  { id: 'kitchen', name: 'Kitchen', icon: <KitchenIcon /> },
  { id: 'projector', name: 'Projector', icon: <ProjectorIcon /> },
  { id: 'laundry', name: 'Laundry', icon: <LaundryIcon /> },
  { id: 'pool', name: 'Swimming Pool', icon: <PoolIcon /> },
  { id: 'fitness', name: 'Fitness Center', icon: <FitnessIcon /> },
  { id: 'parking', name: 'Parking', icon: <ParkingIcon /> },
];

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [scanDataLoaded, setScanDataLoaded] = useState(false);
  const [fetchedScanData, setFetchedScanData] = useState<any>(null);

  // Fetch scan data from backend if scan_session param exists
  useEffect(() => {
    const scanSession = searchParams.get('scan_session');
    console.log('🔍 Checking for scan_session param:', scanSession);

    if (scanSession && !scanDataLoaded) {
      console.log('📡 Fetching scan data from backend for session:', scanSession);

      fetch(`http://localhost:8000/api/scan/retrieve/${scanSession}`)
        .then(res => res.json())
        .then(data => {
          console.log('✅ Received scan data from backend:', data);
          if (data.success && data.data) {
            setFetchedScanData(data.data);
            setScanDataLoaded(true);
          }
        })
        .catch(err => {
          console.error('❌ Error fetching scan data:', err);
          setScanDataLoaded(true); // Mark as loaded even if error to prevent retry
        });
    }
  }, [searchParams, scanDataLoaded]);

  // Parse initial data from URL params, fetched scan data, or localStorage
  const getInitialData = () => {
    // Priority 1: Use fetchedScanData if available
    if (fetchedScanData) {
      console.log('🎯 Using fetched scan data:', fetchedScanData);
      return {
        title: '',
        location: '8375 Fremont St, San Francisco, CA, 00000',
        guests: Math.max((fetchedScanData.summary?.bedrooms || 1) * 2, 2),
        bedrooms: fetchedScanData.summary?.bedrooms || 1,
        beds: fetchedScanData.summary?.bedrooms || 1,
        bathrooms: fetchedScanData.summary?.bathrooms || 1,
        amenities: fetchedScanData.amenities || [],
        price: 168,
        photos: fetchedScanData.images ? fetchedScanData.images.map((img: any) => img.image) : [],
        fromScan: true,
        scanData: {
          amenities_detected: fetchedScanData.amenities || [],
          photos: fetchedScanData.images ? fetchedScanData.images.map((img: any) => img.image) : [],
          property_type: fetchedScanData.summary?.property_type || 'apartment',
          bedrooms: fetchedScanData.summary?.bedrooms || 1,
          bathrooms: fetchedScanData.summary?.bathrooms || 1,
          guests: Math.max((fetchedScanData.summary?.bedrooms || 1) * 2, 2),
          beds: fetchedScanData.summary?.bedrooms || 1,
          objects_detected: fetchedScanData.objects_detected || {},
          room_breakdown: fetchedScanData.room_breakdown || {},
        },
      };
    }

    // Priority 2: Try to get data from URL params
    const urlTitle = searchParams.get('title');
    const urlLocation = searchParams.get('location');
    const urlGuests = searchParams.get('guests');
    const urlBedrooms = searchParams.get('bedrooms');
    const urlBeds = searchParams.get('beds');
    const urlBathrooms = searchParams.get('bathrooms');
    const urlAmenities = searchParams.get('amenities');
    const urlPrice = searchParams.get('price');

    // If URL params exist, use them
    if (urlTitle || urlLocation) {
      return {
        title: urlTitle || 'Sunny Studio in Downtown SF',
        location: urlLocation || '8375 Fremont St, San Francisco, CA, 00000',
        guests: urlGuests ? parseInt(urlGuests) : 6,
        bedrooms: urlBedrooms ? parseInt(urlBedrooms) : 2,
        beds: urlBeds ? parseInt(urlBeds) : 3,
        bathrooms: urlBathrooms ? parseInt(urlBathrooms) : 1,
        amenities: urlAmenities ? urlAmenities.split(',') : ['tv', 'kitchen', 'projector'],
        price: urlPrice ? parseInt(urlPrice) : 168,
        photos: [],
        fromScan: false,
      };
    }

    // Otherwise try localStorage
    if (typeof window !== 'undefined') {
      // Debug: Log ALL localStorage keys
      console.log('🔑 All localStorage keys:', Object.keys(localStorage));
      console.log('📦 localStorage contents:');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          console.log(`  ${key}:`, localStorage.getItem(key)?.substring(0, 100) + '...');
        }
      }

      // Try detected_listing from scan page first
      const detectedListing = localStorage.getItem('detected_listing');
      console.log('🔍 detected_listing value:', detectedListing ? 'EXISTS' : 'NULL/UNDEFINED');

      if (detectedListing) {
        const parsed = JSON.parse(detectedListing);
        console.log('🔍 DEBUG: Raw scan data from localStorage:', parsed);
        console.log('📸 Photos found:', parsed.photos?.length || 0);
        console.log('🏷️ Amenities detected:', parsed.amenities_detected || []);

        return {
          title: parsed.title || '',
          location: parsed.location || '8375 Fremont St, San Francisco, CA, 00000',
          guests: parsed.guests || 6,
          bedrooms: parsed.bedrooms || 2,
          beds: parsed.beds || 3,
          bathrooms: parsed.bathrooms || 1,
          amenities: parsed.amenities_detected || parsed.amenities || ['tv', 'kitchen', 'projector'],
          price: parsed.suggested_price || parsed.price || 168,
          photos: parsed.photos || [],
          fromScan: true,
          scanData: parsed, // Keep full scan data for AI analysis
        };
      }

      // Fall back to propertyData from manual upload
      const storedData = localStorage.getItem('propertyData');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        return {
          title: parsed.title || 'Sunny Studio in Downtown SF',
          location: parsed.location || '8375 Fremont St, San Francisco, CA, 00000',
          guests: parsed.guests || 6,
          bedrooms: parsed.bedrooms || 2,
          beds: parsed.beds || 3,
          bathrooms: parsed.bathrooms || 1,
          amenities: parsed.amenities || ['tv', 'kitchen', 'projector'],
          price: parsed.price || 168,
          photos: parsed.photos || [],
          fromScan: false,
        };
      }
    }

    // Default fallback
    return {
      title: 'Sunny Studio in Downtown SF',
      location: '8375 Fremont St, San Francisco, CA, 00000',
      guests: 6,
      bedrooms: 2,
      beds: 3,
      bathrooms: 1,
      amenities: ['tv', 'kitchen', 'projector'],
      price: 168,
      photos: [],
      fromScan: false,
    };
  };

  const initialData = getInitialData();

  // Property Information (can be updated from video analysis)
  const [propertyTitle, setPropertyTitle] = useState(initialData.title);
  const [propertyLocation, setPropertyLocation] = useState(initialData.location);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [tempLocation, setTempLocation] = useState(initialData.location);

  // Step 1: Room Information
  const [roomData, setRoomData] = useState<RoomData>({
    guests: initialData.guests,
    bedrooms: initialData.bedrooms,
    beds: initialData.beds,
    bathrooms: initialData.bathrooms,
  });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialData.amenities);

  // Step 2: Dates
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Step 3: Pricing
  const [price, setPrice] = useState(initialData.price);
  const [isDraggingPrice, setIsDraggingPrice] = useState(false);
  const priceMin = 76;
  const priceMax = 310;

  // Step 4: Questions
  const [questionsAnswered, setQuestionsAnswered] = useState<{
    summary: boolean | null;
    selfCheckin: boolean | null;
    keyAccess: boolean | null;
  }>({
    summary: null,
    selfCheckin: null,
    keyAccess: null,
  });

  // Photos
  const [photos, setPhotos] = useState<string[]>(initialData.photos || []);
  const [coverPhotoIndex, setCoverPhotoIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat input and messages
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  // AI analysis loading state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const incrementRoomValue = (key: keyof RoomData) => {
    setRoomData(prev => ({ ...prev, [key]: prev[key] + 1 }));
  };

  const decrementRoomValue = (key: keyof RoomData) => {
    setRoomData(prev => ({ ...prev, [key]: Math.max(0, prev[key] - 1) }));
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    // If we removed the cover photo, reset to first photo
    if (index === coverPhotoIndex) {
      setCoverPhotoIndex(0);
    } else if (index < coverPhotoIndex) {
      // Adjust cover index if we removed a photo before it
      setCoverPhotoIndex(prev => prev - 1);
    }
  };

  const setCoverPhoto = (index: number) => {
    // Reorder photos array to put selected photo first
    const newPhotos = [...photos];
    const [selectedPhoto] = newPhotos.splice(index, 1);
    newPhotos.unshift(selectedPhoto);
    setPhotos(newPhotos);
    setCoverPhotoIndex(0);
  };

  // Calendar functions
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);

    if (!startDate || (startDate && endDate)) {
      // First click: set start date and clear end date
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (startDate && !endDate) {
      // Second click: set end date
      if (clickedDate >= startDate) {
        setEndDate(clickedDate);
      } else {
        // If clicked date is before start date, swap them
        setEndDate(startDate);
        setStartDate(clickedDate);
      }
    }
  };

  const isDateInRange = (day: number) => {
    if (!startDate) return false;
    const date = new Date(currentYear, currentMonth, day);
    if (endDate) {
      return date >= startDate && date <= endDate;
    }
    return date.getTime() === startDate.getTime();
  };

  const isDateStart = (day: number) => {
    if (!startDate) return false;
    const date = new Date(currentYear, currentMonth, day);
    return date.getTime() === startDate.getTime();
  };

  const isDateEnd = (day: number) => {
    if (!endDate) return false;
    const date = new Date(currentYear, currentMonth, day);
    return date.getTime() === endDate.getTime();
  };

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Price slider functions
  const handlePriceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const slider = document.getElementById('price-slider');
    if (slider) {
      const rect = slider.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newPrice = Math.round(priceMin + percentage * (priceMax - priceMin));
      setPrice(newPrice);
    }
  };

  const handlePriceMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingPrice(true);
    // Also update price on initial click
    handlePriceClick(e as React.MouseEvent<HTMLDivElement>);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingPrice) {
        const slider = document.getElementById('price-slider');
        if (slider) {
          const rect = slider.getBoundingClientRect();
          const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          const newPrice = Math.round(priceMin + percentage * (priceMax - priceMin));
          setPrice(newPrice);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingPrice(false);
    };

    if (isDraggingPrice) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPrice, priceMin, priceMax]);

  // Save price to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('propertyData');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        parsed.price = price;
        localStorage.setItem('propertyData', JSON.stringify(parsed));
      }
    }
  }, [price]);

  // Analyze scan data with AI when fetchedScanData loads
  useEffect(() => {
    const analyzeScanData = async () => {
      console.log('🔄 AI analysis useEffect running...');
      console.log('  fetchedScanData:', !!fetchedScanData);
      console.log('  analysisComplete:', analysisComplete);
      console.log('  isAnalyzing:', isAnalyzing);

      // Only run if we have fetched scan data and haven't analyzed yet
      if (!fetchedScanData || analysisComplete || isAnalyzing) {
        console.log('⏭️ Skipping AI analysis (conditions not met)');
        return;
      }

      // Prepare scan data in the format the backend expects
      const scanData = {
        amenities_detected: fetchedScanData.amenities || [],
        property_type: fetchedScanData.summary?.property_type || 'apartment',
        bedrooms: fetchedScanData.summary?.bedrooms || 1,
        bathrooms: fetchedScanData.summary?.bathrooms || 1,
        guests: Math.max((fetchedScanData.summary?.bedrooms || 1) * 2, 2),
        beds: fetchedScanData.summary?.bedrooms || 1,
        objects_detected: fetchedScanData.objects_detected || {},
        room_breakdown: fetchedScanData.room_breakdown || {},
      };

      console.log('🤖 Starting AI analysis of scan data...');
      console.log('📦 Scan data being sent:', scanData);
      setIsAnalyzing(true);

      try {
        const response = await fetch('http://localhost:8000/api/analyze-scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scan_data: scanData,
            location: propertyLocation,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze scan data');
        }

        const data = await response.json();
        console.log('✅ AI analysis complete:', data);
        console.log('  Title:', data.title);
        console.log('  Price:', data.suggested_price);
        console.log('  Amenities:', data.amenities);

        // Update state with AI-generated content
        if (data.title && data.title !== '') {
          console.log('📝 Updating title from:', propertyTitle, 'to:', data.title);
          setPropertyTitle(data.title);
        } else {
          console.log('⚠️ No title in response or empty');
        }

        if (data.suggested_price) {
          console.log('💰 Updating price from:', price, 'to:', data.suggested_price);
          setPrice(data.suggested_price);
        } else {
          console.log('⚠️ No suggested_price in response');
        }

        if (data.amenities && data.amenities.length > 0) {
          console.log('🏷️ Updating amenities from:', selectedAmenities, 'to:', data.amenities);
          setSelectedAmenities(data.amenities);
        } else {
          console.log('⚠️ No amenities in response or empty array');
        }

        setAnalysisComplete(true);
      } catch (error) {
        console.error('❌ Error analyzing scan data:', error);
        if (error instanceof Error) {
          console.error('  Error message:', error.message);
          console.error('  Error stack:', error.stack);
        }
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeScanData();
  }, [fetchedScanData]); // Run when fetchedScanData loads

  // Update state when fetchedScanData loads
  useEffect(() => {
    if (fetchedScanData) {
      console.log('📸 Updating photos from fetched scan data:', fetchedScanData.images?.length || 0);
      if (fetchedScanData.images) {
        const photoUrls = fetchedScanData.images.map((img: any) => img.image);
        setPhotos(photoUrls);
      }

      console.log('🏷️ Updating amenities from fetched scan data:', fetchedScanData.amenities);
      if (fetchedScanData.amenities) {
        // Will be updated by AI analysis, but set initial values
        // The AI analysis will map these to UI amenity IDs
      }

      console.log('🏠 Updating room data from fetched scan data');
      if (fetchedScanData.summary) {
        setRoomData({
          guests: Math.max((fetchedScanData.summary.bedrooms || 1) * 2, 2),
          bedrooms: fetchedScanData.summary.bedrooms || 1,
          beds: fetchedScanData.summary.bedrooms || 1,
          bathrooms: fetchedScanData.summary.bathrooms || 1,
        });
      }
    }
  }, [fetchedScanData]);

  const handlePublish = () => {
    // Save final listing data to localStorage for success page
    const publishedListing = {
      title: propertyTitle,
      location: propertyLocation,
      price: price,
      coverPhoto: photos[0] || null,
      guests: roomData.guests,
      bedrooms: roomData.bedrooms,
      beds: roomData.beds,
      bathrooms: roomData.bathrooms,
      amenities: selectedAmenities,
      availability: startDate && endDate ? {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      } : null,
    };

    localStorage.setItem('publishedListing', JSON.stringify(publishedListing));
    router.push('/sell/review/success');
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();

    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    // Clear input immediately
    setChatInput('');

    try {
      // Build current listing data from state
      const currentListing = {
        title: propertyTitle,
        location: propertyLocation,
        guests: roomData.guests,
        bedrooms: roomData.bedrooms,
        beds: roomData.beds,
        bathrooms: roomData.bathrooms,
        amenities: selectedAmenities,
        photos: photos,
        price: price,
      };

      // Build conversation history (last 5 messages)
      const conversationHistory = chatMessages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call seller chatbot API
      const response = await fetch('http://localhost:8000/api/seller/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seller_message: userMessage,
          current_listing: currentListing,
          conversation_history: conversationHistory,
          current_stage: 'review_listing',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get chatbot response');
      }

      const data = await response.json();

      // Debug: Log the response
      console.log('📥 Chatbot response:', data);

      // Update listing if changes were made
      if (data.listing) {
        if (data.listing.title !== propertyTitle) {
          setPropertyTitle(data.listing.title);
        }
        if (data.listing.location !== propertyLocation) {
          setPropertyLocation(data.listing.location);
        }
        if (data.listing.bathrooms !== roomData.bathrooms) {
          setRoomData(prev => ({ ...prev, bathrooms: data.listing.bathrooms }));
        }
        if (data.listing.bedrooms !== roomData.bedrooms) {
          setRoomData(prev => ({ ...prev, bedrooms: data.listing.bedrooms }));
        }
        if (data.listing.beds !== roomData.beds) {
          setRoomData(prev => ({ ...prev, beds: data.listing.beds }));
        }
        if (data.listing.guests !== roomData.guests) {
          setRoomData(prev => ({ ...prev, guests: data.listing.guests }));
        }
        if (data.listing.amenities && JSON.stringify(data.listing.amenities) !== JSON.stringify(selectedAmenities)) {
          console.log('🔄 Updating amenities from:', selectedAmenities, 'to:', data.listing.amenities);
          setSelectedAmenities(data.listing.amenities);
        }
        if (data.listing.price && data.listing.price !== price) {
          console.log('💰 Updating price from listing data:', price, '→', data.listing.price);
          setPrice(data.listing.price);
        }
      }

      // Update price from pricing suggestions
      if (data.pricing_suggestions && data.pricing_suggestions.suggested_price) {
        const suggestedPrice = data.pricing_suggestions.suggested_price;
        if (suggestedPrice !== price) {
          console.log('💰 Updating price from:', price, 'to:', suggestedPrice);
          setPrice(suggestedPrice);
        }
      }

      // Update calendar dates if availability was set
      if (data.listing.availability) {
        const avail = data.listing.availability;
        if (avail.start_date && avail.end_date) {
          const start = new Date(avail.start_date);
          const end = new Date(avail.end_date);
          console.log('📅 Updating calendar dates from:', startDate, endDate, 'to:', start, end);
          setStartDate(start);
          setEndDate(end);
        }
      }

      // Check if listing is published (final confirmation approved)
      if (data.stage === 'published' || (data.stage === 'final_confirmation' && data.listing.status === 'published')) {
        console.log('🎉 Listing published! Redirecting to success page...');
        router.push('/sell/review/success');
        return;
      }

      // Add assistant's response to chat
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || 'Got it!'
      }]);

    } catch (error) {
      console.error('Chatbot error:', error);
      // Show error message
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble processing that. Please try again.'
      }]);
    }
  };

  const canProceedFromQuestions = () => {
    // Summary must be true (yes), others just need to be answered
    return questionsAnswered.summary === true &&
           questionsAnswered.selfCheckin !== null &&
           questionsAnswered.keyAccess !== null;
  };

  // Calculate nights between dates
  const calculateNights = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderProgressBar = () => {
    const steps = 4;

    return (
      <div className="w-full px-6 pt-6">
        <div className="flex gap-2 mb-6">
          {Array.from({ length: steps }).map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all ${
                index <= currentStep ? 'bg-white' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className={`flex-1 overflow-y-auto px-6 ${chatMessages.length > 0 ? 'pb-96' : 'pb-32'}`}>
      <div className="mb-6">
        <p className="text-gray-300 mb-4 text-sm">Here is what I feel in your space</p>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-light text-lg">Title : "{propertyTitle}" ✏️</p>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">City View</span>
            <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">Modern</span>
            <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">Professional</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">Inviting</span>
            <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">Simple</span>
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-6">
          Here is what I found in your space, you can fine-tune details through chat
        </p>

        <div className="mb-6">
          <p className="mb-3 font-light">Location</p>
          {isEditingLocation ? (
            <div className="mb-4">
              <input
                type="text"
                value={tempLocation}
                onChange={(e) => setTempLocation(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-gray-500 mb-2"
                placeholder="Enter address..."
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPropertyLocation(tempLocation);
                    setIsEditingLocation(false);
                  }}
                  className="px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempLocation(propertyLocation);
                    setIsEditingLocation(false);
                  }}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => {
                setTempLocation(propertyLocation);
                setIsEditingLocation(true);
              }}
              className="text-gray-400 text-sm mb-4 cursor-pointer hover:text-white transition flex items-center gap-2"
            >
              <span>{propertyLocation}</span>
              <span className="text-xs">✏️</span>
            </div>
          )}

          <PropertyMap location={propertyLocation} className="w-full h-64" />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-light mb-4">Room Information</h2>

        <div className="space-y-4">
          {Object.entries(roomData).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-1">
              <span className="capitalize text-gray-300">{key}</span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => decrementRoomValue(key as keyof RoomData)}
                  className="w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center hover:bg-gray-800 transition"
                  aria-label={`Decrease ${key}`}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center">{value}</span>
                <button
                  type="button"
                  onClick={() => incrementRoomValue(key as keyof RoomData)}
                  className="w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center hover:bg-gray-800 transition"
                  aria-label={`Increase ${key}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-light mb-4">Amenities</h2>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {allAmenities.map(amenity => (
            <button
              type="button"
              key={amenity.id}
              onClick={() => toggleAmenity(amenity.id)}
              className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition ${
                selectedAmenities.includes(amenity.id)
                  ? 'border-gray-600 bg-gray-900'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {amenity.icon}
              <span className="text-xs">{amenity.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-light mb-3">Photos</h2>
        <p className="text-sm text-gray-400 mb-3">Tap a photo to set as cover</p>
        <div className="grid grid-cols-2 gap-3">
          {photos.map((photo, index) => (
            <div
              key={index}
              className={`relative aspect-video rounded-xl overflow-hidden bg-gray-800 cursor-pointer transition-all ${
                index === 0 ? 'ring-2 ring-white' : 'hover:ring-2 hover:ring-gray-500'
              }`}
              onClick={() => index !== 0 && setCoverPhoto(index)}
            >
              <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-white text-black text-xs font-semibold px-2 py-1 rounded">
                  Cover
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(index);
                }}
                className="absolute top-2 right-2 w-6 h-6 bg-black bg-opacity-70 rounded-full flex items-center justify-center hover:bg-opacity-90 transition"
                aria-label="Remove photo"
              >
                <span className="text-white text-sm">×</span>
              </button>
            </div>
          ))}
          {photos.length < 4 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video rounded-xl border-2 border-dashed border-gray-700 flex items-center justify-center hover:border-gray-600 transition"
              aria-label="Add photo"
            >
              <div className="flex flex-col items-center justify-center">
                <Plus className="w-8 h-8 mb-1" />
              </div>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </div>

      <div className="mb-6 border-t border-gray-800 pt-6">
        <p className="text-gray-300 mb-4">
          Here's the summary so far — description, location, amenities, and photos.
          Everything look right?
        </p>
        <p className="text-gray-400 text-sm mb-4">
          You can make quick changes or confirm to continue.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setQuestionsAnswered(prev => ({ ...prev, summary: true }))}
            className={`flex-1 py-3 rounded-lg transition ${
              questionsAnswered.summary
                ? 'bg-white text-black'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => setQuestionsAnswered(prev => ({ ...prev, summary: false }))}
            className={`flex-1 py-3 rounded-lg transition ${
              questionsAnswered.summary === false
                ? 'bg-white text-black'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            No
          </button>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-300 mb-4">Would you like guests to self-check in?</p>
        <div className="flex gap-3">
          <button
            onClick={() => setQuestionsAnswered(prev => ({ ...prev, selfCheckin: true }))}
            className={`flex-1 py-3 rounded-lg transition ${
              questionsAnswered.selfCheckin
                ? 'bg-white text-black'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => setQuestionsAnswered(prev => ({ ...prev, selfCheckin: false }))}
            className={`flex-1 py-3 rounded-lg transition ${
              questionsAnswered.selfCheckin === false
                ? 'bg-white text-black'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            No
          </button>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-gray-300 mb-3">Will guests be able to access the keys?</p>
        <ul className="list-disc list-inside text-gray-400 text-sm mb-4 space-y-1">
          <li>Smart Lock</li>
          <li>Key Box</li>
          <li>Door Code</li>
        </ul>
        <div className="flex gap-3">
          <button
            onClick={() => setQuestionsAnswered(prev => ({ ...prev, keyAccess: true }))}
            className={`flex-1 py-3 rounded-lg transition ${
              questionsAnswered.keyAccess
                ? 'bg-white text-black'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => setQuestionsAnswered(prev => ({ ...prev, keyAccess: false }))}
            className={`flex-1 py-3 rounded-lg transition ${
              questionsAnswered.keyAccess === false
                ? 'bg-white text-black'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['m', 't', 'w', 't', 'f', 's', 's'];

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return (
      <div className={`flex-1 overflow-y-auto px-6 ${chatMessages.length > 0 ? 'pb-96' : 'pb-32'}`}>
        <p className="text-gray-300 mb-4">When would you like to host?</p>
        <p className="text-gray-400 text-sm mb-8">Tell us the time / choose from the calendar</p>

        <div className="mb-8">
          <p className="text-sm text-gray-400 mb-4">Start Date</p>
          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center font-medium text-lg">
              {startDate ? String(startDate.getDate()).padStart(2, '0') : '01'}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={previousMonth}
              className="p-2 hover:bg-gray-800 rounded-full transition"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <p className="font-medium">{monthNames[currentMonth]}</p>
              <p className="text-sm text-gray-400">{currentYear}</p>
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 hover:bg-gray-800 rounded-full transition"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-3">
            {dayNames.map((day, idx) => (
              <div key={idx} className="text-center text-xs text-gray-500 py-2 lowercase">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => (
              <button
                type="button"
                key={index}
                onClick={() => day && handleDateClick(day)}
                disabled={!day}
                aria-label={day ? `Select ${day}` : undefined}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm transition ${
                  !day
                    ? 'invisible'
                    : isDateStart(day) || isDateEnd(day)
                    ? 'bg-white text-black font-medium'
                    : isDateInRange(day)
                    ? 'bg-gray-700'
                    : new Date(currentYear, currentMonth, day) < new Date(new Date().setHours(0,0,0,0))
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'hover:bg-gray-800'
                }`}
              >
                {day || ''}
              </button>
            ))}
          </div>
        </div>

        {startDate && endDate && (
          <div className="bg-gray-800 rounded-lg p-4 mt-6">
            <p className="text-sm text-gray-400 mb-2">Selected Range</p>
            <p className="font-medium">
              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {calculateNights(startDate, endDate)} nights
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderStep3 = () => {
    const percentage = ((price - priceMin) / (priceMax - priceMin)) * 100;

    return (
      <div className={`flex-1 overflow-y-auto px-6 ${chatMessages.length > 0 ? 'pb-96' : 'pb-32'}`}>
        <p className="text-gray-300 mb-16 leading-relaxed">
          Based on your space's size, location, dates, and nearby listings, I suggest :
        </p>

        <div className="flex flex-col items-center mb-12">
          <div className="text-7xl font-light mb-12 tracking-tight" style={{ fontFamily: 'serif' }}>
            ${price}
          </div>

          <div className="w-full mb-6 px-2">
            <div
              id="price-slider"
              className="relative h-1 bg-gray-700 rounded-full cursor-pointer"
              onMouseDown={handlePriceMouseDown}
            >
              <div
                className="absolute h-1 bg-gray-600 rounded-full"
                style={{ width: `${percentage}%` }}
              ></div>
              <div
                className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing"
                style={{ left: `${percentage}%`, marginLeft: '-10px' }}
                onMouseDown={handlePriceMouseDown}
              ></div>
            </div>
          </div>

          <div className="w-full flex flex-col items-end mb-2">
            <p className="text-gray-400 text-sm">per night</p>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm mb-1">
              Calculated from 30+ nearby listings and seasonal data
            </p>
            <p className="text-gray-400 text-sm">
              Drag to adjust the price
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderStep4 = () => {
    const selectedAmenitiesData = allAmenities.filter(a => selectedAmenities.includes(a.id));

    return (
      <div className={`flex-1 overflow-y-auto px-6 ${chatMessages.length > 0 ? 'pb-96' : 'pb-32'}`}>
        <p className="text-gray-300 mb-8">Everything's ready. Let's make it live!</p>

        <div className="mb-8">
          <div className="w-full aspect-[3/4] bg-gray-800 rounded-2xl overflow-hidden mb-4 shadow-lg">
            {photos.length > 0 ? (
              <img src={photos[0]} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No cover photo
              </div>
            )}
          </div>

          <h2 className="text-xl font-medium mb-2">{propertyTitle}</h2>
          <p className="text-gray-400 text-sm mb-1">{propertyLocation}</p>
          <p className="text-gray-400 text-sm">
            {roomData.guests} guests | {roomData.bedrooms} bedroom{roomData.bedrooms !== 1 ? 's' : ''} | {roomData.beds} bed{roomData.beds !== 1 ? 's' : ''} | {roomData.bathrooms} bath{roomData.bathrooms !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-light mb-4">Amenities</h3>
          <div className="grid grid-cols-3 gap-3">
            {selectedAmenitiesData.slice(0, 6).map(amenity => (
              <div
                key={amenity.id}
                className="aspect-square rounded-xl border-2 border-gray-700 flex flex-col items-center justify-center gap-2 bg-gray-900"
              >
                {amenity.icon}
                <span className="text-xs text-center px-2">{amenity.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-light mb-3">Location</h3>
          {isEditingLocation ? (
            <div className="mb-4">
              <input
                type="text"
                value={tempLocation}
                onChange={(e) => setTempLocation(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-gray-500 mb-2"
                placeholder="Enter address..."
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPropertyLocation(tempLocation);
                    setIsEditingLocation(false);
                  }}
                  className="px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempLocation(propertyLocation);
                    setIsEditingLocation(false);
                  }}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => {
                setTempLocation(propertyLocation);
                setIsEditingLocation(true);
              }}
              className="text-gray-400 text-sm mb-4 cursor-pointer hover:text-white transition flex items-center gap-2"
            >
              <span>{propertyLocation}</span>
              <span className="text-xs">✏️</span>
            </div>
          )}
          <PropertyMap location={propertyLocation} className="w-full h-64" />
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-light mb-3">Availability</h3>
          {startDate && endDate ? (
            <p className="text-gray-400 text-sm">
              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} | {startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </p>
          ) : (
            <p className="text-gray-400 text-sm">Oct 12 - 29 | November 01 - December 25</p>
          )}
        </div>

        <button
          type="button"
          onClick={handlePublish}
          className="w-full py-4 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition mt-8"
        >
          Publish
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="sticky top-0 bg-black z-10">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-light">
            {currentStep === 0 && 'Review Details'}
            {currentStep === 1 && 'Availability'}
            {currentStep === 2 && 'Review Details'}
            {currentStep === 3 && 'Finalize Listings'}
          </h1>
          <div className="w-10"></div>
        </div>
        {renderProgressBar()}

        {/* AI Analysis Loading Indicator */}
        {isAnalyzing && (
          <div className="px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <p className="text-sm text-gray-300">AI analyzing your property scan...</p>
            </div>
          </div>
        )}
      </div>

      {currentStep === 0 && renderStep1()}
      {currentStep === 1 && renderStep2()}
      {currentStep === 2 && renderStep3()}
      {currentStep === 3 && renderStep4()}

      {/* Chat Messages */}
      {chatMessages.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 bg-black/95 border-t border-gray-800 max-h-64 overflow-y-auto p-4 space-y-3">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-white text-black'
                    : 'bg-gray-800 text-white'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask for Anything..."
            className="flex-1 bg-transparent border border-gray-700 rounded-full px-6 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
          />
          <button
            type="button"
            onClick={handleSendMessage}
            className="p-3 hover:bg-gray-900 rounded-full transition"
            aria-label="Send message"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 0 && !canProceedFromQuestions()) {
                  return;
                }
                setCurrentStep(currentStep + 1);
              }}
              disabled={currentStep === 0 && !canProceedFromQuestions()}
              className={`p-3 rounded-full transition ${
                currentStep === 0 && !canProceedFromQuestions()
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-200'
              }`}
              aria-label="Continue to next step"
            >
              <Check className={`w-6 h-6 ${currentStep === 0 && !canProceedFromQuestions() ? 'text-gray-600' : 'text-black'}`} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              className="p-3 bg-white hover:bg-gray-200 rounded-full transition"
              aria-label="Publish listing"
            >
              <Check className="w-6 h-6 text-black" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}