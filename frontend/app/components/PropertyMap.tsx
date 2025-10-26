'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import react-leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface PropertyMapProps {
  location: string;
  className?: string;
}

export default function PropertyMap({ location, className = '' }: PropertyMapProps) {
  const [coords, setCoords] = useState<{lat: number; lon: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client-side flag
    setIsClient(true);

    // Fix Leaflet marker icon issue with Next.js
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, []);

  useEffect(() => {
    // Geocode the location
    const fetchCoords = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/geocode?location=${encodeURIComponent(location)}`
        );
        const data = await response.json();
        setCoords({ lat: data.lat, lon: data.lon });
      } catch (error) {
        console.error('Geocoding error:', error);
        // Fallback to SF
        setCoords({ lat: 37.7749, lon: -122.4194 });
      } finally {
        setLoading(false);
      }
    };

    if (isClient) {
      fetchCoords();
    }
  }, [location, isClient]);

  if (loading || !coords || !isClient) {
    return (
      <div className={`bg-gray-800 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-gray-400">Loading map...</div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden shadow-lg ${className}`}>
      <MapContainer
        center={[coords.lat, coords.lon]}
        zoom={13}
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coords.lat, coords.lon]}>
          <Popup>
            <div className="text-sm">
              <strong>{location}</strong>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
