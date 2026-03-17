'use client';

import { useState } from 'react';
import {
  Star, MapPin, Phone, Globe, Mail, Shield, Edit2, Key,
  Lock, Camera, ExternalLink, MessageSquare, Flag, TrendingUp,
  Eye, Search, Calendar, Users, BarChart2, Clock, ChevronRight,
  CheckCircle, AlertTriangle, Wifi, X, Check, Plus, Minus,
  Building2, Tag, DollarSign, Image, Settings, Activity,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ─── Mock data ─────────────────────────────────────────────────────────────────
const owner = {
  name: 'Ahmed Ben Salah',
  role: 'Verified Business Owner',
  avatar: 'ABS',
  joinDate: 'January 2024',
  location: 'Djerba, Tunisia',
  email: 'ahmed.bensalah@bluelagoon.tn',
  phone: '+216 75 650 421',
  verified: true,
  twoFactor: true,
};

const business = {
  name: 'Blue Lagoon Restaurant',
  logo: '🌊',
  category: 'Seafood Restaurant',
  rating: 4.7,
  reviews: 128,
  status: 'active' as const,
  description: 'Premium seafood restaurant on the shores of Djerba. Fresh catch daily, traditional Tunisian recipes with a modern twist.',
  address: '12 Avenue Habib Bourguiba, Djerba Houmt Souk, 4180',
  phone: '+216 75 650 000',
  website: 'bluelagoon-djerba.tn',
  priceRange: '$$',
  services: ['Dine-in', 'Takeaway', 'Private Events', 'Catering'],
  openingHours: [
    { day: 'Mon–Thu', hours: '12:00 – 23:00' },
    { day: 'Fri–Sat', hours: '12:00 – 00:00' },
    { day: 'Sunday',  hours: 'Closed' },
  ],
  coords: { lat: '33.8749° N', lng: '10.8575° E' },
};

const metrics = [
  { icon: Eye,         label: 'Profile Views',        value: '1,245', change: '+18%', trend: 'up',   period: 'this month' },
  { icon: Search,      label: 'Search Appearances',   value: '3,892', change: '+24%', trend: 'up',   period: 'this month' },
  { icon: Calendar,    label: 'Reservation Requests', value: '87',    change: '+6%',  trend: 'up',   period: 'this month' },
  { icon: MessageSquare, label: 'Customer Messages',  value: '23',    change: '-3%',  trend: 'down', period: 'this month' },
  { icon: Star,        label: 'Reviews Received',     value: '14',    change: '+40%', trend: 'up',   period: 'this month' },
];

const chartData = [18, 32, 27, 45, 38, 52, 48, 61, 55, 72, 68, 84];
const bookingData = [4, 7, 5, 9, 6, 11, 8, 13, 10, 9, 12, 14];
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const reviews = [
  { id: '1', author: 'Leila M.', avatar: 'LM', rating: 5, date: '2 days ago', text: 'Exceptional seafood! The grilled fish was absolutely perfect and the view is breathtaking.', replied: false },
  { id: '2', author: 'Karim T.', avatar: 'KT', rating: 4, date: '1 week ago', text: 'Great ambiance and fresh ingredients. Service was a bit slow on Friday night but understandable.', replied: true },
  { id: '3', author: 'Sophie L.', avatar: 'SL', rating: 5, date: '2 weeks ago', text: 'Best restaurant in Djerba without a doubt. Will be back next summer!', replied: false },
  { id: '4', author: 'Youssef B.', avatar: 'YB', rating: 3, date: '3 weeks ago', text: 'Food was good but portions could be larger for the price. Nice location though.', replied: true },
];

const sentimentData = { excellent: 68, good: 20, neutral: 8, poor: 4 };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 40;
  const w = 100;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'fill-amber-500 text-amber-600' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  );
}

// ─── Tab system ───────────────────────────────────────────────────────────────
type Tab = 'overview' | 'analytics' | 'reputation' | 'business' | 'settings';

