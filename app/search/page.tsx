'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BusinessCard from '@/components/ui/BusinessCard';
import ResultsMap from '@/components/ui/ResultsMap';
import { Search, SlidersHorizontal, Loader2, Package, LayoutGrid, Store, Tags, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { searchStores } from '@/lib/actions/search_bus';
import { searchItems, SearchResultItem } from '@/lib/actions/search_items';
import { searchServicesDirectory } from '@/lib/actions/search_service';
import { ProductCard } from '@/components/ProductCard';
import { ServiceCard } from '@/components/ServiceCard';
import { Business } from '@/types/business';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || searchParams.get('q') || '';
  const location = searchParams.get('location') || '';
  const initialTab = searchParams.get('tab') || 'tout';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeBusinessId, setActiveBusinessId] = useState<string | undefined>();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [products, setProducts] = useState<SearchResultItem[]>([]);
  const [services, setServices] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [compared, setCompared] = useState<number[]>([]);
  const businessRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const fetchAllResults = async () => {
      setIsLoading(true);
      try {
        const [busResults, prodResults, servResults] = await Promise.all([
          searchStores(query, location),
          searchItems(query),
          searchServicesDirectory(query, location)
        ]);
        setBusinesses(busResults);
        setProducts(prodResults.data || []);
        setServices(servResults.data || []);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllResults();
  }, [query, location]);

  // When user clicks a marker: highlight it, scroll list to card, open map popup (via activeBusinessId)
  const handleMarkerClick = (businessId: string) => {
    setActiveBusinessId(businessId);
    const element = businessRefs.current.get(businessId);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setActiveBusinessId(undefined), 5000);
  };

  // When user clicks a card: highlight it and show marker popup on map
  const handleCardClick = (businessId: string) => {
    setActiveBusinessId(businessId);
    setTimeout(() => setActiveBusinessId(undefined), 5000);
  };

  const handleProductClick = (item: SearchResultItem) => {
    router.push(`/merchants/product/${item.id}`);
  };

  const toggleCompare = (id: number) =>
    setCompared((prev: number[]) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(-3));

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
      {/* Tab Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl w-fit">
          {[
            { id: 'tout', label: 'Tout', icon: LayoutGrid },
            { id: 'boutiques', label: 'Boutiques', icon: Store },
            { id: 'items', label: 'Items', icon: Package },
            { id: 'services', label: 'Services', icon: Tags },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                ? 'bg-white text-stone-900 shadow-md scale-105'
                : 'text-stone-500 hover:text-stone-700 hover:bg-white/50'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'boutiques' && businesses.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-stone-200 text-[10px]">{businesses.length}</span>
              )}
              {tab.id === 'items' && products.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-stone-200 text-[10px]">{products.length}</span>
              )}
              {tab.id === 'services' && services.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-stone-200 text-[10px]">{services.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Recherche en cours...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Results Section */}
            <div className="flex-1 min-w-0">

              {/* TOUT TAB */}
              {activeTab === 'tout' && (
                <div className="space-y-12">
                  {/* Top Businesses Section */}
                  {businesses.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-stone-900">Meilleures boutiques</h2>
                        <button onClick={() => setActiveTab('boutiques')} className="text-sm font-bold text-red-600 hover:text-red-700">Voir tout</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {businesses.slice(0, 2).map((b: Business) => (
                          <BusinessCard key={b.id} business={b} onClick={() => handleCardClick(b.id)} />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Top Items Section */}
                  {(products.length > 0 || services.length > 0) && (
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-stone-900">Articles et Services</h2>
                        <button onClick={() => setActiveTab('items')} className="text-sm font-bold text-red-600 hover:text-red-700">Voir tout</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {[...products, ...services].slice(0, 4).map((item: SearchResultItem) => (
                          <div key={item.id}>
                            {item.item_type === 'SERVICE' ? (
                            /* Service Card Component */
                            <ServiceCard 
                              item={item} 
                              businessName={item.stores?.name}
                              onViewDetails={() => router.push(`/merchants/service/${item.id}`)}

                              hideBooking={false} 
                            />
                            ) : (
                              <ProductCard
                                item={item}
                                businessName={item.stores?.name}
                                compared={compared.includes(item.id)}
                                onCompare={() => toggleCompare(item.id)}
                                onViewDetails={() => router.push(`/merchants/product/${item.id}`)}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {businesses.length === 0 && products.length === 0 && services.length === 0 && (
                    <div className="text-center py-16">
                      <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                      <h2 className="text-xl font-semibold text-stone-800 mb-2">Aucun résultat trouvé</h2>
                      <p className="text-stone-500">Essayez d'autres mots-clés ou vérifiez votre localisation.</p>
                    </div>
                  )}
                </div>
              )}

              {/* BOUTIQUES TAB */}
              {activeTab === 'boutiques' && (
                <div className="space-y-6">
                  {businesses.length === 0 ? (
                    <div className="text-center py-16">
                      <Store className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                      <h2 className="text-xl font-semibold text-stone-800">Aucune boutique trouvée</h2>
                    </div>
                  ) : (
                    businesses.map((business: Business) => (
                      <div
                        key={business.id}
                        ref={(el) => { if (el) businessRefs.current.set(business.id, el); }}
                        onMouseEnter={() => setActiveBusinessId(business.id)}
                        onMouseLeave={() => setActiveBusinessId(undefined)}
                      >
                        <BusinessCard
                          business={business}
                          isHighlighted={activeBusinessId === business.id}
                          onClick={() => handleCardClick(business.id)}
                        />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ITEMS TAB */}
              {activeTab === 'items' && (
                <div className="space-y-6">
                  {products.length === 0 ? (
                    <div className="text-center py-16">
                      <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                      <h2 className="text-xl font-semibold text-stone-800">Aucun élément trouvé</h2>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((item: SearchResultItem) => (
                        <div key={item.id}>
                          {item.item_type === 'SERVICE' ? (
                            <ServiceCard 
                              item={item} 
                              businessName={item.stores?.name}
                              onViewDetails={() => router.push(`/merchants/service/${item.id}`)}

                              hideBooking={false}
                            />
                          ) : (
                            <ProductCard
                              item={item}
                              businessName={item.stores?.name}
                              compared={compared.includes(item.id)}
                              onCompare={() => toggleCompare(item.id)}
                              onViewDetails={() => handleProductClick(item)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SERVICES TAB */}
              {activeTab === 'services' && (
                <div className="space-y-4">
                  {services.length === 0 ? (
                    <div className="text-center py-16">
                      <Tags className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                      <h2 className="text-xl font-semibold text-stone-800">Aucun service trouvé</h2>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {services.map((item: SearchResultItem) => (
                        <div key={item.id}>
                          <ServiceCard 
                            item={item} 
                            businessName={item.stores?.name}
                            onViewDetails={() => router.push(`/merchants/business/${item.id}`)}
                            hideBooking={false}
                            hidePricing={true}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Map Section (only for boutiques or tout) */}
            {(activeTab === 'boutiques' || activeTab === 'tout') && (
              <div className="hidden lg:block w-[400px] xl:w-[500px] sticky top-32 h-[calc(100vh-250px)] rounded-2xl overflow-hidden shadow-xl border border-stone-100">
                <ResultsMap
                  businesses={businesses}
                  activeBusinessId={activeBusinessId}
                  onMarkerClick={handleMarkerClick}
                  searchLocation={location || undefined}
                />
              </div>
            )}
          </div>
        )}
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