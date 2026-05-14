'use client';

import { getBusinessStories } from '@/lib/actions/stories';
import { useEffect } from 'react';

import React, { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Story, 
  StoryProgress, 
  StoryControls, 
  StorySlide, 
  StoryOverlay,
} from '@/components/ui/story';
import { 
  PlusCircle, 
  Loader2, 
  Camera, 
  X, 
  Video as VideoIcon, 
  Send,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadStoryMedia, publishStory, recordStoryView } from '@/lib/actions/stories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CameraCapture from '@/components/CameraCapture';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

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
  author_id?: string;
  stores?: {
    name: string;
    logo_url?: string;
    owner_id: string;
  };
}

const ACCENT_COLORS = [
  'bg-rose-500', 'bg-blue-500', 'bg-purple-500',
  'bg-amber-500', 'bg-green-500', 'bg-cyan-500',
];

// ─── Story Viewer Dialog ───────────────────────────────────────────────────────
function StoryItem({ story, accentColor }: { story: RealStory; accentColor: string }) {
  const isBusinessOwner = story.author_id === story.stores?.owner_id;
  const authorName = isBusinessOwner ? 'Propriétaire' : (story.author?.full_name || 'Client');
  const avatarUrl = isBusinessOwner ? (story.stores?.logo_url || story.author?.avatar_url) : story.author?.avatar_url;

  const handleOpen = async () => {
    try { await recordStoryView(story.id); } catch { }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex flex-col items-center gap-1.5 group outline-none" onClick={handleOpen}>
          <div className="p-[2px] rounded-full bg-gradient-to-tr from-red-500 via-rose-400 to-orange-400 group-hover:from-red-400 group-hover:to-orange-300 transition-all duration-300 group-hover:scale-105">
            <div className="p-[1.5px] rounded-full bg-white relative">
              <Avatar className={`size-14 border border-transparent ${isBusinessOwner ? 'ring-2 ring-offset-2 ring-red-500' : ''}`}>
                <AvatarImage src={avatarUrl || ''} alt={authorName} className="object-cover" />
                <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">
                  {authorName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isBusinessOwner && (
                <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-0.5 rounded-full border-2 border-white shadow-sm">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
          </div>
          <span className="text-[11px] text-slate-600 font-semibold max-w-[68px] truncate">
            {authorName.split(' ')[0]}
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md aspect-[9/16] w-full max-h-[90vh] overflow-hidden p-0 rounded-3xl border-0 shadow-2xl">
        <DialogTitle className="sr-only">Story de {authorName}</DialogTitle>

        <Story className="relative size-full bg-black" duration={5000} mediaLength={1}>
          <DialogHeader className="absolute top-0 inset-x-0 z-20 px-4 pt-5 pb-2 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center gap-2.5">
              <Avatar className="size-9 border-2 border-white/60">
                <AvatarImage src={avatarUrl || ''} alt={authorName} className="object-cover" />
                <AvatarFallback>{authorName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <StoryProgress
                  className="flex-1"
                  progressWrapClass="h-1 bg-white/30 rounded-full overflow-hidden"
                  progressActiveClass={accentColor}
                />
                <div className="flex items-center gap-1.5 mt-1.5">
                   <span className="text-white text-xs font-bold truncate">
                    {authorName} {isBusinessOwner && <span className="ml-1 text-[10px] bg-red-600 px-1.5 py-0.5 rounded uppercase">Propriétaire</span>}
                  </span>
                  <span className="text-white/60 text-[10px]">
                    · {timeAgo(story.created_at)}
                  </span>
                </div>
              </div>
              <StoryControls variant="ghost" className="text-white hover:bg-white/10 rounded-full shrink-0 size-9 p-0" />
            </div>
          </DialogHeader>

          <StorySlide index={0} className="absolute inset-0 size-full">
            {story.media_type === 'video' ? (
              <video src={story.media_url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
            ) : (
              <img src={story.media_url} alt={story.caption || 'Story'} className="w-full h-full object-cover" />
            )}
            
            <DialogHeader className="absolute bottom-0 inset-x-0 z-10 p-8 pt-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              {story.caption && (
                <p className="text-[15px] font-medium text-white leading-relaxed text-center drop-shadow-lg mb-4">
                  {story.caption}
                </p>
              )}
            </DialogHeader>
          </StorySlide>

          <StoryOverlay />
        </Story>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Story Button & Publisher Dialog ──────────────────────────────────────
function AddStoryButton({ storeId, isOwner, onAdded }: { storeId: number; isOwner: boolean; onAdded: (story: RealStory) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  const resetState = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption('');
    setIsUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) {
      toast.error('Format non supporté (images ou vidéos uniquement)');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (max 50 MB)');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsDialogOpen(true);
  };

  const handleCameraCapture = (file: File) => {
    setShowCamera(false);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsDialogOpen(true);
  };

  const handlePublish = async () => {
    if (!selectedFile || !previewUrl) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadResult = await uploadStoryMedia(formData);
      if (uploadResult.error) {
        throw new Error(uploadResult.error);
      }
      if (!uploadResult.url) {
        throw new Error("Erreur lors de l'upload du fichier");
      }

      const isVideo = selectedFile.type.startsWith('video/');
      const result = await publishStory({
        storeId,
        mediaUrl: uploadResult.url,
        mediaType: isVideo ? 'video' : 'image',
        caption: caption.trim() || undefined,
      });

      if (result.success) {
        toast.success('Story publiée avec succès !');
        onAdded({
          id: result.storyId!,
          media_url: uploadResult.url,
          media_type: isVideo ? 'video' : 'image',
          caption: caption.trim() || undefined,
          views_count: 0,
          created_at: new Date().toISOString(),
          author_id: 'OWNER_MOCK_ID', // Temp ID for instant UI comparison
          author: {
            full_name: 'Vous',
            avatar_url: undefined
          },
          stores: isOwner ? {
            name: '',
            logo_url: undefined,
            owner_id: 'OWNER_MOCK_ID'
          } : undefined,
        });
        setIsDialogOpen(false);
        resetState();
      } else {
        throw new Error(result.error || 'Erreur lors de la publication');
      }
    } catch (error: any) {
      console.error('Story publish error:', error);
      toast.error(error.message || 'Erreur lors de la publication de la story');
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="relative flex flex-col items-center justify-center size-14 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 hover:border-red-500 hover:bg-red-50 hover:scale-105 transition-all duration-300"
          >
            <PlusCircle className="w-6 h-6 text-slate-400 group-hover:text-red-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="rounded-2xl p-2 bg-white border-slate-100 shadow-2xl">
          <DropdownMenuItem 
            className="rounded-xl flex items-center gap-3 py-3 cursor-pointer focus:bg-red-50 focus:text-red-600"
            onClick={() => fileRef.current?.click()}
          >
            <PlusCircle className="w-4 h-4" />
            <span className="font-bold text-sm text-slate-600">Galerie</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="rounded-xl flex items-center gap-3 py-3 cursor-pointer focus:bg-red-50 focus:text-red-600"
            onClick={() => setShowCamera(true)}
          >
            <Camera className="w-4 h-4" />
            <span className="font-bold text-sm text-slate-600">Caméra Live</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <span className="text-[11px] text-slate-500 font-semibold tracking-tight">Ma story</span>
      
      {showCamera && (
        <CameraCapture 
          onCapture={handleCameraCapture} 
          onClose={() => setShowCamera(false)} 
        />
      )}
      
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetState(); setIsDialogOpen(open); }}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-3xl border-0 shadow-2xl bg-white">
           <div className="relative aspect-[9/16] bg-slate-900 group">
              {selectedFile?.type.startsWith('video/') ? (
                <video src={previewUrl!} className="w-full h-full object-cover" autoPlay loop muted />
              ) : (
                <img src={previewUrl!} className="w-full h-full object-cover" alt="Preview" />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 bg-black/20 backdrop-blur-md text-white hover:bg-black/40 rounded-full"
                onClick={() => setIsDialogOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>

              <div className="absolute bottom-0 inset-x-0 p-6 space-y-4">
                <div className="space-y-2">
                   <Label htmlFor="story-caption" className="text-white/80 text-[11px] font-bold uppercase tracking-wider pl-1">
                    Légende
                  </Label>
                  <Input 
                    id="story-caption"
                    placeholder="Dites quelque chose..."
                    className="bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder:text-white/40 rounded-2xl h-12 focus:ring-red-500 focus:border-red-500"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                <Button 
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-xl shadow-red-600/20 disabled:opacity-50"
                  onClick={handlePublish}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Publication...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" />Publier maintenant</>
                  )}
                </Button>
              </div>

              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full ring-1 ring-white/10">
                {selectedFile?.type.startsWith('video/') ? (
                  <VideoIcon className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Camera className="w-3.5 h-3.5 text-white" />
                )}
                <span className="text-white text-[10px] font-bold tracking-tight">
                  {selectedFile?.type.startsWith('video/') ? 'VIDEO REEL' : 'PHOTO STORY'}
                </span>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000 / 3600;
  if (diff < 0.02) return "à l'instant";
  if (diff < 1) return `${Math.floor(diff * 60)}min`;
  if (diff < 24) return `${Math.floor(diff)}h`;
  return `${Math.floor(diff / 24)}j`;
}

// ─── Dialog Wrapper for Discover Feed ─────────────────────────────────────────
export function BusinessStoriesDialog({ 
  storeId, 
  isOpen, 
  onOpenChange,
  isOwner = false 
}: { 
  storeId: number; 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void;
  isOwner?: boolean;
}) {
  const [stories, setStories] = useState<RealStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && storeId) {
      setLoading(true);
      getBusinessStories(storeId).then(data => {
        setStories(data);
        setLoading(false);
      });
    }
  }, [isOpen, storeId]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black/95 border-0 p-0 overflow-hidden aspect-[9/16] rounded-3xl">
        <DialogTitle className="sr-only">Stories du commerce</DialogTitle>
        
        {loading ? (
          <div className="size-full flex items-center justify-center">
            <Loader2 className="animate-spin text-white/20 size-10" />
          </div>
        ) : stories.length > 0 ? (
          <Story className="relative size-full bg-black" duration={5000} mediaLength={stories.length}>
            {stories.map((story, i) => {
              const isBusinessOwner = story.author_id === story.stores?.owner_id;
              const authorName = isBusinessOwner ? 'Propriétaire' : (story.author?.full_name || 'Client');
              const avatarUrl = isBusinessOwner ? (story.stores?.logo_url || story.author?.avatar_url) : story.author?.avatar_url;
              const accentColor = ACCENT_COLORS[i % ACCENT_COLORS.length];

              return (
                <StorySlide key={story.id} index={i} className="absolute inset-0 size-full">
                  <div className="absolute top-0 inset-x-0 z-20 px-4 pt-8 bg-gradient-to-b from-black/80 to-transparent">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-9 border-2 border-white/60">
                        <AvatarImage src={avatarUrl || ''} alt={authorName} />
                        <AvatarFallback>{authorName.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1 min-w-0">
                        <StoryProgress className="flex-1" progressWrapClass="h-1 bg-white/30 rounded-full" progressActiveClass={accentColor} />
                        <span className="text-white text-xs font-bold mt-1">
                          {authorName} {isBusinessOwner && <span className="ml-1 text-[8px] bg-red-600 px-1 rounded uppercase">Propriétaire</span>}
                        </span>
                      </div>
                      <Button variant="ghost" className="text-white hover:bg-white/10 size-8 p-0 rounded-full" onClick={() => onOpenChange(false)}>
                        <X className="size-5" />
                      </Button>
                    </div>
                  </div>

                  {story.media_type === 'video' ? (
                    <video src={story.media_url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                  ) : (
                    <img src={story.media_url} alt="Story" className="w-full h-full object-cover" />
                  )}

                  {story.caption && (
                    <div className="absolute bottom-10 inset-x-0 p-6 text-center bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white font-medium">{story.caption}</p>
                    </div>
                  )}
                </StorySlide>
              );
            })}
            <StoryOverlay />
          </Story>
        ) : (
          <div className="size-full flex flex-col items-center justify-center text-white/40 gap-3">
             <VideoIcon className="size-12 opacity-20" />
             <p>Aucune story active</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────
interface BusinessStoriesProps {
  businessName: string;
  storeId: number;
  initialStories?: RealStory[];
  canAddStory?: boolean;
}

export function BusinessStories({ storeId, initialStories = [], canAddStory = false, isOwner = false }: BusinessStoriesProps & { isOwner?: boolean }) {
  const [stories, setStories] = useState<RealStory[]>(initialStories);

  const handleAdded = (newStory: RealStory) => {
    setStories(prev => [newStory, ...prev]);
  };

  if (stories.length === 0 && !canAddStory) {
    return null;
  }

  return (
    <div className="bg-white border-y border-slate-100 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-5">
           <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
              <Camera className="w-4 h-4 text-red-500" />
            </div>
            <div>
               <h2 className="text-sm font-black text-slate-900 tracking-tight leading-none uppercase">Stories Communauté</h2>
               <p className="text-[10px] font-bold text-slate-400 tracking-wide mt-1 uppercase">Partagez votre expérience en live</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{stories.length} Actives</span>
          </div>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x h-full">
          {/* Add story button restricted by canAddStory */}
          {canAddStory && <AddStoryButton storeId={storeId} isOwner={isOwner} onAdded={handleAdded} />}
          
          {/* Real stories */}
          {stories.map((story, i) => (
            <div key={story.id} className="snap-start shrink-0">
               <StoryItem story={story} accentColor={ACCENT_COLORS[i % ACCENT_COLORS.length]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}