'use client';

import React, { useEffect, useState, useMemo } from 'react';
import '@/app/globals.css';
import { TrendingUp, Eye, Phone, MapPin, ShoppingCart, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { mockAnalytics, mockActions } from '@/lib/mock-data';
import { AnalyticsSnapshot } from '@/types';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

import { motion } from 'framer-motion';

function StatCard({ label, value, icon, trend, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30 glow-blue',
    green: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30 glow-green',
    purple: 'from-violet-500/20 to-fuchsia-500/20 text-violet-400 border-violet-500/30 glow-purple',
    orange: 'from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30 glow-pink',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        className="relative overflow-hidden border-0 shadow-2xl transition-all duration-500 bg-white/5 backdrop-blur-2xl ring-1 ring-white/10 group"
      >
        {/* Animated background glow */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${colorClasses[color].split(' ').slice(0, 2).join(' ')} blur-3xl -z-10`} />

        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-1">{label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-extrabold text-white tracking-tight">{value.toLocaleString()}</p>
                {trend && (
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                    {Math.abs(trend)}%
                  </div>
                )}
              </div>
            </div>
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorClasses[color].split(' ').slice(0, 2).join(' ')} shadow-lg backdrop-blur-md`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Weekly trend data
const weeklyData = [
  { day: 'Mon', views: 240, clicks: 28, actions: 15 },
  { day: 'Tue', views: 320, clicks: 32, actions: 18 },
  { day: 'Wed', views: 290, clicks: 35, actions: 22 },
  { day: 'Thu', views: 380, clicks: 42, actions: 28 },
  { day: 'Fri', views: 450, clicks: 55, actions: 32 },
  { day: 'Sat', views: 520, clicks: 68, actions: 35 },
  { day: 'Sun', views: 280, clicks: 28, actions: 17 },
];

// Rating distribution data
const ratingData = [
  { rating: '5 stars', count: 72 },
  { rating: '4 stars', count: 38 },
  { rating: '3 stars', count: 12 },
  { rating: '2 stars', count: 4 },
  { rating: '1 star', count: 1 },
];

export default function DashboardPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

  const currentStats = useMemo(() => {
    return mockAnalytics.find((a) => a.period === period);
  }, [period]);

  if (!currentStats) return null;

  const totalActions = currentStats.phoneClicks + currentStats.directionClicks + currentStats.reservations + currentStats.purchases;

  return (
    <div className="space-y-6 p-4 md:p-8 flex-1" style={{ background: 'linear-gradient(135deg, #0f1729 0%, #1a1f3a 100%)' }}>
      {/* Verification Warning Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-4 shadow-lg shadow-amber-500/5 backdrop-blur-sm animate-in fade-in slide-in-from-top duration-500">
        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
          <TrendingUp className="w-5 h-5 rotate-90" />
        </div>
        <div>
          <h3 className="text-amber-500 font-semibold flex items-center gap-2">
            Vérification RNE en attente
          </h3>
          <p className="text-amber-500/80 text-sm mt-1">
            Votre établissement est en attente de validation du Registre National des Entreprises (RNE). Certaines fonctionnalités pourront être limitées jusqu'à la confirmation de vos informations.
          </p>
        </div>
      </div>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-black mb-2 text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/50 tracking-tight">
            Dashboard
          </h1>
          <p className="text-white/40 font-medium">Welcome back! Here's your business performance overview.</p>
        </div>
      </motion.div>

      {/* Period Selector */}
      <div className="flex gap-2">
        <Tabs value={period} onValueChange={(val) => setPeriod(val as any)}>
          <TabsList className="grid w-fit grid-cols-3">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          label="Profile Views"
          value={currentStats.profileViews}
          icon={<Eye className="w-8 h-8" />}
          trend={12}
          color="blue"
        />
        <StatCard
          label="Phone Clicks"
          value={currentStats.phoneClicks}
          icon={<Phone className="w-8 h-8" />}
          trend={8}
          color="green"
        />
        <StatCard
          label="Direction Requests"
          value={currentStats.directionClicks}
          icon={<MapPin className="w-8 h-8" />}
          trend={-3}
          color="purple"
        />
        <StatCard
          label="Reservations"
          value={currentStats.reservations}
          icon={<ShoppingCart className="w-8 h-8" />}
          trend={15}
          color="orange"
        />
        <StatCard
          label="Purchases"
          value={currentStats.purchases}
          icon={<DollarSign className="w-8 h-8" />}
          trend={22}
          color="green"
        />
        <StatCard
          label="Total Actions"
          value={totalActions}
          icon={<TrendingUp className="w-8 h-8" />}
          trend={11}
          color="blue"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Trend */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-2xl ring-1 ring-white/10 h-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <div className="w-1 h-6 bg-cyan-500 rounded-full" />
                Activity Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={weeklyData}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="rgba(255,255,255,0.3)"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 500 }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 500 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 41, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#d946ef"
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#d946ef', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="Views"
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#a855f7"
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#a855f7', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="Clicks"
                  />
                  <Line
                    type="monotone"
                    dataKey="actions"
                    stroke="#ec4899"
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#ec4899', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="Actions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rating Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-2xl ring-1 ring-white/10 h-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-500 rounded-full" />
                Rating Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={ratingData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis dataKey="rating" type="category" stroke="rgba(255,255,255,0.3)" width={80} axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 41, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[0, 4, 4, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#d946ef" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-2xl ring-1 ring-white/10">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <div className="w-1 h-6 bg-pink-500 rounded-full" />
              Recent Customer Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActions.slice(0, 5).map((action, idx) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="group flex items-start justify-between p-4 rounded-xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-white capitalize tracking-wide">
                        {action.type.replace('_', ' ')}
                      </p>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <p className="text-[10px] text-white/40 uppercase font-black">Verified</p>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed">{action.details}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-xs font-medium text-white/30 whitespace-nowrap">
                      {Math.round((Date.now() - action.timestamp.getTime()) / 1000 / 60)} min ago
                    </p>
                    <div className="w-8 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="w-1/2 h-full bg-pink-500/50" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
