'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Loader2, SlidersHorizontal, Star, MapPin, Clock, ChevronDown, X, Package, Wrench, Stethoscope, GraduationCap, Car, Scissors, Dumbbell, Laptop, Home, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { searchServicesDirectory } from '@/lib/actions/search';
import { ServiceCard } from '@/components/ServiceCard';

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
  const [showFilters,    setShowFilters]    = useState(false);
  const [priceMin,       setPriceMin]       = useState('');
  const [priceMax,       setPriceMax]       = useState('');
  const [minRating,      setMinRating]      = useState(0);
  const [showSortMenu,   setShowSortMenu]   = useState(false);

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
      const matchMin    = !priceMin  || (s.price ?? 0) >= Number(priceMin);
      const matchMax    = !priceMax  || (s.price ?? 0) <= Number(priceMax);
      const matchRating = !minRating || (s.rating_average ?? 0) >= minRating;
      return matchCat && matchMin && matchMax && matchRating;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc')  return (a.price ?? 0) - (b.price ?? 0);
      if (sortBy === 'price_desc') return (b.price ?? 0) - (a.price ?? 0);
      if (sortBy === 'rating')     return (b.rating_average ?? 0) - (a.rating_average ?? 0);
      if (sortBy === 'newest')     return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
      return 0;
    });

  const activeFilterCount = [
    priceMin, priceMax, minRating > 0 ? minRating : '', activeCategory !== 'all' ? activeCategory : ''
  ].filter(Boolean).length;

  const clearFilters = () => {
    setPriceMin(''); setPriceMax(''); setMinRating(0); setActiveCategory('all');
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
          <button
            onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all relative ${
              showFilters || activeFilterCount > 0
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtres
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

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

        {/* ── Filter panel ─────────────────────────────────────────────────── */}
        {showFilters && (
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

              {/* Price range */}
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
                  Prix (TND)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={e => setPriceMin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                  />
                  <span className="text-stone-400 text-xs">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={e => setPriceMax(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                  />
                </div>
              </div>

              {/* Min rating */}
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
                  Note minimale
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setMinRating(minRating === star ? 0 : star)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        star <= minRating ? 'text-amber-400' : 'text-stone-300 hover:text-amber-300'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  {minRating > 0 && (
                    <span className="ml-1 text-xs text-stone-500 self-center">{minRating}+ étoiles</span>
                  )}
                </div>
              </div>

              {/* Clear */}
              <div className="flex items-end">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors"
                  >
                    <X className="w-4 h-4" /> Effacer les filtres
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

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