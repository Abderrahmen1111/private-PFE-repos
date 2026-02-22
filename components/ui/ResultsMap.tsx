'use client';

import { useEffect, useRef } from 'react';
import { Business } from '@/types/business';

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
        // Calculate center point or default to Tunis
        let avgLat = 36.8065;
        let avgLng = 10.1815;

        const validBusinesses = businesses.filter(b =>
          typeof b.location?.lat === 'number' && !isNaN(b.location.lat) &&
          typeof b.location?.lng === 'number' && !isNaN(b.location.lng)
        );

        if (validBusinesses.length > 0) {
          avgLat = validBusinesses.reduce((sum, b) => sum + b.location.lat, 0) / validBusinesses.length;
          avgLng = validBusinesses.reduce((sum, b) => sum + b.location.lng, 0) / validBusinesses.length;
        }

        // Initialize map
        const map = L.map(mapRef.current, {
          attributionControl: false
        }).setView([avgLat, avgLng], validBusinesses.length > 0 ? 11 : 6);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

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

  const geocodedCacheRef = useRef<Map<string, { lat: number, lng: number }>>(new Map());

  // Background geocoding process
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isCancelled = false;
    const processGeocoding = async () => {
      // Find businesses that need geocoding
      const queue = businesses.filter(b => {
        const isDefault = (b.location.lat === 36.8065 && b.location.lng === 10.1815);
        return isDefault && !geocodedCacheRef.current.has(b.id);
      });

      for (const business of queue) {
        if (isCancelled) break;

        try {
          const query = encodeURIComponent(`${business.name}, ${business.location.address}`);
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
            headers: { 'User-Agent': 'PhantomMarketplace/1.0' }
          });
          const results = await response.json();

          if (results && results.length > 0 && !isCancelled) {
            const lat = parseFloat(results[0].lat);
            const lng = parseFloat(results[0].lon);

            geocodedCacheRef.current.set(business.id, { lat, lng });

            // Update marker on map immediately if it exists
            const marker = markersRef.current.get(business.id);
            if (marker) {
              marker.setLatLng([lat, lng]);
            }
          }
        } catch (err) {
          console.error(`Error geocoding ${business.name}:`, err);
        }

        // Wait 1 second before next request to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    };

    processGeocoding();

    return () => {
      isCancelled = true;
    };
  }, [businesses]);

  // Update marker styles when highlighted changes
  useEffect(() => {
    if (typeof window === 'undefined' || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

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

      const handleHighlight = async (id: string) => {
        const marker = markersRef.current.get(id);
        if (!marker) return;

        marker.setIcon(createIcon(true));
        marker.setZIndexOffset(1000);

        const business = businesses.find(b => b.id === id);
        if (!business) return;

        let targetLat = business.location.lat;
        let targetLng = business.location.lng;

        // Use cached coordinates if available
        if (geocodedCacheRef.current.has(id)) {
          const cached = geocodedCacheRef.current.get(id)!;
          targetLat = cached.lat;
          targetLng = cached.lng;
        }

        // Move marker to real location if it changed
        marker.setLatLng([targetLat, targetLng]);

        // Pan to location
        map.flyTo([targetLat, targetLng], 14, {
          animate: true,
          duration: 0.5
        });

        marker.openPopup();
      };

      markersRef.current.forEach((marker, id) => {
        if (highlightedId === id) {
          handleHighlight(id);
        } else {
          marker.setIcon(createIcon(false));
          marker.setZIndexOffset(0);
        }
      });
    };

    updateMarkers();
  }, [highlightedId, businesses]);




  return (
    <div className="h-full w-full">
      <div ref={mapRef} className="w-full h-full rounded-lg shadow-lg" />
    </div>
  );
}