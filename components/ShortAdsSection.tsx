'use client';

import { useEffect, useState } from 'react';
import { Play, Store, ChevronRight, Loader2, PlusCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StoriesCarousel } from '@/components/ui/stories-carousel';
import { getDiscoverStories } from '@/lib/actions/stories';
import Link from 'next/link';

interface Story {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption: string | null;
  store_id: string;
  author_id: string;
  created_at: string;
  stores: {
    name: string;
    logo_url: string | null;
  };
}

export default function ShortAdsSection() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStories() {
      try {
        const data = await getDiscoverStories();
        setStories(data as Story[]);
      } catch (err) {
        console.error('Failed to load stories:', err);
        setError('Impossible de charger les Reels communautaires.');
      } finally {
        setIsLoading(false);
      }
    }
    loadStories();
  }, []);

  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des Reels communautaires...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
             <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-red-900">Erreur de chargement</h3>
             <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
              <Play className="w-3 h-3 fill-current" /> En Direct
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Reels Communautaires</h2>
            <p className="text-slate-500 text-lg">Découvrez les dernières nouveautés de nos marchands</p>
          </div>
          
          <Button variant="outline" className="group border-slate-200 hover:border-primary hover:bg-primary/5 transition-all h-12 px-6" asChild>
            <Link href="/discover" className="flex items-center gap-2">
              Voir Tout <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {stories.length > 0 ? (
          <div className="relative">
            <StoriesCarousel 
              stories={stories.map(s => ({
                id: s.id,
                media_url: s.media_url,
                media_type: s.media_type,
                author: {
                  name: s.stores.name,
                  avatar: s.stores.logo_url || undefined,
                },
                caption: s.caption || undefined
              }))} 
            />
          </div>
        ) : (
          <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 py-16 text-center">
            <div className="max-w-sm mx-auto space-y-4">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <PlusCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Pas encore de Stories</h3>
                <p className="text-slate-500 text-sm">Soyez le premier à partager un moment fort de votre business avec la communauté !</p>
              </div>
              <Button asChild>
                <Link href="/dashboard">Créer une Story</Link>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}
