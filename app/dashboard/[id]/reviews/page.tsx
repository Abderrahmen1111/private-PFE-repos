'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getStoreReviews, saveVendorResponse } from '@/lib/actions/overviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Star, MessageCircle, AlertCircle, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { revalidatePath } from 'next/cache';

export default function ReviewsPage() {
  const params = useParams();
  const storeId = Number(params.id);

  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [response, setResponse] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (storeId) {
      getStoreReviews(storeId).then(data => {
        setReviews(data as any[]);
        setIsLoading(false);
      });
    }
  }, [storeId]);

  const handleRespond = async (reviewId: number) => {
    if (!response.trim()) {
      toast.error('Veuillez écrire une réponse.');
      return;
    }
    setIsSaving(true);
    const result = await saveVendorResponse(reviewId, response);
    if (result.success) {
      toast.success('Réponse publiée avec succès !');
      // Update the review in state
      setReviews(prev => prev.map(r =>
        r.id === reviewId ? { ...r, vendor_response: response, responded_at: new Date().toISOString() } : r
      ));
    } else {
      toast.error('Erreur lors de la publication de la réponse.');
    }
    setIsSaving(false);
    setResponse('');
    setRespondingTo(null);
    setIsOpen(false);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  const unrepliedCount = reviews.filter(r => !r.vendor_response).length;

  // Calculate real rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    rating: `${star} étoile${star > 1 ? 's' : ''}`,
    count: reviews.filter(r => Math.round(r.rating) === star).length
  }));

  if (isLoading) return <div className="p-8 text-foreground">Chargement des avis...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Avis & Réputation</h1>
        <p className="text-white/50">Gérez et répondez aux avis de vos clients</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-2xl ring-1 ring-white/10">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-2">Note Moyenne</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-extrabold text-white">{avgRating}</p>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(parseFloat(avgRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-white/40 mt-2">Basé sur {reviews.length} avis</p>
              </div>
              <div className="p-3 rounded-2xl bg-yellow-500/20">
                <TrendingUp className="w-7 h-7 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-2xl ring-1 ring-white/10">
          <CardContent className="p-6">
            <p className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-2">Total Avis</p>
            <p className="text-4xl font-extrabold text-white">{reviews.length}</p>
            <p className="text-xs text-white/40 mt-2">Avis clients approuvés</p>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-2xl backdrop-blur-2xl ring-1 ${unrepliedCount > 0 ? 'bg-orange-500/10 ring-orange-500/30' : 'bg-white/5 ring-white/10'}`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-2">En attente de réponse</p>
                <p className={`text-4xl font-extrabold ${unrepliedCount > 0 ? 'text-orange-400' : 'text-white'}`}>{unrepliedCount}</p>
                <p className="text-xs text-white/40 mt-2">Avis sans réponse</p>
              </div>
              {unrepliedCount > 0 && (
                <div className="p-3 rounded-2xl bg-orange-500/20">
                  <AlertCircle className="w-7 h-7 text-orange-400" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution Chart */}
      <Card className="border-0 shadow-sm bg-white/5 backdrop-blur-sm ring-1 ring-white/10">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <div className="w-1 h-5 bg-purple-500 rounded-full" />
            Distribution des notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingCounts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
              <XAxis type="number" stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#fff' }} />
              <YAxis dataKey="rating" type="category" stroke="rgba(255,255,255,0.4)" width={80} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#ccc', fontWeight: 600 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 41, 0.95)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  color: '#fff',
                }}
                itemStyle={{ color: '#e879f9' }}
                labelStyle={{ color: '#fff', fontWeight: 700 }}
              />
              <defs>
                <linearGradient id="ratingBarGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#d946ef" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <Bar dataKey="count" fill="url(#ratingBarGradient)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Avis récents</h2>

        {reviews.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">Aucun avis pour le moment. Continuez à interagir avec vos clients !</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-foreground">{review.author?.full_name || 'Client Anonyme'}</p>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(review.created_at))}
                    </p>
                  </div>
                  {review.vendor_response && (
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 px-2 py-1 rounded">
                      Répondu
                    </span>
                  )}
                </div>

                <p className="text-foreground">{review.comment}</p>

                {review.vendor_response && (
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <p className="text-sm font-medium text-foreground mb-2">Votre réponse</p>
                    <p className="text-sm text-muted-foreground">{review.vendor_response}</p>
                  </div>
                )}

                {!review.vendor_response && (
                  <Dialog open={isOpen && respondingTo === review.id} onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) setRespondingTo(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => { setRespondingTo(review.id); setIsOpen(true); }}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Répondre
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Répondre à l'avis</DialogTitle>
                        <DialogDescription>Rédigez une réponse professionnelle à cet avis client.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="response" className="mb-2">Votre réponse</Label>
                          <Textarea id="response" value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Merci pour votre avis..." rows={4} />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => { setIsOpen(false); setRespondingTo(null); }}>
                            Annuler
                          </Button>
                          <Button className="flex-1" onClick={() => handleRespond(review.id)} disabled={isSaving}>
                            {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Envoi...</> : 'Publier'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
