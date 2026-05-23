'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Loader2, SlidersHorizontal, Star, MapPin, Clock, ChevronDown, X, Package, Wrench, Stethoscope, GraduationCap, Car, Scissors, Dumbbell, Laptop, Home, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { searchServicesDirectory } from '@/lib/actions/search';
import { ServiceCard } from '@/components/ServiceCard';
import SearchFilters from '@/components/search/SearchFilters';

// ── Category chips ────────────────────────────────────────────────────────────
const SERVICE_CATEGORIES = [
  { id: 'all',          label: 'Tous',         icon: Package },
  { id: 'plomberie',    label: 'Plomberie',    icon: Wrench },
  { id: 'sante',        label: 'Santé',        icon: Stethoscope },
  { id: 'education',    label: 'Éducation',    icon: GraduationCap },
  { id: 'auto',         label: 'Auto',         icon: Car },
  { id: 'beaute',       label: 'Beauté',       icon: Scissors },
  { id: 'sport',        label: 'Sport',        icon: Dumbbell },
  { id: 'informatique', label: 'Informatique', icon: Laptop },
  { id: 'immobilier',   label: 'Immobilier',   icon: Home },
];

// ── Sort options ──────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { id: 'pertinence', label: 'Pertinence' },
  { id: 'price_asc',  label: 'Prix croissant' },
  { id: 'price_desc', label: 'Prix décroissant' },
  { id: 'rating',     label: 'Mieux notés' },
  { id: 'newest',     label: 'Plus récents' },
];

function ServiceSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query    = searchParams.get('query') || searchParams.get('q') || '';
  const location = searchParams.get('location') || '';

  const [services,       setServices]       = useState<any[]>([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy,         setSortBy]         = useState('pertinence');
  const [showSortMenu,   setShowSortMenu]   = useState(false);
  
  // ✅ UPDATED: Use new filter structure
  const [filters, setFilters] = useState<any>({
    priceRange: [0, 10000],
    availability: '',
    location: '',
    rating: 0,
    verifiedProviders: false,
    experience: [],
    onHomeOrShop: [],
    emergencyService: false,
  });

  // ── Fetch from service_directory ───────────────────────────────────────────
  useEffect(() => {
    const fetchDir = async () => {
      setIsLoading(true);
      try {
        const result = await searchServicesDirectory(query, location || undefined);
        setServices(result.data || []);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDir();
  }, [query, location]);

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = services
    .filter(s => {
      const matchCat    = activeCategory === 'all' || 
                          (s.name?.toLowerCase() || '').includes(activeCategory) || 
                          (s.description?.toLowerCase() || '').includes(activeCategory);
      
      // Price range
      const price = s.price ?? 0;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;

      // Location filter
      if (filters.onHomeOrShop.length > 0) {
        const hasLocation = filters.onHomeOrShop.some((loc: string) =>
          s.description?.toLowerCase().includes(loc) || s.name?.toLowerCase().includes(loc)
        );
        if (!hasLocation) return false;
      }

      // Rating
      if (filters.rating > 0 && (s.rating_average ?? 0) < filters.rating) return false;

      // Experience filter
      if (filters.experience.length > 0) {
        const hasExperience = filters.experience.some((exp: string) =>
          s.description?.toLowerCase().includes(exp)
        );
        if (!hasExperience) return false;
      }

      // Emergency service
      if (filters.emergencyService && !s.description?.toLowerCase().includes('urgence')) return false;

      return matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc')  return (a.price ?? 0) - (b.price ?? 0);
      if (sortBy === 'price_desc') return (b.price ?? 0) - (a.price ?? 0);
      if (sortBy === 'rating')     return (b.rating_average ?? 0) - (a.rating_average ?? 0);
      if (sortBy === 'newest')     return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
      return 0;
    });

  const activeFilterCount = [
    filters.priceRange[0] > 0 || filters.priceRange[1] < 10000 ? 1 : 0,
    filters.experience.length,
    filters.onHomeOrShop.length,
    filters.rating > 0 ? 1 : 0,
    filters.emergencyService ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 10000],
      availability: '',
      location: '',
      rating: 0,
      verifiedProviders: false,
      experience: [],
      onHomeOrShop: [],
      emergencyService: false,
    });
  };

  const currentSortLabel = SORT_OPTIONS.find(o => o.id === sortBy)?.label ?? 'Pertinence';

  return (
    <div className="min-h-screen bg-white pt-24 pb-24">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-sm text-stone-400 mb-1">Résultats pour</p>
          <h1 className="text-2xl font-bold text-stone-900">
            Services{query ? ` · "${query}"` : ''}
          </h1>
          {!isLoading && (
            <p className="text-sm text-stone-500 mt-1">
              <span className="font-semibold text-stone-800">{filtered.length}</span> service{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
              {location && <span> près de <span className="font-medium text-red-600">{location}</span></span>}
            </p>
          )}
        </div>

        {/* ── Category chips ───────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {SERVICE_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-md scale-105'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── Toolbar: filters + sort ──────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5 gap-3">
          {/* ✅ UPDATED: Use new SearchFilters component */}
          <SearchFilters
            category="services"
            activeFilters={filters}
            onFilterChange={(newFilters) => setFilters((prev: any) => ({ ...prev, ...newFilters }))}
          />

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(p => !p)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-stone-200 bg-white text-stone-700 hover:border-stone-400 transition-all"
            >
              Trier : <span className="text-stone-900">{currentSortLabel}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-100 z-30 overflow-hidden">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setSortBy(opt.id); setShowSortMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      sortBy === opt.id
                        ? 'bg-stone-100 font-bold text-stone-900'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Results ──────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
            <p className="text-stone-500 font-medium">Recherche en cours...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Wrench className="w-16 h-16 text-stone-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-stone-800 mb-2">Aucun service trouvé</h2>
            <p className="text-stone-500">
              {activeFilterCount > 0
                ? 'Essayez de modifier vos filtres.'
                : 'Essayez d\'autres mots-clés ou une autre localisation.'}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 px-5 py-2 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-700 transition-colors"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item: any) => (
              <ServiceCard
                key={item.service_id || item.id}
                item={{
                  ...item,
                  id: item.service_id || item.id,
                  price: item.price ?? 0,
                  price_unit: item.price_unit ?? 'TND',
                  status: item.status ?? 'AVAILABLE',
                  item_type: 'SERVICE',
                  main_image: item.main_image,
                }}
                businessName={item.stores?.name || item.name}
                hidePricing={true}
                hideBooking={false}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function ServiceSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    }>
      <ServiceSearchContent />
    </Suspense>
  );
}