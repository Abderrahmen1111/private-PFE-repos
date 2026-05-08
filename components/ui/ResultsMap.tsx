'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Business } from '@/types/business';

interface ResultsMapProps {
  businesses: Business[];
  /** ID of the business to highlight (hover or click). Syncs list ↔ map. */
  activeBusinessId?: string;
  onMarkerClick?: (businessId: string) => void;
  /** Search location query (e.g. city name) – used to center map when results have no/different coords */
  searchLocation?: string;
}

// Access token should be in .env.local
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ;

const DEFAULT_CENTER: [number, number] = [10.1815, 36.8065]; // Tunis fallback [lng, lat] for Mapbox
const DEFAULT_ZOOM = 6;

export default function ResultsMap({
  businesses,
  activeBusinessId,
  onMarkerClick,
  searchLocation,
}: ResultsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [mapLoaded, setMapLoaded] = useState(false);

  // ——— 1. Initialize Map ———
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Premium dark style
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    map.on('load', () => {
      setMapLoaded(true);
      mapRef.current = map;
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ——— 2. Handle Markers and Centering ———
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const map = mapRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    if (businesses.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    businesses.forEach((business) => {
      const { lat, lng } = business.location;
      
      if (!lat || !lng) return;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.backgroundColor = '#ef4444';
      el.style.border = '3px solid white';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      el.style.transition = 'all 0.2s';

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="min-width: 150px; padding: 5px;">
                <h3 style="font-weight: 600; margin-bottom: 4px; color: #1f2937;">${business.name}</h3>
                <p style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">${business.category}</p>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="font-size: 12px; font-weight: 600; color: #f59e0b;">${business.rating}</span>
                  <span style="font-size: 12px; color: #9ca3af;">⭐</span>
                </div>
              </div>
            `)
        )
        .addTo(map);

      el.addEventListener('click', () => {
        onMarkerClick?.(business.id);
      });

      markersRef.current[business.id] = marker;
      bounds.extend([lng, lat]);
    });

    if (businesses.length > 0) {
      map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }
  }, [businesses, mapLoaded]);

  // ——— 3. Handle Active Business Highlight ———
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !activeBusinessId) return;

    const activeMarker = markersRef.current[activeBusinessId];
    if (activeMarker) {
      const el = activeMarker.getElement();
      el.style.backgroundColor = '#3b82f6';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.zIndex = '10';

      const lngLat = activeMarker.getLngLat();
      mapRef.current.flyTo({
        center: lngLat,
        zoom: 15,
        essential: true,
        duration: 1000
      });

      activeMarker.togglePopup();
    }

    // Reset others
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      if (id !== activeBusinessId) {
        const el = marker.getElement();
        el.style.backgroundColor = '#ef4444';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.zIndex = '1';
        if (marker.getPopup()?.isOpen()) marker.togglePopup();
      }
    });
  }, [activeBusinessId, mapLoaded]);

  return (
    <div className="h-full w-full relative">
      <div ref={mapContainerRef} className="w-full h-full rounded-xl shadow-2xl border border-white/10" />
      
      {/* Map Overlay for Premium Look */}
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
        <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Mapbox Premium Engine</span>
      </div>
    </div>
  );
}
