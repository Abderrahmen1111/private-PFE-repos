'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAccountDetails } from '@/lib/actions/overviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Package, TrendingUp, Zap, BarChart3, Crown, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteAccount } from '@/lib/actions/account_subscription';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const plans: Record<'free' | 'pro' | 'business', { features: string[]; price: number; annualPrice?: number }> = {
  free: {
    price: 0,
    features: [
      'Profil de base',
      "Jusqu'à 5 produits/services",
      'Statistiques limitées',
      'Support communautaire',
    ],
  },
  pro: {
    price: 29,
    annualPrice: 290,
    features: [
      'Tout le forfait Gratuit +',
      "Jusqu'à 50 produits/services",
      'Statistiques avancées',
      'Gestion des avis',
      'Outils promotionnels',
      'Support par email',
    ],
  },
  business: {
    price: 99,
    annualPrice: 990,
    features: [
      'Tout le forfait Pro +',
      'Produits illimités',
      'Image de marque personnalisée',
      'Accès API',
      'Support prioritaire',
      'Rapports avancés',
    ],
  },
};

export default function AccountPage() {
  const params = useParams();
  const storeId = Number(params.id);

  const [account, setAccount] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (storeId) {
      getAccountDetails(storeId).then(data => {
        setAccount(data);
        setIsLoading(false);
      });
    }
  }, [storeId]);

  const handleUpgrade = (plan: string) => {
    toast.success(`Mise à niveau vers le forfait ${plan} initiée !`);
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    const { success, error } = await deleteAccount(user.id);
    if (success) {
      toast.success("Votre compte a été supprimé avec succès. Redirection...");
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } else {
      toast.error("Erreur lors de la suppression du compte: " + error);
    }
  };

  if (isLoading) return <div className="p-8 text-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Chargement du compte...</div>;

  const store = account?.store;
  const user = account?.user;
  const subscription = account?.subscription;
  const currentPlan: 'free' | 'pro' | 'business' = subscription?.plan_name?.toLowerCase() || 'free';

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Compte & Abonnement</h1>
        <p className="text-muted-foreground">Gérez les informations de votre compte et votre forfait</p>
      </div>

      {/* Account Information */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Nom de la boutique</p>
              <p className="text-lg font-medium text-foreground">{store?.name || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Adresse email</p>
              <p className="text-lg font-medium text-foreground">{user?.email || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Compte créé le</p>
              <p className="text-lg font-medium text-foreground">
                {store?.created_at ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(store.created_at)) : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Statut de la boutique</p>
              <p className={`text-lg font-medium capitalize ${store?.status === 'ACTIVE' ? 'text-green-600' : 'text-orange-500'}`}>
                {store?.status === 'ACTIVE' ? 'Actif' : store?.status === 'PENDING' ? 'En attente' : store?.status || '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Plan Overview */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">Forfait actuel</p>
              <h3 className="text-2xl font-bold text-foreground capitalize">
                {currentPlan === 'free' ? 'Gratuit' : currentPlan === 'pro' ? 'Pro' : 'Business'}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {plans[currentPlan].price === 0 ? 'Gratuit' : `${plans[currentPlan].price} DT/mois`}
              </p>
              {subscription?.current_period_end && (
                <p className="text-xs text-muted-foreground mt-1">
                  Valide jusqu'au {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(subscription.current_period_end))}
                </p>
              )}
            </div>
            <Crown className="w-12 h-12 text-primary opacity-20" />
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Forfaits disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.entries(plans) as [string, typeof plans['free']][]).map(([planKey, planData]) => {
            const isCurrent = planKey === currentPlan;
            const isLower = (currentPlan === 'business') || (currentPlan === 'pro' && planKey === 'free');
            return (
              <Card key={planKey} className={`border-0 shadow-sm overflow-hidden transition-all ${isCurrent ? 'ring-2 ring-primary shadow-lg' : ''} ${isLower ? 'opacity-75' : ''}`}>
                {isCurrent && (
                  <div className="bg-primary text-primary-foreground py-2 px-4 text-center">
                    <p className="text-sm font-bold">FORFAIT ACTUEL</p>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="capitalize flex items-center justify-between">
                    {planKey === 'free' ? 'Gratuit' : planKey === 'pro' ? 'Pro' : 'Business'}
                    {planKey === 'pro' && <Zap className="w-5 h-5 text-yellow-500" />}
                    {planKey === 'business' && <Crown className="w-5 h-5 text-yellow-600" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <span className="text-4xl font-bold text-foreground">{planData.price}</span>
                    <span className="text-muted-foreground">{planData.price === 0 ? ' DT' : ' DT/mois'}</span>
                    {planData.annualPrice && (
                      <p className="text-xs text-muted-foreground mt-1">ou {planData.annualPrice} DT/an (économisez 2 mois)</p>
                    )}
                  </div>
                  <ul className="space-y-3">
                    {planData.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <Button disabled className="w-full">Forfait actuel</Button>
                  ) : isLower ? (
                    <Button disabled variant="outline" className="w-full opacity-50">Rétrograder</Button>
                  ) : (
                    <Button className="w-full" onClick={() => handleUpgrade(planKey)}>
                      Passer à {planKey === 'pro' ? 'Pro' : 'Business'} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Danger Zone */}
      <Card className="border-0 shadow-sm border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            Zone de danger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Ces actions sont irréversibles. Veuillez procéder avec précaution.</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                Supprimer le compte
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white font-bold text-xl">Êtes-vous absolument sûr ?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300 text-base">
                  Cette action est irréversible. Elle supprimera définitivement votre compte,
                  vos boutiques et toutes les données associées de nos serveurs.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-foreground border-input hover:bg-accent">Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer définitivement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
