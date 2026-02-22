'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BusinessCard from '@/components/ui/BusinessCard';
import ResultsMap from '@/components/ui/ResultsMap';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { searchStores } from '@/lib/actions/search_bus';
import { Business } from '@/types/business';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const location = searchParams.get('location') || '';

  const [highlightedBusinessId, setHighlightedBusinessId] = useState<string | undefined>();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const businessRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const fetchBusinesses = async () => {
      setIsLoading(true);
      try {
        const results = await searchStores(query, location);
        setBusinesses(results);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();
  }, [query, location]);

  // Scroll to business card when marker is clicked
  const handleMarkerClick = (businessId: string) => {
    setHighlightedBusinessId(businessId);
    const element = businessRefs.current.get(businessId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Auto-remove highlight after 3 seconds
      setTimeout(() => setHighlightedBusinessId(undefined), 3000);
    }
  };

  // Highlight card when clicking
  const handleCardClick = (businessId: string) => {
    setHighlightedBusinessId(businessId);
    setTimeout(() => setHighlightedBusinessId(undefined), 3000);
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-24">
      <Navbar />
      {/* Results Header - Sticky below navbar */}



      {/* 
            Filters button (ready for future implementation) 
            <button className="flex items-center gap-2 px-4 py-2  text-white bg-[#11111198] hover:bg-[#111111d1] shadow-[0_0_20px_rgba(0,0,0,0.2)] border-none rounded-xl backdrop-blur-sm transition">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </button> 
            */}


      {/* Main Content: List + Map */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* LEFT SIDE - Results List */}
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                <p className="text-gray-500 animate-pulse">Recherche des meilleurs établissements...</p>
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun résultat trouvé
                </h2>
                <p className="text-gray-600">
                  Essayez d'ajuster votre recherche ou vos filtres
                </p>
              </div>
            ) : (
              businesses.map((business) => (
                <div
                  key={business.id}
                  ref={(el) => {
                    if (el) businessRefs.current.set(business.id, el);
                  }}
                  onMouseEnter={() => setHighlightedBusinessId(business.id)}
                  onMouseLeave={() => setHighlightedBusinessId(undefined)}
                >
                  <BusinessCard
                    business={business}
                    isHighlighted={highlightedBusinessId === business.id}
                    onClick={() => handleCardClick(business.id)}
                  />
                </div>
              ))
            )}

          </div>

          {/* RIGHT SIDE - Map (hidden on mobile, fixed on desktop) */}
          <div className="hidden lg:block w-[500px] xl:w-[600px] sticky top-32 h-[calc(100vh-200px)]">
            <ResultsMap
              businesses={businesses}
              highlightedId={highlightedBusinessId}
              onMarkerClick={handleMarkerClick}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}