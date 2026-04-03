'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Search, Plus, MessageSquare, Phone, User, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createSupportTicket } from '@/lib/actions/support';
import { toast } from 'sonner';

import { getStoreTickets, SupportTicket } from '@/lib/actions/support';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const priorityColors: Record<string, string> = {
  low: 'bg-primary/10 text-primary border-primary/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const statusColors: Record<string, string> = {
  open: 'bg-green-500/10 text-green-500 border-green-500/20',
  in_progress: 'bg-primary/10 text-primary border-primary/20',
  waiting_customer: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  resolved: 'bg-muted text-muted-foreground border-border/50',
  closed: 'bg-muted text-muted-foreground border-border/50',
};

const statusLabels: Record<string, string> = {
  open: 'Ouvert',
  in_progress: 'En cours',
  waiting_customer: 'En attente client',
  resolved: 'Résolu',
  closed: 'Fermé',
};

export default function TicketsPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = Number(params.id);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  // New Ticket State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'medium' as any });

  useEffect(() => {
    async function loadTickets() {
      setIsLoading(true);
      if (storeId) {
        const data = await getStoreTickets(storeId);
        setTickets(data);
      }
      setIsLoading(false);
    }
    loadTickets();
  }, [storeId]);

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.description) {
      toast.error("Veuillez remplir le sujet et la description.");
      return;
    }
    setIsCreating(true);
    const result = await createSupportTicket({
      storeId,
      ...newTicket
    });
    if (result.success && result.data) {
      toast.success("Ticket créé avec succès ! Nous reviendrons vers vous rapidement.");
      setTickets(prev => [result.data as SupportTicket, ...prev]);
      setIsDialogOpen(false);
      setNewTicket({ subject: '', description: '', priority: 'medium' });
    } else {
      toast.error("Erreur lors de la création du ticket.");
    }
    setIsCreating(false);
  };

  const filteredTickets = tickets.filter(ticket => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchLower) || 
      ticket.subject.toLowerCase().includes(searchLower) ||
      (ticket.customer_name?.toLowerCase() || '').includes(searchLower) ||
      (ticket.customer_phone?.toLowerCase() || '').includes(searchLower);
      
    const matchesPriority = !priorityFilter || ticket.priority === priorityFilter;
    const matchesStatus = !statusFilter || ticket.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const openTicketsCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

  if (isLoading) return <div className="p-8 text-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Chargement des tickets...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground">Manage customer support requests for Ro2ya</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ouvrir un ticket de support</DialogTitle>
              <DialogDescription>
                Décrivez votre problème ou votre question. L'équipe Ro2ya vous répondra dans les plus brefs délais.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Sujet</Label>
                <Input 
                  id="subject" 
                  value={newTicket.subject}
                  onChange={e => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="ex: Problème de paiement" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priorité</Label>
                <select
                  id="priority"
                  value={newTicket.priority}
                  onChange={e => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full p-2 rounded-md border border-input bg-background"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="critical">Critique</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description détaillée</Label>
                <Textarea 
                  id="description" 
                  value={newTicket.description}
                  onChange={e => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Expliquez-nous tout..." 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleCreateTicket} disabled={isCreating}>
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Envoyer le ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="text-sm text-muted-foreground font-medium">Tickets Ouverts</div>
          <div className="text-2xl font-bold text-destructive mt-1">{openTicketsCount}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">En attente d'action</div>
        </Card>
        <Card className="p-4 border border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="text-sm text-muted-foreground font-medium">En Cours</div>
          <div className="text-2xl font-bold text-primary mt-1">{inProgressCount}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Équipe active</div>
        </Card>
        <Card className="p-4 border border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="text-sm text-muted-foreground font-medium">Résolus</div>
          <div className="text-2xl font-bold text-green-500 mt-1">{resolvedCount}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Problèmes réglés</div>
        </Card>
        <Card className="p-4 border border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="text-sm text-muted-foreground font-medium">Efficacité</div>
          <div className="text-2xl font-bold text-foreground mt-1">98%</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Satisfaction client</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 border border-border/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par ID, sujet, client ou téléphone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || undefined)}
            className="px-3 py-2 rounded-lg border border-border text-sm bg-background text-foreground"
          >
            <option value="">Tous les statuts</option>
            <option value="open">Ouvert</option>
            <option value="in_progress">En cours</option>
            <option value="waiting_customer">Attente Client</option>
            <option value="resolved">Résolu</option>
            <option value="closed">Fermé</option>
          </select>
          <select
            value={priorityFilter || ''}
            onChange={(e) => setPriorityFilter(e.target.value || undefined)}
            className="px-3 py-2 rounded-lg border border-border text-sm bg-background text-foreground"
          >
            <option value="">Toutes les priorités</option>
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
            <option value="critical">Critique</option>
          </select>
        </div>
      </Card>

      {/* Tickets Table */}
      <Card className="overflow-hidden border border-border/50 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Ticket ID</th>
                <th className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Customer Contact</th>
                <th className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Subject</th>
                <th className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Priority</th>
                <th className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Last Update</th>
                <th className="px-6 py-4 text-right font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Aucun ticket trouvé.
                  </td>
                </tr>
              ) : filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-primary/[0.02] transition-colors cursor-pointer group"
                  onClick={() => router.push(`/dashboard/${storeId}/support/chat?ticket=${ticket.id}`)}
                >
                  <td className="px-6 py-4 font-mono text-[10px] font-bold text-primary">#{ticket.id.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="font-bold text-foreground">{ticket.customer_name || 'Client Inconnu'}</span>
                      </div>
                      {ticket.customer_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-medium">{ticket.customer_phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-sm group-hover:text-primary transition-colors">{ticket.subject}</p>
                    <p className="text-[10px] text-muted-foreground uppercase mt-0.5 tracking-tighter">Support Canal: Chat</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={`text-[10px] font-black uppercase ring-1 shadow-sm ${priorityColors[ticket.priority]}`}>
                      {ticket.priority}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={`text-[10px] font-black uppercase ring-1 shadow-sm ${statusColors[ticket.status]}`}>
                      {statusLabels[ticket.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground font-medium">
                    {format(new Date(ticket.created_at), 'dd MMM yyyy', { locale: fr })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="bg-primary/10 p-2 rounded-full inline-flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <MessageSquare className="w-4 h-4" />
                    </div>
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
