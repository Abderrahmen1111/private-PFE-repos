'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  getBusinessReels, 
  deleteReel,
  publishReel,
  uploadReelMedia
} from '@/lib/actions/reels';
import { 
  getDashboardStories, 
  deleteStory, 
  publishStory, 
  uploadStoryMedia 
} from '@/lib/actions/stories';
import { getAdminItemsByStoreId, Item } from '@/lib/actions/items';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Video, 
  Loader2, 
  Play,
  Camera,
  Circle,
  StopCircle,
  Heart,
  Bookmark,
  Target,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function MediaManagementPage() {
  const { id } = useParams();
  const storeId = parseInt(id as string);

  const [activeTab, setActiveTab] = useState('reels');
  const [reels, setReels] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Camera logic
  const [mode, setMode] = useState<'upload' | 'record'>('record');
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chunksRef = useRef<Blob[]>([]);

  // State for unmuted videos
  const [unmutedVideos, setUnmutedVideos] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchData();
  }, [storeId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [r, s] = await Promise.all([getBusinessReels(storeId), getDashboardStories(storeId)]);
      setReels(r); setStories(s);
    } catch { toast.error('Erreur'); } finally { setIsLoading(false); }
  };

  const handlePublish = async () => {
    if (!selectedFile) return toast.error('Sélectionnez un fichier');
    setIsUploading(true);
    try {
      const isVideo = selectedFile.type.startsWith('video/');
      if (activeTab === 'reels') {
        const formData = new FormData(); formData.append('file', selectedFile);
        const url = await uploadReelMedia(formData);
        if (!url) throw new Error();
        await publishReel({ 
          storeId, 
          mediaPath: url, 
          mediaType: isVideo ? 'video' : 'image', 
          title, 
          price: parseFloat(price) || 0, 
          category,
          metadata: { filter: selectedFilter }
        });
      } else {
        const formData = new FormData(); formData.append('file', selectedFile);
        const url = await uploadStoryMedia(formData);
        if (!url) throw new Error();
        await publishStory({ storeId, mediaUrl: url, mediaType: isVideo ? 'video' : 'image', caption: title });
      }
      toast.success('Publié avec succès !'); setIsDialogOpen(false); fetchData();
      resetForm();
    } catch { toast.error('Erreur lors de la publication'); } finally { setIsUploading(false); }
  };

  const resetForm = () => {
    setSelectedFile(null); setPreviewUrl(null); setTitle(''); setPrice(''); setCategory(''); setSelectedFilter('none');
    setRecordingTime(0);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' 
        }, 
        audio: true 
      });
      setStream(s);
    } catch (err) { 
      console.error("Camera error:", err);
      toast.error("Accès caméra refusé ou non supporté"); 
    }
  };

  const stopCamera = () => { stream?.getTracks().forEach(t => t.stop()); setStream(null); };

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const b = new Blob(chunksRef.current, { type: 'video/webm' });
      const f = new File([b], 'capture.webm', { type: 'video/webm' });
      setSelectedFile(f); 
      setPreviewUrl(URL.createObjectURL(b)); 
      stopCamera();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
    recorder.start(); 
    setMediaRecorder(recorder); 
    setIsRecording(true);
    setRecordingTime(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 119) {
          recorder.stop();
          toast.warning("Limite de 2 minutes atteinte");
          return 120;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 121) { // 2 mins max
          toast.error("La vidéo ne doit pas dépasser 2 minutes");
          return;
        }
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      };
      video.src = URL.createObjectURL(file);
    } else {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-[#050811] text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black flex items-center gap-3 tracking-tighter">
            <div className="bg-red-500 p-2 rounded-2xl shadow-lg shadow-red-500/40">
              <Smartphone className="text-white w-6 h-6" />
            </div>
            Contenu Live & Discover
          </h1>
          <p className="text-white/40 font-medium">Gérez votre présence visuelle en temps réel.</p>
        </div>
        <Button 
          onClick={() => { setIsDialogOpen(true); setMode('record'); resetForm(); }} 
          className="bg-red-600 hover:bg-red-700 font-bold px-8 py-6 rounded-2xl shadow-2xl shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="mr-2 w-5 h-5" /> Nouveau Contenu
        </Button>
      </div>

      <Tabs defaultValue="reels" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl mb-10 inline-flex w-full max-w-md">
          <TabsTrigger value="reels" className="flex-1 rounded-xl py-3 data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all font-bold">Reels Discover</TabsTrigger>
          <TabsTrigger value="stories" className="flex-1 rounded-xl py-3 data-[state=active]:bg-cyan-600 data-[state=active]:text-white transition-all font-bold">Stories Boutique</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
             <Loader2 className="animate-spin size-12 text-red-500" />
             <p className="text-white/40 font-bold animate-pulse">Chargement de vos médias...</p>
          </div>
        ) : (
          <>
            <TabsContent value="reels" className="focus:outline-none">
              {reels.length === 0 ? (
                <div className="text-center py-32 bg-white/5 rounded-[40px] border-2 border-dashed border-white/10">
                  <Video className="mx-auto size-16 text-white/10 mb-6" />
                  <h3 className="text-xl font-bold text-white/60">Aucun Reel publié</h3>
                  <p className="text-white/30 max-w-xs mx-auto mt-2 text-sm">Les Reels apparaissent dans le flux mondial pour attirer de nouveaux clients.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {reels.map(r => (
                    <Card key={r.id} className="bg-white/5 border-0 aspect-[9/16] rounded-3xl overflow-hidden relative group ring-1 ring-white/5">
                      {r.media_type === 'video' ? (
                        <video src={r.media_urls?.[0] || r.media_path} className="size-full object-cover" muted loop />
                      ) : (
                        <img src={r.media_urls?.[0] || r.media_path} className="size-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-5">
                        <p className="font-bold text-sm mb-3 line-clamp-2">{r.title}</p>
                        <div className="flex gap-2">
                           <Button variant="destructive" className="flex-1 rounded-xl font-bold" onClick={() => deleteReel(r.id).then(fetchData)}>
                             <Trash2 className="size-4 mr-2" /> Supprimer
                           </Button>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <div className="bg-black/60 backdrop-blur-md rounded-full px-3 py-1 text-[10px] font-bold flex items-center gap-1.5 ring-1 ring-white/10">
                          <Eye className="size-3 text-blue-400" /> {r.stats?.views_count || 0}
                        </div>
                        <div className="bg-black/60 backdrop-blur-md rounded-full px-3 py-1 text-[10px] font-bold flex items-center gap-1.5 ring-1 ring-white/10">
                          <Heart className="size-3 text-rose-500" /> {r.stats?.likes_count || 0}
                        </div>
                        <div className="bg-black/60 backdrop-blur-md rounded-full px-3 py-1 text-[10px] font-bold flex items-center gap-1.5 ring-1 ring-white/10">
                          <MessageSquare className="size-3 text-emerald-400" /> {r.stats?.comments_count || 0}
                        </div>
                        <div className="bg-black/60 backdrop-blur-md rounded-full px-3 py-1 text-[10px] font-bold flex items-center gap-1.5 ring-1 ring-white/10">
                          <Bookmark className="size-3 text-amber-400" /> {r.stats?.saves_count || 0}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="stories" className="focus:outline-none">
              {stories.length === 0 ? (
                <div className="text-center py-32 bg-white/5 rounded-[40px] border-2 border-dashed border-white/10">
                  <Camera className="mx-auto size-16 text-white/10 mb-6" />
                  <h3 className="text-xl font-bold text-white/60">Aucune Story active</h3>
                  <p className="text-white/30 max-w-xs mx-auto mt-2 text-sm">Les Stories durent 24h et apparaissent sur votre page business.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {stories.map(s => (
                    <Card key={s.id} className="bg-white/5 border-0 aspect-[9/16] rounded-3xl overflow-hidden relative group ring-1 ring-white/5">
                      {s.media_type === 'video' ? (
                        <video src={s.media_url} className="size-full object-cover" muted loop />
                      ) : (
                        <img src={s.media_url} className="size-full object-cover" />
                      )}
                      <div className="absolute top-4 left-4">
                        {new Date(s.expires_at) < new Date() 
                          ? <Badge variant="outline" className="bg-black/60 backdrop-blur-md">Expiré</Badge>
                          : <Badge className="bg-green-600 shadow-lg shadow-green-600/30">En Direct</Badge>}
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-5">
                        <p className="text-xs text-white/60 mb-3">Par: {s.author?.full_name || 'Propriétaire'}</p>
                        <Button variant="destructive" className="rounded-xl font-bold" onClick={() => deleteStory(s.id).then(fetchData)}>
                          <Trash2 className="size-4 mr-2" /> Supprimer
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) stopCamera(); }}>
        <DialogContent className="bg-slate-950 text-white border-white/10 sm:max-w-xl rounded-[32px] p-0 overflow-hidden shadow-2xl">
          <div className="flex h-full max-h-[85vh]">
            {/* Visual Preview Side */}
            <div className="w-[300px] bg-black relative flex-shrink-0 group">
              {previewUrl ? (
                <div className="size-full relative">
                  {selectedFile?.type.startsWith('video/') ? (
                    <video 
                      src={previewUrl} 
                      className="size-full object-cover" 
                      autoPlay 
                      loop 
                      muted 
                      style={{ filter: filters.find(f => f.name === selectedFilter)?.class || 'none' }}
                    />
                  ) : (
                    <img 
                      src={previewUrl} 
                      className="size-full object-cover" 
                      style={{ filter: filters.find(f => f.name === selectedFilter)?.class || 'none' }}
                    />
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60"
                      onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  
                  {/* Tools Overlay */}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-40">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex flex-col gap-2">
                      {filters.map((f) => (
                        <button
                          key={f.name}
                          onClick={() => setSelectedFilter(f.name)}
                          className={cn(
                            "w-10 h-10 rounded-xl transition-all border-2 overflow-hidden relative group",
                            selectedFilter === f.name ? "border-red-500 scale-110" : "border-transparent opacity-60 hover:opacity-100"
                          )}
                          title={f.name}
                        >
                          <div className="size-full bg-slate-800" style={{ filter: f.class }} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[6px] font-black uppercase text-white/40 group-hover:text-white transition-colors">{f.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedFile?.type.startsWith('video/') && (
                    <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Scissors className="w-3 h-3 text-red-500" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Durée</span>
                        </div>
                        <span className="text-[10px] font-black text-red-500">2:00 MAX</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>
                  )}
                </div>
              ) : mode === 'record' ? (
                <div className="size-full relative">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="size-full object-cover" 
                    style={{ filter: filters.find(f => f.name === selectedFilter)?.class || 'none' }}
                  />
                  
                  {/* Recording Interface */}
                  <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-red-600 rounded-full shadow-lg shadow-red-600/40 animate-pulse z-50">
                    <div className="w-2 h-2 rounded-full bg-white" />
                    <span className="text-[10px] font-black tracking-widest">
                      {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Filter Side Selection */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40">
                    {filters.slice(0, 5).map((f) => (
                      <button
                        key={f.name}
                        onClick={() => setSelectedFilter(f.name)}
                        className={cn(
                          "w-10 h-10 rounded-xl transition-all border-2 flex items-center justify-center bg-black/40 backdrop-blur-md",
                          selectedFilter === f.name ? "border-red-500 scale-110" : "border-white/10"
                        )}
                      >
                        <Wand2 className={cn("w-4 h-4", selectedFilter === f.name ? "text-red-500" : "text-white/40")} />
                      </button>
                    ))}
                  </div>

                  <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                     <button 
                       onClick={isRecording ? () => mediaRecorder?.stop() : startRecording} 
                       className={cn(
                         "size-20 rounded-full border-4 border-white flex items-center justify-center transition-all relative group",
                         isRecording ? "bg-white text-red-600" : "bg-red-600/20 text-white hover:scale-105"
                       )}
                     >
                       {!isRecording && <div className="absolute inset-2 bg-red-600 rounded-full group-hover:scale-110 transition-transform" />}
                       {isRecording ? <StopCircle className="size-10 relative z-10" /> : <Circle className="size-10 relative z-10" />}
                     </button>
                  </div>
                </div>
              ) : (
                <div 
                  className="size-full flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-colors p-8 text-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="p-5 bg-white/5 rounded-full ring-1 ring-white/10">
                    <Upload className="size-10 text-white/20" />
                  </div>
                  <div>
                    <p className="font-bold text-white/60">Importer un fichier</p>
                    <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">MP4, JPG, PNG (MAX 50MB)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Form Side */}
            <div className="flex-1 p-8 flex flex-col bg-slate-900/50">
              <div className="flex-1 space-y-6">
                <div className="space-y-1">
                   <h2 className="text-xl font-bold">Publier un {activeTab === 'reels' ? 'Reel' : 'Story'}</h2>
                   <p className="text-xs text-white/40">Complétez les informations avant de mettre en ligne.</p>
                </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : reels.length === 0 ? (
        <Card className="border-0 shadow-none bg-slate-50/50 dark:bg-slate-900/20 py-20">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-6 rounded-full bg-slate-100 dark:bg-slate-800 mb-6 group-hover:scale-110 transition-transform">
              <Video className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Aucun reel pour le moment</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
              Publiez votre premier reel pour booster votre visibilité sur le flux Discover et attirer de nouveaux clients.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="rounded-xl border-slate-200 dark:border-slate-800">
              <Plus className="w-4 h-4 mr-2" /> Commencer dès maintenant
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {reels.map((reel) => (
            <div key={reel.id} className="relative group">
              <Card className="overflow-hidden border-0 bg-slate-100 dark:bg-slate-900 aspect-[9/16] ring-1 ring-slate-200 dark:ring-white/5 shadow-md">
                <div className="p-0 h-full relative">
                  {reel.is_gallery ? (
                    <Carousel className="w-full h-full">
                      <CarouselContent className="h-full ml-0">
                        {reel.media_urls.map((url: string, idx: number) => (
                           <CarouselItem key={idx} className="pl-0 h-full">
                             <img src={url} className="w-full h-full object-cover" alt={`${reel.title} ${idx + 1}`} />
                           </CarouselItem>
                        ))}
                      </CarouselContent>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                        {reel.media_urls.map((_: any, idx: number) => (
                          <div key={idx} className="w-1.5 h-1.5 rounded-full bg-white/50" />
                        ))}
                      </div>
                    </Carousel>
                  ) : reel.media_type === 'video' ? (
                    <div className="relative w-full h-full">
                      <video 
                        key={reel.id}
                        controls
                        playsInline
                        preload="metadata"
                        muted={!unmutedVideos[reel.id]}
                        className="w-full h-full object-cover"
                      >
                        <source src={reel.media_urls?.[0] || reel.media_path} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      
                      {/* Unmute button overlay */}
                      {!unmutedVideos[reel.id] && (
                        <button
                          onClick={() => setUnmutedVideos(prev => ({ ...prev, [reel.id]: true }))}
                          className="absolute bottom-20 right-3 bg-black/60 backdrop-blur-md rounded-full p-2 z-10 hover:bg-black/80 transition"
                        >
                          <VolumeX className="w-4 h-4 text-white" />
                        </button>
                      )}
                      
                      {/* Mute button overlay when unmuted */}
                      {unmutedVideos[reel.id] && (
                        <button
                          onClick={() => setUnmutedVideos(prev => ({ ...prev, [reel.id]: false }))}
                          className="absolute bottom-20 right-3 bg-black/60 backdrop-blur-md rounded-full p-2 z-10 hover:bg-black/80 transition"
                        >
                          <Volume2 className="w-4 h-4 text-white" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <img src={reel.media_urls?.[0] || reel.media_path} className="w-full h-full object-cover" alt={reel.title} />
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p className="text-sm font-bold text-white mb-1">{reel.title}</p>
                    {reel.subtitle && <p className="text-[10px] text-white/70 line-clamp-2 mb-2">{reel.subtitle}</p>}
                    {reel.price && <p className="text-xs font-bold text-red-500 mb-3">{reel.price} {reel.currency}</p>}
                    
                    <div className="flex items-center justify-between gap-2">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="h-8 w-8 p-0 text-white hover:bg-white/20"
                         onClick={() => window.open(reel.media_urls?.[0] || reel.media_path, '_blank')}
                       >
                         <Play className="w-4 h-4" />
                       </Button>
                       <Button 
                        variant="destructive" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleDelete(reel.id)}
                        disabled={isDeleting === reel.id}
                      >
                        {isDeleting === reel.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {activeTab === 'reels' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Prix (TND)</Label>
                        <Input type="number" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} className="bg-white/5 border-white/10 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Catégorie</Label>
                        <Input placeholder="Ex: Mode" value={category} onChange={e => setCategory(e.target.value)} className="bg-white/5 border-white/10 rounded-xl" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <Button 
                  onClick={handlePublish} 
                  disabled={isUploading || !selectedFile} 
                  className="w-full bg-red-600 hover:bg-red-700 py-6 rounded-2xl font-bold shadow-xl shadow-red-600/20"
                >
                  {isUploading ? <><Loader2 className="animate-spin mr-2" />Publication...</> : 'Mettre en ligne'}
                </Button>
              </div>
            </div>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="video/*,image/*" />
        </DialogContent>
      </Dialog>
    </div>
  );
}