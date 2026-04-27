'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { updateBookingStatus } from '@/lib/actions/reservation';
import { updateOrderStatus } from '@/lib/actions/leads';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function ValiderContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [transaction, setTransaction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  useEffect(() => {
    if (!code) {
      setError("Aucun code de transaction fourni.");
      setIsLoading(false);
      return;
    }

    async function fetchTransaction() {
      // Remove prefixes if any
      const ref = code!.startsWith('order_completion:') ? code!.replace('order_completion:', '') : code;

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        // Redirect to login with callback URL
        router.push(`/login?redirect=/valider?code=${encodeURIComponent(code!)}`);
        return;
      }

      // Try by transaction_code
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('transaction_code', ref)
        .single();

      if (error || !data) {
        // Fallback: try by qr_code_token
        const { data: data2, error: error2 } = await supabase
          .from('transactions')
          .select('*')
          .eq('qr_code_token', code!)
          .single();

        if (error2 || !data2) {
           setError("Transaction introuvable ou vous n'avez pas les droits pour la consulter.");
           setIsLoading(false);
           return;
        }
        setTransaction(data2);
      } else {
        setTransaction(data);
      }
      setIsLoading(false);
    }

    fetchTransaction();
  }, [code, router, supabase]);

  const handleValidate = async () => {
    if (!transaction) return;
    setIsUpdating(true);
    try {
      const isBooking = transaction.booking_id != null;
      let realId = transaction.booking_id;
      
      if (!isBooking) {
         const { data: order } = await supabase.from('orders').select('id').eq('order_number', transaction.order_number).single();
         if (!order) throw new Error("Commande d'origine introuvable.");
         realId = order.id;
         await updateOrderStatus(realId, 'COMPLETED');
      } else {
         await updateBookingStatus(realId, 'COMPLETED');
      }

      // Mettre à jour l'état local pour éviter de re-valider
      setTransaction({...transaction, status: 'completed'});
      setShowSuccessAnimation(true);
      
      setTimeout(() => {
        router.push(`/dashboard/${transaction.merchant_id}/transactions`);
      }, 3000);

    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (showSuccessAnimation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-14 h-14 text-green-500 animate-bounce" />
          </div>
          <h2 className="text-3xl font-black text-green-500 tracking-tight uppercase">Validé !</h2>
          <p className="text-muted-foreground text-center text-sm">
            Montrez cet écran au client
          </p>
          <div className="mt-8 pt-8 border-t border-border/50 w-full flex justify-center">
            <img src="/ro2ya_logo.png" alt="Ro2ya Logo" className="h-10 object-contain drop-shadow-md" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full bg-card p-8 rounded-xl shadow-sm border border-border text-center space-y-4">
           <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
           <h1 className="text-xl font-bold">Oups !</h1>
           <p className="text-muted-foreground">{error}</p>
           <Button variant="outline" className="mt-4 w-full" onClick={() => router.push('/')}>Retour à l'accueil</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full bg-card p-8 rounded-xl shadow-sm border border-border space-y-6">
           <div className="text-center space-y-2">
             <h1 className="text-2xl font-bold text-foreground">Valider la prestation</h1>
             <p className="text-muted-foreground text-sm">Voulez-vous marquer cette prestation comme complétée ?</p>
           </div>
           
           <div className="bg-muted p-4 rounded-lg space-y-3 border border-border">
             <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Référence</span>
                <span className="font-bold text-foreground">{transaction.transaction_code}</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Client</span>
                <span className="font-medium text-foreground">{transaction.customer_name}</span>
             </div>
             <div className="flex justify-between text-sm pt-2 border-t border-border">
                <span className="text-muted-foreground">Montant total</span>
                <span className="font-black text-lg text-primary">{transaction.amount} DT</span>
             </div>
           </div>

           {transaction.status === 'completed' ? (
             <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-lg text-center font-bold flex items-center justify-center gap-2">
               <CheckCircle className="w-5 h-5" /> Déjà validée
             </div>
           ) : (
             <Button className="w-full font-bold text-lg h-12" onClick={handleValidate} disabled={isUpdating}>
               {isUpdating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
               Valider la transaction
             </Button>
           )}
        </div>
    </div>
  );
}

export default function ValiderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <ValiderContent />
    </Suspense>
  );
}
