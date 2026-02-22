'use client';

import React, { useState, useMemo } from 'react';
import { CustomerAction, ActionType } from '@/types';
import { mockActions } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Phone,
  MapPin,
  ShoppingCart,
  Calendar,
  MessageSquare,
  TrendingUp,
  Filter,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface ActionStats {
  type: ActionType;
  count: number;
  icon: React.ReactNode;
  label: string;
  color: string;
}

const actionIcons: Record<ActionType, React.ReactNode> = {
  phone_click: <Phone className="w-5 h-5" />,
  direction_click: <MapPin className="w-5 h-5" />,
  reservation: <Calendar className="w-5 h-5" />,
  purchase: <ShoppingCart className="w-5 h-5" />,
  contact: <MessageSquare className="w-5 h-5" />,
};

const actionLabels: Record<ActionType, string> = {
  phone_click: 'Phone Inquiry',
  direction_click: 'Direction Request',
  reservation: 'Reservation',
  purchase: 'Purchase',
  contact: 'Contact Form',
};

const actionColors: Record<ActionType, string> = {
  phone_click: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  direction_click: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
  reservation: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
  purchase: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
  contact: 'bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400',
};

export default function LeadsPage() {
  const [actions, setActions] = useState<CustomerAction[]>(mockActions);
  const [filterType, setFilterType] = useState<ActionType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');

  // Calculate statistics
  const stats = useMemo<ActionStats[]>(() => {
    const typeMap: Record<ActionType, number> = {
      phone_click: 0,
      direction_click: 0,
      reservation: 0,
      purchase: 0,
      contact: 0,
    };

    actions.forEach((action) => {
      typeMap[action.type]++;
    });

    return [
      {
        type: 'phone_click',
        count: typeMap.phone_click,
        icon: actionIcons.phone_click,
        label: 'Phone Inquiries',
        color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
      },
      {
        type: 'direction_click',
        count: typeMap.direction_click,
        icon: actionIcons.direction_click,
        label: 'Direction Requests',
        color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
      },
      {
        type: 'reservation',
        count: typeMap.reservation,
        icon: actionIcons.reservation,
        label: 'Reservations',
        color: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
      },
      {
        type: 'purchase',
        count: typeMap.purchase,
        icon: actionIcons.purchase,
        label: 'Purchases',
        color: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
      },
      {
        type: 'contact',
        count: typeMap.contact,
        icon: actionIcons.contact,
        label: 'Contact Forms',
        color: 'bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400',
      },
    ];
  }, [actions]);

  // Filter and sort actions
  const filteredActions = useMemo(() => {
    let filtered = actions;

    if (filterType !== 'all') {
      filtered = filtered.filter((a) => a.type === filterType);
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        return b.timestamp.getTime() - a.timestamp.getTime();
      } else {
        return a.timestamp.getTime() - b.timestamp.getTime();
      }
    });
  }, [actions, filterType, sortBy]);

  const totalActions = actions.length;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Customer Actions & Leads</h1>
        <p className="text-muted-foreground">
          Track customer interactions and engagement with your business
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.type}
            className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setFilterType(stat.type === filterType ? 'all' : stat.type)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.count}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total Actions Summary */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Total Interactions</p>
            <p className="text-4xl font-bold text-foreground">{totalActions}</p>
          </div>
          <TrendingUp className="w-12 h-12 text-primary opacity-20" />
        </CardContent>
      </Card>

      {/* Filters and Sort */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2 items-center w-full md:w-auto">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <Select value={filterType} onValueChange={(val) => setFilterType(val as any)}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="phone_click">Phone Inquiries</SelectItem>
              <SelectItem value="direction_click">Direction Requests</SelectItem>
              <SelectItem value="reservation">Reservations</SelectItem>
              <SelectItem value="purchase">Purchases</SelectItem>
              <SelectItem value="contact">Contact Forms</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant={sortBy === 'recent' ? 'default' : 'outline'}
            onClick={() => setSortBy('recent')}
          >
            Most Recent
          </Button>
          <Button
            variant={sortBy === 'oldest' ? 'default' : 'outline'}
            onClick={() => setSortBy('oldest')}
          >
            Oldest First
          </Button>
        </div>
      </div>

      {/* Actions List */}
      <div className="space-y-3">
        {filteredActions.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No customer actions yet</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredActions.map((action) => (
            <Card key={action.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg shrink-0 ${actionColors[action.type]}`}>
                    {actionIcons[action.type]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-foreground">{actionLabels[action.type]}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{action.details}</p>
                      </div>

                      {/* Timestamp */}
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {action.timestamp.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {action.timestamp.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
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

      {/* Pagination Info */}
      {filteredActions.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredActions.length} of {totalActions} interactions
        </div>
      )}
    </div>
  );
}
