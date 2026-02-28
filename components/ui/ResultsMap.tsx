'use client';

import { useEffect, useRef, useState } from 'react';
import { Business } from '@/types/business';

interface ResultsMapProps {
  businesses: Business[];
  /** ID of the business to highlight (hover or click). Syncs list ↔ map. */
  activeBusinessId?: string;
  onMarkerClick?: (businessId: string) => void;
  /** Search location query (e.g. city name) – used to center map when results have no/different coords */
  searchLocation?: string;
}

const DEFAULT_CENTER: [number, number] = [36.8065, 10.1815]; // Tunis fallback
const DEFAULT_ZOOM = 6;

export default function ResultsMap({
  businesses,
  activeBusinessId,
  onMarkerClick,
  searchLocation,
}: ResultsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const locationCenterRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastSearchLocationRef = useRef<string>('');
  const geocodedCacheRef = useRef<Map<string, { lat: number; lng: number }>>(new Map());
  const [mapReady, setMapReady] = useState(false);

  // ——— 1. Create map once on mount; remove on unmount ———
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    let mounted = true;
    const initMapOnce = async () => {
      const L = (await import('leaflet')).default;

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

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      if (!mounted || !mapRef.current) return;
      const map = L.map(mapRef.current, { attributionControl: false })
        .setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      mapInstanceRef.current = map;
      setMapReady(true);
    };

    initMapOnce();
    return () => {
      mounted = false;
      setMapReady(false);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current.clear();
    };
  }, []);

  // ——— 2. When map is ready and businesses/search change: update center and markers (dynamic from Supabase). ———
  useEffect(() => {
    if (typeof window === 'undefined' || !mapReady || !mapInstanceRef.current) return;

    let cancelled = false;
    const map = mapInstanceRef.current;

    const run = async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !mapInstanceRef.current) return;

    if (lastSearchLocationRef.current !== (searchLocation ?? '')) {
      lastSearchLocationRef.current = searchLocation ?? '';
      locationCenterRef.current = null;
    }

    let avgLat = DEFAULT_CENTER[0];
    let avgLng = DEFAULT_CENTER[1];

    const validBusinesses = businesses.filter(
      (b) =>
        typeof b.location?.lat === 'number' &&
        !isNaN(b.location.lat) &&
        typeof b.location?.lng === 'number' &&
        !isNaN(b.location.lng)
    );

    const allSameDefault =
      validBusinesses.length > 0 &&
      validBusinesses.every((b) => b.location.lat === DEFAULT_CENTER[0] && b.location.lng === DEFAULT_CENTER[1]);

    if (validBusinesses.length > 0 && !allSameDefault) {
      avgLat = validBusinesses.reduce((s, b) => s + b.location.lat, 0) / validBusinesses.length;
      avgLng = validBusinesses.reduce((s, b) => s + b.location.lng, 0) / validBusinesses.length;
    } else if (searchLocation?.trim()) {
      if (locationCenterRef.current) {
        avgLat = locationCenterRef.current.lat;
        avgLng = locationCenterRef.current.lng;
      } else {
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLocation.trim())}&limit=1`,
          { headers: { 'User-Agent': 'PhantomMarketplace/1.0' } }
        )
          .then((r) => r.json())
          .then((data: any) => {
            if (data?.[0]) {
              const lat = parseFloat(data[0].lat);
              const lng = parseFloat(data[0].lon);
              locationCenterRef.current = { lat, lng };
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setView([lat, lng], 11, { animate: true });
              }
            }
          })
          .catch((e) => console.error('Geocode search location:', e));
      }
    }

    const zoom = validBusinesses.length > 0 ? 11 : DEFAULT_ZOOM;
    map.setView([avgLat, avgLng], zoom, { animate: true });

    // Clear existing markers only; keep map instance
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    const createIcon = (isActive: boolean) =>
      L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: ${isActive ? '28px' : '24px'};
            height: ${isActive ? '28px' : '24px'};
            background-color: ${isActive ? '#3b82f6' : '#ef4444'};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            transition: all 0.2s;
          "></div>
        `,
        iconSize: [isActive ? 28 : 24, isActive ? 28 : 24],
        iconAnchor: [isActive ? 14 : 12, isActive ? 14 : 12],
      });

    // Add one marker per business using coordinates from Supabase (business.location.lat/lng)
    businesses.forEach((business) => {
      const lat = business.location.lat;
      const lng = business.location.lng;
      const marker = L.marker([lat, lng], {
        icon: createIcon(false),
      }).addTo(map);

      marker.bindPopup(
        `
        <div style="min-width: 200px;">
          <h3 style="font-weight: 600; margin-bottom: 8px;">${business.name}</h3>
          <p style="font-size: 14px; color: #666; margin-bottom: 4px;">${business.category}</p>
          <p style="font-size: 14px; color: #666;">Rating: ${business.rating} ⭐</p>
        </div>
      `
      );

      marker.on('click', () => {
        onMarkerClick?.(business.id);
      });

      markersRef.current.set(business.id, marker);
    });
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [businesses, searchLocation, mapReady]);

  // ——— 3. Background geocoding for businesses with default coords (optional improvement) ———
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    const queue = businesses.filter(
      (b) =>
        b.location.lat === DEFAULT_CENTER[0] &&
        b.location.lng === DEFAULT_CENTER[1] &&
        !geocodedCacheRef.current.has(b.id)
    );
    const run = async () => {
      for (const business of queue) {
        if (cancelled) break;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              `${business.name}, ${business.location.address}`
            )}&limit=1`,
            { headers: { 'User-Agent': 'PhantomMarketplace/1.0' } }
          );
          const data = await res.json();
          if (data?.[0] && !cancelled) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            geocodedCacheRef.current.set(business.id, { lat, lng });
            const marker = markersRef.current.get(business.id);
            if (marker) marker.setLatLng([lat, lng]);
          }
        } catch (e) {
          console.error(`Geocode ${business.name}:`, e);
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [businesses]);

  // ——— 4. Sync active business: highlight marker, center map, open/close popup ———
  useEffect(() => {
    if (typeof window === 'undefined' || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const run = async () => {
      const L = (await import('leaflet')).default;

    const createIcon = (isActive: boolean) =>
      L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: ${isActive ? '28px' : '24px'};
            height: ${isActive ? '28px' : '24px'};
            background-color: ${isActive ? '#3b82f6' : '#ef4444'};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            transition: all 0.2s;
          "></div>
        `,
        iconSize: [isActive ? 28 : 24, isActive ? 28 : 24],
        iconAnchor: [isActive ? 14 : 12, isActive ? 14 : 12],
      });

    markersRef.current.forEach((marker, id) => {
      if (id === activeBusinessId) {
        marker.setIcon(createIcon(true));
        marker.setZIndexOffset(1000);
        const business = businesses.find((b) => b.id === id);
        if (business) {
          let lat = business.location.lat;
          let lng = business.location.lng;
          if (geocodedCacheRef.current.has(id)) {
            const c = geocodedCacheRef.current.get(id)!;
            lat = c.lat;
            lng = c.lng;
          }
          marker.setLatLng([lat, lng]);
          map.flyTo([lat, lng], 14, { animate: true, duration: 0.5 });
          marker.openPopup();
        }
      } else {
        marker.setIcon(createIcon(false));
        marker.setZIndexOffset(0);
        marker.closePopup();
      }
    });
    };

    run();
  }, [activeBusinessId, businesses]);

  return (
    <div className="h-full w-full">
      <div ref={mapRef} className="w-full h-full rounded-lg shadow-lg" />
    </div>
  );
}
