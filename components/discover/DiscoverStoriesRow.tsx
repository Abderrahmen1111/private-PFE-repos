'use client';

import React, { useEffect, useState } from 'react';
import { getDiscoverStories } from '@/lib/actions/stories';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { BusinessStoriesDialog } from '@/components/BusinessStories';

export function DiscoverStoriesRow() {
  const [stories, setStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  useEffect(() => {
    async function loadStories() {
      const data = await getDiscoverStories(15);
      // Group by store to show one bubble per business
      const uniqueStores = data.reduce((acc: any[], story: any) => {
        if (!acc.find(s => s.store_id === story.store_id)) {
          acc.push(story);
        }
        return acc;
      }, []);
      setStories(uniqueStores);
      setIsLoading(false);
    }
    loadStories();
  }, []);

  if (isLoading && stories.length === 0) return null;
  if (!isLoading && stories.length === 0) return null;

  return (
    <div className="w-full py-4 px-2 overflow-x-auto no-scrollbar bg-gradient-to-b from-black/80 to-transparent flex items-center gap-4 z-50">
      {stories.map((story) => (
        <motion.button
          key={story.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedStoreId(story.store_id)}
          className="flex flex-col items-center gap-1 min-w-[70px]"
        >
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 ring-2 ring-black">
             <Avatar className="size-14 border-2 border-black">
                <AvatarImage src={story.stores?.logo_url || story.author?.avatar_url} />
                <AvatarFallback className="bg-slate-800 text-white font-bold text-xs">
                  {(story.stores?.name || story.author?.full_name || 'B')[0]}
                </AvatarFallback>
             </Avatar>
          </div>
          <span className="text-[10px] text-white/80 font-medium truncate w-16 text-center">
            {story.stores?.name || story.author?.full_name || 'Business'}
          </span>
        </motion.button>
      ))}

      {selectedStoreId && (
        <BusinessStoriesDialog 
          storeId={selectedStoreId} 
          isOpen={!!selectedStoreId} 
          onOpenChange={(open) => !open && setSelectedStoreId(null)}
          isOwner={false}
        />
      )}
    </div>
  );
}
