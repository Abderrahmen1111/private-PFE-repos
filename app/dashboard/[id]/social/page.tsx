'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getReviewsByStoreId, respondToReview } from '@/lib/actions/reviews';
import { getStoreReelComments, postReelComment, deleteReelComment } from '@/lib/actions/comments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Star, 
  Reply, 
  Trash2, 
  Loader2, 
  User, 
  Send,
  CheckCircle2,
  AlertCircle,
  Video,
  ThumbsUp,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SocialManagementPage() {
  const { id } = useParams();
  const storeId = parseInt(id as string);

  const [activeTab, setActiveTab] = useState('reviews');
  const [reviews, setReviews] = useState<any[]>([]);
  const [reelComments, setReelComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Response states
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [storeId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [revs, comms] = await Promise.all([
        getReviewsByStoreId(storeId),
        getStoreReelComments(storeId)
      ]);
      setReviews(revs);
      setReelComments(comms);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewResponse = async (reviewId: number) => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await respondToReview(reviewId, replyContent);
      if (res.success) {
        toast.success('Réponse envoyée !');
        setReplyingTo(null);
        setReplyContent('');
        fetchData();
      } else {
        toast.error(res.error || 'Erreur');
      }
    } catch {
      toast.error('Erreur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReelReply = async (reelId: number, parentCommentId: number) => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    try {
      // For now, we just post a new comment as a response
      const res = await postReelComment({ 
        reelId, 
        content: `@reponse: ${replyContent}` 
      });
      if (res.success) {
        toast.success('Réponse publiée !');
        setReplyingTo(null);
        setReplyContent('');
        fetchData();
      } else {
        toast.error(res.error || 'Erreur');
      }
    } catch {
      toast.error('Erreur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (id: number) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;
    try {
      const res = await deleteReelComment(id);
      if (res.success) {
        toast.success('Supprimé');
        fetchData();
      }
    } catch {
      toast.error('Erreur');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen bg-background">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-primary" />
          Social & Avis
        </h1>
        <p className="text-muted-foreground">Gérez vos interactions clients et votre réputation.</p>
      </div>

      <Tabs defaultValue="reviews" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="reviews" className="font-bold">Avis Clients ({reviews.length})</TabsTrigger>
          <TabsTrigger value="comments" className="font-bold">Comms Reels ({reelComments.length})</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin size-10 text-primary" />
            <p className="text-muted-foreground font-medium">Chargement des interactions...</p>
          </div>
        ) : (
          <>
            <TabsContent value="reviews">
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <Card className="p-12 text-center border-dashed">
                    <Star className="mx-auto size-12 text-muted-foreground/20 mb-4" />
                    <h3 className="text-lg font-bold">Aucun avis pour le moment</h3>
                    <p className="text-muted-foreground text-sm">Les avis de vos clients apparaîtront ici.</p>
                  </Card>
                ) : (
                  reviews.map((rev) => (
                    <Card key={rev.id} className="overflow-hidden border-border/50 hover:border-primary/20 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={rev.author?.avatar_url} />
                              <AvatarFallback><User /></AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold">{rev.author?.full_name || 'Client'}</p>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                                ))}
                                <span className="text-[10px] text-muted-foreground ml-2">
                                  {format(new Date(rev.created_at), 'dd MMM yyyy', { locale: fr })}
                                </span>
                              </div>
                            </div>
                          </div>
                          {rev.item && (
                            <Badge variant="outline" className="bg-primary/5 text-[10px] border-primary/20">
                              {rev.item.name}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm leading-relaxed text-foreground/80 mb-6 italic">
                          "{rev.comment}"
                        </p>

                        {rev.vendor_response ? (
                          <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-primary text-[9px] uppercase font-black">Votre Réponse</Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {format(new Date(rev.responded_at), 'dd MMM yyyy', { locale: fr })}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{rev.vendor_response}</p>
                          </div>
                        ) : replyingTo === rev.id ? (
                          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Textarea 
                              placeholder="Écrivez votre réponse professionnelle..." 
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              className="min-h-[100px] rounded-2xl"
                            />
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleReviewResponse(rev.id)} 
                                disabled={isSubmitting}
                                className="rounded-xl font-bold px-6"
                              >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                Envoyer la réponse
                              </Button>
                              <Button variant="ghost" onClick={() => setReplyingTo(null)} className="rounded-xl font-bold">Annuler</Button>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl font-bold"
                            onClick={() => { setReplyingTo(rev.id); setReplyContent(''); }}
                          >
                            <Reply className="w-4 h-4 mr-2" /> Répondre à cet avis
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="comments">
              <div className="space-y-6">
                {reelComments.length === 0 ? (
                  <Card className="p-12 text-center border-dashed">
                    <Video className="mx-auto size-12 text-muted-foreground/20 mb-4" />
                    <h3 className="text-lg font-bold">Aucun commentaire Reel</h3>
                    <p className="text-muted-foreground text-sm">Les commentaires sur vos vidéos apparaîtront ici.</p>
                  </Card>
                ) : (
                  reelComments.map((comm) => (
                    <Card key={comm.id} className="overflow-hidden border-border/50 hover:border-primary/20 transition-colors">
                      <CardContent className="p-5">
                        <div className="flex gap-4">
                          <div className="relative w-16 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-muted group">
                            <img src={comm.reel?.media_path} className="size-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Video className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="size-6">
                                  <AvatarImage src={comm.user?.avatar_url} />
                                  <AvatarFallback><User /></AvatarFallback>
                                </Avatar>
                                <span className="font-bold text-sm">{comm.user?.full_name || 'Utilisateur'}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  • {format(new Date(comm.created_at), 'dd MMM à HH:mm', { locale: fr })}
                                </span>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteComment(comm.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <p className="text-sm mb-4">{comm.content}</p>
                            
                            {comm.attachment_url && (
                              <div className="mb-4">
                                <img src={comm.attachment_url} className="h-20 rounded-lg border" />
                              </div>
                            )}

                            {replyingTo === comm.id ? (
                              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Textarea 
                                  placeholder="Répondre..." 
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  className="min-h-[80px] rounded-xl"
                                />
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm"
                                    onClick={() => handleReelReply(comm.reel_id, comm.id)} 
                                    disabled={isSubmitting}
                                    className="rounded-lg font-bold"
                                  >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                    Répondre
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="rounded-lg font-bold">Annuler</Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-4">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 text-xs font-bold p-0 text-primary hover:bg-transparent"
                                  onClick={() => { setReplyingTo(comm.id); setReplyContent(''); }}
                                >
                                  <Reply className="w-3 h-3 mr-1" /> Répondre
                                </Button>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Clock className="w-3 h-3" /> Sur: {comm.reel?.title || 'Video'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
