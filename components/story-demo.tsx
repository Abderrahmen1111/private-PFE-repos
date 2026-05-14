'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Stories,
  StoriesContent,
  Story as StoryCarouselItem,
  StoryCard,
} from '@/components/ui/stories-carousel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { getFollowedStoresStories, recordStoryView } from '@/lib/actions/stories';
import { Play, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RealStory {
  id: number;
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  views_count: number;
  created_at: string;
  author_id?: string;
  store_id: number;
  author?: {
    full_name: string;
    avatar_url?: string;
  } | null;
  stores?: {
    id: number;
    name: string;
    logo_url?: string;
    owner_id: string;
  };
}

interface StoryViewerProps {
  stories: RealStory[];
  initialIndex: number;
  onClose: () => void;
}

const ACCENT_COLORS = [
  'bg-rose-500', 'bg-blue-500', 'bg-purple-500',
  'bg-amber-500', 'bg-green-500', 'bg-cyan-500',
];

function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [autoProgress, setAutoProgress] = useState(true);
  const currentStory = stories[currentIndex];
  const isVideo = currentStory?.media_type === 'video';

  useEffect(() => {
    if (!autoProgress) return;

    const timer = setTimeout(() => {
      if (currentIndex < stories.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onClose();
      }
    }, isVideo ? 5000 : 3000);

    return () => clearTimeout(timer);
  }, [currentIndex, autoProgress, stories.length, isVideo, onClose]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!currentStory) return null;

  const isBusinessOwner = currentStory.author_id === currentStory.stores?.owner_id;
  const authorName = isBusinessOwner ? 'Propriétaire' : (currentStory.author?.full_name || 'Client');
  const avatarUrl = isBusinessOwner ? (currentStory.stores?.logo_url || currentStory.author?.avatar_url) : currentStory.author?.avatar_url;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="relative w-full max-w-md aspect-[9/16] bg-black rounded-2xl overflow-hidden flex flex-col">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
          {stories.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                'flex-1 h-0.5 rounded-full transition-all duration-300',
                idx === currentIndex ? 'bg-white' : 'bg-white/30'
              )}
            />
          ))}
        </div>

        {/* Story content */}
        <div className="flex-1 relative overflow-hidden">
          {isVideo ? (
            <video
              key={currentStory.id}
              src={currentStory.media_url}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              onEnded={handleNext}
            />
          ) : (
            <img
              src={currentStory.media_url}
              alt="Story"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Header with author info */}
        <div className="absolute top-8 left-4 right-4 z-20 flex items-center gap-2">
          <Avatar className="h-10 w-10 ring-2 ring-white/30">
            <AvatarImage src={avatarUrl || ''} alt={authorName} className="object-cover" />
            <AvatarFallback className="bg-slate-700 text-white text-xs">
              {authorName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{authorName}</p>
            <p className="text-white/70 text-xs truncate">{currentStory.stores?.name}</p>
          </div>
        </div>

        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-20">
            <p className="text-white text-sm">{currentStory.caption}</p>
          </div>
        )}

        {/* Navigation */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white/60 hover:text-white transition-colors"
          aria-label="Previous story"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white/60 hover:text-white transition-colors"
          aria-label="Next story"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Pause/Play toggle */}
        <button
          onClick={() => setAutoProgress(!autoProgress)}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
          aria-label={autoProgress ? 'Pause' : 'Play'}
        >
          {autoProgress ? (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <Play className="w-6 h-6 text-white fill-white" />
          )}
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-white/60 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export interface StoriesDemoProps {
  compact?: boolean;
}

export function StoriesDemo({ compact = false }: StoriesDemoProps) {
  const [stories, setStories] = useState<RealStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [viewedStories, setViewedStories] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const data = await getFollowedStoresStories(30);
        setStories(data);
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const handleStoryClick = async (index: number) => {
    const story = stories[index];
    
    // Record view
    try {
      await recordStoryView(story.id);
      setViewedStories(prev => new Set([...prev, story.id]));
    } catch (error) {
      console.error('Error recording view:', error);
    }

    setSelectedStoryIndex(index);
  };

  if (loading) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-background/50',
        compact ? 'h-20' : 'h-32'
      )}>
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (stories.length === 0) {
    return null;
  }

  return (
    <>
      <div className={cn(
        'border-b border-border/50 bg-background/30 backdrop-blur-sm',
        compact ? 'px-4 py-2' : 'px-4 py-3'
      )}>
        <Stories className="w-full">
          <StoriesContent>
            {stories.map((story, idx) => (
              <StoryCarouselItem
                key={story.id}
                isNew={!viewedStories.has(story.id)}
                onClick={() => handleStoryClick(idx)}
                className="cursor-pointer"
              >
                <div className={cn(
                  'relative rounded-lg overflow-hidden bg-muted aspect-[9/16] group',
                  compact ? 'w-12 h-20' : 'w-16 h-28'
                )}>
                  <img
                    src={story.media_url}
                    alt={`Story by ${story.author?.full_name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Story author info overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
                    <div className="flex items-center gap-1">
                      <Avatar className={cn(
                        'ring-2 ring-white',
                        compact ? 'h-6 w-6' : 'h-7 w-7'
                      )}>
                        <AvatarImage
                          src={story.stores?.logo_url || story.author?.avatar_url || ''}
                          alt={story.stores?.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-xs bg-slate-600">
                          {(story.stores?.name || 'S').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        'text-white font-semibold truncate line-clamp-1',
                        compact ? 'text-[10px]' : 'text-xs'
                      )}>
                        {story.stores?.name}
                      </span>
                    </div>
                  </div>
                </div>
              </StoryCarouselItem>
            ))}
          </StoriesContent>
        </Stories>
      </div>

      {/* Story Viewer Modal */}
      {selectedStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}
    </>
  );
}