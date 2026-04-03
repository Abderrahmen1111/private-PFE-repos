'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, TrendingUp, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getDiscoverStories } from '@/lib/actions/stories';
import { getLatestStores } from '@/lib/actions/business';
import { getLatestItems } from '@/lib/actions/items';

interface SnapchatStory {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption: string;
  store_id: string;
  store_name: string;
  store_logo?: string;
  isSeen?: boolean;
  type?: 'STORY' | 'STORE' | 'ITEM';
}

export default function SnapchatReels() {
  const router = useRouter();
  const [stories, setStories] = useState<SnapchatStory[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function initReels() {
      try {
        setLoading(true);
        const [realStories, latestStores, latestItems] = await Promise.all([
          getDiscoverStories(6),
          getLatestStores(6),
          getLatestItems(8)
        ]);
        
        let mixedContent: SnapchatStory[] = [];

        // 1. Add Real Stories
        if (realStories && realStories.length > 0) {
          mixedContent.push(...realStories.map((s: any) => ({
            id: `story-${s.id}`,
            media_url: s.media_url,
            media_type: s.media_type,
            caption: s.caption || 'Nouveauté !',
            store_id: s.store_id?.toString() || '',
            store_name: s.stores?.name || 'Magasin',
            store_logo: s.stores?.logo_url || undefined,
            isSeen: false,
            type: 'STORY'
          })));
        }

        // 2. Add Latest Items (Products/Services)
        if (latestItems && latestItems.length > 0) {
          const itemStories: SnapchatStory[] = latestItems.map((item: any) => ({
            id: `item-${item.id}`,
            media_url: item.main_image,
            media_type: 'image' as const,
            caption: `${item.item_type === 'SERVICE' ? 'Service' : 'Produit'} : ${item.name}`,
            store_id: item.store_id.toString(),
            store_name: item.stores?.name || 'Vendeur',
            store_logo: item.stores?.logo_url || undefined,
            isSeen: false,
            type: 'ITEM'
          }));
          mixedContent.push(...itemStories);
        }

        // 3. Fallback/Fill with Stores
        if (latestStores && latestStores.length > 0) {
          const storeStories: SnapchatStory[] = latestStores.map((store: any, idx: number) => ({
            id: `store-${store.id}`,
            media_url: store.logo_url || `https://images.unsplash.com/photo-${idx % 2 === 0 ? '1555396273-367ea4eb4db5' : '1441986300917-64674bd600d8'}?w=500&q=80`,
            media_type: 'image' as const,
            caption: `Nouveau commerce : ${store.name}`,
            store_id: store.id.toString(),
            store_name: store.name,
            store_logo: store.logo_url,
            isSeen: false,
            type: 'STORE'
          }));
          mixedContent.push(...storeStories);
        }

        // De-duplicate by store_id or Shuffle if needed
        // For now, let's just use the mixed content and sort it a bit
        setStories(mixedContent.slice(0, 15));
        
      } catch (error) {
        console.error('Failed to init reels:', error);
      } finally {
        setLoading(false);
      }
    }
    
    initReels();
  }, []);

  const handleStoreClick = (story: any) => {
    if (story.store_id) {
       router.push(`/merchants/business/${story.store_id}`);
    } else {
       router.push('/search');
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-black/5 backdrop-blur-md border-b border-white/5">
        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
      </div>
    );
  }

  return (
    <section className="relative z-20 bg-black/5 backdrop-blur-md border-b border-white/5 pt-8 pb-12 overflow-hidden select-none">
      {/* Subtle Radiant Glow (Background) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative px-4">
        
        {/* ─── Top Stories (Circular Bubbles - Premium Polish) ──────────────── */}
        <div className="mb-10 lg:mb-12">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight leading-none">Vivre l'instant</h2>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1.5">Directement de Sfax</p>
              </div>
            </div>
            <button 
               onClick={() => router.push('/search')}
               className="px-4 py-2 rounded-full text-xs font-bold text-white/50 hover:text-white hover:bg-white/5 transition-all duration-300 flex items-center gap-2 border border-white/5 hover:border-white/10 group"
            >
              Explorer
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          
          <div className="flex gap-7 overflow-x-auto pb-4 px-2 scrollbar-none snap-x h-full no-scrollbar">
            {stories.map((story) => (
              <button 
                key={story.id}
                onClick={() => handleStoreClick(story)}
                className="flex flex-col items-center gap-3.5 shrink-0 snap-start group relative"
              >
                {/* Glow ring for unseen stories */}
                {!story.isSeen && (
                  <div className="absolute -inset-1.5 bg-gradient-to-tr from-yellow-400/20 via-rose-500/20 to-purple-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                )}

                <div className={`relative p-[3px] rounded-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110 shadow-2xl ${
                  story.isSeen 
                    ? 'bg-white/10' 
                    : 'bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600'
                }`}>
                  {/* Subtle rotating pulse animation on active stories */}
                  {!story.isSeen && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 blur-[2px] opacity-40 group-hover:opacity-60 animate-[spin_8s_linear_infinite]" />
                  )}

                  <div className="relative p-[2px] rounded-full bg-[#0a0a0a]">
                     <Avatar className="size-16 sm:size-20 border border-white/5 shadow-inner">
                        <AvatarImage src={story.store_logo} alt={story.store_name} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-b from-slate-800 to-slate-900 text-white/20 font-black text-xl text-center">
                          {story.store_name.charAt(0)}
                        </AvatarFallback>
                     </Avatar>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[12px] font-bold text-white/60 group-hover:text-white transition-colors tracking-wide max-w-[80px] truncate">
                    {story.store_name}
                  </span>
                  {!story.isSeen && (
                    <div className="w-1 h-1 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ─── Discover Grid (Premium Cards Design) ─────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-widest uppercase text-left">Découverte</h2>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1.5 text-left">Les tendances à Sfax</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-8">
            {stories.map((story, i) => (
              <button
                key={story.id}
                onClick={() => handleStoreClick(story)}
                className="relative aspect-[2.8/4] rounded-[2.5rem] overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-indigo-500/20 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-3 border border-white/5"
              >
                {/* Immersive Media */}
                <img 
                  src={story.media_url} 
                  alt={story.caption}
                  className="absolute inset-0 size-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                />

                {/* Multi-layered Overlays for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-transparent opacity-50" />
                <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Content Container */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                     <div className="px-4 py-1.5 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-xl overflow-hidden group/tag">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/tag:translate-x-full transition-transform duration-1000" />
                        <span className="relative text-white text-[11px] font-black uppercase tracking-widest truncate max-w-[100px]">
                           {story.store_name}
                        </span>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 scale-75 group-hover:scale-100">
                        <Play className="w-4 h-4 text-white fill-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                     </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-white text-[15px] sm:text-[17px] font-black leading-tight line-clamp-3 text-left drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] group-hover:translate-x-1 transition-transform">
                      {story.caption}
                    </p>
                    <div className="h-1.5 bg-gradient-to-r from-primary via-rose-500 to-indigo-500 rounded-full w-1/4 group-hover:w-full transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] opacity-70" />
                  </div>
                </div>

                {/* Live Badge (Premium Style) */}
                {i % 3 === 0 && (
                  <div className="absolute top-5 left-5 overflow-hidden">
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-rose-600/90 backdrop-blur-xl border border-white/20 shadow-2xl">
                      <div className="relative size-2">
                        <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-75" />
                        <div className="relative size-full rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,1)]" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-tighter text-white">Live</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}

