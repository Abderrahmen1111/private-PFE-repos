'use client';

import { useState, useEffect, Suspense } from 'react';
import {
  Star, MapPin, Phone, Globe, Mail, Shield, Edit2, Key,
  Lock, Camera, ExternalLink, MessageSquare, Flag, TrendingUp,
  Eye, Search, Calendar, Users, BarChart2, Clock, ChevronRight,
  CheckCircle, AlertTriangle, Wifi, X, Check,
  Building2, Tag, Image as ImageIcon, Settings, Activity, Loader2,
  Zap, ArrowUpRight, ArrowDownRight, Camera as CameraIcon
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useRef } from 'react';
import { getOwnerProfileData } from '@/lib/actions/profile';
import { deleteStore, transferStoreOwnership } from '@/lib/actions/stores';
import { sendPasswordResetEmail } from '@/lib/actions/auth';
import { updateProfile, updateAvatar } from '@/lib/actions/users';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ─── Design tokens ────────────────────────────────────────────────────────────
// Accent palette: orange-based warm startup feel
const A = {
  primary:   '#F97316',   // orange-500
  primaryLo: 'rgba(249,115,22,0.08)',
  primaryBd: 'rgba(249,115,22,0.25)',
  green:     '#22C55E',
  greenLo:   'rgba(34,197,94,0.08)',
  greenBd:   'rgba(34,197,94,0.25)',
  blue:      '#3B82F6',
  blueLo:    'rgba(59,130,246,0.08)',
  blueBd:    'rgba(59,130,246,0.25)',
  amber:     '#F59E0B',
  red:       '#EF4444',
  redLo:     'rgba(239,68,68,0.08)',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const px = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={cn(px, i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300')} />
      ))}
    </div>
  );
}

// Micro-badge pill
function Pill({ children, color = 'default', className }: { children: React.ReactNode; color?: 'green'|'orange'|'blue'|'red'|'amber'|'default'; className?: string }) {
  const map = {
    green:   'bg-emerald-50 text-emerald-600 border-emerald-200',
    orange:  'bg-orange-50 text-orange-600 border-orange-200',
    blue:    'bg-blue-50 text-blue-600 border-blue-200',
    red:     'bg-red-50 text-red-600 border-red-200',
    amber:   'bg-amber-50 text-amber-600 border-amber-200',
    default: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border', map[color], className)}>
      {children}
    </span>
  );
}

