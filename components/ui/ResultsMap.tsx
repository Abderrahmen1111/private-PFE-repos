'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Business } from '@/types/business';
import { toast } from 'sonner';

interface ResultsMapProps {
  businesses: Business[];
  /** ID of the business to highlight (hover or click). Syncs list ↔ map. */
  activeBusinessId?: string;
  onMarkerClick?: (businessId: string) => void;
  /** Search location query (e.g. city name) – used to center map when results have no/different coords */
  searchLocation?: string;
}

// Access token should be in .env.local
// It will be assigned inside the component to ensure dynamic env loading works

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
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // ——— 1. Initialize Map ———
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    mapboxgl.accessToken = token;

    if (!token) {
      console.error('MAPBOX TOKEN IS MISSING');
      toast.error('Erreur: Jeton Mapbox introuvable. Redémarrez le serveur si vous venez de l\'ajouter.');
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12', // Standard clear/streets style
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    map.on('load', () => {
      setMapLoaded(true);
      mapRef.current = map;
      map.resize(); // Fix potential issue where map container was 0 height initially
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add Geolocate control which also adds the default blue dot, but we will make a custom one below as requested
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });
    
    // We don't add it to the map visually to avoid duplicate markers, we'll handle geolocation ourselves

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ——— 1.5 Get User Location ———
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          
          if (!userMarkerRef.current) {
            // Create custom red pulsing marker for user
            const el = document.createElement('div');
            el.className = 'user-marker';
            el.style.width = '20px';
            el.style.height = '20px';
            el.style.backgroundColor = '#3b82f6';
            el.style.border = '3px solid white';
            el.style.borderRadius = '50%';
            el.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.6)';
            
            // Add pulse animation
            const style = document.createElement('style');
            style.innerHTML = `
              @keyframes user-pulse {
                0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
                70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
                100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
              }
              .user-marker {
                animation: user-pulse 2s infinite;
              }
            `;
            document.head.appendChild(style);

            userMarkerRef.current = new mapboxgl.Marker(el)
              .setLngLat([longitude, latitude])
              .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<div style="color:black;font-weight:bold;">Ma position</div>'))
              .addTo(mapRef.current!);
          } else {
            userMarkerRef.current.setLngLat([longitude, latitude]);
          }

          // If no businesses are passed, center on user
          if (businesses.length === 0) {
            mapRef.current!.flyTo({ center: [longitude, latitude], zoom: 12 });
          }
        },
        (error) => {
          console.warn('Geolocation error:', error);
          if (error.code === error.PERMISSION_DENIED) {
            toast.error('Veuillez activer la localisation pour voir votre position sur la carte.');
          }
          // Fallback to Tunisia is already handled by DEFAULT_CENTER
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, [mapLoaded, businesses.length]);

  // ——— 2. Handle Markers and Centering ———
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const map = mapRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    if (businesses.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    const usedCoords = new Set<string>();

    businesses.forEach((business) => {
      let lat = business.location?.lat;
      let lng = business.location?.lng;
      
      // Fallback to Tunis with Jitter if no coordinates (to avoid the "single point" issue)
      if (!lat || !lng) {
        lat = 36.8065 + (Math.random() - 0.5) * 0.05;
        lng = 10.1815 + (Math.random() - 0.5) * 0.05;
      } else {
        // Micro-jitter for exact coordinate overlaps
        const coordKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
        if (usedCoords.has(coordKey)) {
          lat += (Math.random() - 0.5) * 0.0006;
          lng += (Math.random() - 0.5) * 0.0006;
        }
        usedCoords.add(coordKey);
      }

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.alignItems = 'center';
      el.style.zIndex = '1';

      el.innerHTML = `
        <div class="marker-label" style="background: white; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; color: #1f2937; box-shadow: 0 2px 5px rgba(0,0,0,0.2); white-space: nowrap; margin-bottom: 4px; transition: all 0.2s; max-width: 120px; overflow: hidden; text-overflow: ellipsis;">
          ${business.name}
        </div>
        <div class="marker-dot" style="width: 20px; height: 20px; background-color: #ef4444; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: all 0.2s;"></div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="min-width: 150px; padding: 5px;">
                <h3 style="font-weight: 600; margin-bottom: 4px; color: #1f2937;">${business.name}</h3>
                <p style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">${business.category || 'Commerce'}</p>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="font-size: 12px; font-weight: 600; color: #f59e0b;">${business.rating || business.rating_average || 0}</span>
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
      map.fitBounds(bounds, { padding: 70, maxZoom: 15 });
    }
  }, [businesses, mapLoaded]);

  // ——— 3. Handle Active Business Highlight ———
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !activeBusinessId) return;

    const activeMarker = markersRef.current[activeBusinessId];
    if (activeMarker) {
      const el = activeMarker.getElement();
      el.style.zIndex = '10';
      
      const label = el.querySelector('.marker-label') as HTMLElement;
      if (label) {
        label.style.backgroundColor = '#3b82f6';
        label.style.color = 'white';
        label.style.transform = 'scale(1.1)';
      }
      
      const dot = el.querySelector('.marker-dot') as HTMLElement;
      if (dot) {
        dot.style.backgroundColor = '#3b82f6';
        dot.style.width = '32px';
        dot.style.height = '32px';
      }

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
        el.style.zIndex = '1';
        
        const label = el.querySelector('.marker-label') as HTMLElement;
        if (label) {
          label.style.backgroundColor = 'white';
          label.style.color = '#1f2937';
          label.style.transform = 'scale(1)';
        }
        
        const dot = el.querySelector('.marker-dot') as HTMLElement;
        if (dot) {
          dot.style.backgroundColor = '#ef4444';
          dot.style.width = '24px';
          dot.style.height = '24px';
        }
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
