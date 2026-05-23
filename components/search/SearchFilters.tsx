'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Sliders } from 'lucide-react';

export type CategoryType = 'items' | 'businesses' | 'services' | 'reels';

interface FilterState {
  // Items filters
  priceRange: [number, number];
  condition: string[];
  deliveryAvailable: boolean;
  rating: number;
  trending: boolean;
  recentlyAdded: boolean;
  sponsored: boolean;

  // Businesses filters
  distance: number | null;
  openNow: boolean;
  verified: boolean;
  priceLevel: string[];
  fastResponse: boolean;

  // Services filters
  availability: string[];
  location: string;
  verifiedProviders: boolean;
  experience: string[];
  onHomeOrShop: string[];
  emergencyService: boolean;

  // Reels filters
  nearby: boolean;
  trending_reels: boolean;
  new: boolean;
  following: boolean;
  offers: boolean;
  videoDuration: string[];
}

interface SearchFiltersProps {
  category: CategoryType;
  onFilterChange: (filters: Partial<FilterState>) => void;
  activeFilters: Partial<FilterState>;
}

const CONDITION_OPTIONS = [
  { id: 'new', label: 'Neuf' },
  { id: 'used', label: 'Utilisé' },
];

const PRICE_LEVEL_OPTIONS = [
  { id: '$', label: '$ - Budget' },
  { id: '$$', label: '$$ - Modéré' },
  { id: '$$$', label: '$$$ - Premium' },
];

const EXPERIENCE_OPTIONS = [
  { id: '1-3', label: '1-3 ans' },
  { id: '3-5', label: '3-5 ans' },
  { id: '5+', label: '5+ ans' },
];

const LOCATION_OPTIONS = [
  { id: 'home', label: 'À domicile' },
  { id: 'shop', label: 'En boutique' },
  { id: 'both', label: 'Les deux' },
];

const VIDEO_DURATION_OPTIONS = [
  { id: 'short', label: 'Court (<30s)' },
  { id: 'medium', label: 'Moyen (30s-1m)' },
  { id: 'long', label: 'Long (>1m)' },
];

