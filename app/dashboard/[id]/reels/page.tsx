'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  getBusinessReels, 
  deleteReel, 
} from '@/lib/actions/reels';
import { uploadToSupabase } from '@/lib/upload';
import { supabase } from "@/lib/supabase/browser";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  RefreshCw,
  AlertCircle,
  Heart,
  Bookmark,
  Target,
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function ReelsPage() {
  const { id } = useParams();
  const storeId = parseInt(id as string);

  const [reels, setReels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [price, setPrice] = useState('');
  const [ctaType, setCtaType] = useState<'call' | 'whatsapp' | 'view'>('view');
  const [ctaValue, setCtaValue] = useState('');
  const [category, setCategory] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);

  // Camera & Recording states
  const [mode, setMode] = useState<'upload' | 'record'>('record');
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    fetchReels();
  }, [storeId]);

  const fetchReels = async () => {
    setIsLoading(true);
    try {
      const data = await getBusinessReels(storeId);
      setReels(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des reels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const oversized = files.find(f => f.size > 50 * 1024 * 1024);
    if (oversized) {
      toast.error(`Fichier ${oversized.name} trop lourd (max 50 MB)`);
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
    // keep single-file convenience `file` state for legacy upload logic
    setFile(files[0] || null);
  };
  
  const removeSelectedFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    // new supabase upload flow
    if (!file) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    if (!title) {
      toast.error('Veuillez donner un titre à votre reel');
      return;
    }

    setIsUploading(true);
    try {
      // determine file to upload (support recorded files which set selectedFiles)
      const uploadFile = file ?? selectedFiles[0] ?? null;
      if (!uploadFile) {
        toast.error('Aucun fichier à uploader');
        setIsUploading(false);
        return;
      }

      // 1. Upload file to storage
      const media_path = await uploadToSupabase(uploadFile, storeId);

      // 2. Save in DB
      await supabase.from('reels').insert({
        store_id: storeId,
        media_path: media_path,
        title,
        subtitle,
        price: price ? parseFloat(price) : undefined,
        currency: undefined,
        cta_type: ctaType,
      });

      toast.success('Reel uploaded successfully 🚀');
      setIsDialogOpen(false);
      // reset form
      setTitle('');
      setSubtitle('');
      setPrice('');
      setCtaValue('');
      setCategory('');
      setSelectedFiles([]);
      setPreviewUrls([]);
      setFile(null);
      fetchReels();
    } catch (err: any) {
      console.error(err);
      toast.error('Upload failed ❌');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (reelId: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce reel ?')) return;
    
    setIsDeleting(reelId);
    try {
      const result = await deleteReel(reelId);
      if (result.success) {
        toast.success('Reel supprimé');
        setReels(prev => prev.filter(r => r.id !== reelId));
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(null);
    }
  };

  const startCamera = async () => {
    try {
      // 1. Check for secure context
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        toast.error("La caméra nécessite un site sécurisé (HTTPS) pour fonctionner.");
        setMode('upload');
        return;
      }

      // 2. Check for navigator.mediaDevices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Votre navigateur ne supporte pas l'accès à la caméra.");
        setMode('upload');
        return;
      }

      // Check available devices
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
      setAvailableCameras(videoDevices);
      
      if (videoDevices.length === 0) {
        setCameraError("Aucune caméra physique détectée par votre navigateur.");
        return;
      }

      // 3. Try many-tiered request strategy
      let mediaStream: MediaStream;
      
      try {
        // High quality with audio first
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } }, 
          audio: true 
        });
      } catch (err) {
        console.warn("First attempt (V+A) failed, trying Video only", err);
        try {
          // Video only if audio is the problem
          mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } }
          });
        } catch (err2) {
          console.warn("Second attempt (V only) failed, trying simplest video", err2);
          // Last resort: any camera available
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
      }

      setStream(mediaStream);
      setCameraError(null);
      setIsPermissionDenied(false);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Camera error details:", err);
      let msg = "Erreur d'accès à la caméra";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = "Permission refusée. Vous devez autoriser la caméra dans les réglages.";
        setIsPermissionDenied(true);
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = "Aucune caméra détectée.";
      }
      setCameraError(msg);
      toast.error(msg);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startRecording = () => {
    if (!stream) return;
    
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const file = new File([blob], `recorded-reel-${Date.now()}.webm`, { type: 'video/webm' });
      setSelectedFiles([file]);
      setPreviewUrls([URL.createObjectURL(blob)]);
      stopCamera();
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    if (mode === 'record' && isDialogOpen && previewUrls.length === 0) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode, isDialogOpen, previewUrls.length]);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Discovery Reels</h1>
          <p className="text-muted-foreground">Gérez vos vidéos et photos qui apparaissent dans le flux Discover.</p>
        </div>

        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (open) {
              setMode('record');
              setPreviewUrls([]);
              setSelectedFiles([]);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/20"
              onClick={() => {
                setMode('record');
                setPreviewUrls([]);
                setSelectedFiles([]);
              }}
            >
              <Plus className="w-5 h-5 mr-2" /> Nouveau Reel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl bg-slate-900 border-slate-800 text-white scrollbar-hide max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Publier un nouveau Reel</DialogTitle>
              <DialogDescription className="text-slate-400">
                Partagez un moment de votre boutique avec vos futurs clients.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="flex bg-slate-800 p-1 rounded-xl">
                <Button 
                  variant={mode === 'upload' ? 'secondary' : 'ghost'} 
                  className="flex-1 rounded-lg"
                  onClick={() => { setMode('upload'); setPreviewUrls([]); }}
                >
                  Importer
                </Button>
                <Button 
                  variant={mode === 'record' ? 'secondary' : 'ghost'} 
                  className="flex-1 rounded-lg"
                  onClick={() => { setMode('record'); setPreviewUrls([]); setSelectedFiles([]); }}
                >
                  Caméra
                </Button>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold">
                  {mode === 'upload' ? 'Sélectionner des fichiers' : 'Enregistrer votre story'}
                </Label>
                
                <div 
                  className="border-2 border-dashed border-slate-700 rounded-2xl min-h-[200px] flex flex-col items-center justify-center bg-slate-800/50 hover:bg-slate-800/80 transition-colors cursor-pointer overflow-hidden relative group p-4"
                  onClick={() => mode === 'upload' && fileInputRef.current?.click()}
                >
                  {previewUrls.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 w-full">
                      {previewUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-[9/16] rounded-lg overflow-hidden border border-slate-700">
                          {selectedFiles[idx]?.type.startsWith('video/') ? (
                            <video src={url} className="w-full h-full object-cover" />
                          ) : (
                            <img src={url} className="w-full h-full object-cover" />
                          )}
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full scale-75"
                            onClick={(e) => { e.stopPropagation(); removeSelectedFile(idx); }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      {mode === 'upload' && (
                        <div 
                          className="flex flex-col items-center justify-center aspect-[9/16] rounded-lg border-2 border-dashed border-slate-700 hover:bg-slate-700/50 transition-colors"
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        >
                          <Plus className="w-6 h-6 text-slate-500" />
                        </div>
                      )}
                    </div>
                  ) : mode === 'record' ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                      {!stream ? (
                        <div className="flex flex-col items-center gap-4 p-6 text-center">
                          <div className="bg-slate-800/80 p-4 rounded-full mb-2">
                            <Camera className="w-12 h-12 text-slate-500" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-white">
                              {cameraError || "Accès caméra requis"}
                            </p>
                          </div>
                          
                          <Button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); startCamera(); }}
                            className="bg-red-600 text-white hover:bg-red-700 font-bold rounded-full px-8 shadow-lg shadow-red-500/20"
                          >
                            Réessayer / Autoriser
                          </Button>
                        </div>
                      ) : (
                        <>
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            muted 
                            playsInline 
                            className="w-full h-full object-cover"
                          />
                          
                          <div className="absolute bottom-8 flex flex-col items-center gap-4">
                            {isRecording ? (
                              <Button 
                                variant="destructive" 
                                size="lg" 
                                className="rounded-full h-16 w-16 p-0 border-4 border-white animate-pulse"
                                onClick={(e) => { e.stopPropagation(); stopRecording(); }}
                              >
                                <StopCircle className="w-8 h-8 fill-current" />
                              </Button>
                            ) : (
                              <Button 
                                variant="destructive" 
                                size="lg" 
                                className="rounded-full h-16 w-16 p-0 border-4 border-white"
                                onClick={(e) => { e.stopPropagation(); startRecording(); }}
                              >
                                <Circle className="w-8 h-8 fill-current" />
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="p-4 rounded-full bg-slate-700 text-slate-400 mb-2">
                        <Plus className="w-8 h-8" />
                      </div>
                      <span className="text-xs font-medium text-slate-400">Cliquez pour sélectionner</span>
                      <span className="text-[10px] text-slate-500 mt-1">MP4, JPG, PNG (Max 50MB)</span>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*" 
                  multiple={mode === 'upload'}
                  onChange={handleFileSelect} 
                />
              </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="title" className="text-sm font-semibold">Titre</Label>
                   <Input 
                     id="title" 
                     className="bg-slate-800 border-slate-700 focus:ring-red-500 text-white" 
                     placeholder="Ex: Nouvelle Collection"
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="category" className="text-sm font-semibold">Catégorie</Label>
                   <Input 
                     id="category" 
                     className="bg-slate-800 border-slate-700 focus:ring-red-500 text-white" 
                     placeholder="Ex: Mode"
                     value={category}
                     onChange={(e) => setCategory(e.target.value)}
                   />
                 </div>
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="subtitle" className="text-sm font-semibold">Sous-titre (Optionnel)</Label>
                 <Input 
                   id="subtitle" 
                   className="bg-slate-800 border-slate-700 focus:ring-red-500 text-white" 
                   placeholder="Dites-en plus..."
                   value={subtitle}
                   onChange={(e) => setSubtitle(e.target.value)}
                 />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="price" className="text-sm font-semibold">Prix (Optionnel)</Label>
                   <Input 
                     id="price" 
                     type="number"
                     className="bg-slate-800 border-slate-700 focus:ring-red-500 text-white" 
                     placeholder="0.00"
                     value={price}
                     onChange={(e) => setPrice(e.target.value)}
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="ctaType" className="text-sm font-semibold">Action Bouton</Label>
                   <select 
                     id="ctaType"
                     className="w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-sm focus:ring-2 focus:ring-red-500 outline-none text-white"
                     value={ctaType}
                     onChange={(e) => setCtaType(e.target.value as any)}
                   >
                     <option value="view">Voir plus</option>
                     <option value="call">Appeler</option>
                     <option value="whatsapp">WhatsApp</option>
                   </select>
                 </div>
               </div>
               
               {ctaType !== 'view' && (
                 <div className="space-y-2">
                   <Label htmlFor="ctaValue" className="text-sm font-semibold">
                     {ctaType === 'call' ? 'Numéro de téléphone' : 'Lien / Numéro WhatsApp'}
                   </Label>
                   <Input 
                     id="ctaValue" 
                     className="bg-slate-800 border-slate-700 focus:ring-red-500 text-white" 
                     placeholder={ctaType === 'call' ? '+216...' : 'https://wa.me/...'}
                     value={ctaValue}
                     onChange={(e) => setCtaValue(e.target.value)}
                   />
                 </div>
               )}
            </div>

            <DialogFooter>
              <Button variant="ghost" className="text-white hover:bg-slate-800" onClick={() => setIsDialogOpen(false)} disabled={isUploading}>Annuler</Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
                onClick={handleUpload}
                disabled={isUploading || (!file && selectedFiles.length === 0)}
              >
                {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publication...</> : 'Publier'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                    <video src={reel.media_url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={reel.media_url} className="w-full h-full object-cover" alt={reel.title} />
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
                         onClick={() => window.open(reel.media_url, '_blank')}
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

                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex flex-col items-center gap-1 text-[10px] font-bold text-white shadow-xl ring-1 ring-white/10">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-blue-400" />
                        {reel.stats?.views_count || 0}
                      </div>
                    </div>
                    
                    <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex flex-col items-center gap-1 text-[10px] font-bold text-white shadow-xl ring-1 ring-white/10">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                        {reel.stats?.likes_count || 0}
                      </div>
                    </div>

                    <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex flex-col items-center gap-1 text-[10px] font-bold text-white shadow-xl ring-1 ring-white/10">
                      <div className="flex items-center gap-1">
                        <Bookmark className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        {reel.stats?.saves_count || 0}
                      </div>
                    </div>

                    <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex flex-col items-center gap-1 text-[10px] font-bold text-white shadow-xl ring-1 ring-white/10">
                      <div className="flex items-center gap-1" title="Taux de complétion">
                        <Target className="w-3 h-3 text-green-400" />
                        {reel.stats?.views_count > 0 
                          ? Math.round(((reel.stats?.completions_count || 0) / reel.stats.views_count) * 100) 
                          : 0}%
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 flex items-center gap-2 group-hover:opacity-0 transition-opacity">
                    <div className="p-1 px-2 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
                      {reel.category || reel.media_type}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
