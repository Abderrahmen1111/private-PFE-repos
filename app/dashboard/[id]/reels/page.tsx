'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  getBusinessReels, 
  deleteReel,
  uploadAndPublishReel
} from '@/lib/actions/reels';
import { 
  getDashboardStories, 
  deleteStory, 
  uploadAndPublishStory 
} from '@/lib/actions/stories';
import { Card } from '@/components/ui/card';
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
  Smartphone,
  X,
  Upload,
  Scissors,
  Wand2,
  MessageSquare,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import AIAgent from '@/components/ai-agent/AIAgent';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const filters = [
  { name: 'none', class: 'none' },
  { name: 'vibrant', class: 'saturate(1.5) contrast(1.1)' },
  { name: 'noir', class: 'grayscale(1) contrast(1.2)' },
  { name: 'warm', class: 'sepia(0.3) saturate(1.2)' },
  { name: 'cool', class: 'hue-rotate(10deg) saturate(0.9)' },
];

export default function MediaManagementPage() {
  const { id } = useParams();
  const storeId = parseInt(id as string);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('reels');
  const [reels, setReels] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('none');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Camera & Recording
  const [mode, setMode] = useState<'upload' | 'record'>('record');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // UI state
  const [unmutedVideos, setUnmutedVideos] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (storeId) fetchData();
  }, [storeId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [r, s] = await Promise.all([
        getBusinessReels(storeId), 
        getDashboardStories(storeId)
      ]);
      setReels(r || []); 
      setStories(s || []);
    } catch (error) { 
      console.error(error);
      toast.error('Erreur lors du chargement des données'); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setTitle('');
    setPrice('');
    setCategory('');
    setSelectedFilter('none');
    setRecordingTime(0);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  };

  const handlePublish = async () => {
    if (!selectedFile) return toast.error('Sélectionnez un média');
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('storeId', storeId.toString());
      formData.append('title', title);
      formData.append('price', price || '0');
      formData.append('category', category);
      formData.append('filter', selectedFilter);

      if (activeTab === 'reels') {
        const result = await uploadAndPublishReel(formData);
        if (!result.success) throw new Error(result.error);
      } else {
        formData.append('caption', title);
        const result = await uploadAndPublishStory(formData);
        if (!result.success) throw new Error(result.error);
      }
      
      toast.success('Publié avec succès !');
      setIsDialogOpen(false);
      fetchData();
      resetForm();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Erreur lors de la publication');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (reelId: number) => {
    if (!confirm('Supprimer ce contenu ?')) return;
    setIsDeleting(reelId);
    try {
      await deleteReel(reelId);
      toast.success('Supprimé avec succès');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteStory = async (storyId: number) => {
    if (!confirm('Supprimer cette story ?')) return;
    try {
      await deleteStory(storyId);
      toast.success('Story supprimée');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Camera & Recording Logic
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, 
        audio: true 
      });
      setStream(s);
    } catch (err) { 
      toast.error("Accès caméra refusé"); 
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
  };

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
    };
    recorder.start(); 
    setMediaRecorder(recorder); 
    setIsRecording(true);
    setRecordingTime(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 119) {
          recorder.stop();
          setIsRecording(false);
          return 120;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-[#050811] text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black flex items-center gap-3 tracking-tighter uppercase italic">
            <div className="bg-red-500 p-2 rounded-2xl shadow-lg shadow-red-500/40">
              <Smartphone className="text-white w-6 h-6" />
            </div>
            Contenu <span className="text-primary italic">Live</span>
          </h1>
          <p className="text-white/40 font-medium">Gérez votre présence visuelle en temps réel.</p>
        </div>
        <Button 
          onClick={() => { setIsDialogOpen(true); setMode('upload'); resetForm(); }} 
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
                    <Card key={r.id} className="bg-white/5 border-0 aspect-[9/16] rounded-3xl overflow-hidden relative group ring-1 ring-white/5 shadow-2xl">
                      {r.media_type === 'video' ? (
                        <video src={r.media_urls?.[0] || r.media_path} className="size-full object-cover" muted loop autoPlay />
                      ) : (
                        <img src={r.media_urls?.[0] || r.media_path} className="size-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-5">
                        <p className="font-bold text-sm mb-3 line-clamp-2">{r.title}</p>
                        <div className="flex gap-2">
                           <Button variant="destructive" className="flex-1 rounded-xl font-bold" onClick={() => handleDelete(r.id)} disabled={isDeleting === r.id}>
                             {isDeleting === r.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4 mr-2" />}
                             Supprimer
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
                    <Card key={s.id} className="bg-white/5 border-0 aspect-[9/16] rounded-3xl overflow-hidden relative group ring-1 ring-white/5 shadow-2xl">
                      {s.media_type === 'video' ? (
                        <video src={s.media_url} className="size-full object-cover" muted loop autoPlay />
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
                        <Button variant="destructive" className="rounded-xl font-bold" onClick={() => handleDeleteStory(s.id)}>
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
        <DialogContent className="bg-slate-950 text-white border-white/10 sm:max-w-4xl rounded-[32px] p-0 overflow-hidden shadow-2xl">
          <div className="flex h-[600px]">
            {/* Visual Preview Side */}
            <div className="w-[350px] bg-black relative flex-shrink-0 group">
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
                      alt="Preview"
                    />
                  )}
                  <div className="absolute top-4 right-4">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60"
                      onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  
                  {/* Filter Selection */}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40">
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
                          <div className="size-full" style={{ filter: f.class, background: '#1e293b' }} />
                        </button>
                      ))}
                    </div>
                  </div>
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

                  <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                     <button 
                       onClick={isRecording ? () => mediaRecorder?.stop() : startRecording} 
                       className={cn(
                         "size-16 rounded-full border-4 border-white flex items-center justify-center transition-all relative group",
                         isRecording ? "bg-white text-red-600" : "bg-red-600/20 text-white hover:scale-105"
                       )}
                     >
                       {!isRecording && <div className="absolute inset-2 bg-red-600 rounded-full group-hover:scale-110 transition-transform" />}
                       {isRecording ? <StopCircle className="size-8 relative z-10" /> : <Circle className="size-8 relative z-10" />}
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
                    <p className="font-bold text-white/60 text-sm">Importer un fichier</p>
                    <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">MP4, JPG, PNG (MAX 50MB)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Form Side */}
            <div className="flex-1 p-8 flex flex-col bg-slate-900/50 overflow-y-auto">
              <div className="flex-1 space-y-6">
                <div className="space-y-1">
                   <h2 className="text-xl font-bold uppercase italic">Publier un <span className="text-primary italic">{activeTab === 'reels' ? 'Reel' : 'Story'}</span></h2>
                   <p className="text-xs text-white/40 font-medium tracking-tight">Partagez votre contenu avec votre audience.</p>
                </div>

                <div className="flex gap-4 p-1 bg-white/5 border border-white/10 rounded-2xl">
                  <button 
                    onClick={() => { setMode('record'); startCamera(); }}
                    className={cn(
                      "flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all",
                      mode === 'record' ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "text-white/40 hover:text-white"
                    )}
                  >
                    <Camera className="size-4" /> Caméra Live
                  </button>
                  <button 
                    onClick={() => { setMode('upload'); stopCamera(); }}
                    className={cn(
                      "flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all",
                      mode === 'upload' ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "text-white/40 hover:text-white"
                    )}
                  >
                    <Upload className="size-4" /> Import Fichier
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Titre / Légende</Label>
                    <Input 
                      placeholder="Décrivez votre contenu..." 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      className="bg-white/5 border-white/10 rounded-xl h-12"
                    />
                  </div>

                  {activeTab === 'reels' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Prix (DT)</Label>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          value={price} 
                          onChange={e => setPrice(e.target.value)} 
                          className="bg-white/5 border-white/10 rounded-xl h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Catégorie</Label>
                        <Input 
                          placeholder="Ex: Mode" 
                          value={category} 
                          onChange={e => setCategory(e.target.value)} 
                          className="bg-white/5 border-white/10 rounded-xl h-12"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-8 border-t border-white/10 mt-6">
                <Button 
                  onClick={handlePublish} 
                  disabled={isUploading || !selectedFile} 
                  className="w-full bg-red-600 hover:bg-red-700 py-7 rounded-2xl font-bold shadow-2xl shadow-red-600/20 transition-all text-lg"
                >
                  {isUploading ? (
                    <><Loader2 className="animate-spin mr-2" /> Publication en cours...</>
                  ) : (
                    <><Zap className="size-5 mr-2 fill-white" /> Mettre en ligne</>
                  )}
                </Button>
              </div>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload} 
            accept="video/*,image/*" 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}