const tabs: { id: Tab; label: string; icon: typeof Eye }[] = [
  { id: 'overview',   label: 'Overview',    icon: Activity },
  { id: 'analytics',  label: 'Analytics',   icon: BarChart2 },
  { id: 'reputation', label: 'Reputation',  icon: Star },
  { id: 'business',   label: 'Business Info', icon: Building2 },
  { id: 'settings',   label: 'Settings',    icon: Settings },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BusinessOwnerProfile() {
  const [activeTab,    setActiveTab]    = useState<Tab>('overview');
  const [replyingTo,   setReplyingTo]   = useState<string | null>(null);
  const [replyText,    setReplyText]    = useState('');
  const [editingHours, setEditingHours] = useState(false);

  return (
    <div className="space-y-6 max-w-6xl mx-auto bg-gray-100 min-h-screen p-6" style={{
      colorScheme: 'light',
      ['--background' as string]: '0 0% 100%',
      ['--foreground' as string]: '222 47% 11%',
      ['--card' as string]: '0 0% 100%',
      ['--card-foreground' as string]: '222 47% 11%',
      ['--popover' as string]: '0 0% 100%',
      ['--popover-foreground' as string]: '222 47% 11%',
      ['--primary' as string]: '221 83% 53%',
      ['--primary-foreground' as string]: '0 0% 100%',
      ['--secondary' as string]: '210 40% 96%',
      ['--secondary-foreground' as string]: '222 47% 11%',
      ['--muted' as string]: '210 40% 94%',
      ['--muted-foreground' as string]: '215 16% 47%',
      ['--accent' as string]: '210 40% 94%',
      ['--accent-foreground' as string]: '222 47% 11%',
      ['--destructive' as string]: '0 84% 60%',
      ['--destructive-foreground' as string]: '0 0% 100%',
      ['--border' as string]: '214 32% 88%',
      ['--input' as string]: '214 32% 88%',
      ['--ring' as string]: '221 83% 53%',
    }}>

      {/* ═══════════════════════════════════════════════════════════════
          1. PROFILE HEADER
      ══════════════════════════════════════════════════════════════════ */}
      <Card className="overflow-hidden">
        {/* Cover gradient */}
        <div className="h-28 bg-gradient-to-r from-indigo-600/80 via-blue-500/60 to-cyan-500/40 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 to-transparent" />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 border-4 border-card shadow-xl flex items-center justify-center">
                  <span className="text-2xl font-black text-white">{owner.avatar}</span>
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Identity */}
              <div className="mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-foreground">{owner.name}</h1>
                  {owner.verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 border border-indigo-300">
                      <Shield className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{owner.role}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Member since {owner.joinDate}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {owner.location}</span>
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {owner.email}</span>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="gap-2">
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Key className="w-3.5 h-3.5" /> Password
              </Button>
              <Button size="sm" className="gap-2">
                <Settings className="w-3.5 h-3.5" /> Account Settings
              </Button>
            </div>
          </div>

          {/* Security status */}
          <div className="flex gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${owner.twoFactor ? 'bg-green-100 text-green-600 border-green-300' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
              {owner.twoFactor ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              2FA {owner.twoFactor ? 'Enabled' : 'Disabled'}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-600 border border-blue-300">
              <Wifi className="w-3 h-3" /> Last login: 2 hours ago
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
              <Phone className="w-3 h-3" /> {owner.phone}
            </span>
          </div>
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════
          2. BUSINESS SUMMARY CARD
      ══════════════════════════════════════════════════════════════════ */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Logo + info */}
          <div className="flex gap-4 flex-1">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-300 flex items-center justify-center text-3xl flex-shrink-0">
              {business.logo}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h2 className="text-base font-bold text-foreground">{business.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {business.category}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> {business.priceRange}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-600 border border-green-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Active
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <StarRow rating={Math.round(business.rating)} />
                <span className="text-sm font-bold text-foreground">{business.rating}</span>
                <span className="text-xs text-muted-foreground">({business.reviews} reviews)</span>
              </div>

              <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">{business.description}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col gap-2 sm:w-36">
            <Button size="sm" className="flex-1 gap-2 text-xs" variant="default">
              <ExternalLink className="w-3.5 h-3.5" /> View Page
            </Button>
            <Button size="sm" className="flex-1 gap-2 text-xs" variant="outline">
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </Button>
            <Button size="sm" className="flex-1 gap-2 text-xs" variant="outline">
              <Image className="w-3.5 h-3.5" /> Photos
            </Button>
          </div>
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════
          TABS
      ══════════════════════════════════════════════════════════════════ */}
      <div className="flex gap-1 border-b border-border overflow-x-auto pb-0 scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all -mb-px ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          TAB: OVERVIEW
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {metrics.map(({ icon: Icon, label, value, change, trend, period }) => (
              <Card key={label} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    trend === 'up'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}>{change}</span>
                </div>
                <p className="text-2xl font-black text-foreground">{value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{label}</p>
                <p className="text-[10px] text-muted-foreground/60">{period}</p>
              </Card>
            ))}
          </div>

          {/* Quick review snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-600" /> Latest Reviews
              </h3>
              <div className="space-y-3">
                {reviews.slice(0, 2).map(r => (
                  <div key={r.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-indigo-600">{r.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground">{r.author}</span>
                        <span className="text-[10px] text-muted-foreground">{r.date}</span>
                      </div>
                      <StarRow rating={r.rating} />
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab('reputation')}
                className="mt-3 text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
              >
                View all reviews <ChevronRight className="w-3 h-3" />
              </button>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" /> Business at a Glance
              </h3>
              <div className="space-y-2.5">
                {[
                  { icon: MapPin,    label: 'Address', value: business.address },
                  { icon: Phone,     label: 'Phone',   value: business.phone },
                  { icon: Globe,     label: 'Website', value: business.website },
                  { icon: Clock,     label: 'Today',   value: 'Open · 12:00 – 23:00' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-muted border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
                      <p className="text-xs text-foreground truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB: ANALYTICS
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Views chart */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Profile Views</h3>
                  <p className="text-xs text-muted-foreground">Last 12 months</p>
                </div>
                <span className="text-2xl font-black text-foreground">1,245</span>
              </div>
              {/* Bar chart */}
              <div className="flex items-end gap-1 h-24">
                {chartData.map((v, i) => {
                  const max = Math.max(...chartData);
                  const pct = (v / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-sm bg-indigo-400 hover:bg-indigo-500 transition-colors cursor-pointer"
                        style={{ height: `${pct}%` }}
                        title={`${months[i]}: ${v}`}
                      />
                      <span className="text-[8px] text-muted-foreground">{months[i].slice(0,1)}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Booking trends */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Booking Trends</h3>
                  <p className="text-xs text-muted-foreground">Reservation requests</p>
                </div>
                <span className="text-2xl font-black text-foreground">87</span>
              </div>
              <div className="flex items-end gap-1 h-24">
                {bookingData.map((v, i) => {
                  const max = Math.max(...bookingData);
                  const pct = (v / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-sm bg-emerald-400 hover:bg-emerald-500 transition-colors cursor-pointer"
                        style={{ height: `${pct}%` }}
                        title={`${months[i]}: ${v}`}
                      />
                      <span className="text-[8px] text-muted-foreground">{months[i].slice(0,1)}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Customer engagement */}
          <Card className="p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Customer Engagement
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Click-through Rate', value: '12.4%', sub: 'from search results',  color: 'text-indigo-600', bg: 'bg-indigo-100' },
                { label: 'Avg. Session Time',  value: '3m 42s', sub: 'on your profile',      color: 'text-blue-600',   bg: 'bg-blue-100' },
                { label: 'Return Visitors',    value: '68%',   sub: 'visited more than once', color: 'text-emerald-600', bg: 'bg-emerald-100' },
                { label: 'Photo Views',        value: '4,120', sub: 'total photo impressions', color: 'text-amber-600',  bg: 'bg-amber-100' },
              ].map(({ label, value, sub, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-4 border border-border`}>
                  <p className={`text-2xl font-black ${color}`}>{value}</p>
                  <p className="text-xs font-semibold text-foreground mt-1">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB: REPUTATION
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'reputation' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Rating summary */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Rating Summary</h3>
              <div className="text-center mb-4">
                <span className="text-5xl font-black text-foreground">{business.rating}</span>
                <span className="text-lg text-muted-foreground"> / 5</span>
                <div className="flex justify-center mt-2">
                  <StarRow rating={5} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{business.reviews} total reviews</p>
              </div>

              {/* Sentiment bars */}
              <div className="space-y-2">
                {[
                  { label: 'Excellent (5★)', pct: sentimentData.excellent, color: 'bg-green-500' },
                  { label: 'Good (4★)',       pct: sentimentData.good,      color: 'bg-emerald-400' },
                  { label: 'Neutral (3★)',    pct: sentimentData.neutral,   color: 'bg-yellow-400' },
                  { label: 'Poor (1-2★)',     pct: sentimentData.poor,      color: 'bg-red-400' },
                ].map(({ label, pct, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-24 flex-shrink-0">{label}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-foreground w-8 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Reviews list */}
            <div className="lg:col-span-2 space-y-3">
              {reviews.map(r => (
                <Card key={r.id} className="p-4">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-[11px] font-bold text-indigo-600">{r.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <span className="text-sm font-semibold text-foreground">{r.author}</span>
                          {r.replied && (
                            <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 border border-blue-300">Replied</span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{r.date}</span>
                      </div>
                      <StarRow rating={r.rating} />
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{r.text}</p>

                      {/* Reply actions */}
                      {replyingTo === r.id ? (
                        <div className="mt-3 space-y-2">
                          <textarea
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder="Write your reply…"
                            rows={2}
                            className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setReplyingTo(null); setReplyText(''); }}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                            >
                              <Check className="w-3 h-3" /> Send Reply
                            </button>
                            <button
                              onClick={() => { setReplyingTo(null); setReplyText(''); }}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <X className="w-3 h-3" /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 mt-2">
                          {!r.replied && (
                            <button
                              onClick={() => setReplyingTo(r.id)}
                              className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg bg-indigo-100 text-indigo-600 border border-indigo-300 hover:bg-indigo-500/20 font-semibold transition-colors"
                            >
                              <MessageSquare className="w-3 h-3" /> Reply
                            </button>
                          )}
                          <button className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg bg-red-100 text-red-600 border border-red-300 hover:bg-red-500/20 font-semibold transition-colors">
                            <Flag className="w-3 h-3" /> Report Fake
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB: BUSINESS INFO
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'business' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Left: editable fields */}
          <div className="space-y-4">
            <Card className="p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
                Business Details
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <Edit2 className="w-3 h-3" /> Edit
                </Button>
              </h3>

              {[
                { label: 'Business Name', value: business.name },
                { label: 'Category',      value: business.category },
                { label: 'Description',   value: business.description },
                { label: 'Address',       value: business.address },
                { label: 'Phone',         value: business.phone },
                { label: 'Website',       value: business.website },
                { label: 'Price Range',   value: business.priceRange },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-sm text-foreground">{value}</p>
                  <div className="mt-1.5 border-b border-border/40" />
                </div>
              ))}
            </Card>

            {/* Services */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">Services Offered</h3>
              <div className="flex gap-2 flex-wrap">
                {business.services.map(s => (
                  <span key={s} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    <Check className="w-3 h-3" /> {s}
                  </span>
                ))}
                <button className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border border-dashed hover:text-foreground transition-colors">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            </Card>
          </div>

          {/* Right: hours + map */}
          <div className="space-y-4">
            {/* Opening hours */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-600" /> Opening Hours</span>
                <button
                  onClick={() => setEditingHours(!editingHours)}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  {editingHours ? 'Save' : 'Edit'}
                </button>
              </h3>
              <div className="space-y-2">
                {business.openingHours.map(({ day, hours }) => (
                  <div key={day} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                    <span className="text-xs font-semibold text-foreground">{day}</span>
                    <span className={`text-xs ${hours === 'Closed' ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                      {hours}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Map location */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" /> Map Location
              </h3>

              {/* Fake map placeholder */}
              <div className="relative h-40 rounded-xl overflow-hidden bg-muted border border-border mb-3">
                {/* Simulated map grid */}
                <div className="absolute inset-0 opacity-20">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="absolute border-border" style={{
                      left: `${(i / 8) * 100}%`, top: 0, bottom: 0,
                      borderLeft: '1px solid currentColor', width: 0,
                    }} />
                  ))}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="absolute border-border" style={{
                      top: `${(i / 5) * 100}%`, left: 0, right: 0,
                      borderTop: '1px solid currentColor', height: 0,
                    }} />
                  ))}
                </div>
                {/* Roads */}
                <div className="absolute" style={{ top: '40%', left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.15)' }} />
                <div className="absolute" style={{ left: '55%', top: 0, bottom: 0, width: '3px', background: 'rgba(255,255,255,0.15)' }} />
                {/* Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-red-500" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2">
                  <button className="text-[10px] font-semibold px-2 py-1 bg-background border border-border rounded-md shadow text-foreground hover:bg-muted transition-colors flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Open in Maps
                  </button>
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Latitude',  value: business.coords.lat },
                  { label: 'Longitude', value: business.coords.lng },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted/50 rounded-lg px-3 py-2 border border-border/50">
                    <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
                    <p className="text-xs font-mono font-bold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB: SETTINGS
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">

            {/* Account security */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" /> Security
              </h3>
              <div className="space-y-3">
                {[
                  { icon: Key,    label: 'Change Password',        sub: 'Last changed 3 months ago',  action: 'Update', color: 'text-indigo-600' },
                  { icon: Shield, label: 'Two-Factor Auth',        sub: owner.twoFactor ? 'Enabled via SMS' : 'Not enabled', action: owner.twoFactor ? 'Manage' : 'Enable', color: 'text-green-600' },
                  { icon: Wifi,   label: 'Active Sessions',        sub: '2 devices logged in',         action: 'Review', color: 'text-blue-600' },
                ].map(({ icon: Icon, label, sub, action, color }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{sub}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">{action}</Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Notifications */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-600" /> Notifications
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'New review posted',    enabled: true },
                  { label: 'New reservation',      enabled: true },
                  { label: 'Customer message',     enabled: true },
                  { label: 'Weekly performance',   enabled: false },
                  { label: 'Promotional tips',     enabled: false },
                ].map(({ label, enabled }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{label}</span>
                    <button className={`w-10 h-5 rounded-full border-2 transition-all relative ${
                      enabled ? 'bg-primary border-primary' : 'bg-muted border-border'
                    }`}>
                      <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${
                        enabled ? 'left-5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            {/* Account actions */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4 text-muted-foreground" /> Account Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted border border-border text-sm font-semibold text-foreground transition-colors text-left">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="flex-1">Manage Team Members</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted border border-border text-sm font-semibold text-foreground transition-colors text-left">
                  <Image className="w-4 h-4 text-purple-600" />
                  <span className="flex-1">Media Library</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted border border-border text-sm font-semibold text-foreground transition-colors text-left">
                  <BarChart2 className="w-4 h-4 text-green-600" />
                  <span className="flex-1">Export Analytics</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <div className="pt-2 border-t border-border/50">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-300 text-sm font-semibold text-red-600 transition-colors text-left">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="flex-1">Deactivate Account</span>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}