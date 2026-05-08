'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BusinessCard from '@/components/ui/BusinessCard';
import ResultsMap from '@/components/ui/ResultsMap';
import { Search, SlidersHorizontal, Loader2, Package, LayoutGrid, Store, Tags, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { searchStores, searchItems, SearchResultItem, searchServicesDirectory } from '@/lib/actions/search';
import { ProductCard } from '@/components/ProductCard';
import { ServiceCard } from '@/components/ServiceCard';
import { Business } from '@/types/business';
import { useTracking } from '@/hooks/useTracking'; // ✅ ADDED

// Calcul de la distance via la formule Haversine (en km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Rayon de la terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || searchParams.get('q') || '';
  const location = searchParams.get('location') || '';
  const category = searchParams.get('category') || '';
  const [activeBusinessId, setActiveBusinessId] = useState<string | undefined>();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [products, setProducts] = useState<SearchResultItem[]>([]);
  const [services, setServices] = useState<SearchResultItem[]>([]);
  const [activeSection, setActiveSection] = useState<'all' | 'services' | 'businesses' | 'products'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [compared, setCompared] = useState<number[]>([]);
  const businessRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // ✅ ADDED: Initialize tracking
  const { trackSearch, trackClick, trackNoResults, trackRefine, trackFilter, trackSort } = useTracking();

  useEffect(() => {
    const fetchAllResults = async () => {
      setIsLoading(true);
      try {
        // Tenter d'obtenir la position de l'utilisateur pour le tri "plus près"
        let userLat: number | null = null;
        let userLng: number | null = null;
        try {
          if ("geolocation" in navigator) {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000, maximumAge: 60000 });
            });
            userLat = pos.coords.latitude;
            userLng = pos.coords.longitude;
          }
        } catch (e) {
          console.log("Géolocalisation ignorée ou refusée", e);
        }

        // Toujours utiliser la recherche sémantique pour une meilleure expérience (Darija + Géo-filtrage)
        const res = await fetch('/api/semantic-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query, 
            searchType: 'all', 
            limit: 50, 
            location, 
            category,
            userLat,
            userLng
          })
        });

        if (res.ok) {
          const { results = [], processing } = await res.json();
          
          const busResults: Business[] = [];
          const prodResults: SearchResultItem[] = [];
          const servResults: SearchResultItem[] = [];
          
          results.forEach((item: any) => {
            if (item.result_type === 'ITEM') {
              prodResults.push({
                id: item.id,
                name: item.name,
                description: item.description,
                item_type: item.category === 'SERVICE' ? 'SERVICE' : 'PRODUCT',
                main_image: item.image_url,
                price: item.metadata?.price,
                store_id: item.metadata?.store_id,
                stores: { 
                  name: item.metadata?.store_name || item.stores?.name,
                  id: item.metadata?.store_id || item.store_id
                },
                is_nearby: item.is_nearby
              } as any);
            } else if (item.result_type === 'STORE' || item.result_type === 'BUSINESS_DIR') {
              busResults.push({
                id: item.id?.toString(),
                name: item.name,
                description: item.description,
                logo_url: item.image_url,
                city: item.location_city || item.city,
                rating_average: item.metadata?.rating || item.metadata?.score || 0,
                total_reviews: item.metadata?.total_reviews || item.metadata?.reviews || 0,
                latitude: item.latitude || item.metadata?.latitude,
                longitude: item.longitude || item.metadata?.longitude,
                location: {
                  lat: Number(item.latitude || item.metadata?.latitude || 36.8065),
                  lng: Number(item.longitude || item.metadata?.longitude || 10.1815),
                },
                is_nearby: item.is_nearby
              } as any);
            } else if (item.result_type === 'SERVICE_DIR') {
              servResults.push({
                id: item.id,
                name: item.name,
                description: item.description,
                item_type: 'SERVICE',
                price: Number(item.metadata?.price || 0),
                stores: { 
                  name: item.metadata?.address || item.location_city || item.city 
                },
                location: {
                  lat: Number(item.latitude || item.metadata?.latitude || 36.8065),
                  lng: Number(item.longitude || item.metadata?.longitude || 10.1815),
                },
                is_nearby: item.is_nearby
              } as any);
            }
          });
          
          // ✅ Tri par distance si position connue
          if (userLat !== null && userLng !== null) {
            const sortFn = (a: any, b: any) => {
              const latA = Number(a.location?.lat || a.latitude || 0);
              const lngA = Number(a.location?.lng || a.longitude || 0);
              const latB = Number(b.location?.lat || b.latitude || 0);
              const lngB = Number(b.location?.lng || b.longitude || 0);
              if (!latA || !lngA) return 1;
              if (!latB || !lngB) return -1;
              return calculateDistance(userLat!, userLng!, latA, lngA) - calculateDistance(userLat!, userLng!, latB, lngB);
            };
            busResults.sort(sortFn);
            servResults.sort(sortFn);
          }
          
          setBusinesses(busResults);
          setProducts(prodResults);
          setServices(servResults);
          console.log('📊 Semantic Search completed:', { query, resultsCount: results.length, processing });
          
          // ✅ Track search
          if (query) {
            trackSearch(query, { location });
            if (results.length === 0) {
              trackNoResults(query, { location });
            }
          }
        } else {
           throw new Error("Semantic API failed");
        }

      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllResults();
  }, [query, location]); // Dependencies

  // When user clicks a marker: highlight it, scroll list to card, open map popup
  const handleMarkerClick = (businessId: string) => {
    setActiveBusinessId(businessId);
    const element = businessRefs.current.get(businessId);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setActiveBusinessId(undefined), 5000);
  };

  // ✅ UPDATED: When user clicks a business card - track it
  const handleCardClick = (businessId: string, position: number, merchantId?: string) => {
    // TRACK: click event with position
    trackClick('search', businessId, position, merchantId);
    setActiveBusinessId(businessId);
    setTimeout(() => setActiveBusinessId(undefined), 5000);
  };

  // ✅ UPDATED: When user clicks a product - track it
  const handleProductClick = (item: SearchResultItem, position: number) => {
    trackClick('search', String(item.id), position, item.stores?.id ? String(item.stores.id) : undefined);
    router.push(`/merchants/product/${item.id}`);
  };

  // ✅ UPDATED: When user clicks a service - track it
  const handleServiceClick = (item: SearchResultItem, position: number) => {
    trackClick('search', String(item.id), position, item.stores?.id ? String(item.stores.id) : undefined);
    router.push(`/merchants/business/${item.id}`);
  };

  const toggleCompare = (id: number) =>
    setCompared((prev: number[]) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(-3));

  // ✅ ADDED: Placeholder for future filter implementation
  const handleFilter = (filterType: string, value: any) => {
    trackFilter('search', filterType, value);
    // Future: Apply filter logic
  };

  // ✅ ADDED: Placeholder for future sort implementation
  const handleSort = (sortBy: string, order: 'asc' | 'desc') => {
    trackSort('search', sortBy, order);
    // Future: Apply sort logic
  };

  // Séparation Exact vs Nearby
  const exactServices = services.filter((s: any) => !s.is_nearby);
  const nearbyServices = services.filter((s: any) => s.is_nearby);
  const exactBusinesses = businesses.filter((b: any) => !b.is_nearby);
  const nearbyBusinesses = businesses.filter((b: any) => b.is_nearby);
  const exactProducts = products.filter((p: any) => !p.is_nearby);
  const nearbyProducts = products.filter((p: any) => p.is_nearby);

  const hasExact = exactServices.length > 0 || exactBusinesses.length > 0 || exactProducts.length > 0;
  const hasNearby = nearbyServices.length > 0 || nearbyBusinesses.length > 0 || nearbyProducts.length > 0;

  return (
    <div className="min-h-screen bg-white pt-24 pb-24">
      <Navbar />

      {/* Sections Filter Bar - Sticky below navbar */}
      {!isLoading && (hasExact || hasNearby) && (
        <div className="sticky top-[72px] z-40 bg-white/90 backdrop-blur-xl border-b border-stone-100 py-3 mb-6 flex items-center gap-2 overflow-x-auto hide-scrollbar shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center gap-2 sm:gap-4">
                <button 
                  onClick={() => setActiveSection('all')} 
                  className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeSection === 'all' ? 'bg-stone-900 text-white shadow-md' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                >
                  Tout voir
                </button>
                
                {services.length > 0 && (
                  <button 
                    onClick={() => setActiveSection('services')} 
                    className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${activeSection === 'services' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                  >
                    <Tags className="w-4 h-4" /> Service <span className="ml-1 bg-white/20 px-1.5 rounded-md">{services.length}</span>
                  </button>
                )}
                
                {businesses.length > 0 && (
                  <button 
                    onClick={() => setActiveSection('businesses')} 
                    className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${activeSection === 'businesses' ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                  >
                    <Store className="w-4 h-4" /> Business <span className="ml-1 bg-white/20 px-1.5 rounded-md">{businesses.length}</span>
                  </button>
                )}
                
                {products.length > 0 && (
                  <button 
                    onClick={() => setActiveSection('products')} 
                    className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${activeSection === 'products' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                  >
                    <Package className="w-4 h-4" /> Items <span className="ml-1 bg-white/20 px-1.5 rounded-md">{products.length}</span>
                  </button>
                )}
            </div>
        </div>
      )}

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
            <div className="flex-1 min-w-0 space-y-12">

              {!hasExact && !hasNearby ? (
                <div className="text-center py-16">
                  <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-stone-800 mb-2">Aucun résultat trouvé</h2>
                  <p className="text-stone-500">Essayez d'autres mots-clés ou vérifiez votre localisation.</p>
                </div>
              ) : (
                <>
                  {/* --- RÉSULTATS EXACTS --- */}
                  {hasExact && (
                    <div className="space-y-12">
                      {(activeSection === 'all' || activeSection === 'services') && exactServices.length > 0 && (
                        <section>
                          <div className="flex items-center gap-2 mb-6">
                            <Tags className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-2xl font-bold text-stone-900">Service</h2>
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">{exactServices.length}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {exactServices.map((item: SearchResultItem, idx: number) => (
                              <div key={item.id}>
                                <ServiceCard 
                                  item={item as any} 
                                  businessName={item.stores?.name}
                                  onViewDetails={() => handleServiceClick(item, idx + 1)}
                                  hideBooking={true}
                                  hidePricing={true}
                                />
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {(activeSection === 'all' || activeSection === 'businesses') && exactBusinesses.length > 0 && (
                        <section>
                          <div className="flex items-center gap-2 mb-6">
                            <Store className="w-5 h-5 text-rose-600" />
                            <h2 className="text-2xl font-bold text-stone-900">Business</h2>
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">{exactBusinesses.length}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {exactBusinesses.map((business: Business, idx: number) => (
                              <div
                                key={business.id}
                                ref={(el) => { if (el) businessRefs.current.set(business.id, el); }}
                                onMouseEnter={() => setActiveBusinessId(business.id)}
                                onMouseLeave={() => setActiveBusinessId(undefined)}
                              >
                                <BusinessCard
                                  business={business}
                                  isHighlighted={activeBusinessId === business.id}
                                  onClick={() => handleCardClick(business.id, idx + 1, business.id)}
                                />
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {(activeSection === 'all' || activeSection === 'products') && exactProducts.length > 0 && (
                        <section>
                          <div className="flex items-center gap-2 mb-6">
                            <Package className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-2xl font-bold text-stone-900">Items</h2>
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">{exactProducts.length}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {exactProducts.map((item: SearchResultItem, idx: number) => (
                              <div key={item.id}>
                                {item.item_type === 'SERVICE' ? (
                                  <ServiceCard 
                                    item={item as any} 
                                    businessName={item.stores?.name}
                                    onViewDetails={() => handleServiceClick(item, idx + 1)}
                                    hideBooking={false}
                                    hidePricing={false}
                                  />
                                ) : (
                                  <ProductCard
                                    item={item as any}
                                    businessName={item.stores?.name}
                                    compared={compared.includes(item.id)}
                                    onCompare={() => toggleCompare(item.id)}
                                    onViewDetails={() => handleProductClick(item, idx + 1)}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  )}

                  {/* --- RÉSULTATS À PROXIMITÉ (VILLES VOISINES) --- */}
                  {hasNearby && (
                    <div className="mt-16 pt-10 border-t-2 border-stone-100 space-y-12 bg-stone-50/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pb-12 rounded-3xl">
                      <div className="mb-8">
                        <h2 className="text-3xl font-black text-stone-900 mb-2">Explorez plus loin 🌍</h2>
                        <p className="text-stone-500 font-medium">Résultats à proximité de votre zone de recherche (villes voisines).</p>
                      </div>

                      {(activeSection === 'all' || activeSection === 'services') && nearbyServices.length > 0 && (
                        <section>
                          <div className="flex items-center gap-2 mb-6">
                            <Tags className="w-5 h-5 text-indigo-400" />
                            <h2 className="text-xl font-bold text-stone-700">Service (À proximité)</h2>
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-500 text-xs font-bold">{nearbyServices.length}</span>
                          </div>
                          <div className="flex overflow-x-auto pb-6 gap-6 snap-x hide-scrollbar">
                            {nearbyServices.map((item: SearchResultItem, idx: number) => (
                              <div key={item.id} className="min-w-[280px] snap-start">
                                <ServiceCard 
                                  item={item as any} 
                                  businessName={item.stores?.name}
                                  onViewDetails={() => handleServiceClick(item, idx + 1)}
                                  hideBooking={true}
                                  hidePricing={true}
                                />
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {(activeSection === 'all' || activeSection === 'businesses') && nearbyBusinesses.length > 0 && (
                        <section>
                          <div className="flex items-center gap-2 mb-6">
                            <Store className="w-5 h-5 text-rose-400" />
                            <h2 className="text-xl font-bold text-stone-700">Business (À proximité)</h2>
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-rose-50 text-rose-500 text-xs font-bold">{nearbyBusinesses.length}</span>
                          </div>
                          <div className="flex overflow-x-auto pb-6 gap-6 snap-x hide-scrollbar">
                            {nearbyBusinesses.map((business: Business, idx: number) => (
                              <div
                                key={business.id}
                                className="min-w-[300px] snap-start"
                                ref={(el) => { if (el) businessRefs.current.set(business.id, el); }}
                                onMouseEnter={() => setActiveBusinessId(business.id)}
                                onMouseLeave={() => setActiveBusinessId(undefined)}
                              >
                                <BusinessCard
                                  business={business}
                                  isHighlighted={activeBusinessId === business.id}
                                  onClick={() => handleCardClick(business.id, idx + 1, business.id)}
                                />
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {(activeSection === 'all' || activeSection === 'products') && nearbyProducts.length > 0 && (
                        <section>
                          <div className="flex items-center gap-2 mb-6">
                            <Package className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-xl font-bold text-stone-700">Items (À proximité)</h2>
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-500 text-xs font-bold">{nearbyProducts.length}</span>
                          </div>
                          <div className="flex overflow-x-auto pb-6 gap-6 snap-x hide-scrollbar">
                            {nearbyProducts.map((item: SearchResultItem, idx: number) => (
                              <div key={item.id} className="min-w-[280px] snap-start">
                                {item.item_type === 'SERVICE' ? (
                                  <ServiceCard 
                                    item={item as any} 
                                    businessName={item.stores?.name}
                                    onViewDetails={() => handleServiceClick(item, idx + 1)}
                                    hideBooking={false}
                                    hidePricing={false}
                                  />
                                ) : (
                                  <ProductCard
                                    item={item as any}
                                    businessName={item.stores?.name}
                                    compared={compared.includes(item.id)}
                                    onCompare={() => toggleCompare(item.id)}
                                    onViewDetails={() => handleProductClick(item, idx + 1)}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  )}
                </>
              )}

            </div>

            {/* Map Section */}
            {(businesses.length > 0 || services.length > 0) && (
              <div className="hidden lg:block w-[400px] xl:w-[500px] sticky top-32 h-[calc(100vh-250px)] rounded-2xl overflow-hidden shadow-xl border border-stone-100">
                <ResultsMap
                  businesses={[...businesses, ...services as any]} // Convert services to display on map if they have coordinates
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