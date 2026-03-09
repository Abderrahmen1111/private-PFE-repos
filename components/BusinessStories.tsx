'use client';

import React, { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Story, StoryProgress, StoryControls, StorySlide, StoryOverlay } from '@/components/ui/story';
import { PlusCircle, Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { uploadStoryMedia, publishStory, recordStoryView } from '@/lib/actions/stories';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface RealStory {
  id: number;
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  views_count: number;
  created_at: string;
  author: {
    full_name: string;
    avatar_url?: string;
  } | null;
}

const ACCENT_COLORS = [
  'bg-rose-500', 'bg-blue-500', 'bg-purple-500',
  'bg-amber-500', 'bg-green-500', 'bg-cyan-500',
];

// ─── Story Viewer Dialog ───────────────────────────────────────────────────────
function StoryItem({ story, accentColor }: { story: RealStory; accentColor: string }) {
  const authorName = story.author?.full_name || 'Client';

  const handleOpen = async () => {
    try { await recordStoryView(story.id); } catch { }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex flex-col items-center gap-1.5 group" onClick={handleOpen}>
          <div className="p-[2px] rounded-full bg-gradient-to-tr from-red-500 via-rose-400 to-orange-400 group-hover:from-red-400 group-hover:to-orange-300 transition-all duration-200">
            <div className="p-[2px] rounded-full bg-white">
              <Avatar className="size-14">
                <AvatarImage src={story.author?.avatar_url || ''} alt={authorName} />
                <AvatarFallback>{authorName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <span className="text-xs text-gray-600 font-medium max-w-[64px] truncate">
            {authorName.split(' ')[0]}
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="aspect-[12/16] w-auto h-[90vh] overflow-hidden p-0 rounded-2xl border-0">
        <DialogTitle className="sr-only">Story de {authorName}</DialogTitle>

        <Story className="relative size-full" duration={5000} mediaLength={1}>
          <DialogHeader className="absolute top-0 inset-x-0 z-20 px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <Avatar className="size-9 border-2 border-white/60">
                <AvatarImage src={story.author?.avatar_url || ''} alt={authorName} />
                <AvatarFallback>{authorName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <StoryProgress
                  className="flex-1"
                  progressWrapClass="h-1 bg-white/30"
                  progressActiveClass={accentColor}
                />
                <span className="text-white text-xs font-semibold mt-1 truncate">
                  {authorName} · {timeAgo(story.created_at)}
                </span>
              </div>
              <StoryControls variant="ghost" className="text-white rounded-full shrink-0 size-8" />
            </div>
          </DialogHeader>

          <StorySlide index={0} className="absolute inset-0 size-full">
            {story.media_type === 'video' ? (
              <video src={story.media_url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
            ) : (
              <img src={story.media_url} alt={story.caption || 'Story'} className="w-full h-full object-cover" />
            )}
            {story.caption && (
              <div className="absolute bottom-0 inset-x-0 z-10 p-6 space-y-1 text-white">
                <p className="text-sm text-white/90 leading-snug">{story.caption}</p>
              </div>
            )}
          </StorySlide>

          <StoryOverlay />
        </Story>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Story Button ──────────────────────────────────────────────────────────
function AddStoryButton({ storeId, onAdded }: { storeId: number; onAdded: (story: RealStory) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      toast.error('Veuillez sélectionner une image ou une vidéo.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Fichier trop lourd (max 50 MB).');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const url = await uploadStoryMedia(formData);
    if (!url) {
      toast.error("Erreur lors de l'upload.");
      setIsUploading(false);
      return;
    }

    const caption = window.prompt('Ajouter un texte à votre story ? (facultatif)') || undefined;

    const result = await publishStory({
      storeId,
      mediaUrl: url,
      mediaType: isVideo ? 'video' : 'image',
      caption,
    });

    if (result.success) {
      toast.success('Votre story a été publiée !');
      // Add to local list immediately without re-fetch
      onAdded({
        id: result.storyId!,
        media_url: url,
        media_type: isVideo ? 'video' : 'image',
        caption,
        views_count: 0,
        created_at: new Date().toISOString(),
        author: null,
      });
    } else {
      toast.error(result.error || 'Erreur lors de la publication.');
    }

    setIsUploading(false);
    // Reset input
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={() => fileRef.current?.click()}
        disabled={isUploading}
        className="relative flex flex-col items-center justify-center size-14 rounded-full border-2 border-dashed border-gray-300 bg-gray-100 hover:border-red-400 hover:bg-red-50 transition-colors"
      >
        {isUploading ? (
          <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
        ) : (
          <PlusCircle className="w-6 h-6 text-gray-400" />
        )}
      </button>
      <span className="text-xs text-gray-500 font-medium">
        {isUploading ? 'Upload...' : 'Ma story'}
      </span>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000 / 3600;
  if (diff < 1) return "à l'instant";
  if (diff < 24) return `${Math.floor(diff)}h`;
  return `${Math.floor(diff / 24)}j`;
}

// ─── Main exported component ──────────────────────────────────────────────────
interface BusinessStoriesProps {
  businessName: string;
  storeId: number;
  initialStories?: RealStory[];
}

export function BusinessStories({ businessName, storeId, initialStories = [] }: BusinessStoriesProps) {
  const [stories, setStories] = useState<RealStory[]>(initialStories);

  const handleAdded = (newStory: RealStory) => {
    setStories(prev => [newStory, ...prev]);
  };

  if (stories.length === 0) {
    return (
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-1 mb-3">
            <Camera className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-900">Stories clients</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
            <AddStoryButton storeId={storeId} onAdded={handleAdded} />
            <div className="flex items-center text-xs text-gray-400 italic">
              Soyez le premier à partager votre expérience !
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-1 mb-3">
          <h2 className="text-sm font-bold text-gray-900">Stories clients</h2>
          <span className="text-xs text-gray-400 font-normal ml-1">· {stories.length} récent{stories.length > 1 ? 'es' : 'e'}</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
          {/* Add story button always first */}
          <AddStoryButton storeId={storeId} onAdded={handleAdded} />
          {/* Real stories */}
          {stories.map((story, i) => (
            <StoryItem key={story.id} story={story} accentColor={ACCENT_COLORS[i % ACCENT_COLORS.length]} />
          ))}
        </div>
      </div>
    </div>
  );
}