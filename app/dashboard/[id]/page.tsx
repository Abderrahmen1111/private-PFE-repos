'use client';

import React, { useEffect, useState } from 'react';
import '@/app/globals.css';
import { TrendingUp, Eye, Phone, MapPin, ShoppingCart, DollarSign, CreditCard, ShieldAlert, Clock } from 'lucide-react';
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
import { useParams } from 'next/navigation';
import { getDashboardOverview } from '@/lib/actions/overviews';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AccountSection from '@/components/dashboard/AccountSection';
import { isStoreDashboardLocked } from '@/lib/dashboard/store-access';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

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

export default function DashboardPage() {
  const params = useParams();
  const storeId = Number(params.id);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      if (storeId) {
        const stats = await getDashboardOverview(storeId);
        setData(stats);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [storeId, period]);

  if (isLoading) return <div className="p-8 text-white font-bold animate-pulse text-center">Chargement des statistiques...</div>;
  if (!data) return null;

  if (isStoreDashboardLocked(data.status)) {
    const isPending = (data.status || '').toUpperCase() === 'PENDING';
    return (
      <div className="space-y-6 p-4 md:p-8 flex-1 min-h-[60vh] flex flex-col justify-center" style={{ background: 'linear-gradient(135deg, #0f1729 0%, #1a1f3a 100%)' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'max-w-2xl mx-auto rounded-2xl border p-6 md:p-8 shadow-xl backdrop-blur-sm',
            isPending
              ? 'bg-amber-500/10 border-amber-500/25 text-amber-100'
              : 'bg-rose-500/10 border-rose-500/25 text-rose-100'
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn('p-3 rounded-xl shrink-0', isPending ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400')}>
              {isPending ? <Clock className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white mb-2">
                {isPending ? 'Validation en cours' : 'Établissement non approuvé'}
              </h1>
              <p className="text-sm leading-relaxed text-white/80 mb-4">
                {isPending ? (
                  <>
                    Votre boutique est en attente de validation (RNE / conformité). Le tableau de bord complet et toutes les sections
                    (produits, commandes, messages, etc.) restent désactivés jusqu&apos;à l&apos;approbation de votre dossier.
                  </>
                ) : (
                  <>
                    Votre demande n&apos;a pas été approuvée. Les outils du tableau de bord ne sont pas accessibles pour cette boutique.
                    Pour toute question, contactez le support Ro2ya depuis la page d&apos;accueil ou votre espace compte.
                  </>
                )}
              </p>
              <p className="text-xs text-white/50">
                Vous pouvez toujours revenir au marché ou changer d&apos;établissement depuis le menu en haut si vous en gérez plusieurs.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8 flex-1" style={{ background: 'linear-gradient(135deg, #0f1729 0%, #1a1f3a 100%)' }}>
      {/* Verification Warning Banner */}
      {data.status === 'PENDING' && (
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
      )}

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
          value={data.profileViews}
          icon={<Eye className="w-8 h-8" />}
          color="blue"
        />
        <StatCard
          label="Phone Clicks"
          value={data.phoneClicks}
          icon={<Phone className="w-8 h-8" />}
          color="green"
        />
        <StatCard
          label="Direction Requests"
          value={data.directionClicks}
          icon={<MapPin className="w-8 h-8" />}
          color="purple"
        />
        <StatCard
          label="Reservations"
          value={data.reservations}
          icon={<ShoppingCart className="w-8 h-8" />}
          color="orange"
        />
        <StatCard
          label="Purchases"
          value={data.purchases}
          icon={<DollarSign className="w-8 h-8" />}
          color="green"
        />
        <StatCard
          label="Revenu Total"
          value={data.totalRevenue || 0}
          icon={<DollarSign className="w-8 h-8" />}
          trend={12}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <LineChart data={data.weeklyStats || []}>
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
                    dataKey="actions"
                    stroke="#ec4899"
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#ec4899', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="Activités (Commandes/Résas)"
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#d946ef"
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#d946ef', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="Vues Profil"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

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
                <BarChart data={data.ratingData} layout="vertical">
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

      {/* Recent Activity List */}
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
              {data.recentActions.length === 0 ? (
                <p className="text-white/50 text-sm">Aucune activité récente.</p>
              ) : (
                data.recentActions.map((action: any, idx: number) => (
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
                          {action.type}
                        </p>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <p className="text-[10px] text-white/40 uppercase font-black">Nouveau</p>
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed">{action.details}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-xs font-medium text-white/30 whitespace-nowrap">
                        {Math.max(0, Math.round((Date.now() - new Date(action.timestamp).getTime()) / 1000 / 60))} min ago
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* FULL ACCOUNT & SUBSCRIPTION SECTION (The "Mix") */}
      <AccountSection 
        store={data.store} 
        user={data.user} 
        subscription={data.subscription} 
        storeId={storeId} 
      />
    </div>
  );
}