export default function SearchFilters({
  category,
  onFilterChange,
  activeFilters,
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [priceMin, setPriceMin] = useState(activeFilters.priceRange?.[0] ?? 0);
  const [priceMax, setPriceMax] = useState(activeFilters.priceRange?.[1] ?? 10000);
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    activeFilters.condition ?? []
  );
  const [selectedExperience, setSelectedExperience] = useState<string[]>(
    activeFilters.experience ?? []
  );
  const [selectedLocation, setSelectedLocation] = useState<string[]>(
    activeFilters.onHomeOrShop ?? []
  );
  const [selectedVideoDuration, setSelectedVideoDuration] = useState<string[]>(
    activeFilters.videoDuration ?? []
  );
  const [selectedPriceLevels, setSelectedPriceLevels] = useState<string[]>(
    activeFilters.priceLevel ?? []
  );
  const filterRef = useRef<HTMLDivElement>(null);

  // Update parent component when filters change
  useEffect(() => {
    onFilterChange({
      priceRange: [priceMin, priceMax],
    });
  }, [priceMin, priceMax, onFilterChange]);

  useEffect(() => {
    onFilterChange({
      condition: selectedConditions,
    });
  }, [selectedConditions, onFilterChange]);

  useEffect(() => {
    onFilterChange({
      experience: selectedExperience,
    });
  }, [selectedExperience, onFilterChange]);

  useEffect(() => {
    onFilterChange({
      onHomeOrShop: selectedLocation,
    });
  }, [selectedLocation, onFilterChange]);

  useEffect(() => {
    onFilterChange({
      videoDuration: selectedVideoDuration,
    });
  }, [selectedVideoDuration, onFilterChange]);

  useEffect(() => {
    onFilterChange({
      priceLevel: selectedPriceLevels,
    });
  }, [selectedPriceLevels, onFilterChange]);

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCondition = (conditionId: string) => {
    setSelectedConditions((prev) =>
      prev.includes(conditionId)
        ? prev.filter((c) => c !== conditionId)
        : [...prev, conditionId]
    );
  };

  const toggleExperience = (expId: string) => {
    setSelectedExperience((prev) =>
      prev.includes(expId) ? prev.filter((e) => e !== expId) : [...prev, expId]
    );
  };

  const toggleLocation = (locId: string) => {
    setSelectedLocation((prev) =>
      prev.includes(locId) ? prev.filter((l) => l !== locId) : [...prev, locId]
    );
  };

  const toggleVideoDuration = (durId: string) => {
    setSelectedVideoDuration((prev) =>
      prev.includes(durId)
        ? prev.filter((d) => d !== durId)
        : [...prev, durId]
    );
  };

  const togglePriceLevel = (levelId: string) => {
    setSelectedPriceLevels((prev) =>
      prev.includes(levelId)
        ? prev.filter((p) => p !== levelId)
        : [...prev, levelId]
    );
  };

  const resetFilters = () => {
    setPriceMin(0);
    setPriceMax(10000);
    setSelectedConditions([]);
    setSelectedExperience([]);
    setSelectedLocation([]);
    setSelectedVideoDuration([]);
    setSelectedPriceLevels([]);
    onFilterChange({
      priceRange: [0, 10000],
      condition: [],
      experience: [],
      onHomeOrShop: [],
      videoDuration: [],
      priceLevel: [],
      deliveryAvailable: false,
      openNow: false,
      verified: false,
      fastResponse: false,
      emergencyService: false,
      nearby: false,
      trending_reels: false,
      new: false,
      following: false,
      offers: false,
    });
  };

  const activeFilterCount =
    [selectedConditions.length, selectedExperience.length, selectedLocation.length, selectedVideoDuration.length, selectedPriceLevels.length].reduce(
      (a, b) => a + b,
      0
    ) + (priceMin > 0 || priceMax < 10000 ? 1 : 0);

  return (
    <div ref={filterRef} className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition-colors"
      >
        <Sliders className="w-4 h-4 text-stone-600" />
        <span className="text-sm font-medium text-stone-700">Filtres</span>
        {activeFilterCount > 0 && (
          <span className="ml-2 flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isExpanded && (
        <div className="absolute top-full mt-2 right-0 z-50 w-80 bg-white rounded-lg border border-stone-200 shadow-lg p-6 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-stone-900">Filtres</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ITEMS Filters */}
          {category === 'items' && (
            <>
              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-stone-700 mb-3">
                  Gamme de prix
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-stone-600">Min: {priceMin}€</label>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={priceMin}
                      onChange={(e) => setPriceMin(Number(e.target.value))}
                      className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-600">Max: {priceMax}€</label>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Condition */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-stone-700 mb-3">
                  État
                </label>
                <div className="space-y-2">
                  {CONDITION_OPTIONS.map((option) => (
                    <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedConditions.includes(option.id)}
                        onChange={() => toggleCondition(option.id)}
                        className="w-4 h-4 rounded border-stone-300"
                      />
                      <span className="text-sm text-stone-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Delivery Available */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.deliveryAvailable ?? false}
                    onChange={(e) =>
                      onFilterChange({ deliveryAvailable: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-stone-300"
                  />
                  <span className="text-sm font-medium text-stone-700">
                    Livraison disponible
                  </span>
                </label>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-stone-700 mb-3">
                  Note minimale
                </label>
                <select
                  value={activeFilters.rating ?? 0}
                  onChange={(e) =>
                    onFilterChange({ rating: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                >
                  <option value="0">Toutes les notes</option>
                  <option value="1">1+ étoile</option>
                  <option value="2">2+ étoiles</option>
                  <option value="3">3+ étoiles</option>
                  <option value="4">4+ étoiles</option>
                </select>
              </div>

              {/* Other toggles */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.trending ?? false}
                    onChange={(e) => onFilterChange({ trending: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300"
                  />
                  <span className="text-sm text-stone-700">Tendances</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.recentlyAdded ?? false}
                    onChange={(e) =>
                      onFilterChange({ recentlyAdded: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-stone-300"
                  />
                  <span className="text-sm text-stone-700">Récemment ajouté</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.sponsored ?? false}
                    onChange={(e) =>
                      onFilterChange({ sponsored: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-stone-300"
                  />
                  <span className="text-sm text-stone-700">Sponsorisé</span>
                </label>
              </div>
            </>
          )}

          {/* BUSINESSES Filters */}
          {category === 'businesses' && (
            <>
              {/* Distance */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-stone-700 mb-3">
                  Distance (km)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 5"
                  value={activeFilters.distance ?? ''}
                  onChange={(e) =>
                    onFilterChange({
                      distance: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              {/* Open Now */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.openNow ?? false}
                    onChange={(e) => onFilterChange({ openNow: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300"
                  />
                  <span className="text-sm font-medium text-stone-700">Ouvert maintenant</span>
                </label>
              </div>

              {/* Delivery Available */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.deliveryAvailable ?? false}
                    onChange={(e) =>
                      onFilterChange({ deliveryAvailable: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-stone-300"
                  />
                  <span className="text-sm font-medium text-stone-700">
                    Livraison disponible
                  </span>
                </label>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-stone-700 mb-3">
                  Note minimale
                </label>
                <select
                  value={activeFilters.rating ?? 0}
                  onChange={(e) =>
                    onFilterChange({ rating: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                >
                  <option value="0">Toutes les notes</option>
                  <option value="1">1+ étoile</option>
                  <option value="2">2+ étoiles</option>
                  <option value="3">3+ étoiles</option>
                  <option value="4">4+ étoiles</option>
                </select>
              </div>

              {/* Verified Businesses */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.verified ?? false}
                    onChange={(e) =>
                      onFilterChange({ verified: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-stone-300"
                  />
                  <span className="text-sm font-medium text-stone-700">
                    Entreprises vérifiées
                  </span>
                </label>
              </div>

              {/* Price Level */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-stone-700 mb-3">
                  Niveau de prix
                </label>
                <div className="space-y-2">
                  {PRICE_LEVEL_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPriceLevels.includes(option.id)}
                        onChange={() => togglePriceLevel(option.id)}
                        className="w-4 h-4 rounded border-stone-300"
                      />
                      <span className="text-sm text-stone-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fast Response */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.fastResponse ?? false}
                    onChange={(e) =>
                      onFilterChange({ fastResponse: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-stone-300"
                  />
                  <span className="text-sm font-medium text-stone-700">
                    Réponse rapide
                  </span>
                </label>
              </div>
            </>
          )}

          {/* SERVICES Filters */}
          {category === 'services' && (
            <>
              {/* Availability */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-stone-700 mb-3">
                  Disponibilité
                </label>
                <input
                  type="text"
                  placeholder="Ex: Lundi-Vendredi"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-stone-700 mb-3">
                  Lieu
                </label>
                <div className="space-y-2">
                  {LOCATION_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLocation.includes(option.id)}
                        onChange={() => toggleLocation(option.id)}
                        className="w-4 h-4 rounded border-stone-300"
                      />
                      <span className="text-sm text-stone-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-stone-700 mb-3">
                  Gamme de prix
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-stone-600">Min: {priceMin}€</label>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={priceMin}
                      onChange={(e) => setPriceMin(Number(e.target.value))}
                      className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-600">Max: {priceMax}€</label>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-stone-700 mb-3">
                  Note minimale
                </label>
                <select
                  value={activeFilters.rating ?? 0}
                  onChange={(e) =>
                    onFilterChange({ rating: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                >
                  <option value="0">Toutes les notes</option>
                  <option value="1">1+ étoile</option>
                  <option value="2">2+ étoiles</option>
                  <option value="3">3+ étoiles</option>
                  <option value="4">4+ étoiles</option>
                </select>
              </div>

              {/* Verified Providers */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.verifiedProviders ?? false}
                    onChange={(e) =>
                      onFilterChange({ verifiedProviders: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-stone-300"
                  />
                  <span className="text-sm font-medium text-stone-700">
                    Prestataires vérifiés
                  </span>
                </label>
              </div>

              {/* Experience */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-stone-700 mb-3">
                  Expérience
                </label>
                <div className="space-y-2">
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedExperience.includes(option.id)}
                        onChange={() => toggleExperience(option.id)}
                        className="w-4 h-4 rounded border-stone-300"
                      />
                      <span className="text-sm text-stone-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Emergency Service */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.emergencyService ?? false}
                    onChange={(e) =>
                      onFilterChange({ emergencyService: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-stone-300"
                  />
                  <span className="text-sm font-medium text-stone-700">
                    Service d&apos;urgence
                  </span>
                </label>
              </div>
            </>
          )}

          {/* REELS Filters */}
          {category === 'reels' && (
            <>
              {/* Nearby */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.nearby ?? false}
                    onChange={(e) => onFilterChange({ nearby: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300"
                  />
                  <span className="text-sm font-medium text-stone-700">À proximité</span>
                </label>
              </div>

              {/* Trending */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.trending_reels ?? false}
                    onChange={(e) =>
                      onFilterChange({ trending_reels: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-stone-300"
                  />
                  <span className="text-sm font-medium text-stone-700">Tendances</span>
                </label>
              </div>

              {/* New */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.new ?? false}
                    onChange={(e) => onFilterChange({ new: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300"
                  />
                  <span className="text-sm font-medium text-stone-700">Nouveaux</span>
                </label>
              </div>

              {/* Following */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.following ?? false}
                    onChange={(e) =>
                      onFilterChange({ following: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-stone-300"
                  />
                  <span className="text-sm font-medium text-stone-700">
                    Abonnements
                  </span>
                </label>
              </div>

              {/* Offers/Discounts */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.offers ?? false}
                    onChange={(e) => onFilterChange({ offers: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300"
                  />
                  <span className="text-sm font-medium text-stone-700">
                    Offres/Réductions
                  </span>
                </label>
              </div>

              {/* Video Duration */}
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-3">
                  Durée vidéo
                </label>
                <div className="space-y-2">
                  {VIDEO_DURATION_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedVideoDuration.includes(option.id)}
                        onChange={() => toggleVideoDuration(option.id)}
                        className="w-4 h-4 rounded border-stone-300"
                      />
                      <span className="text-sm text-stone-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Reset Button */}
          {activeFilterCount > 0 && (
            <div className="mt-6 pt-4 border-t border-stone-200">
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium text-sm transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
