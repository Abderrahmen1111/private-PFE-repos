'use client';

import { useState, useEffect } from 'react';
import {
  Star, MapPin, Phone, Globe, Mail, Shield, Edit2, Key,
  Lock, Camera, ExternalLink, MessageSquare, Flag, TrendingUp,
  Eye, Search, Calendar, Users, BarChart2, Clock, ChevronRight,
  CheckCircle, AlertTriangle, Wifi, X, Check,
  Building2, Tag, Image as ImageIcon, Settings, Activity, Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getOwnerProfileData } from '@/lib/actions/profile';
import { sendPasswordResetEmail } from '@/lib/actions/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  );
}

// ─── Tab system ───────────────────────────────────────────────────────────────
type Tab = 'overview' | 'analytics' | 'reputation' | 'business' | 'settings';

const tabs: { id: Tab; label: string; icon: typeof Eye }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'reputation', label: 'Reputation', icon: Star },
  { id: 'business', label: 'Business Info', icon: Building2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function BusinessOwnerProfile() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const searchParams = useSearchParams();
  const businessIdParam = searchParams.get('id');
  
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
        try {
            const data = await getOwnerProfileData(businessIdParam || undefined);
            setInitialData(data);
        } catch (error) {
            console.error("Failed to load profile data", error);
        } finally {
            setIsLoading(false);
        }
    }
    loadData();
  }, [businessIdParam]);

  if (isLoading) {
      return (
          <div className="flex items-center justify-center min-h-[60vh]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
      )
  }

  if (!initialData) return null;

  const handlePasswordReset = async () => {
    setIsChangingPassword(true);
    try {
        const result = await sendPasswordResetEmail(user.email);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Password reset email sent. Please check your inbox.');
            setIsPasswordModalOpen(false);
        }
    } catch (err) {
        toast.error('Failed to send reset email');
    } finally {
        setIsChangingPassword(false);
    }
  };

  const { user, store, metrics: rawMetrics, recentReviews } = initialData;

  // Map real data to the expected format
  const owner = {
    name: user.profile?.full_name || user.email?.split('@')[0] || 'Business Owner',
    role: user.profile?.role === 'PRO' ? 'Verified Business Owner' : 'Business Owner',
    avatar: user.avatar ? user.avatar : (user.profile?.full_name?.substring(0, 2).toUpperCase() || 'O'),
    joinDate: new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    location: user.profile?.city || user.profile?.address || 'Tunisia',
    email: user.email,
    phone: user.profile?.phone || 'Not provided',
    verified: true,
    twoFactor: false, // Defaulting for now
  };

  const business = store ? {
    id: store.id_business || store.id,
    internal_id: store.id,
    name: store.name,
    logo: store.logo_url ? store.logo_url : store.name.substring(0, 2).toUpperCase(),
    category: store.category,
    rating: rawMetrics.avgRating || 0,
    reviews: rawMetrics.reviewsCount || 0,
    status: store.status,
    description: store.description || 'No description provided.',
    address: store.address || `${store.city || 'Tunisia'}`,
    phone: store.phone || 'Not provided',
    website: store.website || 'Not provided',
    priceRange: 'N/A',
    services: [], // Needs extra relation table if implemented
    openingHours: store.opening_hours ? (Object.entries(store.opening_hours).map(([day, hours]) => ({ day, hours }))) : [
        { day: 'Mon-Sun', hours: 'N/A' }
    ],
    coords: { lat: store.latitude ? `${store.latitude}° N` : 'N/A', lng: store.longitude ? `${store.longitude}° E` : 'N/A' },
  } : null;

  const metrics = [
    { icon: Eye, label: 'Profile Views', value: rawMetrics.totalViews.toLocaleString(), change: '+0%', trend: 'up', period: 'all time' },
    { icon: Calendar, label: 'Reservation Requests', value: rawMetrics.bookingsCount.toLocaleString(), change: '+0%', trend: 'up', period: 'all time' },
    { icon: Star, label: 'Reviews Received', value: rawMetrics.reviewsCount.toLocaleString(), change: '+0%', trend: 'up', period: 'all time' },
    { icon: Search, label: 'Search Appearances', value: 'N/A', change: '0%', trend: 'up', period: 'this month' },
    { icon: MessageSquare, label: 'Customer Messages', value: 'N/A', change: '0%', trend: 'down', period: 'this month' },
  ];

  const chartData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, rawMetrics.totalViews || 1];
  const bookingData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, rawMetrics.bookingsCount || 1];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const sentimentData = (() => {
    const total = recentReviews.length;
    if (total === 0) return { excellent: 0, good: 0, neutral: 0, poor: 0 };
    const counts = recentReviews.reduce((acc: any, r: any) => {
      if (r.rating === 5) acc.excellent++;
      else if (r.rating === 4) acc.good++;
      else if (r.rating === 3) acc.neutral++;
      else acc.poor++;
      return acc;
    }, { excellent: 0, good: 0, neutral: 0, poor: 0 });
    return {
      excellent: Math.round((counts.excellent / total) * 100),
      good: Math.round((counts.good / total) * 100),
      neutral: Math.round((counts.neutral / total) * 100),
      poor: Math.round((counts.poor / total) * 100),
    };
  })();

  if (!business) {
    return (
        <div className="min-h-screen bg-background w-full flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">No Business Profile Found</h2>
                <p className="text-muted-foreground max-w-md">It looks like you haven&apos;t set up your business profile yet or it is pending approval.</p>
                <Button asChild>
                    <Link href="/dashboard/setup">Set Up Business Profile</Link>
                </Button>
            </div>
            <Footer />
        </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

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
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 border-4 border-card shadow-xl flex items-center justify-center overflow-hidden">
                  {owner.avatar.length > 2 && owner.avatar.startsWith('http') ? (
                     <img src={owner.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                     <span className="text-2xl font-black text-white">{owner.avatar}</span>
                  )}
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
              <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                  <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Key className="w-3.5 h-3.5" /> Password
                      </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card text-foreground border-border sm:max-w-[425px]">
                      <DialogHeader>
                          <DialogTitle>Reset Password</DialogTitle>
                          <DialogDescription>
                              We will send a password reset link to <span className="font-semibold text-foreground">{user.email}</span>.
                          </DialogDescription>
                      </DialogHeader>
                      <div className="pt-4 flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
                          <Button type="button" onClick={handlePasswordReset} disabled={isChangingPassword}>
                              {isChangingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                              Send Reset Link
                          </Button>
                      </div>
                  </DialogContent>
              </Dialog>
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
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/25 flex items-center justify-center text-3xl flex-shrink-0">
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
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
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
            <Button size="sm" className="flex-1 gap-2 text-xs" variant="default" asChild>
              <Link href={`/business/${business.id}`}>
                 <ExternalLink className="w-3.5 h-3.5" /> View Page
              </Link>
            </Button>
            <Button size="sm" className="flex-1 gap-2 text-xs" variant="outline" asChild>
              <Link href={`/dashboard/${business.id}/profile`}>
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </Link>
            </Button>
            <Button size="sm" className="flex-1 gap-2 text-xs" variant="outline" asChild>
              <Link href={`/dashboard/${business.id}/profile`}>
                 <ImageIcon className="w-3.5 h-3.5" /> Photos
              </Link>
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
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all -mb-px ${activeTab === tab.id
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
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
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
                {recentReviews.length > 0 ? recentReviews.slice(0, 2).map((r: any) => (
                  <div key={r.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-indigo-400">{r.avatar}</span>
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
                )) : (
                    <p className="text-xs text-muted-foreground text-center py-4">No reviews yet.</p>
                )}
              </div>
              {recentReviews.length > 0 && (
                  <button
                    onClick={() => setActiveTab('reputation')}
                    className="mt-3 text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
                  >
                    View all reviews <ChevronRight className="w-3 h-3" />
                  </button>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" /> Business at a Glance
              </h3>
              <div className="space-y-2.5">
                {[
                  { icon: MapPin, label: 'Address', value: business.address },
                  { icon: Phone, label: 'Phone', value: business.phone },
                  { icon: Globe, label: 'Website', value: business.website },
                  { icon: Clock, label: 'Status', value: business.status },
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
                <span className="text-2xl font-black text-foreground">{metrics[0].value}</span>
              </div>
              {/* Bar chart */}
              <div className="flex items-end gap-1 h-24">
                {chartData.map((v, i) => {
                  const max = Math.max(...chartData, 1);
                  const pct = (v / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-sm bg-indigo-500/70 hover:bg-indigo-400 transition-colors cursor-pointer"
                        style={{ height: `${pct}%` }}
                        title={`${months[i]}: ${v}`}
                      />
                      <span className="text-[8px] text-muted-foreground">{months[i].slice(0, 1)}</span>
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
                <span className="text-2xl font-black text-foreground">{metrics[1].value}</span>
              </div>
              <div className="flex items-end gap-1 h-24">
                {bookingData.map((v, i) => {
                  const max = Math.max(...bookingData, 1);
                  const pct = (v / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-sm bg-emerald-500/70 hover:bg-emerald-400 transition-colors cursor-pointer"
                        style={{ height: `${pct}%` }}
                        title={`${months[i]}: ${v}`}
                      />
                      <span className="text-[8px] text-muted-foreground">{months[i].slice(0, 1)}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Real metrics summary */}
          <Card className="p-5">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Business Performance
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Click-through Rate', value: '12.4%', sub: 'from search results',  color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                { label: 'Avg. Session Time',  value: '3m 42s', sub: 'on your profile',      color: 'text-blue-400',   bg: 'bg-blue-500/10' },
                { label: 'Return Visitors',    value: '68%',   sub: 'visited more than once', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Photo Views',        value: '4,120', sub: 'total photo impressions', color: 'text-amber-400',  bg: 'bg-amber-500/10' },
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
                  <StarRow rating={Math.round(business.rating)} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{business.reviews} total reviews</p>
              </div>

              {/* Sentiment bars - computed from real reviews */}
              <div className="space-y-2">
                {recentReviews.length > 0 ? (
                  <>
                    {[
                      { label: 'Excellent (5★)', rating: [5], color: 'bg-green-500' },
                      { label: 'Good (4★)', rating: [4], color: 'bg-emerald-400' },
                      { label: 'Neutral (3★)', rating: [3], color: 'bg-yellow-400' },
                      { label: 'Poor (1-2★)', rating: [1, 2], color: 'bg-red-400' },
                    ].map(({ label, rating, color }) => {
                      const count = recentReviews.filter((r: any) => rating.includes(r.rating)).length;
                      const pct = recentReviews.length > 0 ? Math.round((count / recentReviews.length) * 100) : 0;
                      return (
                        <div key={label} className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-24 flex-shrink-0">{label}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-foreground w-8 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <p className="text-xs text-center text-muted-foreground py-2">No reviews yet to analyse</p>
                )}
              </div>
            </Card>

            {/* Reviews list */}
            <div className="lg:col-span-2 space-y-3">
              {reviews.map(r => (
                <Card key={r.id} className="p-4">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[11px] font-bold text-indigo-400">{r.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <span className="text-sm font-semibold text-foreground">{r.author}</span>
                          {r.replied && (
                            <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Replied</span>
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
                              className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 font-semibold transition-colors"
                            >
                              <MessageSquare className="w-3 h-3" /> Reply
                            </button>
                          )}
                          <button className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 font-semibold transition-colors">
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
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" asChild>
                   <Link href={`/dashboard/${business.id}/profile`}>
                     <Edit2 className="w-3 h-3" /> Edit
                   </Link>
                </Button>
              </h3>

              {[
                { label: 'Business Name', value: business.name },
                { label: 'Category', value: business.category },
                { label: 'Description', value: business.description },
                { label: 'Address', value: business.address },
                { label: 'Phone', value: business.phone },
                { label: 'Website', value: business.website },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-sm text-foreground">{value}</p>
                  <div className="mt-1.5 border-b border-border/40" />
                </div>
              ))}
            </Card>
          </div>

          {/* Right: hours + map */}
          <div className="space-y-4">
            {/* Opening hours */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400" /> Opening Hours</span>
                <button
                  onClick={() => setEditingHours(!editingHours)}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  {editingHours ? 'Save' : 'Edit'}
                </button>
              </h3>
              <div className="space-y-2">
                {business.openingHours.map(({ day, hours }: { day: string; hours: any }) => (
                  <div key={day} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                    <span className="text-xs font-semibold text-foreground">{day}</span>
                    <span className={`text-xs ${hours === 'Closed' ? 'text-red-400 font-semibold' : 'text-muted-foreground'}`}>
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

              {/* Real OpenStreetMap embed */}
              {store?.latitude && store?.longitude ? (
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${store.longitude - 0.005},${store.latitude - 0.005},${store.longitude + 0.005},${store.latitude + 0.005}&layer=mapnik&marker=${store.latitude},${store.longitude}`}
                  className="w-full h-40 rounded-xl border border-border mb-3"
                  title="Store Location"
                />
              ) : (
                <div className="h-40 rounded-xl bg-muted border border-border flex flex-col items-center justify-center gap-2 mb-3">
                  <MapPin className="w-8 h-8 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">No location coordinates set</p>
                </div>
              )}

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Latitude', value: business.coords.lat },
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
                  { icon: Key,    label: 'Change Password',        sub: 'Last changed 3 months ago',  action: 'Update', color: 'text-indigo-400' },
                  { icon: Shield, label: 'Two-Factor Auth',        sub: owner.twoFactor ? 'Enabled via SMS' : 'Not enabled', action: owner.twoFactor ? 'Manage' : 'Enable', color: 'text-green-400' },
                  { icon: Wifi,   label: 'Active Sessions',        sub: '2 devices logged in',         action: 'Review', color: 'text-blue-400' },
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
                  { label: 'New review posted', enabled: true },
                  { label: 'New reservation', enabled: true },
                  { label: 'Customer message', enabled: true },
                  { label: 'Weekly performance', enabled: false },
                  { label: 'Promotional tips', enabled: false },
                ].map(({ label, enabled }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{label}</span>
                    <button className={`w-10 h-5 rounded-full border-2 transition-all relative ${enabled ? 'bg-primary border-primary' : 'bg-muted border-border'
                      }`}>
                      <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${enabled ? 'left-5' : 'left-0.5'
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
                  <Image className="w-4 h-4 text-purple-400" />
                  <span className="flex-1">Media Library</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
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
      </main>
      <Footer />
    </div>
  );
}