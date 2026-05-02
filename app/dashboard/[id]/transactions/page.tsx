'use client';

import React from 'react';
import { getStoreTransactions, Transaction } from '@/lib/actions/transactions';
import { useParams } from 'next/navigation';
import { 
  Loader2, Search, Filter, ShieldCheck, CreditCard, 
  Calendar, ArrowRight, TrendingUp, Info, MoreVertical, 
  CheckCircle, XCircle, Clock, Download, ChevronLeft, ChevronRight,
  QrCode
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Scanner } from '@yudiel/react-qr-scanner';
import { updateBookingStatus } from '@/lib/actions/reservation';
import { updateOrderStatus } from '@/lib/actions/leads';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getUserOrders } from '@/lib/actions/orders';
import { getUserBookings } from '@/lib/actions/reservation';
import { createClient } from '@/lib/supabase/client';

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
  const [userOrders, setUserOrders] = React.useState<any[]>([]);
  const [userBookings, setUserBookings] = React.useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  const [selectedTxn, setSelectedTxn] = React.useState<Transaction | null>(null);
  const [selectedPersonalTxn, setSelectedPersonalTxn] = React.useState<any | null>(null);
  const [personalQrUrl, setPersonalQrUrl] = React.useState<string>('');
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
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      if (storeId) {
        const data = await getStoreTransactions(storeId);
        setTransactions(data);
      }
      
      if (user?.id) {
        const [orders, bookings] = await Promise.all([
          getUserOrders(user.id),
          getUserBookings(user.id)
        ]);
        setUserOrders(orders);
        setUserBookings(bookings);
      }
      
      setIsLoading(false);
    }
    fetchData();
  }, [storeId]);

  React.useEffect(() => {
    if (selectedPersonalTxn) {
      const ref = selectedPersonalTxn.order_number || selectedPersonalTxn.booking_number || selectedPersonalTxn.id;
      QRCode.toDataURL(ref, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      })
      .then(url => setPersonalQrUrl(url))
      .catch(err => console.error("QR Error", err));
    } else {
      setPersonalQrUrl('');
    }
  }, [selectedPersonalTxn]);

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

  const completedRevenue = filteredTransactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const pendingRevenue = filteredTransactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);
  const totalCommission = completedRevenue * 0.10;
  const hasActiveFilters = statusFilter || typeFilter || startDate || endDate || searchQuery;
  const clearFilters = () => {
    setStatusFilter(''); setTypeFilter(''); setStartDate(''); setEndDate('');
    setSearchQuery(''); setPage(1);
  };

  const personalTransactions = React.useMemo(() => {
    const combined = [
      ...userOrders.map(o => ({ ...o, tType: 'order' })),
      ...userBookings.map(b => ({ ...b, tType: 'booking' }))
    ];
    return combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [userOrders, userBookings]);

  const [activeView, setActiveView] = React.useState<'global' | 'purchases'>('global');

  if (isLoading) {
    return (
      <div className="p-8 text-foreground flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> 
        Chargement des transactions...
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Transactions & Suivi</h1>
            <p className="text-muted-foreground text-sm">Gérez vos paiements et vos actions directes</p>
            <div className="flex gap-2">
              <Button 
                variant={activeView === 'global' ? 'default' : 'outline'} 
                onClick={() => setActiveView('global')}
                className="rounded-xl font-bold"
              >
                Liste Détaillée
              </Button>
              <Button 
                variant={activeView === 'purchases' ? 'default' : 'outline'} 
                onClick={() => setActiveView('purchases')}
                className="rounded-xl font-bold"
              >
                Mes Transactions
              </Button>
            </div>
          </div>
        </div>

        {activeView === 'purchases' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {personalTransactions.length === 0 ? (
             <Card className="p-12 text-center flex flex-col items-center gap-4 border-dashed">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                   <CreditCard className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                   <h3 className="text-lg font-bold">Aucune transaction personnelle</h3>
                   <p className="text-muted-foreground text-sm">Vos transactions passées en tant que client apparaîtront ici.</p>
                </div>
                <Button variant="outline" className="rounded-xl" onClick={() => window.location.href = '/'}>
                  Explorer les produits
                </Button>
             </Card>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalTransactions.map((item) => (
                  <Card key={item.id} className="overflow-hidden group hover:ring-2 hover:ring-primary/20 transition-all">
                    <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] font-bold">
                            {item.tType === 'order' ? 'COMMANDE' : 'RÉSERVATION'}
                          </Badge>
                          <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                            {item.order_number || item.booking_number}
                          </span>
                       </div>
                       <Badge className={`text-[10px] uppercase font-bold ${statusColors[item.status.toLowerCase()] || ''}`}>
                         {item.status}
                       </Badge>
                    </div>
                    <div className="p-4 flex gap-4">
                       <div className="size-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                          <img 
                            src={item.items?.main_image || '/placeholder.png'} 
                            className="size-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          />
                       </div>
                       <div className="flex flex-col justify-center min-w-0">
                          <p className="font-bold text-sm truncate">{item.items?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.stores?.name}</p>
                          <p className="text-sm font-black mt-1 text-primary">{item.total_price || item.price || 0} DT</p>
                       </div>
                    </div>
                    <div className="p-4 bg-muted/10 border-t border-border flex items-center justify-between">
                       <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {format(new Date(item.created_at), 'dd MMMM yyyy', { locale: fr })}
                          </span>
                          {item.booking_date && (
                            <span className="text-[9px] text-primary font-bold">
                              Rendez-vous: {format(new Date(item.booking_date), 'dd/MM')} à {item.start_time}
                            </span>
                          )}
                       </div>
                       <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[10px] font-bold rounded-lg px-2 hover:bg-primary/10 hover:text-primary transition-colors"
                          onClick={() => setSelectedPersonalTxn(item)}
                        >
                          Détails {['PENDING', 'VALIDATED'].includes(item.status.toUpperCase()) && (
                            <> / QR <QrCode className="w-3 h-3 ml-1" /></>
                          )}
                       </Button>
                    </div>
                  </Card>
                ))}
             </div>
           )}
        </div>
        ) : null}

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Dernières Actions</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Transactions', value: filteredTransactions.length, sub: 'Au total', color: 'text-foreground' },
              { label: 'Revenu Réel', value: `${completedRevenue.toLocaleString()} DT`, sub: `${filteredTransactions.filter(t => t.status === 'completed').length} validées`, color: 'text-green-500' },
              { label: 'En attente', value: `${pendingRevenue.toLocaleString()} DT`, sub: `${filteredTransactions.filter(t => t.status === 'pending').length} à traiter`, color: 'text-yellow-500' },
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
        </div>
      </div>

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

      <Dialog open={!!selectedPersonalTxn} onOpenChange={(open) => { if (!open) setSelectedPersonalTxn(null); }}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Votre QR Code de validation</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Présentez ce code au commerçant pour valider votre {selectedPersonalTxn?.tType === 'order' ? 'commande' : 'réservation'}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-xl">
              {personalQrUrl ? (
                <img src={personalQrUrl} alt="Personal QR Code" className="w-64 h-64" />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-muted-foreground">
                  Génération du code...
                </div>
              )}
            </div>
            
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-foreground">
                {selectedPersonalTxn?.order_number || selectedPersonalTxn?.booking_number}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedPersonalTxn?.items?.name}
              </p>
            </div>

            <Badge className={`uppercase font-bold ${statusColors[selectedPersonalTxn?.status?.toLowerCase()] || ''}`}>
              Statut: {selectedPersonalTxn?.status}
            </Badge>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPersonalTxn(null)} className="w-full">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}