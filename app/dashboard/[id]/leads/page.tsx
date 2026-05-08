'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getLeadActions, updateOrderStatus } from '@/lib/actions/leads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ShoppingCart,
  Calendar,
  TrendingUp,
  Filter,
  Loader2,
  Phone,
  Check,
  X as XIcon,
  ShieldAlert,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { updateBookingStatus } from '@/lib/actions/reservation';
import { toast } from 'sonner';
import { blockUser } from '@/lib/actions/friendships';

type LeadType = 'all' | 'order' | 'booking';

export default function LeadsPage() {
  const params = useParams();
  const storeId = Number(params.id);

  const [leads, setLeads] = useState<{ orders: any[]; bookings: any[] }>({ orders: [], bookings: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<LeadType>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');
  const [updatingIds, setUpdatingIds] = useState<Record<number, boolean>>({});

  const fetchData = () => {
    if (storeId) {
      getLeadActions(storeId).then(data => {
        setLeads(data as any);
        setIsLoading(false);
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [storeId]);

  const handleStatusUpdate = async (leadId: number, type: 'order' | 'booking', newStatus: string) => {
    // Generate unique key for loading state
    const key = `${type}-${leadId}`;
    setUpdatingIds(prev => ({ ...prev, [leadId]: true })); // We can still use leadId as key or type-id
    
    try {
      if (type === 'booking') {
        await updateBookingStatus(leadId, newStatus as any);
        toast.success(newStatus === 'CONFIRMED' ? 'Réservation acceptée' : 'Réservation refusée');
      } else {
        await updateOrderStatus(leadId, newStatus as any);
        toast.success(newStatus === 'VALIDATED' ? 'Commande validée' : 'Commande refusée');
      }
      
      // Update local state
      setLeads(prev => ({
        orders: type === 'order' 
          ? prev.orders.map(o => o.id === leadId ? { ...o, status: newStatus } : o)
          : prev.orders,
        bookings: type === 'booking'
          ? prev.bookings.map(b => b.id === leadId ? { ...b, status: newStatus } : b)
          : prev.bookings
      }));
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour");
    } finally {
      setUpdatingIds(prev => ({ ...prev, [leadId]: false }));
    }
  };

  const handleBlockCustomer = async (customerId: string, leadId: number, type: 'order' | 'booking') => {
    if (!customerId) {
      toast.error("Impossible de bloquer : ID client manquant");
      return;
    }
    
    if (window.confirm("Voulez-vous bloquer ce client et annuler sa demande ?")) {
      setUpdatingIds(prev => ({ ...prev, [leadId]: true }));
      try {
        const { error } = await blockUser(customerId);
        if (error) throw error;
        
        // Also cancel the order/booking
        if (type === 'booking') {
          await updateBookingStatus(leadId, 'CANCELLED');
        } else {
          await updateOrderStatus(leadId, 'CANCELLED');
        }
        
        toast.success("Client bloqué et demande annulée");
        fetchData();
      } catch (err: any) {
        toast.error("Erreur: " + (err.message || "Action impossible"));
      } finally {
        setUpdatingIds(prev => ({ ...prev, [leadId]: false }));
      }
    }
  };

  const allLeads = useMemo(() => {
    const combined = [
      ...leads.orders.map(o => ({ ...o, leadType: 'order' as const, amount: o.total_price })),
      ...leads.bookings.map(b => ({ ...b, leadType: 'booking' as const, amount: b.price })),
    ];

    // On ne garde QUE les actions en attente (PENDING)
    let filtered = combined.filter(l => l.status === 'PENDING');

    if (filterType !== 'all') {
      filtered = filtered.filter(l => l.leadType === filterType);
    }
    
    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === 'recent' ? dateB - dateA : dateA - dateB;
    });
  }, [leads, filterType, sortBy]);

  if (isLoading) return <div className="p-8 text-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Chargement des leads...</div>;

  const pendingOrders = leads.orders.filter(o => o.status === 'PENDING').length;
  const pendingBookings = leads.bookings.filter(b => b.status === 'PENDING').length;
  const ordersCount = pendingOrders;
  const bookingsCount = pendingBookings;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Actions clients & Leads</h1>
        <p className="text-muted-foreground">Suivez vos commandes et réservations en temps réel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterType('all')}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Total interactions</p>
                <p className="text-3xl font-bold text-foreground">{ordersCount + bookingsCount}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"><TrendingUp className="w-5 h-5" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterType('order')}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Commandes</p>
                <p className="text-3xl font-bold text-foreground">{ordersCount}</p>
              </div>
              <div className="p-2 rounded-lg bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"><ShoppingCart className="w-5 h-5" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterType('booking')}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Réservations</p>
                <p className="text-3xl font-bold text-foreground">{bookingsCount}</p>
              </div>
              <div className="p-2 rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400"><Calendar className="w-5 h-5" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2 items-center w-full md:w-auto">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <Select value={filterType} onValueChange={(val) => setFilterType(val as LeadType)}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tout</SelectItem>
              <SelectItem value="order">Commandes</SelectItem>
              <SelectItem value="booking">Réservations</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant={sortBy === 'recent' ? 'default' : 'outline'} onClick={() => setSortBy('recent')}>Plus récent</Button>
          <Button variant={sortBy === 'oldest' ? 'default' : 'outline'} onClick={() => setSortBy('oldest')}>Plus ancien</Button>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {allLeads.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12">
              <div className="text-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Aucune interaction client pour le moment.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          allLeads.map((lead) => (
            <Card key={`${lead.leadType}-${lead.id}`} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg shrink-0 ${lead.leadType === 'order' ? 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400' : 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400'}`}>
                    {lead.leadType === 'order' ? <ShoppingCart className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
                      <div className="space-y-1">
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                          {lead.leadType === 'order' ? 'Commande' : 'Réservation'}
                          <span className="text-[10px] font-black px-2 py-0.5 bg-muted rounded uppercase tracking-widest opacity-70">#{lead.id}</span>
                        </h3>
                        <p className="text-sm text-foreground font-black uppercase italic tracking-tighter">{lead.customer_name}</p>
                        {lead.customer_phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 opacity-80">
                            <Phone className="w-3 h-3" /> {lead.customer_phone}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2 border-l-2 border-primary/20 pl-3">
                          Montant : <span className="font-black text-foreground">{lead.amount} DT</span>
                        </p>

                        {/* Fraud Signals */}
                        {lead.fraud && (
                          <div className="mt-4 p-3 bg-muted/30 rounded-xl border border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                              <ShieldAlert className={`w-4 h-4 ${
                                lead.fraud.level === 'safe' ? 'text-emerald-500' :
                                lead.fraud.level === 'suspicious' ? 'text-amber-500' :
                                'text-rose-500'
                              }`} />
                              <span className={`text-[10px] font-black uppercase tracking-widest ${
                                lead.fraud.level === 'safe' ? 'text-emerald-600' :
                                lead.fraud.level === 'suspicious' ? 'text-amber-600' :
                                'text-rose-600'
                              }`}>
                                Analyse de risque : {lead.fraud.level.replace('_', ' ')} ({lead.fraud.score}/100)
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                              "{lead.fraud.ai_reasoning}"
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-3 text-right">
                        <div className="space-y-0.5">
                          <p className="text-sm font-black text-foreground">
                            {new Intl.DateTimeFormat('fr-FR', { month: 'short', day: 'numeric' }).format(new Date(lead.created_at))}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em] opacity-40">
                            {new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(lead.created_at))}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border shadow-sm ${
                            lead.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            lead.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            lead.status === 'CONFIRMED' || lead.status === 'VALIDATED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                          }`}>{lead.status}</span>

                          {lead.status === 'PENDING' && (
                            <div className="flex gap-2 mt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(lead.id, lead.leadType, lead.leadType === 'booking' ? 'CONFIRMED' : 'VALIDATED')}
                                disabled={updatingIds[lead.id]}
                                className="h-8 px-3 text-[9px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all active:scale-95 rounded-lg shadow-sm"
                              >
                                {updatingIds[lead.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Accepter
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(lead.id, lead.leadType, 'CANCELLED')}
                                disabled={updatingIds[lead.id]}
                                className="h-8 px-3 text-[9px] font-black uppercase tracking-widest border-rose-500/20 text-rose-600 hover:bg-rose-600 hover:text-white transition-all active:scale-95 rounded-lg shadow-sm"
                              >
                                {updatingIds[lead.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <XIcon className="w-3 h-3" />}
                                Refuser
                              </Button>
                            </div>
                          )}
                          
                          {lead.customer_id && lead.status !== 'CANCELLED' && lead.status !== 'COMPLETED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleBlockCustomer(lead.customer_id, lead.id, lead.leadType)}
                              disabled={updatingIds[lead.id]}
                              className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-all rounded-lg mt-1"
                            >
                              <ShieldAlert className="w-3 h-3 mr-1" />
                              Bloquer Client
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {allLeads.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">Affichage de {allLeads.length} interactions</div>
      )}
    </div>
  );
}
