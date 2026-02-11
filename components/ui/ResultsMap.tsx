'use client';

import { useEffect, useRef } from 'react';
import { Business } from '@/lib/mockBusinesses';

interface ResultsMapProps {
  businesses: Business[];
  highlightedId?: string;
  onMarkerClick?: (businessId: string) => void;
}

export default function ResultsMap({ businesses, highlightedId, onMarkerClick }: ResultsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamically import Leaflet only on client side
    const initMap = async () => {
    const L = (await import('leaflet')).default;

    // Load Leaflet CSS dynamically to avoid TypeScript module error
    if (typeof document !== 'undefined' && !document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
      document.head.appendChild(link);
      await new Promise<void>((resolve) => {
        link.onload = () => resolve();
      });
    }

    // Fix for default marker icons in Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current && mapRef.current) {
        // Calculate center point
        const avgLat = businesses.reduce((sum, b) => sum + b.location.lat, 0) / businesses.length;
        const avgLng = businesses.reduce((sum, b) => sum + b.location.lng, 0) / businesses.length;

        // Initialize map
        const map = L.map(mapRef.current).setView([avgLat, avgLng], 13);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      // Create custom icon for markers
      const createIcon = (isHighlighted: boolean) => {
        return L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              width: ${isHighlighted ? '28px' : '24px'};
              height: ${isHighlighted ? '28px' : '24px'};
              background-color: ${isHighlighted ? '#3b82f6' : '#ef4444'};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              transition: all 0.2s;
            "></div>
          `,
          iconSize: [isHighlighted ? 28 : 24, isHighlighted ? 28 : 24],
          iconAnchor: [isHighlighted ? 14 : 12, isHighlighted ? 14 : 12],
        });
      };

      // Add markers for each business
      businesses.forEach((business) => {
        const marker = L.marker(
          [business.location.lat, business.location.lng],
          { icon: createIcon(highlightedId === business.id) }
        ).addTo(mapInstanceRef.current);

        marker.bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="font-weight: 600; margin-bottom: 8px;">${business.name}</h3>
            <p style="font-size: 14px; color: #666; margin-bottom: 4px;">${business.category}</p>
            <p style="font-size: 14px; color: #666;">Rating: ${business.rating} ⭐</p>
          </div>
        `);

        marker.on('click', () => {
          onMarkerClick?.(business.id);
        });

        markersRef.current.set(business.id, marker);
      });
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [businesses]);

  // Update marker styles when highlighted changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;

      const createIcon = (isHighlighted: boolean) => {
        return L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              width: ${isHighlighted ? '28px' : '24px'};
              height: ${isHighlighted ? '28px' : '24px'};
              background-color: ${isHighlighted ? '#3b82f6' : '#ef4444'};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              transition: all 0.2s;
            "></div>
          `,
          iconSize: [isHighlighted ? 28 : 24, isHighlighted ? 28 : 24],
          iconAnchor: [isHighlighted ? 14 : 12, isHighlighted ? 14 : 12],
        });
      };

      markersRef.current.forEach((marker, id) => {
        marker.setIcon(createIcon(highlightedId === id));
      });
    };

    updateMarkers();
  }, [highlightedId]);

  return (
    <div className="h-full w-full">
      <div ref={mapRef} className="w-full h-full rounded-lg shadow-lg" />
    </div>
  );
}