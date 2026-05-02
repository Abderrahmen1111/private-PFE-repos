'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Camera, 
  Trash2, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Loader2,
  Video
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getDashboardStories, 
  deleteStory, 
  uploadStoryMedia, 
  publishStory 
} from '@/lib/actions/stories';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CameraCapture from '@/components/CameraCapture';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StoriesDashboardPage() {
  const params = useParams();
  const storeId = Number(params.id);
  
  const [stories, setStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // New story state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);

  useEffect(() => {
    fetchStories();
  }, [storeId]);

  async function fetchStories() {
    setIsLoading(true);
    try {
      const data = await getDashboardStories(storeId);
      setStories(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des stories");
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette story ?")) return;
    
    try {
      const res = await deleteStory(id);
      if (res.success) {
        setStories(stories.filter(s => s.id !== id));
        toast.success("Story supprimée");
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error("Échec de la suppression");
    }
  };

  const handleCapture = (file: File) => {
    setShowCamera(false);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsPublishDialogOpen(true);
  };

  const handlePublish = async () => {
    if (!selectedFile) return;
    
    setIsPublishing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const url = await uploadStoryMedia(formData);
      if (!url) throw new Error("Upload échoué");

      const isVideo = selectedFile.type.startsWith('video/');
      const result = await publishStory({
        storeId,
        mediaUrl: url,
        mediaType: isVideo ? 'video' : 'image',
        caption: caption.trim() || undefined
      });

      if (result.success) {
        toast.success("Story publiée !");
        setIsPublishDialogOpen(false);
        setCaption('');
        setSelectedFile(null);
        setPreviewUrl(null);
        fetchStories();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur de publication");
    } finally {
      setIsPublishing(false);
    }
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Camera className="w-8 h-8 text-cyan-400" />
            Gestion des Stories
          </h1>
          <p className="text-white/60 mt-1">
            Gérez les stories de vos clients et créez vos propres contenus éphémères.
          </p>
        </div>
        
        <Button 
          onClick={() => setShowCamera(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Story Live
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-white/5 border-white/10 animate-pulse">
              <div className="aspect-[9/16] bg-white/5 rounded-t-xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-white/10 rounded w-1/2" />
                <div className="h-3 bg-white/10 rounded w-1/3" />
              </div>
            </Card>
          ))
        ) : stories.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-3xl">
            <Camera className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white/80">Aucune story pour le moment</h3>
            <p className="text-white/40 max-w-xs mx-auto mt-2">
              Commencez à créer du contenu en direct ou attendez que vos clients partagent leur expérience.
            </p>
          </div>
        ) : (
          stories.map((story) => {
            const expired = isExpired(story.expires_at);
            return (
              <Card key={story.id} className="bg-white/5 border-white/10 overflow-hidden group hover:border-cyan-500/50 transition-all duration-300">
                <div className="relative aspect-[9/16]">
                  {story.media_type === 'video' ? (
                    <video src={story.media_url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={story.media_url} alt="Story content" className="w-full h-full object-cover" />
                  )}
                  
                  <div className="absolute top-3 left-3 flex gap-2">
                    {expired ? (
                      <Badge variant="outline" className="bg-black/60 backdrop-blur-md text-white/60 border-white/20">
                        <Clock className="w-3 h-3 mr-1" /> Expiré
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 backdrop-blur-md">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Actif
                      </Badge>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(story.id)}
                      className="rounded-full w-10 h-10 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-1.5 text-white text-xs font-bold">
                      <Eye className="w-4 h-4" />
                      {story.views_count} vues
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-white/10 bg-black/40">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6 border border-white/10">
                      <AvatarImage src={story.author?.avatar_url} />
                      <AvatarFallback className="bg-white/10 text-[10px]">
                        {(story.author?.full_name || 'C')[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {story.author?.full_name || 'Client'}
                      </p>
                      <p className="text-[10px] text-white/40">
                        {new Date(story.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {story.caption && (
                    <p className="text-[11px] text-white/80 mt-2 line-clamp-2 italic">
                      "{story.caption}"
                    </p>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {showCamera && (
        <CameraCapture 
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Publish Dialog */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-slate-900 border-white/10 text-white p-0 overflow-hidden rounded-3xl">
          <div className="relative aspect-[9/16] bg-black">
            {selectedFile?.type.startsWith('video/') ? (
              <video src={previewUrl!} className="w-full h-full object-cover" autoPlay loop muted />
            ) : (
              <img src={previewUrl!} className="w-full h-full object-cover" alt="Preview" />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            
            <div className="absolute bottom-0 inset-x-0 p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="caption" className="text-white/60 text-[10px] font-bold uppercase tracking-widest ml-1">Légende</Label>
                <Input 
                  id="caption"
                  placeholder="Dites quelque chose sur cette story..."
                  className="bg-white/10 border-white/10 text-white placeholder:text-white/30 h-12 rounded-2xl"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>

              <Button 
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-cyan-500/20"
              >
                {isPublishing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publication...</>
                ) : (
                  "Publier maintenant"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
