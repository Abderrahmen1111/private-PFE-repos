'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  MessageCircle,
  Zap,
  Target,
  ChevronRight,
  Loader2,
  RefreshCw,
  Star,
  MessageSquare,
  Reply,
  Trash2,
  User,
  Send,
  Video,
  Clock,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { toast } from 'sonner';
import { getReviewsByStoreId, respondToReview } from '@/lib/actions/reviews';
import { getStoreReelComments, postReelComment, deleteReelComment } from '@/lib/actions/comments';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AIAdvisorSection from '@/components/dashboard/AIAdvisorSection';

export default function IntelligencePage() {
  const params = useParams();
  const id = params.id as string;
  const storeId = Number(id);

  // Intelligence State
  const [intelData, setIntelData] = useState<any>(null);
  const [isIntelLoading, setIsIntelLoading] = useState(true);

  // Social State
  const [activeTab, setActiveTab] = useState('analyses');
  const [reviews, setReviews] = useState<any[]>([]);
  const [reelComments, setReelComments] = useState<any[]>([]);
  const [isLoadingInteractions, setIsLoadingInteractions] = useState(true);
  
  // Response states
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchIntelligence = async () => {
    setIsIntelLoading(true);
    try {
      const response = await fetch(`/api/dashboard/${id}/intelligence`);
      const result = await response.json();
      if (result.error) {
        throw new Error(result.details || result.error);
      }
      setIntelData(result);
      return result;
    } catch (error: any) {
      toast.error("Erreur Analyse: " + error.message);
      return null;
    } finally {
      setIsIntelLoading(false);
    }
  };

  const fetchInteractions = async (aiResults?: any[]) => {
    setIsLoadingInteractions(true);
    try {
      const [revs, comms] = await Promise.all([
        getReviewsByStoreId(storeId),
        getStoreReelComments(storeId)
      ]);

      // Enrich with AI data if available
      const enrichedRevs = revs.map((r: any) => {
        const ai = aiResults?.find((a: any) => a.originalComment === r.comment);
        return { ...r, aiAnalysis: ai };
      });

      const enrichedComms = comms.map((c: any) => {
        const ai = aiResults?.find((a: any) => a.originalComment === c.content);
        return { ...c, aiAnalysis: ai };
      });

      setReviews(enrichedRevs);
      setReelComments(enrichedComms);
    } catch (error) {
      console.error("Failed to load interactions:", error);
    } finally {
      setIsLoadingInteractions(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchIntelligence().then((data: any) => {
        if (data && data.results) {
          fetchInteractions(data.results);
        } else {
          fetchInteractions();
        }
      });
    }
  }, [id]);

  const handleReviewResponse = async (reviewId: number) => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await respondToReview(reviewId, replyContent);
      if (res.success) {
        toast.success('Réponse envoyée !');
        setReplyingTo(null);
        setReplyContent('');
        fetchInteractions();
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
        fetchInteractions();
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
        fetchInteractions();
      }
    } catch {
      toast.error('Erreur');
    }
  };

  const getReelThumbnail = (mediaPath: string) => {
    if (!mediaPath) return '';
    try {
      if (mediaPath.startsWith('[') && mediaPath.endsWith(']')) {
        const urls = JSON.parse(mediaPath);
        return Array.isArray(urls) ? urls[0] : mediaPath;
      }
    } catch (e) {
      return mediaPath;
    }
    return mediaPath;
  };

  // Intelligence Aggregate Calculations
  const aggregate = intelData?.aggregate;
  const globalRecommendations = intelData?.globalRecommendations;
  const results = intelData?.results;
  
  const sentimentData = aggregate ? [
    { name: 'Positif', value: aggregate.sentimentBreakdown.positive, color: '#10b981' },
    { name: 'Neutre', value: aggregate.sentimentBreakdown.neutral, color: '#6366f1' },
    { name: 'Négatif', value: aggregate.sentimentBreakdown.negative, color: '#ef4444' },
  ] : [];

  const totalResults = results?.length || 1;

  // Review Calculations
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  const unrepliedCount = reviews.filter(r => !r.vendor_response).length;

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    rating: `${star} étoile${star > 1 ? 's' : ''}`,
    count: reviews.filter(r => Math.round(r.rating) === star).length
  }));

  return (
    <div className="p-4 md:p-8 space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Social & Reviews <Sparkles className="w-8 h-8 text-purple-400" />
          </h1>
          <p className="text-muted-foreground text-lg mt-1 font-medium">Gérez votre réputation et vos interactions clients.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="gap-2 border-white/10 bg-white/5 hover:bg-white/10" onClick={() => { fetchIntelligence(); fetchInteractions(); }}>
                <RefreshCw className="w-4 h-4" /> Actualiser
            </Button>
        </div>
      </div>

      <Tabs defaultValue="analyses" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl mb-8 inline-flex w-full max-w-2xl">
          <TabsTrigger value="analyses" className="flex-1 rounded-xl font-bold py-3">Analyses IA</TabsTrigger>
          <TabsTrigger value="reviews" className="flex-1 rounded-xl font-bold py-3">Avis Clients ({reviews.length})</TabsTrigger>
          <TabsTrigger value="comments" className="flex-1 rounded-xl font-bold py-3">Comments Reels ({reelComments.length})</TabsTrigger>
          <TabsTrigger value="advisor" className="flex-1 rounded-xl font-bold py-3">Conseiller IA</TabsTrigger>
        </TabsList>

        {/* --- TABS CONTENT: ANALYSES IA --- */}
        <TabsContent value="analyses" className="space-y-10 focus:outline-none">
          {isIntelLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-muted-foreground animate-pulse font-bold uppercase tracking-widest text-xs">Analyse en cours...</p>
            </div>
          ) : aggregate ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-white/10 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Brain className="w-20 h-20" />
                    </div>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-black text-purple-300 uppercase tracking-[0.2em]">Health Score</p>
                            <TrendingUp className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-5xl font-black text-white">{aggregate.overallHealthScore}%</h2>
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Optimal</Badge>
                        </div>
                        <Progress value={aggregate.overallHealthScore} className="h-1.5 mt-4 bg-white/5" />
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/5 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Alertes IA</p>
                        <h2 className={`text-5xl font-black ${aggregate.criticalAlerts > 0 ? 'text-red-500' : 'text-white'}`}>
                            {aggregate.criticalAlerts}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Nécessitent votre attention</p>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/5 backdrop-blur-sm md:col-span-2">
                    <CardContent className="pt-6 flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Sentiment Global</p>
                            <div className="space-y-3">
                                {sentimentData.map(s => (
                                    <div key={s.name} className="space-y-1">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                                            <span>{s.name}</span>
                                            <span>{Math.round((s.value / totalResults) * 100)}%</span>
                                        </div>
                                        <Progress value={(s.value / totalResults) * 100} className="h-1" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-24 h-24 shrink-0 mx-auto md:mx-0 min-w-[96px] min-h-[96px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={sentimentData} innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                                        {sentimentData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-2">
                        <Brain className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-black uppercase tracking-tight">Recommandations</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {globalRecommendations?.map((rec: any, idx: number) => (
                            <Card key={idx} className="group hover:bg-white/5 transition-all border-white/5 bg-slate-900/50 rounded-2xl">
                                <CardContent className="p-5 flex items-start gap-4">
                                    <div className={`mt-1 p-2.5 rounded-xl ${rec.impact === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        {rec.impact === 'high' ? <Zap className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <Badge variant="outline" className={`text-[8px] font-black tracking-widest ${rec.impact === 'high' ? 'border-red-500/30 text-red-400' : 'border-blue-500/30 text-blue-400'}`}>
                                                {rec.impact.toUpperCase()} IMPACT
                                            </Badge>
                                            <span className="text-[10px] text-white/30 font-bold uppercase">{rec.timeframe}</span>
                                        </div>
                                        <h4 className="font-bold text-white text-sm group-hover:text-primary transition-colors">{rec.action}</h4>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:translate-x-1 transition-transform" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-tight">Sujets Chauds</h3>
                    <Card className="bg-slate-900/50 border-white/5 rounded-2xl overflow-hidden">
                        <div className="divide-y divide-white/5">
                            {aggregate.topTopics.map((t: any, idx: number) => (
                                <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-[10px]">
                                            {idx + 1}
                                        </div>
                                        <span className="text-sm font-bold capitalize text-white/80">{t.topic}</span>
                                    </div>
                                    <Badge className="bg-white/5 text-white/60 text-[10px] font-bold border-none">{t.count}x</Badge>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center bg-white/5 border-dashed">
              <Zap className="mx-auto size-12 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-bold">Pas assez de données pour l'IA</h3>
              <p className="text-muted-foreground text-sm">L'analyse IA apparaîtra une fois que vous aurez plus d'interactions clients.</p>
            </Card>
          )}
        </TabsContent>

        {/* --- TABS CONTENT: AVIS CLIENTS --- */}
        <TabsContent value="reviews" className="space-y-8 focus:outline-none">
          {isLoadingInteractions ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin size-10 text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {reviews.length === 0 ? (
                  <Card className="p-12 text-center bg-white/5 border-dashed">
                    <Star className="mx-auto size-12 text-muted-foreground/20 mb-4" />
                    <h3 className="text-lg font-bold">Aucun avis client</h3>
                  </Card>
                ) : (
                  reviews.map((rev) => (
                    <Card key={rev.id} className="bg-white/5 border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.07] transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-10 ring-2 ring-white/5">
                              <AvatarImage src={rev.author?.avatar_url} />
                              <AvatarFallback className="bg-primary/20 text-primary"><User /></AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-white">{rev.author?.full_name || 'Client'}</p>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/10'}`} />
                                ))}
                                <span className="text-[10px] text-white/30 ml-2 font-bold uppercase">
                                  {format(new Date(rev.created_at), 'dd MMM yyyy', { locale: fr })}
                                </span>
                              </div>
                            </div>
                          </div>
                          {rev.item && (
                            <Badge variant="outline" className="bg-primary/5 text-[10px] border-primary/20 font-black">
                              {rev.item.name}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm leading-relaxed text-white/70 mb-6 italic">
                          "{rev.comment}"
                        </p>

                        {/* AI Analysis Overlay for Reviews */}
                        {rev.aiAnalysis && (
                          <div className="mb-6 p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                <Badge className={cn(
                                  "text-[9px] uppercase font-black",
                                  rev.aiAnalysis.analysis.sentiment === 'positive' ? "bg-emerald-500/20 text-emerald-400" :
                                  rev.aiAnalysis.analysis.sentiment === 'negative' ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
                                )}>
                                  Sentiment: {rev.aiAnalysis.analysis.sentiment}
                                </Badge>
                                <Badge className="bg-purple-500/20 text-purple-400 text-[9px] uppercase font-black">
                                  Urgence: {rev.aiAnalysis.analysis.urgency}
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                {rev.aiAnalysis.analysis.intentions.slice(0, 2).map((intent: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-[8px] uppercase border-purple-500/20 text-purple-300">
                                    {intent}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            {rev.aiAnalysis.analysis.suggested_response && !rev.vendor_response && (
                              <div className="space-y-2">
                                <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" /> Suggestion IA
                                </p>
                                <div className="text-[11px] text-white/50 bg-white/5 p-3 rounded-xl border border-white/5 relative group">
                                  {rev.aiAnalysis.analysis.suggested_response}
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="absolute top-2 right-2 h-6 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity bg-purple-500/10 hover:bg-purple-500/20"
                                    onClick={() => {
                                      setReplyingTo(rev.id);
                                      setReplyContent(rev.aiAnalysis.analysis.suggested_response);
                                    }}
                                  >
                                    Utiliser
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {rev.vendor_response ? (
                          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-primary text-[9px] uppercase font-black">Votre Réponse</Badge>
                              <span className="text-[10px] text-white/30 font-bold">
                                {format(new Date(rev.responded_at), 'dd MMM yyyy', { locale: fr })}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-white/90">{rev.vendor_response}</p>
                          </div>
                        ) : replyingTo === rev.id ? (
                          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Textarea 
                              placeholder="Répondre à ce client..." 
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              className="bg-white/5 border-white/10 min-h-[120px] rounded-2xl focus:ring-primary/20"
                            />
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleReviewResponse(rev.id)} 
                                disabled={isSubmitting}
                                className="rounded-xl font-bold px-8 py-6 bg-primary hover:bg-primary/90"
                              >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                Publier la réponse
                              </Button>
                              <Button variant="ghost" onClick={() => setReplyingTo(null)} className="rounded-xl font-bold">Annuler</Button>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            className="w-full rounded-xl font-bold border-white/10 bg-white/5 hover:bg-primary hover:text-white transition-all py-6"
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
              
              {/* Stats Sidebar */}
              <div className="space-y-6">
                <Card className="bg-white/5 border-white/5 backdrop-blur-sm rounded-3xl p-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6">Résumé des Avis</h4>
                    <div className="space-y-8">
                        <div>
                            <p className="text-6xl font-black text-white mb-1">{avgRating}</p>
                            <div className="flex gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < Math.round(parseFloat(avgRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-white/10'}`} />
                                ))}
                            </div>
                            <p className="text-xs text-white/30 font-bold uppercase">Moyenne sur {reviews.length} avis</p>
                        </div>
                        
                        <div className="space-y-3">
                            {ratingCounts.map(rc => (
                                <div key={rc.rating} className="flex items-center gap-3 text-white/60">
                                    <span className="text-[10px] font-bold w-12">{rc.rating.split(' ')[0]}*</span>
                                    <Progress value={(rc.count / (reviews.length || 1)) * 100} className="h-1 flex-1 bg-white/5" />
                                    <span className="text-[10px] font-bold text-white/30">{rc.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* --- TABS CONTENT: COMMENTAIRES REELS --- */}
        <TabsContent value="comments" className="space-y-8 focus:outline-none">
          {isLoadingInteractions ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin size-10 text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {reelComments.length === 0 ? (
                <Card className="p-20 text-center bg-white/5 border-dashed border-white/10 rounded-[40px]">
                  <Video className="mx-auto size-16 text-white/10 mb-6" />
                  <h3 className="text-xl font-bold text-white/60">Aucun commentaire Reel</h3>
                  <p className="text-white/30 max-w-xs mx-auto mt-2 text-sm">Les interactions sur vos vidéos Discover apparaîtront ici.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {reelComments.map((comm) => (
                    <Card key={comm.id} className="bg-white/5 border-white/10 rounded-3xl overflow-hidden hover:bg-white/[0.07] transition-all">
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          <div className="relative w-20 h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-white/5 ring-1 ring-white/10">
                            <img 
                              src={getReelThumbnail(comm.reel?.media_path)} 
                              className="size-full object-cover" 
                              onError={(e: any) => {
                                e.target.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=200&auto=format&fit=crop';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Video className="w-6 h-6 text-white/40" />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="size-8 ring-2 ring-white/5">
                                  <AvatarImage src={comm.user?.avatar_url} />
                                  <AvatarFallback className="bg-primary/20 text-primary"><User /></AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="font-bold text-white">{comm.user?.full_name || 'Utilisateur'}</span>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-white/20" />
                                    <span className="text-[10px] text-white/30 font-bold uppercase">
                                      {format(new Date(comm.created_at), 'dd MMM à HH:mm', { locale: fr })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-full" onClick={() => handleDeleteComment(comm.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <p className="text-sm mb-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                              {comm.content}
                            </p>

                            {/* AI Analysis Overlay for Reel Comments */}
                            {comm.aiAnalysis && (
                              <div className="mb-4 p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-2">
                                    <Badge className={cn(
                                      "text-[9px] uppercase font-black border-none",
                                      comm.aiAnalysis.analysis.sentiment === 'positive' ? "bg-emerald-500/20 text-emerald-400" :
                                      comm.aiAnalysis.analysis.sentiment === 'negative' ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
                                    )}>
                                      {comm.aiAnalysis.analysis.sentiment}
                                    </Badge>
                                    {comm.aiAnalysis.analysis.purchase_signals.has_purchase_intent && (
                                      <Badge className="bg-amber-500/20 text-amber-400 text-[9px] uppercase font-black border-none">
                                        Intention d'achat
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                {comm.aiAnalysis.analysis.suggested_response && replyingTo !== comm.id && (
                                  <div className="space-y-2">
                                    <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
                                      <Sparkles className="w-3 h-3" /> Suggestion IA
                                    </p>
                                    <div className="text-[11px] text-white/50 bg-white/5 p-3 rounded-xl border border-white/5 relative group">
                                      {comm.aiAnalysis.analysis.suggested_response}
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="absolute top-2 right-2 h-6 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity bg-purple-500/10 hover:bg-purple-500/20"
                                        onClick={() => {
                                          setReplyingTo(comm.id);
                                          setReplyContent(comm.aiAnalysis.analysis.suggested_response);
                                        }}
                                      >
                                        Utiliser
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {comm.attachment_url && (
                              <div className="mb-6">
                                <img src={comm.attachment_url} className="h-32 rounded-2xl border border-white/10 shadow-2xl" />
                              </div>
                            )}

                            {replyingTo === comm.id ? (
                              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                                <Textarea 
                                  placeholder="Écrire votre réponse..." 
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  className="bg-white/5 border-white/10 min-h-[100px] rounded-xl focus:ring-primary/20"
                                />
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm"
                                    onClick={() => handleReelReply(comm.reel_id, comm.id)} 
                                    disabled={isSubmitting}
                                    className="rounded-lg font-bold px-6 bg-primary"
                                  >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                    Répondre
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="rounded-lg font-bold">Annuler</Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-9 px-4 rounded-xl font-bold bg-white/5 hover:bg-primary hover:text-white transition-all"
                                  onClick={() => { setReplyingTo(comm.id); setReplyContent(''); }}
                                >
                                  <Reply className="w-4 h-4 mr-2" /> Répondre
                                </Button>
                                <div className="flex items-center gap-2">
                                   <Badge variant="outline" className="text-[10px] font-black border-white/10 text-white/40">
                                     REEL: {comm.reel?.title || 'Sans titre'}
                                   </Badge>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* --- TABS CONTENT: CONSEILLER IA --- */}
        <TabsContent value="advisor" className="space-y-8 focus:outline-none">
          <AIAdvisorSection 
            storeId={storeId}
            onApplyPromotion={(recommendation) => {
              toast.success(`Recommandation "${recommendation.title}" sélectionnée - Créer une promotion`);
              // In future, this could redirect to promotions tab or open a dialog
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
