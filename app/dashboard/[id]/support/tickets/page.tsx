'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Search, Plus, MessageSquare, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mockTickets = Array.from({ length: 25 }, (_, i) => ({
  id: `TKT-${String(i + 1).padStart(6, '0')}`,
  customerId: `cust-${Math.floor(i / 3) + 1}`,
  customerName: `Customer ${Math.floor(i / 3) + 1}`,
  subject: [
    'Order not received',
    'Product damaged',
    'Wrong item shipped',
    'Refund status',
    'Payment issue',
  ][i % 5],
  priority: ['low', 'medium', 'high', 'critical'][i % 4] as any,
  status: ['open', 'in_progress', 'waiting_customer', 'resolved'][i % 4] as any,
  channel: ['email', 'chat', 'phone', 'social'][i % 4] as any,
  assignedTo: i % 2 === 0 ? `Agent ${Math.floor(i / 2) + 1}` : 'Unassigned',
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  lastReply: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
  messages: Math.floor(Math.random() * 10) + 1,
}));

const priorityColors = {
  low: 'bg-primary/20 text-primary border-primary/40',
  medium: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40',
  high: 'bg-orange-500/20 text-orange-500 border-orange-500/40',
  critical: 'bg-red-500/20 text-red-500 border-red-500/40',
};

const statusColors = {
  open: 'bg-green-500/20 text-green-500 border-green-500/40',
  in_progress: 'bg-primary/20 text-primary border-primary/40',
  waiting_customer: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40',
  resolved: 'bg-muted text-muted-foreground border-border/50',
};

export default function TicketsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = ticket.id.includes(searchQuery) || ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = !priorityFilter || ticket.priority === priorityFilter;
    const matchesStatus = !statusFilter || ticket.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const openTickets = filteredTickets.filter(t => t.status === 'open').length;
  const avgResponseTime = 2.5;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground">Manage customer support requests</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Open Tickets</div>
          <div className="text-2xl font-bold text-destructive">{openTickets}</div>
          <div className="text-xs text-muted-foreground mt-1">Pending response</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">In Progress</div>
          <div className="text-2xl font-bold text-primary">
            {filteredTickets.filter(t => t.status === 'in_progress').length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Being handled</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Resolved</div>
          <div className="text-2xl font-bold text-green-500">
            {filteredTickets.filter(t => t.status === 'resolved').length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">This month</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Avg Response Time</div>
          <div className="text-2xl font-bold text-foreground">{avgResponseTime}h</div>
          <div className="text-xs text-muted-foreground mt-1">To first reply</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by ticket ID or customer..."
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
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_customer">Waiting Customer</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={priorityFilter || ''}
            onChange={(e) => setPriorityFilter(e.target.value || undefined)}
            className="px-3 py-2 rounded-lg border border-border text-sm bg-background text-foreground"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </Card>

      {/* Tickets Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Ticket ID</th>
                <th className="px-6 py-3 text-left font-semibold">Customer</th>
                <th className="px-6 py-3 text-left font-semibold">Subject</th>
                <th className="px-6 py-3 text-left font-semibold">Channel</th>
                <th className="px-6 py-3 text-left font-semibold">Priority</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Assigned To</th>
                <th className="px-6 py-3 text-left font-semibold">Messages</th>
                <th className="px-6 py-3 text-left font-semibold">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/${id}/support/chat?ticket=${ticket.id}`)}
                >
                  <td className="px-6 py-4 font-mono text-sm font-medium">{ticket.id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-sm">{ticket.customerName}</p>
                      <p className="text-xs text-muted-foreground">{ticket.customerId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-sm truncate">{ticket.subject}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm capitalize">{ticket.channel}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                      {ticket.priority}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm">{ticket.assignedTo}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{ticket.messages}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {ticket.lastReply.toLocaleDateString()}
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
