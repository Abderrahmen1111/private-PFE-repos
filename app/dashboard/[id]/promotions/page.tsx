'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotion,
} from '@/lib/actions/promotions';
import { getAdminItemsByStoreId, Item } from '@/lib/actions/items';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Star, Package, ShoppingCart, Scale, Heart, Zap, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Promo = {
  id: number;
  title: string;
  description?: string;
  discount_percent?: number;
  discount_text?: string;
  valid_from: string;
  valid_until: string;
  active: boolean;
  apply_to_all: boolean;
  item_ids: number[];
};

type PromoDraft = {
  id?: number;
  title: string;
  description: string;
  discount_percent: string;
  discount_text: string;
  valid_from: string;
  valid_until: string;
  apply_to_all: boolean;
  item_ids: number[];
};

const emptyDraft = (): PromoDraft => ({
  title: '',
  description: '',
  discount_percent: '',
  discount_text: '',
  valid_from: '',
  valid_until: '',
  apply_to_all: false,
  item_ids: [],
});

export default function PromotionsPage({ params }: { params: { id: string } }) {
  const storeIdParam = params.id;

  const [promotions, setPromotions] = useState<Promo[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<PromoDraft>(emptyDraft());
  const [resolvedStoreId, setResolvedStoreId] = useState<number | null>(null);

  useEffect(() => {
    async function init() {
      if (!storeIdParam) return;

      // Try to resolve if storeIdParam is a business ID or store ID
      let sId = Number(storeIdParam);

      // Verification if the ID actually exists as a store
      // In some dashboards, the ID might be the business ID from directory
      // We can check if getPromotions returns data or if we need to fetch business first
      setResolvedStoreId(sId);

      const [promoData, itemData] = await Promise.all([
        getPromotions(sId),
        getAdminItemsByStoreId(sId)
      ]);

      setPromotions(promoData as Promo[]);
      setItems(itemData);
      setIsLoading(false);
    }

    init();
  }, [storeIdParam]);

  const storeId = resolvedStoreId || Number(storeIdParam);

  const allPromotions = promotions;
  const activePromos = allPromotions.filter((p: Promo) => {
    const now = new Date();
    return p.active && new Date(p.valid_from) <= now && new Date(p.valid_until) >= now;
  });
  const inactivePromos = promotions.filter(p => !p.active);

  const isExpired = (date: string) => new Date(date) < new Date();
  const daysUntil = (date: string) =>
    Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const openCreate = () => {
    setDraft(emptyDraft());
    setIsOpen(true);
  };

  const openEdit = (promo: Promo) => {
    setDraft({
      id: promo.id,
      title: promo.title,
      description: promo.description || '',
      discount_percent: promo.discount_percent?.toString() || '',
      discount_text: promo.discount_text || '',
      valid_from: promo.valid_from?.slice(0, 10) || '',
      valid_until: promo.valid_until?.slice(0, 10) || '',
      apply_to_all: promo.apply_to_all,
      item_ids: promo.item_ids || [],
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!draft.title || !draft.valid_from || !draft.valid_until) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setIsSaving(true);

    const payload = {
      title: draft.title,
      description: draft.description || undefined,
      discount_percent: draft.discount_percent ? Number(draft.discount_percent) : undefined,
      discount_text: draft.discount_text || undefined,
      valid_from: draft.valid_from,
      valid_until: draft.valid_until,
      apply_to_all: draft.apply_to_all,
      item_ids: draft.item_ids,
    };

    if (draft.id) {
      const result = await updatePromotion(draft.id, storeId, payload);
      if (result.success) {
        setPromotions(prev => prev.map(p => p.id === draft.id ? { ...p, ...payload } as Promo : p));
        toast.success('Promotion mise à jour !');
      } else {
        toast.error('Erreur lors de la mise à jour.');
      }
    } else {
      const result = await createPromotion(storeId, payload as any);
      if (result.success && result.data) {
        setPromotions(prev => [{ ...result.data as Promo, item_ids: draft.item_ids }, ...prev]);
        toast.success('Promotion créée !');
      } else {
        toast.error('Erreur lors de la création.');
      }
    }

    setIsSaving(false);
    setIsOpen(false);
  };

  const handleDelete = async (id: number) => {
    const result = await deletePromotion(id, storeId);
    if (result.success) {
      setPromotions(prev => prev.filter(p => p.id !== id));
      toast.success('Promotion supprimée.');
    } else {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const handleToggle = async (promo: Promo) => {
    const newActive = !promo.active;
    const result = await togglePromotion(promo.id, storeId, newActive);
    if (result.success) {
      setPromotions(prev => prev.map(p => p.id === promo.id ? { ...p, active: newActive } : p));
      toast.success(newActive ? 'Promotion activée.' : 'Promotion désactivée.');
    } else {
      toast.error('Erreur lors du changement de statut.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center gap-2 text-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Chargement des promotions...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Promotions & Offres</h1>
          <p className="text-muted-foreground">Créez et gérez vos campagnes promotionnelles</p>
        </div>

        <Dialog open={isOpen} onOpenChange={open => { setIsOpen(open); if (!open) setDraft(emptyDraft()); }}>
          <DialogTrigger asChild>
            <Button size="lg" onClick={openCreate}>
              <Plus className="w-5 h-5 mr-2" /> Nouvelle Promotion
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-xl bg-slate-900/95 backdrop-blur-xl border-slate-800 text-white p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 p-6 border-b border-white/5">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                  {draft.id ? 'Modifier la promotion' : 'Nouvelle Offre Spéciale'}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  {draft.id ? 'Ajustez les paramètres de votre campagne.' : 'Propulsez vos ventes avec une nouvelle offre attractive.'}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid gap-6">
                {/* Visual Preview */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Aperçu en direct</Label>
                  <div className="rounded-xl border border-dashed border-slate-800 p-4 bg-slate-950/30">
                    <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-3 rounded-lg flex items-center justify-between text-white shadow-lg">
                      <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4 fill-white" />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{draft.title || 'Votre Titre Ici'}</span>
                          <span className="text-[10px] opacity-80">{draft.discount_percent ? `-${draft.discount_percent}%` : draft.discount_text || 'Réduction'}</span>
                        </div>
                      </div>
                      <div className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded uppercase">
                        Aperçu
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-2">
                      <Zap className="w-4 h-4 text-pink-400" /> Titre de l'offre *
                    </Label>
                    <Input
                      id="title"
                      className="bg-slate-950/50 border-slate-800 focus:border-pink-500/50 transition-colors"
                      value={draft.title}
                      onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                      placeholder="ex: Early Bird Summer Sale"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold flex items-center gap-2">
                      Description <span className="text-xs font-normal text-slate-500">(Optionnel)</span>
                    </Label>
                    <Textarea
                      id="description"
                      className="bg-slate-950/50 border-slate-800 focus:border-pink-500/50 min-h-[80px]"
                      value={draft.description}
                      onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                      placeholder="Détaillez les conditions ou l'avantage..."
                    />
                  </div>
                </div>

                {/* Discount Logic */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="space-y-2">
                    <Label htmlFor="pct" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Réduction (%)</Label>
                    <div className="relative">
                      <Input
                        id="pct"
                        type="number"
                        className="bg-slate-950/50 border-slate-800 pr-8"
                        value={draft.discount_percent}
                        onChange={e => setDraft(d => ({ ...d, discount_percent: e.target.value }))}
                        placeholder="20"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="txt" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Texte Alternatif</Label>
                    <Input
                      id="txt"
                      className="bg-slate-950/50 border-slate-800 "
                      value={draft.discount_text}
                      onChange={e => setDraft(d => ({ ...d, discount_text: e.target.value }))}
                      placeholder="ex: 1 Acheté = 1 Offert"
                    />
                  </div>
                </div>

                {/* Validity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from" className="text-sm font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" /> Début
                    </Label>
                    <Input
                      id="from"
                      type="date"
                      className="bg-slate-950/50 border-slate-800"
                      value={draft.valid_from}
                      onChange={e => setDraft(d => ({ ...d, valid_from: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="until" className="text-sm font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-400" /> Fin
                    </Label>
                    <Input
                      id="until"
                      type="date"
                      className="bg-slate-950/50 border-slate-800"
                      value={draft.valid_until}
                      onChange={e => setDraft(d => ({ ...d, valid_until: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Target Selection */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-pink-500/5 border border-pink-500/20 group cursor-pointer transition-all hover:bg-pink-500/10">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="all"
                        className="data-[state=checked]:bg-pink-500 border-pink-500/50"
                        checked={draft.apply_to_all}
                        onCheckedChange={(checked) => setDraft(d => ({ ...d, apply_to_all: checked === true }))}
                      />
                      <Label htmlFor="all" className="text-sm font-bold text-pink-100 cursor-pointer">
                        Appliquer à tous les produits/services
                      </Label>
                    </div>
                  </div>

                  {!draft.apply_to_all && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-slate-300">Sélectionner les articles ({draft.item_ids.length})</Label>
                        {draft.item_ids.length > 0 && (
                          <button
                            className="text-xs text-pink-400 hover:underline"
                            onClick={() => setDraft(d => ({ ...d, item_ids: [] }))}
                          >
                            Effacer la sélection
                          </button>
                        )}
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-950/50 overflow-hidden">
                        <ScrollArea className="h-48 w-full p-2">
                          <div className="grid grid-cols-1 gap-1">
                            {items.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-8 text-slate-500 italic">
                                <Package className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-sm">Aucun article trouvé dans votre store.</p>
                              </div>
                            ) : (
                              items.map(item => (
                                <div
                                  key={item.id}
                                  className={`flex items-center justify-between p-2.5 rounded-lg transition-all ${draft.item_ids.includes(item.id)
                                    ? 'bg-pink-500/10 text-pink-100'
                                    : 'hover:bg-white/5 text-slate-400'
                                    }`}
                                  onClick={() => {
                                    const isSelected = draft.item_ids.includes(item.id);
                                    if (isSelected) {
                                      setDraft(d => ({ ...d, item_ids: d.item_ids.filter(id => id !== item.id) }));
                                    } else {
                                      setDraft(d => ({ ...d, item_ids: [...d.item_ids, item.id] }));
                                    }
                                  }}
                                >
                                  <div className="flex items-center space-x-3 cursor-pointer">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${draft.item_ids.includes(item.id) ? 'bg-pink-500 border-pink-500' : 'border-slate-700'
                                      }`}>
                                      {draft.item_ids.includes(item.id) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{item.name}</p>
                                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{item.item_type}</p>
                                    </div>
                                  </div>
                                  <span className="text-xs font-mono font-bold bg-slate-900 px-2 py-0.5 rounded text-slate-300">
                                    {item.price} DT
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-950/80 border-t border-white/5 flex gap-3">
              <Button
                variant="ghost"
                className="flex-1 text-slate-400 hover:text-white hover:bg-white/5"
                onClick={() => setIsOpen(false)}
              >
                Annuler
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold shadow-lg shadow-pink-500/20"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Traitement...</> : draft.id ? 'Mettre à jour' : 'Lancer l\'offre'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Promotions actives', value: activePromos.length },
          { label: 'Total promotions', value: promotions.length },
          { label: 'Inactives', value: inactivePromos.length },
        ].map(stat => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground font-medium mb-2">{stat.label}</p>
              <p className="text-4xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Actives ({activePromos.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactives ({inactivePromos.length})</TabsTrigger>
        </TabsList>

        {(['active', 'inactive'] as const).map(tab => {
          const list = tab === 'active' ? activePromos : inactivePromos;
          return (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {list.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="py-12 text-center">
                    <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">
                      {tab === 'active' ? 'Aucune promotion active pour le moment.' : 'Aucune promotion inactive.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                list.map(promo => {
                  const expired = isExpired(promo.valid_until);
                  const days = daysUntil(promo.valid_until);
                  return (
                    <Card key={promo.id} className={`border-0 shadow-sm ${expired && promo.active ? 'opacity-60' : ''}`}>
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-foreground">{promo.title}</h3>
                            {promo.description && <p className="text-sm text-muted-foreground mt-1">{promo.description}</p>}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {promo.apply_to_all ? (
                              <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 px-2 py-1 rounded border border-purple-200 dark:border-purple-800">
                                Toute la boutique
                              </span>
                            ) : (
                              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 px-2 py-1 rounded border border-blue-200 dark:border-blue-800">
                                {promo.item_ids?.length || 0} article{promo.item_ids?.length > 1 ? 's' : ''}
                              </span>
                            )}
                            {expired && <span className="text-xs bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 px-2 py-1 rounded">Expirée</span>}
                            {promo.active && !expired && <span className="text-xs bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 px-2 py-1 rounded">Active</span>}
                          </div>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-4 border border-border flex items-center justify-between">
                          <div>
                            {promo.discount_percent && <p className="text-3xl font-bold text-foreground">{promo.discount_percent}% OFF</p>}
                            {promo.discount_text && <p className="text-lg font-bold text-foreground">{promo.discount_text}</p>}
                          </div>
                          <Zap className="w-8 h-8 text-yellow-500 opacity-50" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Depuis</p>
                              <p className="text-sm font-medium text-foreground">
                                {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(promo.valid_from))}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Jusqu'au</p>
                              <p className="text-sm font-medium text-foreground">
                                {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(promo.valid_until))}
                              </p>
                            </div>
                          </div>
                        </div>

                        {!expired && (
                          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              <span className="font-medium">{days}</span> jour{days > 1 ? 's' : ''} restant{days > 1 ? 's' : ''}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleToggle(promo)}>
                            {promo.active ? <><ToggleRight className="w-4 h-4 mr-2" />Désactiver</> : <><ToggleLeft className="w-4 h-4 mr-2" />Activer</>}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEdit(promo)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(promo.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
