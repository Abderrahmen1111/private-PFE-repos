"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Loader2, SlidersHorizontal, Star, Package, Scale, Tags, ShoppingCart, ChevronDown, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from "@/components/Footer";
import { searchItems, SearchResultItem } from '@/lib/actions/search';
import { ProductCard } from '@/components/ProductCard';

const SORT_OPTIONS = [
  { id: 'pertinence', label: 'Pertinence' },
  { id: 'price_asc',  label: 'Prix croissant' },
  { id: 'price_desc', label: 'Prix décroissant' },
  { id: 'rating',     label: 'Mieux notés' },
  { id: 'newest',     label: 'Plus récents' },
];

const PRODUCT_FILTERS = [
  { label: "Usage étudiant", icon: "🎓" },
  { label: "Qualité/prix", icon: "💎" },
  { label: "Haute performance", icon: "🚀" },
  { label: "Budget maîtrisé", icon: "💰" },
];

// ─── Main Page Content ────────────────────────────────────────────────────────
function ProductSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || searchParams.get('q') || '';
  
  const [products, setProducts] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('pertinence');
  const [compared, setCompared] = useState<number[]>([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const result = await searchItems(query);
        // On ne garde que les produits qui ont une boutique (cohérence avec la page principale)
        const onlyProducts = (result.data || []).filter(
          (item: SearchResultItem) => item.item_type === 'PRODUCT' && item.stores && item.stores.name
        );
        setProducts(onlyProducts);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [query]);

  const filtered = products
    .filter(p => {
      const matchMin    = !priceMin  || (p.price ?? 0) >= Number(priceMin);
      const matchMax    = !priceMax  || (p.price ?? 0) <= Number(priceMax);
      const matchRating = !minRating || (p.rating_average ?? 0) >= minRating;
      return matchMin && matchMax && matchRating;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc')  return (a.price ?? 0) - (b.price ?? 0);
      if (sortBy === 'price_desc') return (b.price ?? 0) - (a.price ?? 0);
      if (sortBy === 'rating')     return (b.rating_average ?? 0) - (a.rating_average ?? 0);
      if (sortBy === 'newest')     return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
      return 0;
    });

  const toggleFilter = (f: string) =>
    setActiveFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const toggleCompare = (id: number) =>
    setCompared(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(-3));

  const handleItemClick = (item: SearchResultItem) => {
    if (item.stores && item.stores.name) {
      router.push(`/merchants/business/${item.store_id}`);
    } else {
      router.push(`/merchants/product/${item.id}`);
    }
  };

  const currentSortLabel = SORT_OPTIONS.find(o => o.id === sortBy)?.label ?? 'Pertinence';

  return (
    <div className="min-h-screen bg-[#F8F7F5] font-[system-ui]" style={{ fontFamily: "'DM Sans', 'Instrument Sans', system-ui, sans-serif" }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        * { font-family: 'DM Sans', system-ui, sans-serif; }
        .serif { font-family: 'DM Serif Display', Georgia, serif; }
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        `}</style>

      <Navbar />

      {/* ── Main Content ── */}
      <main className="max-w-6xl mx-auto px-6 py-8 pt-24">
        {/* ── 1. Query Interpretation Banner ── */}
        <div className="bg-white border border-stone-100 rounded-2xl px-6 py-4 mb-6 shadow-sm fade-up">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
              <Search className="w-4.5 h-4.5 text-violet-500" />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">Résultats pour</p>
              <p className="text-stone-800 font-semibold text-base">
                {query ? `"${query}"` : 'Tous les produits'}
                <span className="ml-3 text-sm font-normal text-stone-400">— {filtered.length} produits trouvés</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── 2. Sticky Filter Bar ── */}
        <div className="sticky top-24 z-40 bg-white/90 backdrop-blur-md border border-stone-100 rounded-2xl shadow-sm mb-8">
          <div className="px-6 py-3 flex items-center justify-between gap-4">
            <div
              ref={filterRef}
              className="flex items-center gap-2 overflow-x-auto hide-scroll flex-1 pb-0.5"
            >
              {PRODUCT_FILTERS.map(f => {
                const active = activeFilters.includes(f.label);
                return (
                  <button
                    key={f.label}
                    onClick={() => toggleFilter(f.label)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 shadow-sm
                      ${active
                        ? "bg-stone-900 text-white border-stone-900 shadow-md"
                        : "bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:text-stone-900"
                      }`}
                  >
                    {f.icon && <span>{f.icon}</span>}
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Sort Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-stone-200 bg-white text-stone-700 hover:border-stone-400 transition-all"
              >
                Trier : <span className="text-stone-900">{currentSortLabel}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-100 z-50 overflow-hidden">
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
        </div>

        {/* Loading State or Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-stone-900 animate-spin mb-4" />
            <p className="text-stone-500 font-medium font-serif">À la recherche des meilleures offres...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-stone-200 shadow-sm">
            <Package className="w-16 h-16 text-stone-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-stone-800 mb-2 serif">Aucun produit trouvé</h2>
            <p className="text-stone-500">Essayez d'autres mots-clés ou modifiez vos filtres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, i) => (
              <div 
                key={item.id} 
                className="fade-up opacity-0" 
                style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'forwards' }}
              >
                <ProductCard 
                  item={item} 
                  businessName={item.stores?.name}
                  compared={compared.includes(item.id)}
                  onCompare={() => toggleCompare(item.id)}
                  onViewDetails={() => handleItemClick(item)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Compare Bar ── */}
      {compared.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-6 fade-up">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-violet-400" />
            <span className="text-sm font-bold tracking-tight">{compared.length} produit{compared.length > 1 ? "s" : ""} sélectionné{compared.length > 1 ? "s" : ""}</span>
          </div>
          <div className="h-4 w-px bg-stone-700" />
          <button className="bg-white text-stone-900 text-sm font-black px-5 py-2 rounded-xl hover:scale-105 transition-transform active:scale-95 shadow-lg">
            COMPARER MAINTENANT ⚖️
          </button>
          <button onClick={() => setCompared([])} className="text-stone-400 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      <Footer/>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-stone-900 animate-spin" />
      </div>
    }>
      <ProductSearchContent />
    </Suspense>
  );
}