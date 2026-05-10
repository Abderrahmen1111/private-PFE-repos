'use client';

import React, { useState, useEffect } from 'react';
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotion,
} from '@/lib/actions/promotions';
import { Item } from '@/lib/actions/items';
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
import { Zap, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Calendar, Loader2, Sparkles, Package, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import DarijaAIPanel from '@/components/dashboard/DarijaAIPanel';

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

interface PromotionsSectionProps {
  storeId: number;
  items: Item[];
  initialPromotions?: any[];
  onPromotionsChange?: (promos: any[]) => void;
}

export default function PromotionsSection({ storeId, items, initialPromotions, onPromotionsChange }: PromotionsSectionProps) {
  const [promotions, setPromotions] = useState<Promo[]>(initialPromotions || []);
  const [isLoading, setIsLoading] = useState(!initialPromotions);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<PromoDraft>(emptyDraft());
  const [isAIOpen, setIsAIOpen] = useState(false);

  useEffect(() => {
    async function fetchPromos() {
      if (!storeId || initialPromotions) return;
      setIsLoading(true);
      const data = await getPromotions(storeId);
      setPromotions(data as Promo[]);
      setIsLoading(false);
    }
    fetchPromos();
  }, [storeId, initialPromotions]);

  // Sync internal state with external if needed
  useEffect(() => {
    if (initialPromotions) {
      setPromotions(initialPromotions);
    }
  }, [initialPromotions]);

  // Notify parent of changes
  const notifyChange = (update: Promo[] | ((prev: Promo[]) => Promo[])) => {
    setPromotions(prev => {
      const newList = typeof update === 'function' ? update(prev) : update;
      onPromotionsChange?.(newList);
      return newList;
    });
  };

  const activePromos = promotions.filter(p => {
    const now = new Date();
    // Start date is today or in the past, and end date is today or in the future
    return p.active && new Date(p.valid_from) <= now && new Date(p.valid_until) >= now;
  });

  const upcomingPromos = promotions.filter(p => {
    const now = new Date();
    // Start date is in the future
    return p.active && new Date(p.valid_from) > now;
  });

  const inactivePromos = promotions.filter(p => !p.active || new Date(p.valid_until) < new Date());

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
        notifyChange(prev => prev.map(p => p.id === draft.id ? { ...p, ...payload } as Promo : p));
        toast.success('Promotion mise à jour !');
      } else {
        toast.error('Erreur lors de la mise à jour.');
      }
    } else {
      const result = await createPromotion(storeId, payload as any);
      if (result.success && result.data) {
        notifyChange(prev => [{ ...result.data as Promo, item_ids: draft.item_ids }, ...prev]);
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
      notifyChange(prev => prev.filter(p => p.id !== id));
      toast.success('Promotion supprimée.');
    } else {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const handleToggle = async (promo: Promo) => {
    const newActive = !promo.active;
    const result = await togglePromotion(promo.id, storeId, newActive);
    if (result.success) {
      notifyChange(prev => prev.map(p => p.id === promo.id ? { ...p, active: newActive } : p));
      toast.success(newActive ? 'Promotion activée.' : 'Promotion désactivée.');
    } else {
      toast.error('Erreur lors du changement de statut.');
    }
  };

  return (
    <div className="space-y-10 mt-20 pt-12 border-t border-white/5 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-10 bg-gradient-to-b from-red-500 to-orange-600 rounded-full shadow-lg shadow-red-500/20" />
            <h2 className="text-4xl font-black text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
              Marketing & Offres
            </h2>
          </div>
          <p className="text-slate-400 font-medium max-w-md">
            Boostez votre visibilité et fidélisez vos clients avec des campagnes percutantes.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAIOpen(true)}
            className="border-violet-500/40 text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/70 gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Darija
          </Button>

          <Dialog open={isOpen} onOpenChange={open => { setIsOpen(open); if (!open) setDraft(emptyDraft()); }}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" onClick={openCreate} className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" /> Nouvelle Offre
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-xl bg-slate-900/95 backdrop-blur-xl border-slate-800 text-white p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 p-6 border-b border-white/5">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
                    {draft.id ? 'Modifier la promotion' : 'Nouvelle Offre Spéciale'}
                  </DialogTitle>
                </DialogHeader>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-2">
                      <Zap className="w-4 h-4 text-red-500" /> Titre de l'offre *
                    </Label>
                    <Input
                      id="title"
                      className="bg-slate-950/50 border-slate-800 focus:border-red-500/50"
                      value={draft.title}
                      onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                      placeholder="ex: Soldes d'été"
                    />
                  </div>

                  <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] font-black text-red-500/80 uppercase tracking-[0.3em] animate-pulse">Aperçu Premium</p>
                      <Sparkles className="w-3 h-3 text-red-500/50" />
                    </div>
                    
                    <div className="relative group perspective-1000">
                      <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-orange-600 to-red-700 rounded-[2rem] blur-md opacity-40 group-hover:opacity-70 transition duration-1000 animate-tilt" />
                      <div className="relative bg-slate-950/90 backdrop-blur-2xl border border-white/20 rounded-[1.8rem] p-5 overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -ml-16 -mb-16" />
                        <div className="flex items-center justify-between gap-6 relative z-10">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </div>
                              <h4 className="font-black text-white text-base md:text-lg uppercase tracking-tight truncate drop-shadow-sm">
                                {draft.title || 'VOTRE OFFRE ICI'}
                              </h4>
                            </div>
                            <p className="text-xs text-slate-400 font-medium italic line-clamp-1 opacity-80">
                              {draft.description || 'Une description qui donne envie...'}
                            </p>
                          </div>
                          <div className="relative group">
                            <div className="absolute -inset-2 bg-red-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                            <div className="relative px-5 py-3 rounded-2xl bg-gradient-to-br from-red-500 via-orange-600 to-red-700 shadow-xl shadow-red-500/30 transform -rotate-3 group-hover:rotate-0 transition-all duration-500 border border-white/20">
                              <span className="text-xl font-black text-white italic tracking-tighter">
                                {draft.discount_percent ? `-${draft.discount_percent}%` : (draft.discount_text || 'PROMO')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
                              <Zap className="w-3 h-3 text-yellow-500" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Offre Spéciale</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                    <Textarea
                      id="description"
                      className="bg-slate-950/50 border-slate-800 min-h-[80px]"
                      value={draft.description}
                      onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pct" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Réduction (%)</Label>
                      <Input
                        id="pct"
                        type="number"
                        className="bg-slate-950/50 border-slate-800"
                        value={draft.discount_percent}
                        onChange={e => setDraft(d => ({ ...d, discount_percent: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="txt" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Texte (ex: 1+1)</Label>
                      <Input
                        id="txt"
                        className="bg-slate-950/50 border-slate-800"
                        value={draft.discount_text}
                        onChange={e => setDraft(d => ({ ...d, discount_text: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from" className="text-sm font-semibold">Début</Label>
                      <Input id="from" type="date" className="bg-slate-950/50 border-slate-800" value={draft.valid_from} onChange={e => setDraft(d => ({ ...d, valid_from: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="until" className="text-sm font-semibold">Fin</Label>
                      <Input id="until" type="date" className="bg-slate-950/50 border-slate-800" value={draft.valid_until} onChange={e => setDraft(d => ({ ...d, valid_until: e.target.value }))} />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                      <Checkbox
                        id="all"
                        checked={draft.apply_to_all}
                        onCheckedChange={(checked) => setDraft(d => ({ ...d, apply_to_all: checked === true }))}
                      />
                      <Label htmlFor="all" className="text-sm font-bold text-white cursor-pointer">
                        Appliquer à tous les articles
                      </Label>
                    </div>

                    {!draft.apply_to_all && (
                      <ScrollArea className="h-40 border border-slate-800 rounded-lg p-2 bg-slate-950/50">
                        {items.map(item => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${draft.item_ids.includes(item.id) ? 'bg-red-500/20' : 'hover:bg-white/5'}`}
                            onClick={() => {
                              const selected = draft.item_ids.includes(item.id);
                              setDraft(d => ({ ...d, item_ids: selected ? d.item_ids.filter(id => id !== item.id) : [...d.item_ids, item.id] }));
                            }}
                          >
                            <span className="text-sm font-medium">{item.name}</span>
                            <span className="text-xs font-bold text-white/40">{item.price} DT</span>
                          </div>
                        ))}
                      </ScrollArea>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-950/80 border-t border-white/5 flex gap-3">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsOpen(false)}>Annuler</Button>
                <Button type="button" className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : draft.id ? 'Mettre à jour' : 'Lancer'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <div className="flex items-center justify-center mb-10">
          <TabsList className="bg-slate-950/50 border border-white/10 p-1 rounded-2xl h-auto">
            <TabsTrigger 
              value="active" 
              className="px-8 py-3 rounded-xl data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-red-600/20 transition-all font-bold text-slate-400"
            >
              🔥 Actives ({activePromos.length})
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming" 
              className="px-8 py-3 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all font-bold text-slate-400"
            >
              📅 À venir ({upcomingPromos.length})
            </TabsTrigger>
            <TabsTrigger 
              value="inactive" 
              className="px-8 py-3 rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-white transition-all font-bold text-slate-400"
            >
              ❄️ Inactives ({inactivePromos.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {(['active', 'upcoming', 'inactive'] as const).map(tab => {
          const list = tab === 'active' ? activePromos : tab === 'upcoming' ? upcomingPromos : inactivePromos;
          return (
            <TabsContent key={tab} value={tab} className="mt-0 outline-none">
              {list.length === 0 ? (
                <div className="relative group overflow-hidden rounded-[2.5rem] border border-dashed border-white/10 bg-white/5 py-24">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className="flex flex-col items-center justify-center gap-6 relative z-10 text-center px-6">
                    <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center border border-white/10 shadow-2xl relative">
                      <div className="absolute inset-0 rounded-full bg-red-500/20 blur-2xl animate-pulse" />
                      <Tag className="w-10 h-10 text-red-500 relative z-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white">
                        {tab === 'upcoming' ? 'Aucune offre à venir' : 'Prêt à booster vos ventes ?'}
                      </h3>
                      <p className="text-slate-400 max-w-sm mx-auto">
                        {tab === 'upcoming' ? 'Planifiez vos futures campagnes marketing ici.' : 'Créez votre première offre spéciale et attirez de nouveaux clients dès aujourd\'hui.'}
                      </p>
                    </div>
                    {tab !== 'upcoming' && (
                      <Button 
                        onClick={openCreate} 
                        className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-6 rounded-2xl shadow-xl shadow-red-600/20 group"
                      >
                        <Plus className="w-6 h-6 mr-2 transition-transform group-hover:rotate-90" />
                        Lancer une campagne
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {list.map(promo => (
                    <div key={promo.id} className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                      
                      <Card className="relative border-white/5 bg-slate-900/40 backdrop-blur-xl hover:border-white/10 transition-all duration-300 rounded-3xl overflow-hidden shadow-2xl h-full">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                <h3 className="font-black text-white text-xl tracking-tight uppercase leading-none">
                                  {promo.title}
                                </h3>
                              </div>
                              <p className="text-sm text-slate-400 line-clamp-1 italic">
                                {promo.description || 'Offre exclusive limitée'}
                              </p>
                            </div>
                            
                            <div className="flex flex-col items-end">
                              <div className="px-4 py-2 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-500/20 transform group-hover:scale-110 transition-transform">
                                <span className="text-lg font-black text-white italic">
                                  {promo.discount_percent ? `-${promo.discount_percent}%` : (promo.discount_text || 'PROMO')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-red-500/10">
                                <Calendar className="w-4 h-4 text-red-400" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expire le</span>
                                <span className="text-xs font-black text-white">{new Date(promo.valid_until).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-red-500/10">
                                <Package className="w-4 h-4 text-red-400" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cible</span>
                                <span className="text-xs font-black text-white">
                                  {promo.apply_to_all ? 'Global' : `${promo.item_ids.length} art.`}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl h-10 font-bold transition-all" 
                              onClick={() => handleToggle(promo)}
                            >
                              {promo.active ? (
                                <><ToggleRight className="w-4 h-4 mr-2 text-emerald-400" /> Actif</>
                              ) : (
                                <><ToggleLeft className="w-4 h-4 mr-2 text-slate-500" /> Inactif</>
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-10 h-10 p-0 border-white/10 hover:bg-white/10 text-white rounded-xl" 
                              onClick={() => openEdit(promo)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-10 h-10 p-0 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl" 
                              onClick={() => handleDelete(promo.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* AI Panel */}
      {storeId && (
        <DarijaAIPanel
          open={isAIOpen}
          onClose={() => setIsAIOpen(false)}
          storeId={storeId}
          mode="promotion"
          onApplyPromotion={(data) => {
            setDraft({
              title: data.title,
              description: data.description,
              discount_percent: data.discount_percent?.toString() ?? '',
              discount_text: data.discount_text ?? '',
              valid_from: new Date().toISOString().slice(0, 10),
              valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
              apply_to_all: true,
              item_ids: [],
            });
            setIsOpen(true);
          }}
        />
      )}
    </div>
  );
}
