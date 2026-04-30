'use client';

import React from 'react';
import { getStoreTransactions, Transaction } from '@/lib/actions/transactions';
import { useParams } from 'next/navigation';
import { 
  Loader2, Search, Filter, ShieldCheck, CreditCard, 
  Calendar, ArrowRight, TrendingUp, Info, MoreVertical, 
  CheckCircle, XCircle, Clock, Download, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Scanner } from '@yudiel/react-qr-scanner';
import { updateBookingStatus } from '@/lib/actions/reservation';
import { updateOrderStatus } from '@/lib/actions/leads';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const statusColors: Record<string, string> = {
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  shipped: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  validated: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
};

const PAGE_SIZE = 10;

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string };
function FilterSelect({ label, children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      {label && <label className="text-xs font-medium text-muted-foreground px-0.5">{label}</label>}
      <select
        {...props}
        className="px-3 py-2 rounded-lg border border-border text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
      >
        {children}
      </select>
    </div>
  );
}

export default function TransactionsPage() {
  const { id } = useParams();
  const storeId = Number(id);

  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [page, setPage] = React.useState(1);

  const [selectedTxn, setSelectedTxn] = React.useState<Transaction | null>(null);
  const [isScannerOpen, setIsScannerOpen] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = React.useState(false);
  const isScanningRef = React.useRef(false);

  const playBeep = React.useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15); // Beep duration
    } catch (e) {
      console.error("Audio beep failed", e);
    }
  }, []);

  const handleStatusUpdate = async (newStatus: 'completed' | 'cancelled' | 'failed') => {
    if (!selectedTxn) return;
    setIsUpdating(true);
    try {
      const isBooking = selectedTxn.type === 'booking';
      const actualStatus = newStatus === 'failed' ? 'CANCELLED' : newStatus.toUpperCase();
      
      const realId = selectedTxn.original_id;
      if (!realId) throw new Error("ID d'origine introuvable pour cette transaction.");
      
      if (isBooking) {
        await updateBookingStatus(realId, actualStatus as any);
      } else {
        await updateOrderStatus(realId, actualStatus as any);
      }
      
      if (newStatus === 'completed') {
        setShowSuccessAnimation(true);
        setTimeout(() => {
          toast.success('Transaction finalisée avec succès');
          setTransactions(prev => prev.map(t => t.id === selectedTxn.id ? { ...t, status: 'completed' } : t));
          setSelectedTxn(null);
          setIsScannerOpen(false);
          setShowSuccessAnimation(false);
        }, 2500);
      } else {
        toast.success('Transaction marquée comme échouée');
        setTransactions(prev => prev.map(t => t.id === selectedTxn.id ? { ...t, status: 'failed' } : t));
        setSelectedTxn(null);
        setIsScannerOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
    } finally {
      if (newStatus !== 'completed') {
        setIsUpdating(false);
      } else {
        // Leave isUpdating true until setTimeout finishes to prevent double clicks
        setTimeout(() => setIsUpdating(false), 2500);
      }
    }
  };

  const onScan = (result: any) => {
    if (isUpdating || isScanningRef.current) return;
    
    const code = result?.[0]?.rawValue || result?.rawValue || result;
    if (code && selectedTxn) {
      const tokenToMatch = selectedTxn.qr_code_token || selectedTxn.reference;
      if (typeof code === 'string' && code.includes(tokenToMatch)) {
        isScanningRef.current = true; // Lock scanner
        playBeep(); // Audio feedback
        toast.success('QR Code valide !', { id: 'qr-success' });
        handleStatusUpdate('completed').finally(() => {
          setTimeout(() => { isScanningRef.current = false; }, 3000);
        });
      } else {
        toast.error('QR Code invalide. Ne correspond pas à la référence attendue.', { id: 'qr-invalid' });
      }
    }
  };

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      if (storeId) {
        const data = await getStoreTransactions(storeId);
        setTransactions(data);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [storeId]);

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(txn => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        txn.id.toLowerCase().includes(q) ||
        txn.reference.toLowerCase().includes(q) ||
        txn.customer_name.toLowerCase().includes(q);
        
      const matchesStatus = !statusFilter || txn.status === statusFilter;
      const matchesType = !typeFilter || txn.type === typeFilter;
      
      const transDate = new Date(txn.created_at);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate + 'T23:59:59') : null;
      const inDateRange = (!start || transDate >= start) && (!end || transDate <= end);
      
      return matchesSearch && matchesStatus && matchesType && inDateRange;
    });
  }, [transactions, searchQuery, statusFilter, typeFilter, startDate, endDate]);

  const totalPages = Math.ceil(filteredTransactions.length / PAGE_SIZE) || 1;
  const paginated = filteredTransactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalRevenue = filteredTransactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const totalCommission = totalRevenue * 0.10;
  const hasActiveFilters = statusFilter || typeFilter || startDate || endDate || searchQuery;

  const clearFilters = () => {
    setStatusFilter(''); setTypeFilter(''); setStartDate(''); setEndDate('');
    setSearchQuery(''); setPage(1);
  };

  if (isLoading) return <div className="p-8 text-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Chargement des transactions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Transactions</h1>
          <p className="text-muted-foreground text-sm">Track all financial transactions</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Transactions', value: filteredTransactions.length, sub: 'Au total', color: 'text-foreground' },
          { label: 'Revenu Réel', value: `${totalRevenue.toLocaleString()} DT`, sub: `${filteredTransactions.filter(t => t.status === 'completed').length} validées`, color: 'text-green-500' },
          { label: 'En attente', value: filteredTransactions.filter(t => t.status === 'pending').length, sub: 'À traiter', color: 'text-yellow-500' },
          { label: 'Commissions', value: `${totalCommission.toLocaleString()} DT`, sub: 'Frais Ro2ya 10%', color: 'text-foreground' },
        ].map(({ label, value, sub, color }) => (
          <Card key={label} className="p-4">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{sub}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <FilterSelect label="Type" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="">Tous les types</option>
            <option value="order">Commande (Produit)</option>
            <option value="booking">Réservation (Service)</option>
          </FilterSelect>
          
          <FilterSelect label="Statut" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="completed">Complété</option>
            <option value="shipped">Expédié</option>
            <option value="failed">Annulé</option>
          </FilterSelect>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground px-0.5">Du</label>
            <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-border text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground px-0.5">Au</label>
            <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-border text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par référence ou client..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead className="bg-muted border-b border-border">
              <tr>
                {[
                  'Date', 'Référence', 'Type', 'Client', 'Détails', 'Montant', 'Statut'
                ].map(col => (
                  <th key={col} className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground text-sm">
                    Aucune transaction trouvée pour ces filtres.
                  </td>
                </tr>
              ) : paginated.map(txn => (
                <tr 
                  key={txn.id} 
                  className={`transition-colors ${txn.status === 'pending' ? 'cursor-pointer hover:bg-muted/60' : 'hover:bg-muted/40'}`}
                  onClick={() => {
                    if (txn.status === 'pending') {
                      setSelectedTxn(txn);
                      setIsScannerOpen(false);
                    }
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-sm">
                    {format(new Date(txn.created_at), 'dd MMM yyyy', { locale: fr })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-foreground text-sm">
                    {txn.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold">
                      {txn.type === 'order' ? 'PRODUIT' : 'SERVICE'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-foreground text-sm">
                    {txn.customer_name}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">
                    {txn.details}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-extrabold text-foreground text-sm">
                    {txn.amount.toLocaleString()} DT
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`text-[10px] font-bold uppercase border ${statusColors[txn.status] || ''}`}>
                      {txn.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Affichage de {filteredTransactions.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredTransactions.length)} sur {filteredTransactions.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '...')[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                acc.push(p); return acc;
              }, [])
              .map((p, i) => p === '...'
                ? <span key={`e${i}`} className="px-2 text-muted-foreground text-xs">…</span>
                : <button key={p} onClick={() => setPage(p as number)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition ${page === p ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'}`}>
                    {p}
                  </button>
              )}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      <Dialog open={!!selectedTxn} onOpenChange={(open) => { if (!open) setSelectedTxn(null); }}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Mise à jour de la transaction</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedTxn?.reference} - {selectedTxn?.customer_name}
            </DialogDescription>
          </DialogHeader>

          {showSuccessAnimation ? (
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
          ) : isScannerOpen ? (
            <div className="space-y-4">
              <div className="bg-black rounded-lg overflow-hidden relative flex justify-center items-center h-[350px] w-full">
                {!navigator?.mediaDevices ? (
                  <div className="text-red-500 text-center p-4 text-sm font-bold">
                    Accès Caméra Bloqué.<br/>
                    Vous devez utiliser "localhost" ou "https://" pour que le navigateur autorise la caméra.
                  </div>
                ) : (
                  <Scanner 
                    onScan={onScan} 
                    onError={(error: any) => {
                      console.error("Scanner Error:", error);
                      const msg = error?.message || error?.name || String(error);
                      if (msg.includes('NotFound') || msg.includes('DevicesNotFoundError')) {
                        toast.error("Aucune caméra n'a été trouvée sur cet appareil.");
                      } else {
                        toast.error("Erreur Caméra: " + msg);
                      }
                    }}
                    components={{
                      finder: true,
                    }}
                  />
                )}
              </div>
              <Button variant="outline" className="w-full" onClick={() => setIsScannerOpen(false)}>
                Annuler le scan
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="bg-muted p-4 rounded-lg flex flex-col gap-2 border border-border">
                <p className="text-sm font-semibold text-foreground">Confirmer la prestation</p>
                <p className="text-xs text-muted-foreground">Demandez au client de vous montrer son code QR pour valider la prestation et garantir votre paiement.</p>
              </div>

              <Button 
                className="w-full font-bold" 
                onClick={() => setIsScannerOpen(true)}
                disabled={isUpdating}
              >
                Scanner le QR du Client
              </Button>

              <Button 
                variant="secondary"
                className="w-full font-bold border-primary/20 hover:bg-primary/10 transition-colors" 
                onClick={() => handleStatusUpdate('completed')}
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2 text-primary" />}
                Valider manuellement (Sans QR)
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground font-medium">Ou</span></div>
              </div>

              <div className="bg-red-500/10 p-4 rounded-lg flex flex-col gap-2 border border-red-500/20">
                <p className="text-sm font-semibold text-red-500">Déclarer un No-Show</p>
                <p className="text-xs text-red-400">Si le client ne s'est pas présenté, marquez la réservation comme échouée.</p>
                <Button 
                  variant="destructive" 
                  onClick={() => handleStatusUpdate('failed')}
                  disabled={isUpdating}
                  className="mt-2 font-bold"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Déclarer comme échouée
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}