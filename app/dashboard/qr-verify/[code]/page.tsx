'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrderByTrackingCode, updateOrderStatus } from '@/lib/actions/orders';
import { getBookingByTrackingCode, updateBookingStatus } from '@/lib/actions/reservation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, ShoppingBag, Calendar, User, Store } from 'lucide-react';
import { toast } from 'sonner';

export default function QRVerifyPage() {
  const { code } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [type, setType] = useState<'order' | 'booking' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!code) return;
      setLoading(true);
      setError(null);

      try {
        // Try Order first
        try {
          const order = await getOrderByTrackingCode(code as string);
          if (order) {
            setData(order);
            setType('order');
            setLoading(false);
            return;
          }
        } catch (e) {
          // Continue to booking
        }

        // Try Booking
        try {
          const booking = await getBookingByTrackingCode(code as string);
          if (booking) {
            setData(booking);
            setType('booking');
            setLoading(false);
            return;
          }
        } catch (e) {
          throw new Error('Code QR invalide ou transaction déjà complétée.');
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [code]);

  const handleComplete = async () => {
    if (!data || !type) return;
    setUpdating(true);
    try {
      if (type === 'order') {
        await updateOrderStatus(data.id, 'COMPLETED');
        toast.success('Commande complétée avec succès !');
      } else {
        await updateBookingStatus(data.id, 'COMPLETED');
        toast.success('Réservation complétée avec succès !');
      }
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Une erreur est survenue');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Vérification du code QR...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="w-full max-w-md border-red-200 bg-red-50/30">
          <CardHeader className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-800">Erreur de vérification</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-red-700">{error}</p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Retour au tableau de bord
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4 bg-slate-50/50">
      <Card className="w-full max-w-lg shadow-xl border-t-4 border-t-primary animate-in fade-in zoom-in duration-300">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Transaction Détectée</CardTitle>
          <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">
            {type === 'order' ? 'Commande' : 'Réservation'} #{data.order_number || data.booking_number}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Client</p>
                <p className="font-bold text-slate-900">{data.customer_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase">Produit / Service</p>
                <p className="font-bold text-slate-900 line-clamp-1">{data.items?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Store className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Établissement</p>
                <p className="font-bold text-slate-900">{data.stores?.name}</p>
              </div>
            </div>
            
            {type === 'booking' && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Date & Heure</p>
                  <p className="font-bold text-slate-900">
                    {data.booking_date} à {data.start_time.slice(0, 5)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <div className="shrink-0 mt-0.5">
              <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
            </div>
            <p className="text-sm text-amber-800">
              Veuillez confirmer que vous avez bien servi ce client avant de finaliser la transaction.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-8">
          <Button 
            className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" 
            onClick={handleComplete}
            disabled={updating}
          >
            {updating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Finaliser la transaction'}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground"
            onClick={() => router.push('/dashboard')}
            disabled={updating}
          >
            Annuler
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
