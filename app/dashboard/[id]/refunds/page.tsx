'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Download, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';
import { getStoreTransactions, Transaction } from '@/lib/actions/transactions';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusColors = {
  CANCELLED: 'bg-destructive/10 text-destructive border-destructive/20',
  REFUNDED: 'bg-green-500/10 text-green-500 border-green-500/20',
};

export default function RefundsPage() {
  const { id } = useParams();
  const storeId = Number(id);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      if (storeId) {
        const data = await getStoreTransactions(storeId);
        setTransactions(data);
      }
      setIsLoading(false);
    }
    loadData();
  }, [storeId]);

  const cancelledTransactions = useMemo(() => {
    return transactions.filter(t => t.status === ('CANCELLED' as any));
  }, [transactions]);

  const filteredRefunds = useMemo(() => {
    return cancelledTransactions.filter(ref => {
      const matchesSearch = ref.reference.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           ref.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [cancelledTransactions, searchQuery]);

  const totalRefundAmount = cancelledTransactions.reduce((sum, t) => sum + t.amount, 0);

  if (isLoading) return <div className="p-8 text-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Chargement des annulations...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Refund Management</h1>
          <p className="text-muted-foreground">Process and track customer refunds</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border border-border">
          <div className="text-sm text-muted-foreground">Volume Annulé</div>
          <div className="text-2xl font-bold text-foreground">{totalRefundAmount.toLocaleString()} DT</div>
          <div className="text-xs text-muted-foreground mt-1">Montant total des annulations</div>
        </Card>
        <Card className="p-4 border border-border">
          <div className="text-sm text-muted-foreground">Nombre d'Annulations</div>
          <div className="text-2xl font-bold text-destructive">{cancelledTransactions.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Transactions non abouties</div>
        </Card>
        <Card className="p-4 border border-border">
          <div className="text-sm text-muted-foreground">Taux d'Annulation</div>
          <div className="text-2xl font-bold text-foreground">
            {transactions.length > 0 ? ((cancelledTransactions.length / transactions.length) * 100).toFixed(1) : '0'}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">Sur l'ensemble des ventes</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par référence ou client..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Refunds Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Date</th>
                <th className="px-6 py-3 text-left font-semibold">Référence</th>
                <th className="px-6 py-3 text-left font-semibold">Client</th>
                <th className="px-6 py-3 text-left font-semibold">Type</th>
                <th className="px-6 py-3 text-left font-semibold">Détails</th>
                <th className="px-6 py-3 text-right font-semibold">Montant</th>
                <th className="px-6 py-3 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground text-sm">
                    Aucune annulation trouvée.
                  </td>
                </tr>
              ) : filteredRefunds.map((refund) => (
                <tr key={refund.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-sm">
                    {format(new Date(refund.created_at), 'dd MMM yyyy', { locale: fr })}
                  </td>
                  <td className="px-6 py-4 font-mono text-sm font-bold text-foreground">{refund.reference}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-sm">{refund.customer_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold">
                      {refund.type === 'order' ? 'PRODUIT' : 'SERVICE'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm truncate text-muted-foreground">{refund.details}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-extrabold text-foreground">{refund.amount.toLocaleString()} DT</td>
                  <td className="px-6 py-4">
                    <Badge className={`text-[10px] font-bold uppercase border ${statusColors[refund.status as keyof typeof statusColors]}`}>
                      {refund.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
