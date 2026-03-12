'use client';

import { useState } from 'react';
import { Search, Download, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mockRefunds = Array.from({ length: 20 }, (_, i) => ({
  id: `ref-${String(i + 1).padStart(6, '0')}`,
  orderId: `ORD-${String(i + 1).padStart(6, '0')}`,
  customerId: `cust-${Math.floor(i / 2) + 1}`,
  customerName: `Customer ${Math.floor(i / 2) + 1}`,
  originalAmount: Math.floor(Math.random() * 5000) + 100,
  refundAmount: Math.floor(Math.random() * 4000) + 50,
  reason: ['damaged', 'wrong_item', 'not_received', 'quality_issue'][i % 4] as any,
  status: ['pending', 'approved', 'processed', 'rejected'][i % 4] as any,
  requestedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  processedAt: i % 2 === 0 ? new Date() : null,
}));

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40',
  approved: 'bg-primary/20 text-primary border-primary/40',
  processed: 'bg-green-500/20 text-green-500 border-green-500/40',
  rejected: 'bg-destructive/20 text-destructive border-destructive/40',
};

export default function RefundsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const filteredRefunds = mockRefunds.filter(ref => {
    const matchesSearch = ref.id.includes(searchQuery) || ref.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || ref.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRefunds = filteredRefunds.filter(r => r.status === 'processed').reduce((sum, r) => sum + r.refundAmount, 0);
  const pendingRefunds = filteredRefunds.filter(r => r.status === 'pending' || r.status === 'approved');

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
          <div className="text-sm text-muted-foreground">Total Refunds</div>
          <div className="text-2xl font-bold text-foreground">${(totalRefunds / 1000).toFixed(1)}K</div>
          <div className="text-xs text-muted-foreground mt-1">Processed</div>
        </Card>
        <Card className="p-4 border border-border">
          <div className="text-sm text-muted-foreground">Pending Approval</div>
          <div className="text-2xl font-bold text-yellow-500">{mockRefunds.filter(r => r.status === 'pending').length}</div>
          <div className="text-xs text-muted-foreground mt-1">Awaiting review</div>
        </Card>
        <Card className="p-4 border border-border">
          <div className="text-sm text-muted-foreground">Average Refund</div>
          <div className="text-2xl font-bold text-foreground">
            ${(filteredRefunds.filter(r => r.status === 'processed').reduce((sum, r) => sum + r.refundAmount, 0) / Math.max(filteredRefunds.filter(r => r.status === 'processed').length, 1)).toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Per refund</div>
        </Card>
        <Card className="p-4 border border-border">
          <div className="text-sm text-muted-foreground">Rejection Rate</div>
          <div className="text-2xl font-bold text-destructive">
            {mockRefunds.length > 0 ? ((mockRefunds.filter(r => r.status === 'rejected').length / mockRefunds.length) * 100).toFixed(1) : '0'}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">This month</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by refund ID or customer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || undefined)}
            className="px-3 py-2 rounded-lg border border-border text-sm bg-background text-foreground hover:bg-muted transition-colors"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="processed">Processed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </Card>

      {/* Refunds Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Refund ID</th>
                <th className="px-6 py-3 text-left font-semibold">Order ID</th>
                <th className="px-6 py-3 text-left font-semibold">Customer</th>
                <th className="px-6 py-3 text-left font-semibold">Reason</th>
                <th className="px-6 py-3 text-right font-semibold">Original</th>
                <th className="px-6 py-3 text-right font-semibold">Refund Amount</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRefunds.map((refund) => (
                <tr key={refund.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-medium">{refund.id}</td>
                  <td className="px-6 py-4 text-sm">{refund.orderId}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-sm">{refund.customerName}</p>
                      <p className="text-xs text-muted-foreground">{refund.customerId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm capitalize">{refund.reason.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">${refund.originalAmount}</td>
                  <td className="px-6 py-4 text-right font-semibold text-green-500">${refund.refundAmount}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={statusColors[refund.status as keyof typeof statusColors]}>
                      {refund.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {refund.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 flex gap-1 text-white">
                          <CheckCircle className="w-3 h-3" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-400 flex gap-1">
                          <XCircle className="w-3 h-3" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {refund.status === 'approved' && (
                      <Button size="sm">Process</Button>
                    )}
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
