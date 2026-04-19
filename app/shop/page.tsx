'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, ArrowLeft, Filter, Loader2, ShoppingCart } from 'lucide-react';
import { getLatestItems } from '@/lib/actions/items';
import { ProductCard } from '@/components/ProductCard';
import { ServiceCard } from '@/components/ServiceCard';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ShopPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const data = await getLatestItems(40);
      setItems(data);
      setLoading(false);
    };
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.stores?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-stone-900">
      <Navbar />

      <main className="pt-28 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-bold tracking-widest text-[10px] uppercase">
              <ShoppingBag className="w-3.5 h-3.5" />
              Place de marché
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-stone-900">
              La Boutique <span className="text-stone-300">Ro2ya</span>
            </h1>
            <p className="text-stone-500 max-w-md text-sm leading-relaxed">
              Découvrez les meilleurs produits et services de nos partenaires locaux, sélectionnés pour leur qualité.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text"
                placeholder="Rechercher un produit ou magasin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all shadow-sm"
              />
            </div>
            <button className="p-3.5 rounded-2xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 transition-all shadow-sm">
                <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-stone-400 font-medium tracking-wide">Préparation du catalogue...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto">
            <div className="w-24 h-24 rounded-[40px] bg-white border border-stone-100 flex items-center justify-center shadow-xl mb-8">
              <ShoppingBag className="h-10 w-10 text-stone-200" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Aucun produit trouvé</h2>
            <p className="text-stone-500 text-sm mb-8">
              Nous n'avons trouvé aucun résultat pour "{searchQuery}". Essayez avec des termes plus simples.
            </p>
            <button 
              onClick={() => setSearchQuery('')}
              className="px-8 py-3 bg-stone-900 text-white rounded-2xl font-bold text-sm hover:bg-stone-800 transition-all active:scale-95"
            >
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {item.item_type === 'SERVICE' ? (
                    <ServiceCard 
                      item={item} 
                      businessName={item.stores?.name}
                      onViewDetails={() => router.push(`/business/${item.store_id}?itemId=${item.id}`)}
                    />
                  ) : (
                    <ProductCard 
                      item={item} 
                      businessName={item.stores?.name}
                      onViewDetails={() => router.push(`/business/${item.store_id}?itemId=${item.id}`)}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
