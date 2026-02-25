'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Story, StoryProgress, StoryControls, StorySlide, StoryOverlay } from '@/components/ui/story';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CustomerStory {
  id: string;
  customerName: string;
  customerAvatar: string;
  handle: string;
  slides: {
    title: string;
    caption: string;
    image: string;
  }[];
  accentColor: string; // tailwind class for progress bar
}

interface BusinessStoriesProps {
  businessName: string;
  stories?: CustomerStory[];
}

// ─── Default placeholder stories ──────────────────────────────────────────────
const DEFAULT_STORIES: CustomerStory[] = [
  {
    id: '1',
    customerName: 'Sarah M.',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    handle: '@sarah_m',
    accentColor: 'bg-rose-500',
    slides: [
      {
        title: 'Amazing experience! ⭐⭐⭐⭐⭐',
        caption: 'The service was absolutely incredible. Highly recommend to everyone!',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=900&fit=crop',
      },
      {
        title: 'Beautiful atmosphere 🌟',
        caption: 'Great vibes, great food. Will definitely be coming back soon.',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=900&fit=crop',
      },
    ],
  },
  {
    id: '2',
    customerName: 'James K.',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    handle: '@james_k',
    accentColor: 'bg-blue-500',
    slides: [
      {
        title: 'Must visit place 🔥',
        caption: 'Came here with my family and we had the best time. The staff is so welcoming.',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=900&fit=crop',
      },
      {
        title: 'Perfect for special occasions',
        caption: 'Celebrated my birthday here. The team went above and beyond!',
        image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=900&fit=crop',
      },
      {
        title: 'See you next time! 👋',
        caption: 'Already planning my next visit. This place is a hidden gem.',
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=900&fit=crop',
      },
    ],
  },
  {
    id: '3',
    customerName: 'Leila R.',
    customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    handle: '@leila_r',
    accentColor: 'bg-purple-500',
    slides: [
      {
        title: 'Loved every moment 💜',
        caption: 'The quality here is unmatched. Such a great find in the city.',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=900&fit=crop',
      },
    ],
  },
  {
    id: '4',
    customerName: 'Omar B.',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    handle: '@omar_b',
    accentColor: 'bg-amber-500',
    slides: [
      {
        title: 'Top notch quality 🏆',
        caption: 'Everything exceeded my expectations. Will tell all my friends about this.',
        image: 'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=600&h=900&fit=crop',
      },
      {
        title: 'Great value for money 💯',
        caption: "Honestly, can't believe how good it is for the price. 10/10.",
        image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&h=900&fit=crop',
      },
    ],
  },
  {
    id: '5',
    customerName: 'Nina T.',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    handle: '@nina_t',
    accentColor: 'bg-green-500',
    slides: [
      {
        title: 'A true gem 💎',
        caption: 'One of those places you keep coming back to. The details matter here.',
        image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600&h=900&fit=crop',
      },
    ],
  },
];

// ─── Single story avatar trigger ──────────────────────────────────────────────
function StoryItem({ story }: { story: CustomerStory }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex flex-col items-center gap-1.5 group">
          {/* Avatar with gradient ring */}
          <div className="p-[2px] rounded-full bg-gradient-to-tr from-red-500 via-rose-400 to-orange-400 group-hover:from-red-400 group-hover:to-orange-300 transition-all duration-200">
            <div className="p-[2px] rounded-full bg-white">
              <Avatar className="size-14">
                <AvatarImage src={story.customerAvatar} alt={story.customerName} />
                <AvatarFallback>{story.customerName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <span className="text-xs text-gray-600 font-medium max-w-[64px] truncate">
            {story.customerName.split(' ')[0]}
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="aspect-[12/16] w-auto h-[90vh] overflow-hidden p-0 rounded-2xl border-0">
        <DialogTitle className="sr-only">Story by {story.customerName}</DialogTitle>

        <Story className="relative size-full" duration={5000} mediaLength={story.slides.length}>
          {/* Header: avatar + progress + controls */}
          <DialogHeader className="absolute top-0 inset-x-0 z-20 px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <Avatar className="size-9 border-2 border-white/60">
                <AvatarImage src={story.customerAvatar} alt={story.customerName} />
                <AvatarFallback>{story.customerName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <StoryProgress
                  className="flex-1"
                  progressWrapClass="h-1 bg-white/30"
                  progressActiveClass={story.accentColor}
                />
                <span className="text-white text-xs font-semibold mt-1 truncate">
                  {story.customerName} · {story.handle}
                </span>
              </div>
              <StoryControls variant="ghost" className="text-white rounded-full shrink-0 size-8" />
            </div>
          </DialogHeader>

          {/* Slides */}
          {story.slides.map((slide, idx) => (
            <StorySlide key={idx} index={idx} className="absolute inset-0 size-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 z-10 p-6 space-y-1 text-white">
                <h3 className="font-bold text-lg leading-tight">{slide.title}</h3>
                <p className="text-sm text-white/80 leading-snug">{slide.caption}</p>
              </div>
            </StorySlide>
          ))}

          <StoryOverlay />
        </Story>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────
export function BusinessStories({ businessName, stories = DEFAULT_STORIES }: BusinessStoriesProps) {
  return (
    <div className="bg-white border-b px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-1 mb-3">
          <h2 className="text-sm font-bold text-gray-900">Customer Stories</h2>
          <span className="text-xs text-gray-400 font-normal ml-1">· {stories.length} recent</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
          {stories.map((story) => (
            <StoryItem key={story.id} story={story} />
          ))}
        </div>
      </div>
    </div>
  );
}