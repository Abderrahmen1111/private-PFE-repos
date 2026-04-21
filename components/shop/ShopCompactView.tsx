'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ShoppingBag, ArrowRight } from 'lucide-react';
import { getLatestItems } from '@/lib/actions/items';
import { ProductCard } from '@/components/ProductCard';
import { ServiceCard } from '@/components/ServiceCard';
import { useRouter } from 'next/navigation';

export function ShopCompactView() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const data = await getLatestItems(12);
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
    <div className="flex flex-col h-full bg-black text-white">
      {/* Search Bar */}
      <div className="p-4 border-b border-white/5 bg-zinc-950/50">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
          <input 
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium tracking-wide">Chargement de la boutique...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 p-8">
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-zinc-600" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-medium">Aucun produit trouvé</p>
              <p className="text-zinc-600 text-xs mt-1">Essayez d'autres mots-clés</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="scale-[0.9] origin-top mb-[-1.5rem]">
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
              </div>
            ))}
            
            <button 
              onClick={() => router.push('/shop')}
              className="mt-8 mb-4 w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
            >
              Voir tout le catalogue
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