// Stat metric card
function MetricCard({ icon: Icon, label, value, change, trend, period }: {
  icon: React.ElementType; label: string; value: string;
  change: string; trend: 'up'|'down'; period: string;
}) {
  const isUp = trend === 'up';
  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white p-4 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100/50 transition-all duration-300 overflow-hidden">
      {/* Subtle hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(249,115,22,0.04) 0%, transparent 60%)' }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange-50">
          <Icon className="w-4 h-4 text-orange-500" />
        </div>
        <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full',
          isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600')}>
          {isUp ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
          {change}
        </span>
      </div>
      <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
      <p className="text-[11px] font-medium text-gray-600 mt-0.5 leading-tight">{label}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{period}</p>
    </div>
  );
}

// ─── Tab system ───────────────────────────────────────────────────────────────
type Tab = 'overview' | 'analytics' | 'reputation' | 'business' | 'settings';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',    label: 'Overview',      icon: Activity   },
  { id: 'analytics',  label: 'Analytics',     icon: BarChart2  },
  { id: 'reputation', label: 'Reputation',    icon: Star       },
  { id: 'business',   label: 'Business Info', icon: Building2  },
  { id: 'settings',   label: 'Settings',      icon: Settings   },
];

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, children, action }: {
  icon: React.ElementType; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-orange-50">
          <Icon className="w-3.5 h-3.5 text-orange-500" />
        </div>
        {children}
      </h3>
      {action}
    </div>
  );
}

// ─── Pro card wrapper ─────────────────────────────────────────────────────────
function ProCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-gray-200 bg-white p-5 shadow-sm', className)}>
      {children}
    </div>
  );
}

// ─── Bar chart ────────────────────────────────────────────────────────────────
function BarChart({ data, months, color }: { data: number[]; months: string[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-28">
      {data.map((v, i) => {
        const pct = Math.max((v / max) * 100, v > 0 ? 8 : 2);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar">
            <div
              className="w-full rounded-md transition-all duration-200 cursor-pointer group-hover/bar:brightness-110"
              style={{ height: `${pct}%`, background: color, opacity: v === 0 ? 0.2 : 0.85 }}
              title={`${months[i]}: ${v}`}
            />
            <span className="text-[8px] text-gray-400">{months[i].slice(0, 1)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange, loading }: { enabled: boolean, onChange: () => void, loading?: boolean }) {
  return (
    <div 
      onClick={loading ? undefined : onChange}
      className={cn(
        'relative w-10 h-5 rounded-full border-2 transition-all duration-200 cursor-pointer',
        enabled ? 'border-orange-500' : 'border-gray-300',
        loading && 'opacity-50 cursor-not-allowed'
      )} 
      style={{ background: enabled ? A.primary : '#f3f4f6' }}
    >
      <span className={cn(
        'absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-200',
        enabled ? 'left-4' : 'left-0.5'
      )} />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════════════════════════════

function formatDuration(seconds: number) {
  if (seconds <= 0) return '0s';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════

function BusinessOwnerContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editingHours, setEditingHours] = useState(false);
  const [loadingToggles, setLoadingToggles] = useState<Record<string, boolean>>({});
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferOwnerEmail, setTransferOwnerEmail] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();
  const businessIdParam = searchParams.get('id');
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // States for security toggles
  const [twoFactor, setTwoFactor] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [loginAlert, setLoginAlert] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getOwnerProfileData(businessIdParam || undefined);
        const role = data?.user?.profile?.role?.toLowerCase();
        const isBusinessRole = role === 'pro' || role === 'admin' || role === 'business_owner';
        if (!isBusinessRole) { router.push('/profile/user'); return; }
        setInitialData(data);
        
        // Init toggle states
        setTwoFactor(data.user.twoFactorEnabled);
        setEmailNotif(data.user.emailNotificationsEnabled);
        setLoginAlert(data.user.loginAlertsEnabled);
      } catch (error) {
        console.error('Failed to load profile data', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [businessIdParam, router]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-orange-50">
            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (!initialData) return null;

  const handlePasswordReset = async () => {
    setIsChangingPassword(true);
    try {
      const result = await sendPasswordResetEmail(user.email);
      if ("error" in result) { toast.error(result.error); }
      else { toast.success('Password reset email sent!'); setIsPasswordModalOpen(false); }
    } catch { toast.error('Failed to send reset email'); }
    finally { setIsChangingPassword(false); }
  };



  const handleTogglePreference = async (key: string, currentValue: boolean, setter: (v: boolean) => void) => {
    setLoadingToggles(prev => ({ ...prev, [key]: true }));
    try {
      const fieldMap: Record<string, string> = {
        '2fa': 'two_factor_enabled',
        'email': 'email_notifications_enabled',
        'alerts': 'login_alerts_enabled'
      };
      
      const result = await updateProfile(user.id, {
        [fieldMap[key]]: !currentValue
      });
      
      if (result.error) {
        toast.error(`Failed to update ${key}`);
      } else {
        setter(!currentValue);
        toast.success(`${key} settings updated`);
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setLoadingToggles(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleAvatarUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUpdatingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { error } = await updateAvatar(formData);
      if (error) throw new Error((error as any).message || String(error));
      toast.success('Photo de profil mise à jour');

      // Refresh data
      const data = await getOwnerProfileData(businessIdParam || undefined);
      setInitialData(data);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour de l'image");
    } finally {
      setIsUpdatingAvatar(false);
      e.target.value = '';
    }
  };

  const { user, store, stores: storesList = [], metrics: rawMetrics, recentReviews } = initialData;

  const owner = {
    name:      user.profile?.full_name || user.email?.split('@')[0] || 'Business Owner',
    role:      user.profile?.role === 'PRO' ? 'Verified Business Owner' : 'Business Owner',
    avatar:    user.avatar ?? (user.profile?.full_name?.substring(0, 2).toUpperCase() || 'BO'),
    joinDate:  new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    location:  user.profile?.city || user.profile?.address || 'Tunisia',
    email:     user.email,
    phone:     user.profile?.phone || 'Not provided',
    verified:  true,
  };

  const business = store ? {
    id:           store.id_business || store.id,
    dashboardId: store.id,
    internal_id:  store.id,
    name:         store.name,
    logo:         store.logo_url ?? store.name.substring(0, 2).toUpperCase(),
    category:     store.category,
    rating:       rawMetrics.avgRating || 0,
    reviews:      rawMetrics.reviewsCount || 0,
    status:       store.status,
    description:  store.description || 'No description provided.',
    address:      store.address || store.city || 'Tunisia',
    phone:        store.phone || 'Not provided',
    website:      store.website || 'Not provided',
    openingHours: store.opening_hours
      ? Object.entries(store.opening_hours).map(([day, hours]) => ({ day, hours }))
      : [{ day: 'Mon–Sun', hours: 'N/A' }],
    coords: {
      lat: store.latitude  ? `${store.latitude}° N`  : 'N/A',
      lng: store.longitude ? `${store.longitude}° E` : 'N/A',
    },
  } : null;

  const handleDeleteStore = async () => {
    const storeId = store?.id;
    if (!storeId) {
      toast.error('Boutique introuvable.');
      return;
    }
    try {
      const { success, error } = await deleteStore(Number(storeId));
      if (success) {
        toast.success('Votre boutique a été supprimée. Redirection...');
        setTimeout(() => router.push('/'), 2000);
      } else {
        toast.error('Erreur lors de la suppression de la boutique: ' + (error || 'Erreur inconnue'));
      }
    } catch {
      toast.error('Une erreur inattendue est survenue.');
    }
  };

  const handleTransferOwnership = async () => {
    const storeId = store?.id;
    if (!storeId) {
      toast.error('Boutique introuvable.');
      return;
    }
    const email = transferOwnerEmail.trim();
    if (!email) {
      toast.error('Indiquez l’e-mail du nouveau propriétaire.');
      return;
    }
    setIsTransferring(true);
    try {
      const { success, error } = await transferStoreOwnership(Number(storeId), email);
      if (success) {
        toast.success('Boutique transférée. Le nouveau propriétaire a désormais accès au tableau de bord.');
        setTransferDialogOpen(false);
        setTransferOwnerEmail('');
        const data = await getOwnerProfileData(businessIdParam || undefined);
        setInitialData(data);
        router.refresh();
      } else {
        toast.error(error || 'Le transfert a échoué.');
      }
    } catch {
      toast.error('Une erreur inattendue est survenue.');
    } finally {
      setIsTransferring(false);
    }
  };

  const metrics = [
    { icon: Eye,          label: 'Total Visits',        value: (rawMetrics.uniqueSessionsCount || 0).toLocaleString(),   change: '+0%', trend: 'up'   as const, period: 'all time'   },
    { icon: ImageIcon,    label: 'Content Views',       value: (rawMetrics.totalPhotoViews || 0).toLocaleString(),     change: '+0%', trend: 'up'   as const, period: 'all time'   },
    { icon: Calendar,     label: 'Reservations',         value: (rawMetrics.bookingsCount || 0).toLocaleString(), change: '+0%', trend: 'up'   as const, period: 'all time'   },
    { icon: Star,         label: 'Reviews',              value: (rawMetrics.reviewsCount || 0).toLocaleString(),  change: '+0%', trend: 'up'   as const, period: 'all time'   },
    { icon: Search,       label: 'Search Appearances',   value: '12',                                     change: '0%',  trend: 'up'   as const, period: 'this month' },
  ];

  const chartData   = [0,0,0,0,0,0,0,0,0,0,0, rawMetrics.totalViews    || 1];
  const bookingData = [0,0,0,0,0,0,0,0,0,0,0, rawMetrics.bookingsCount || 1];
  const months      = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const reviews = recentReviews.map((r: any) => ({
    id:      r.id,
    author:  r.reviewer_name || r.user_name || 'Anonymous',
    avatar:  (r.reviewer_name || 'A').substring(0, 2).toUpperCase(),
    rating:  r.rating,
    text:    r.comment || r.text || '',
    date:    new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    replied: !!r.reply,
  }));

  // ── No business state ────────────────────────────────────────────────────
  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-4">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-orange-50">
            <Building2 className="w-9 h-9 text-orange-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">No Business Profile</h2>
            <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
              You haven&apos;t set up your business profile yet, or it&apos;s pending approval.
            </p>
          </div>
          <Button asChild className="rounded-xl font-bold px-6 bg-orange-500 hover:bg-orange-600">
            <Link href="/dashboard/setup">Set Up Business Profile</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════


  
  return (
    <div className="space-y-5 max-w-6xl mx-auto bg-gray-50 p-6 min-h-screen">

      {/* ──────────────────────────────────────────────────────────────────
          1. PROFILE HEADER
      ─────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        {/* Cover — warm gradient with subtle mesh */}
        <div className="relative h-32 overflow-hidden" style={{
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 40%, #fed7aa 100%)',
        }}>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(249,115,22,0.15) 0%, transparent 55%),
                              radial-gradient(circle at 80% 20%, rgba(251,191,36,0.12) 0%, transparent 50%)`,
          }} />
          {/* Subtle grid texture */}
          <div className="absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: 'linear-gradient(rgba(249,115,22,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,.3) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-5">
            {/* Avatar + identity */}
            <div className="flex items-end gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' }}>
                  {owner.avatar.length > 2 && owner.avatar.startsWith('http') ? (
                    <img src={owner.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-orange-600">{owner.avatar}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUpdatingAvatar}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 bg-orange-500 disabled:opacity-50"
                >
                  {isUpdatingAvatar ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    <Camera className="w-3.5 h-3.5 text-white" />
                  )}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarUpdate} 
                  className="hidden" 
                  accept="image/*" 
                />
              </div>

              <div className="mb-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-black text-gray-900 tracking-tight">{owner.name}</h1>
                  {owner.verified && (
                    <Pill color="blue"><Shield className="w-3 h-3" /> Verified</Pill>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-500">{owner.role}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {[
                    { icon: Calendar, text: `Since ${owner.joinDate}` },
                    { icon: MapPin,   text: owner.location },
                    { icon: Mail,     text: owner.email },
                    { icon: Phone,    text: owner.phone },
                  ].map(({ icon: Icon, text }) => (
                    <span key={text} className="flex items-center gap-1 text-[11px] text-gray-500">
                      <Icon className="w-3 h-3 opacity-60" />{text}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 flex-wrap text-white items-center">

              <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs font-semibold border-gray-200">
                    <Key className="w-3.5 h-3.5" /> Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white text-gray-900 border-gray-200 rounded-2xl sm:max-w-[420px]">
                  <DialogHeader>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-orange-50">
                      <Key className="w-5 h-5 text-orange-500" />
                    </div>
                    <DialogTitle className="text-lg text-red-500 ">Reset Password</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                      We'll send a reset link to <span className="font-semibold text-gray-900">{user.email}</span>.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" className="rounded-xl text-white" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
                    <Button className="rounded-xl font-bold gap-2 bg-orange-500 hover:bg-orange-600" onClick={handlePasswordReset} disabled={isChangingPassword}>
                      {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                      Send Reset Link
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

            </div>
          </div>

          {/* Status pills */}
          <div className="flex gap-2 flex-wrap">
            <Pill color={twoFactor ? 'green' : 'orange'}>
              {twoFactor ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              2FA {twoFactor ? 'Enabled' : 'Disabled'}
            </Pill>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          2. BUSINESS SUMMARY CARD
      ─────────────────────────────────────────────────────────────────── */}
      <ProCard>
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="flex gap-4 flex-1">
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl border border-gray-200 flex items-center justify-center text-2xl font-black flex-shrink-0 overflow-hidden bg-orange-50">
              {typeof business.logo === 'string' && business.logo.startsWith('http')
                ? <img src={business.logo} alt={business.name} className="w-full h-full object-cover" />
                : <span className="text-orange-600">{business.logo}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                <div>
                  <h2 className="text-base font-black text-gray-900 tracking-tight">{business.name}</h2>
                  <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Tag className="w-3 h-3" /> {business.category}
                  </span>
                </div>
                <Pill color="green">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </Pill>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <StarRow rating={Math.round(business.rating)} />
                <span className="text-sm font-black text-gray-900">{business.rating}</span>
                <span className="text-xs text-gray-500">({business.reviews} reviews)</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{business.description}</p>
            </div>
          </div>
          {/* Actions */}
          <div className="flex sm:flex-col gap-2 sm:w-36">
            <Button size="sm" className="flex-1 gap-1.5 text-xs rounded-xl font-bold bg-orange-500 hover:bg-orange-600" asChild>
              <Link href={`/merchants/business/${business.id}`}><ExternalLink className="w-3.5 h-3.5" /> View Page</Link>
            </Button>
            <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs rounded-xl text-white font-semibold border-gray-200 hover:border-orange-300" asChild>
              <Link href={`/dashboard/${business.dashboardId}/profile`}><Edit2 className="w-3.5 h-3.5" /> Edit</Link>
            </Button>
            <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs text-white rounded-xl font-semibold border-gray-200 hover:border-orange-300" asChild>
              <Link href={`/dashboard/${business.dashboardId}/profile`}><ImageIcon className="w-3.5 h-3.5" /> Photos</Link>
            </Button>
          </div>
        </div>
      </ProCard>

      {storesList.length > 1 && (
        <ProCard className="py-4">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Mes établissements</p>
          <div className="flex flex-wrap gap-2">
            {storesList.map((s: { id: number; name: string; status?: string | null }) => {
              const selected = store?.id === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => router.push(`/profile/businessOwner?id=${s.id}`)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-bold border transition-all max-w-[220px] truncate',
                    selected
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                  )}
                  title={s.name}
                >
                  {s.name}
                </button>
              );
            })}
            <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold border-dashed border-gray-300" asChild>
              <Link href="/merchants/business/add">+ Ajouter</Link>
            </Button>
          </div>
        </ProCard>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          TABS
      ─────────────────────────────────────────────────────────────────── */}
      <div className="flex gap-0.5 overflow-x-auto pb-0 scrollbar-none bg-white rounded-2xl p-1 border border-gray-200 shadow-sm">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 text-xs font-semibold whitespace-nowrap rounded-xl transition-all duration-200',
                isActive
                  ? 'text-white shadow-sm bg-orange-500'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          TAB: OVERVIEW
      ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {metrics.map((m) => <MetricCard key={m.label} {...m} />)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Latest reviews */}
            <ProCard>
              <SectionHeading icon={Star}>Latest Reviews</SectionHeading>
              <div className="space-y-4">
                {recentReviews.length > 0 ? reviews.slice(0, 2).map((r: any) => (
                  <div key={r.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[10px] font-black bg-orange-50 text-orange-600">
                      {r.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-bold text-gray-900">{r.author}</span>
                        <span className="text-[10px] text-gray-400">{r.date}</span>
                      </div>
                      <StarRow rating={r.rating} />
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{r.text}</p>
                    </div>
                  </div>
                )) : (
                  <div className="py-8 text-center">
                    <Star className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                    <p className="text-xs text-gray-400">No reviews yet</p>
                  </div>
                )}
              </div>
              {recentReviews.length > 0 && (
                <button onClick={() => setActiveTab('reputation')}
                  className="mt-4 text-xs font-bold flex items-center gap-1 text-orange-500 hover:text-orange-600 transition-colors">
                  View all reviews <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </ProCard>

            {/* Business at a glance */}
            <ProCard>
              <SectionHeading icon={Building2}>Business at a Glance</SectionHeading>
              <div className="space-y-3">
                {[
                  { icon: MapPin,  label: 'Address', value: business.address },
                  { icon: Phone,   label: 'Phone',   value: business.phone   },
                  { icon: Globe,   label: 'Website', value: business.website },
                  { icon: Clock,   label: 'Status',  value: business.status  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border border-gray-200 bg-gray-50">
                      <Icon className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="text-xs font-medium text-gray-900 truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ProCard>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          TAB: ANALYTICS
      ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ProCard>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Profile Views</h3>
                  <p className="text-[11px] text-gray-500">Last 12 months</p>
                </div>
                <span className="text-2xl font-black text-gray-900">{metrics[0].value}</span>
              </div>
              <BarChart data={chartData} months={months} color={A.primary} />
            </ProCard>

            <ProCard>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Booking Trends</h3>
                  <p className="text-[11px] text-gray-500">Reservation requests</p>
                </div>
                <span className="text-2xl font-black text-gray-900">{metrics[1].value}</span>
              </div>
              <BarChart data={bookingData} months={months} color={A.green} />
            </ProCard>
          </div>

          <ProCard>
            <SectionHeading icon={TrendingUp}>Business Performance</SectionHeading>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Click-through Rate', value: `${rawMetrics.ctr || 0}%`, sub: 'from unique visitors',     color: A.primary, bg: 'bg-orange-50' },
                { label: 'Avg. Session Time',  value: formatDuration(rawMetrics.avgSessionTime || 0), sub: 'on your profile',         color: A.blue,    bg: 'bg-blue-50'   },
                { label: 'Return Visitors',    value: `${rawMetrics.returnVisitorsCount || 0}`,    sub: 'visited more than once',   color: A.green,   bg: 'bg-emerald-50'  },
                { label: 'Photo Views',        value: (rawMetrics.totalPhotoViews || 0).toLocaleString(),  sub: 'total content impressions',  color: A.amber,   bg: 'bg-amber-50' },
              ].map(({ label, value, sub, color, bg }) => (
                <div key={label} className="rounded-xl p-4 border border-gray-200 bg-white">
                  <p className="text-2xl font-black" style={{ color }}>{value}</p>
                  <p className="text-xs font-bold text-gray-900 mt-1">{label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </ProCard>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          TAB: REPUTATION
      ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'reputation' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Rating summary */}
            <ProCard>
              <SectionHeading icon={Star}>Rating Summary</SectionHeading>
              <div className="text-center mb-5">
                <span className="text-6xl font-black text-gray-900 tracking-tighter">{business.rating || '—'}</span>
                <span className="text-xl text-gray-400"> / 5</span>
                <div className="flex justify-center mt-2 mb-1">
                  <StarRow rating={Math.round(business.rating)} size="md" />
                </div>
                <p className="text-xs text-gray-500">{business.reviews} total reviews</p>
              </div>
              <div className="space-y-2.5">
                {recentReviews.length > 0 ? [
                  { label: 'Excellent', stars: [5], color: '#22C55E' },
                  { label: 'Good',      stars: [4], color: '#86EFAC' },
                  { label: 'Neutral',   stars: [3], color: '#FCD34D' },
                  { label: 'Poor',      stars: [1,2], color: '#F87171' },
                ].map(({ label, stars, color }) => {
                  const count = recentReviews.filter((r: any) => stars.includes(r.rating)).length;
                  const pct = Math.round((count / recentReviews.length) * 100);
                  return (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 w-16 flex-shrink-0">{label}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-700 w-8 text-right">{pct}%</span>
                    </div>
                  );
                }) : (
                  <p className="text-xs text-center text-gray-400 py-2">No reviews to analyse</p>
                )}
              </div>
            </ProCard>

            {/* Reviews list */}
            <div className="lg:col-span-2 space-y-3">
              {reviews.length === 0 && (
                <ProCard className="py-10 text-center">
                  <Star className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                  <p className="text-sm font-semibold text-gray-500">No reviews yet</p>
                  <p className="text-xs text-gray-400 mt-1">Reviews will appear here once customers rate your business.</p>
                </ProCard>
              )}
              {reviews.map((r: any) => (
                <div key={r.id} className="rounded-2xl border border-gray-200 bg-white p-4 hover:border-orange-200 transition-all duration-200 shadow-sm">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-black bg-orange-50 text-orange-600">
                      {r.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{r.author}</span>
                          {r.replied && (
                            <Pill color="blue"><Check className="w-2.5 h-2.5" /> Replied</Pill>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400">{r.date}</span>
                      </div>
                      <StarRow rating={r.rating} />
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">{r.text}</p>

                      {replyingTo === r.id ? (
                        <div className="mt-3 space-y-2">
                          <textarea
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder="Write your reply…"
                            rows={2}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none transition-all"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setReplyingTo(null); setReplyText(''); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all active:scale-95"
                            >
                              <Check className="w-3 h-3" /> Send Reply
                            </button>
                            <button
                              onClick={() => { setReplyingTo(null); setReplyText(''); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl font-semibold bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              <X className="w-3 h-3" /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 mt-3">
                          {!r.replied && (
                            <button
                              onClick={() => setReplyingTo(r.id)}
                              className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg font-bold border transition-all active:scale-95 bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
                            >
                              <MessageSquare className="w-3 h-3" /> Reply
                            </button>
                          )}
                          <button className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg font-semibold transition-all active:scale-95 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">
                            <Flag className="w-3 h-3" /> Report
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          TAB: BUSINESS INFO
      ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'business' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <ProCard>
              <SectionHeading icon={Building2} action={null}>
                Business Details
              </SectionHeading>
              <div className="space-y-4">
                {[
                  { label: 'Business Name', value: business.name },
                  { label: 'Category',      value: business.category },
                  { label: 'Description',   value: business.description },
                  { label: 'Address',       value: business.address },
                  { label: 'Phone',         value: business.phone },
                  { label: 'Website',       value: business.website },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </ProCard>

            <ProCard>
              <SectionHeading icon={Clock} action={
                <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 hover:bg-orange-50" onClick={() => setEditingHours(!editingHours)}>
                  <Edit2 className="w-3 h-3" /> {editingHours ? 'Done' : 'Edit'}
                </Button>
              }>
                Opening Hours
              </SectionHeading>
              <div className="space-y-2">
                {business.openingHours.map(({ day, hours }: any) => {
                  const displayHours = typeof hours === 'object' && hours !== null
                    ? hours.closed ? 'Fermé' : `${hours.open} - ${hours.close}`
                    : String(hours);

                  return (
                    <div key={day} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-xs font-medium text-gray-600 capitalize">{day}</span>
                      {editingHours ? (
                        <Input className="w-32 h-7 text-xs" defaultValue={displayHours} />
                      ) : (
                        <span className="text-xs text-gray-900">{displayHours}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </ProCard>
          </div>

          <div className="space-y-4">
            <ProCard>
              <SectionHeading icon={MapPin}>Location</SectionHeading>
              <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-48 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">Map preview</p>
                  <p className="text-[10px] text-gray-400 mt-1">Lat: {business.coords.lat} • Lng: {business.coords.lng}</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                <p className="font-medium text-gray-900">{business.address}</p>
              </div>
            </ProCard>

            <ProCard>
              <SectionHeading icon={Shield}>Verification Status</SectionHeading>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-bold text-emerald-700">Verified Business</p>
                  <p className="text-xs text-emerald-600">Your business is verified and visible to customers</p>
                </div>
              </div>
            </ProCard>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          TAB: SETTINGS
      ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProCard>
            <SectionHeading icon={Lock}>Security</SectionHeading>
            <div className="space-y-4">
              {[
                { id: '2fa', label: 'Two-Factor Authentication', desc: 'Add an extra layer of security', enabled: twoFactor, setter: setTwoFactor },
                { id: 'email', label: 'Email Notifications', desc: 'Receive alerts for new reviews', enabled: emailNotif, setter: setEmailNotif },
                { id: 'alerts', label: 'Login Alerts', desc: 'Get notified of new sign-ins', enabled: loginAlert, setter: setLoginAlert },
              ].map(({ id, label, desc, enabled, setter }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <Toggle 
                    enabled={enabled} 
                    onChange={() => handleTogglePreference(id, enabled, setter)} 
                    loading={loadingToggles[id]}
                  />
                </div>
              ))}
            </div>
          </ProCard>

          <ProCard>
            <SectionHeading icon={Settings}>Preferences</SectionHeading>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-gray-600">Language</Label>
                <select className="w-full mt-1.5 px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200">
                  <option>English</option>
                  <option>Français</option>
                  <option>العربية</option>
                </select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-600">Timezone</Label>
                <select className="w-full mt-1.5 px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200">
                  <option>Africa/Tunis (GMT+1)</option>
                  <option>Europe/Paris (GMT+1)</option>
                  <option>America/New_York (GMT-5)</option>
                </select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-600">Currency</Label>
                <select className="w-full mt-1.5 px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-200">
                  <option>TND - Tunisian Dinar</option>
                  <option>EUR - Euro</option>
                  <option>USD - US Dollar</option>
                </select>
              </div>
            </div>
          </ProCard>

          <ProCard className="lg:col-span-2">
            <SectionHeading icon={Zap}>Danger Zone</SectionHeading>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 p-4 rounded-xl border border-red-200 bg-red-50">
                <p className="text-sm font-bold text-red-700">Transfert de propriété</p>
                <p className="text-xs text-red-600 mt-1 mb-3">
                  Indique l’e-mail du compte Ro2ya du nouveau propriétaire. Il doit déjà avoir un compte ; il recevra la boutique et tout le tableau de bord associé.
                </p>
                <Dialog
                  open={transferDialogOpen}
                  onOpenChange={(open) => {
                    setTransferDialogOpen(open);
                    if (!open) setTransferOwnerEmail('');
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-100">
                      Transférer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white text-gray-900 border-gray-200 rounded-2xl sm:max-w-[420px]">
                    <DialogHeader>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2 bg-red-50">
                        <Mail className="w-5 h-5 text-red-600" />
                      </div>
                      <DialogTitle className="text-lg font-bold text-gray-900">Transférer la boutique</DialogTitle>
                      <DialogDescription className="text-sm text-gray-600 text-left space-y-2">
                        <span className="block">
                          Saisis l’adresse e-mail du <strong className="text-gray-900">nouveau propriétaire</strong>. Ce
                          doit être le même e-mail que celui de son compte Ro2ya. Après confirmation, tu n’auras plus
                          accès à cette boutique (sauf si on te la retransfère).
                        </span>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-2">
                      <div className="grid gap-1.5">
                        <Label htmlFor="transfer-owner-email" className="text-xs font-semibold text-gray-700">
                          E-mail du nouveau propriétaire
                        </Label>
                        <Input
                          id="transfer-owner-email"
                          type="email"
                          autoComplete="email"
                          placeholder="exemple@domaine.com"
                          value={transferOwnerEmail}
                          onChange={(e) => setTransferOwnerEmail(e.target.value)}
                          className="rounded-xl border-gray-200"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end text-white gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl border-gray-200"
                        onClick={() => setTransferDialogOpen(false)}
                        disabled={isTransferring}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="button"
                        className="rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white inline-flex items-center gap-2"
                        onClick={handleTransferOwnership}
                        disabled={isTransferring}
                      >
                        {isTransferring ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                            Transfert…
                          </>
                        ) : (
                          'Confirmer le transfert'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex-1 p-4 rounded-xl border border-red-200 bg-red-50">
                <p className="text-sm font-bold text-red-700">Supprimer la boutique</p>
                <p className="text-xs text-red-600 mt-1 mb-3">
                  Supprime définitivement cette boutique et ses données. Ton compte personnel est conservé.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-100">
                      Supprimer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white border border-gray-200 text-gray-900 rounded-2xl shadow-xl sm:max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-gray-900 font-bold">Confirmer la suppression</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-600">
                        Cette action supprimera définitivement votre boutique. Vos données personnelles de compte seront conservées.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                      <AlertDialogCancel className="border border-gray-200 bg-white text-gray-900 hover:bg-gray-50">
                        Annuler
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteStore}
                        className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                      >
                        Confirmer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </ProCard>
        </div>
      )}
    </div>
  );
}

export default function BusinessOwnerProfile() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-orange-50">
            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Loading your profile…</p>
        </div>
      </div>
    }>
      <BusinessOwnerContent />
    </Suspense>
  );
}