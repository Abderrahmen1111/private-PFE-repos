'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, X, Plus } from 'lucide-react';
import { Item } from '@/lib/actions/items';
import { useActionDrawer } from '@/hooks/useActionDrawer';

interface Props {
  businessName: string;
  items: Item[];
  storeId?: number;
  isLinkedToStore?: boolean;
}

export default function BusinessCommandSidebar({
  businessName,
  items,
  storeId,
  isLinkedToStore = true,
}: Props) {
  const [showCommand, setShowCommand] = useState(false);
  const { openDrawer } = useActionDrawer();

  // Listen for event to open sidebar from ProductCard
  useEffect(() => {
    const handleOpenCommand = (event: Event) => {
      const customEvent = event as CustomEvent;
      setShowCommand(true);
      // Auto-click the product item if provided
      setTimeout(() => {
        const productElement = document.querySelector(`[data-product-id="${customEvent.detail.item?.id}"]`);
        if (productElement) {
          (productElement as HTMLElement).click();
        }
        // Smooth scroll to sidebar
        document.getElementById('command-sidebar')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };

    window.addEventListener('openCommandSidebar', handleOpenCommand);
    return () => window.removeEventListener('openCommandSidebar', handleOpenCommand);
  }, []);

  const products = items.filter(i => i.item_type === 'PRODUCT');

  if (products.length === 0 || !isLinkedToStore) return null;

  return (
    <div id="command-sidebar" className="space-y-3 pt-3 border-t border-gray-50 scroll-mt-24">
      {/* ── Command Button ────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setShowCommand(!showCommand)}
        className={`w-full font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all border-2 active:scale-[0.98] ${
          showCommand
            ? 'bg-slate-100 border-slate-200 text-slate-700'
            : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
        }`}
      >
        {showCommand ? <><X className="w-4 h-4" /> Fermer</> : 'Commander'}
      </button>

      {/* ── Command/Products list (slides in below) ────────────────────────── */}
      {showCommand && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between mb-2 pb-3 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-black text-slate-900">Catalogue</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Achat direct</p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                {products.length} articles
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide py-1">
              {products.map(item => (
                <div
                  key={item.id}
                  data-product-id={item.id}
                  onClick={() => openDrawer('checkout', { item, businessName, storeId })}
                  className="group flex flex-col bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer overflow-hidden p-2"
                >
                  <div className="aspect-square rounded-lg bg-white overflow-hidden mb-2 relative">
                    {item.main_image ? (
                      <img src={item.main_image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl bg-slate-50">📦</div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{item.name}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-blue-600">{item.price.toLocaleString()} DT</p>
                      <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                document.getElementById('items-section')?.scrollIntoView({ behavior: 'smooth' });
                setShowCommand(false);
              }}
              className="w-full py-2.5 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all text-center border border-transparent hover:border-blue-100 mt-2"
            >
              Voir en grand format
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
