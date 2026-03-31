'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  getBusinessStories, 
  publishStory, 
  deleteStory, 
  uploadStoryMedia 
} from '@/lib/actions/stories';
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

export default function ReelsPage() {
  const { id } = useParams();
  const storeId = parseInt(id as string);

  const [stories, setStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Camera & Recording states
  const [mode, setMode] = useState<'upload' | 'record'>('upload');
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    fetchStories();
  }, [storeId]);

  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const data = await getBusinessStories(storeId);
      setStories(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des reels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Fichier trop lourd (max 50 MB)');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const mediaUrl = await uploadStoryMedia(formData);
      if (!mediaUrl) throw new Error("Erreur lors de l'upload");

      const isVideo = selectedFile.type.startsWith('video/');
      
      const result = await publishStory({
        storeId,
        mediaUrl,
        mediaType: isVideo ? 'video' : 'image',
        caption: caption || undefined,
      });

      if (result.success) {
        toast.success('Reel publié avec succès !');
        setIsDialogOpen(false);
        setCaption('');
        setSelectedFile(null);
        setPreviewUrl(null);
        fetchStories();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la publication");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (storyId: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce reel ?')) return;
    
    setIsDeleting(storyId);
    try {
      const result = await deleteStory(storyId);
      if (result.success) {
        toast.success('Reel supprimé');
        setStories(prev => prev.filter(s => s.id !== storyId));
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
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(blob));
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
    if (mode === 'record' && isDialogOpen && !previewUrl) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode, isDialogOpen, previewUrl]);

  const resetRecording = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    startCamera();
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Discovery Reels</h1>
          <p className="text-muted-foreground">Gérez vos vidéos et photos qui apparaissent dans le flux Discover.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/20">
              <Plus className="w-5 h-5 mr-2" /> Nouveau Reel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
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
                  onClick={() => { setMode('upload'); setPreviewUrl(null); }}
                >
                  Importer
                </Button>
                <Button 
                  variant={mode === 'record' ? 'secondary' : 'ghost'} 
                  className="flex-1 rounded-lg"
                  onClick={() => { setMode('record'); setPreviewUrl(null); }}
                >
                  Caméra
                </Button>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold">
                  {mode === 'upload' ? 'Sélectionner un fichier' : 'Enregistrer votre story'}
                </Label>
                
                <div 
                  className="border-2 border-dashed border-slate-700 rounded-2xl aspect-[9/16] max-h-[400px] flex flex-col items-center justify-center bg-slate-800/50 hover:bg-slate-800/80 transition-colors cursor-pointer overflow-hidden relative group"
                  onClick={() => mode === 'upload' && !previewUrl && fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <>
                      {selectedFile?.type.startsWith('video/') ? (
                        <video src={previewUrl} className="w-full h-full object-cover" controls autoPlay loop />
                      ) : (
                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                      )}
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="absolute top-4 right-4 h-8 w-8 p-0 rounded-full"
                        onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setSelectedFile(null); mode === 'record' && startCamera(); }}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </>
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
                            {isPermissionDenied && (
                              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-[10px] text-red-400 max-w-[280px] mt-2 mb-4 text-left">
                                <p className="font-bold mb-2 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                                  <AlertCircle className="w-3 h-3" /> État du matériel :
                                </p>
                                <div className="space-y-3">
                                  <div className="bg-black/20 p-2 rounded border border-red-500/10">
                                    <p className="font-bold text-white mb-1">Caméras détectées : {availableCameras.length}</p>
                                    {availableCameras.length > 0 ? (
                                      <ul className="list-disc list-inside ml-1 text-[9px]">
                                        {availableCameras.map((c, i) => (
                                          <li key={i}>{c.label || `Caméra #${i+1}`}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="text-red-300 italic">⚠️ Aucune caméra n'est reconnue par Windows/Navigateur.</p>
                                    )}
                                  </div>
                                  
                                  <div>
                                    <p className="font-bold text-white mb-1">1. Dans le navigateur :</p>
                                    <ul className="list-disc list-inside ml-1">
                                      <li>Cliquez sur l'icône 🔒 ou ⚙️ (barre d'adresse)</li>
                                      <li>Passez "Caméra" sur <b>Autoriser</b></li>
                                    </ul>
                                  </div>
                                  <div>
                                    <p className="font-bold text-white mb-1">2. Sur Windows (si bloqué) :</p>
                                    <ul className="list-disc list-inside ml-1">
                                      <li>Démarrer → Paramètres → Confidentialité → Caméra</li>
                                      <li>Activez "Autoriser les applis à accéder à votre caméra"</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}
                            <p className="text-xs text-slate-400 max-w-[200px] mx-auto">
                              L'accès à la caméra est nécessaire pour enregistrer vos stories directement.
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
                            <span className="text-xs font-bold text-white bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                              {isRecording ? 'ENREGISTREMENT EN COURS...' : 'APPUYEZ POUR ENREGISTRER'}
                            </span>
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
                  onChange={handleFileSelect} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="caption" className="text-sm font-semibold">Légende (Optionnelle)</Label>
                <Input 
                  id="caption" 
                  className="bg-slate-800 border-slate-700 focus:ring-red-500" 
                  placeholder="Dites-en plus sur ce reel..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isUploading}>Annuler</Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
                onClick={handleUpload}
                disabled={isUploading || !selectedFile}
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
      ) : stories.length === 0 ? (
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
          {stories.map((story) => (
            <div key={story.id} className="relative group">
              <Card className="overflow-hidden border-0 bg-slate-100 dark:bg-slate-900 aspect-[9/16] ring-1 ring-slate-200 dark:ring-white/5 shadow-md">
                <div className="p-0 h-full relative">
                  {story.media_type === 'video' ? (
                    <video src={story.media_url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={story.media_url} className="w-full h-full object-cover" alt="Story" />
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    {story.caption && <p className="text-xs text-white line-clamp-2 mb-3">{story.caption}</p>}
                    <div className="flex items-center justify-between gap-2">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="h-8 w-8 p-0 text-white hover:bg-white/20"
                         onClick={() => window.open(story.media_url, '_blank')}
                       >
                         <Play className="w-4 h-4" />
                       </Button>
                       <Button 
                        variant="destructive" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleDelete(story.id)}
                        disabled={isDeleting === story.id}
                      >
                        {isDeleting === story.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1.5 text-[10px] font-bold text-white shadow-xl ring-1 ring-white/10">
                    <Eye className="w-3 h-3" />
                    {story.views_count}
                  </div>

                  <div className="absolute bottom-4 left-4 flex items-center gap-2 group-hover:opacity-0 transition-opacity">
                    <div className="p-1 px-2 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
                      {story.media_type}
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
