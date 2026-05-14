'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from './button';
import { Search, MapPin, Loader2, Navigation } from 'lucide-react';
import { toast } from 'sonner';

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onSelect: (lat: number, lng: number) => void;
  onClose: () => void;
}

const DEFAULT_CENTER: [number, number] = [10.1815, 36.8065]; // Tunis

export default function MapPicker({
  initialLat,
  initialLng,
  onSelect,
  onClose,
}: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLng, initialLat] : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: selectedCoords || DEFAULT_CENTER,
      zoom: selectedCoords ? 15 : 6,
      attributionControl: false,
    });

    map.on('load', () => {
      setMapLoaded(true);
      mapRef.current = map;
      map.resize();

      if (selectedCoords) {
        addOrMoveMarker(selectedCoords[0], selectedCoords[1]);
      }
    });

    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      setSelectedCoords([lng, lat]);
      addOrMoveMarker(lng, lat);
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const addOrMoveMarker = (lng: number, lat: number) => {
    if (!mapRef.current) return;

    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    } else {
      markerRef.current = new mapboxgl.Marker({ draggable: true, color: '#10b981' })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      markerRef.current.on('dragend', () => {
        const lngLat = markerRef.current?.getLngLat();
        if (lngLat) {
          setSelectedCoords([lngLat.lng, lngLat.lat]);
        }
      });
    }
  };

  const handleGeolocate = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { longitude, latitude } = pos.coords;
        mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 15 });
        setSelectedCoords([longitude, latitude]);
        addOrMoveMarker(longitude, latitude);
      });
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${token}&country=TN&limit=1`
      );
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 15 });
        setSelectedCoords([lng, lat]);
        addOrMoveMarker(lng, lat);
      } else {
        toast.error('Lieu introuvable');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la recherche');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b flex items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Chercher une adresse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-emerald-500" />
          )}
        </form>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleGeolocate}
          className="rounded-full shrink-0"
        >
          <Navigation className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="bg-white/90 backdrop-blur shadow-lg rounded-full px-8"
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (selectedCoords) {
                onSelect(selectedCoords[1], selectedCoords[0]);
                onClose();
              } else {
                toast.error('Veuillez sélectionner un point sur la carte');
              }
            }}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-lg rounded-full px-8"
          >
            Confirmer la position
          </Button>
        </div>
      </div>

      <div className="p-3 bg-gray-50 border-t flex items-center justify-center gap-2">
        <MapPin className="w-3 h-3 text-emerald-500" />
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          {selectedCoords
            ? `${selectedCoords[1].toFixed(6)}, ${selectedCoords[0].toFixed(6)}`
            : 'Cliquez sur la carte pour pointer'}
        </span>
      </div>
    </div>
  );
}
