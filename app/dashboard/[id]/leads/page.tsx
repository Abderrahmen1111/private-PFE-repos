'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getLeadActions } from '@/lib/actions/overviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ShoppingCart,
  Calendar,
  TrendingUp,
  Filter,
  Loader2,
  Phone,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type LeadType = 'all' | 'order' | 'booking';

export default function LeadsPage() {
  const params = useParams();
  const storeId = Number(params.id);

  const [leads, setLeads] = useState<{ orders: any[]; bookings: any[] }>({ orders: [], bookings: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<LeadType>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');

  useEffect(() => {
    if (storeId) {
      getLeadActions(storeId).then(data => {
        setLeads(data as any);
        setIsLoading(false);
      });
    }
  }, [storeId]);

  const allLeads = useMemo(() => {
    const combined = [
      ...leads.orders.map(o => ({ ...o, leadType: 'order' as const, amount: o.total_price })),
      ...leads.bookings.map(b => ({ ...b, leadType: 'booking' as const, amount: b.price })),
    ];

    let filtered = filterType === 'all' ? combined : combined.filter(l => l.leadType === filterType);
    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === 'recent' ? dateB - dateA : dateA - dateB;
    });
  }, [leads, filterType, sortBy]);

  if (isLoading) return <div className="p-8 text-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Chargement des leads...</div>;

  const ordersCount = leads.orders.length;
  const bookingsCount = leads.bookings.length;

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
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-foreground">{lead.leadType === 'order' ? 'Commande' : 'Réservation'}</h3>
                        <p className="text-sm text-foreground font-medium mt-0.5">{lead.customer_name}</p>
                        {lead.customer_phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {lead.customer_phone}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          Montant : <span className="font-semibold">{lead.amount} DT</span>
                        </p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded mt-1 inline-block ${
                          lead.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          lead.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{lead.status}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {new Intl.DateTimeFormat('fr-FR', { month: 'short', day: 'numeric' }).format(new Date(lead.created_at))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(lead.created_at))}
                        </p>
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
