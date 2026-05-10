'use client';
// Force refresh for Camera icon

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '@/app/globals.css';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Plus, LayoutDashboard, Briefcase, Package, Bell, Zap, Settings, Menu, ChevronDown, LogOut, Home, Search, MessageCircle, Video, LifeBuoy, HelpCircle, Mail, CreditCard, MessageSquare, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserDropdown } from '@/components/ui/user-dropdown';
import { cn } from '@/lib/utils';
import { Toaster, toast } from 'sonner';
import AIAgent from '@/components/ai-agent/AIAgent';
import { getSidebarStats } from '@/lib/actions/overviews';
import { createClient } from '@/lib/supabase/client';
import { getUserProfile } from '@/lib/actions/users';
import { getUserStores } from '@/lib/actions/stores';
import { searchDashboard } from '@/lib/actions/overviews';
import { UploadProvider } from '@/lib/context/UploadContext';
import UploadProgressManager from '@/components/dashboard/UploadProgressManager';

type Business = {
  id: number;
  name: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const id = params.id as string;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  const [user, setUser] = useState<{ id: string; name: string; username: string; initials: string } | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [stats, setStats] = useState({ reviews: 0, leads: 0 });
  const [lastSeenCounts, setLastSeenCounts] = useState<Record<string, number>>({});

  // Dashboard Search State
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState('');
  const [dashboardResults, setDashboardResults] = useState<{
    items: any[];
    bookings: any[];
    orders: any[];
    reviews: any[];
  }>({ items: [], bookings: [], orders: [], reviews: [] });
  const [isSearching, setIsSearching] = useState(false);

  // Search Effect
  useEffect(() => {
    const handler = setTimeout(async () => {
      const storeId = currentBusiness?.id || Number(id);
      if (dashboardSearchQuery.trim().length > 1 && !isNaN(storeId)) {
        setIsSearching(true);
        try {
          const results = await searchDashboard(storeId, dashboardSearchQuery);
          
          // Inject category matches (Navigation)
          const lowQuery = dashboardSearchQuery.toLowerCase();
          const navigationResults: any[] = [];
          
          if ("produits products items promo".includes(lowQuery) || "prod".includes(lowQuery)) {
            navigationResults.push({ id: 'nav-products', name: 'Gérer les Produits & Promos', type: 'nav', href: `/dashboard/${id}/products` });
          }
          if ("réservations bookings leads clients".includes(lowQuery) || "reser".includes(lowQuery)) {
            navigationResults.push({ id: 'nav-leads', name: 'Voir les Réservations & Commandes', type: 'nav', href: `/dashboard/${id}/leads` });
          }
          if ("avis reviews intelligence social".includes(lowQuery) || "avis".includes(lowQuery)) {
            navigationResults.push({ id: 'nav-intel', name: 'Analyser les Avis & Social Intel', type: 'nav', href: `/dashboard/${id}/intelligence` });
          }
          if ("profil profile settings business".includes(lowQuery)) {
            navigationResults.push({ id: 'nav-profile', name: 'Editer le Profil Boutique', type: 'nav', href: `/dashboard/${id}/profile` });
          }

          setDashboardResults({
            ...results,
            navigation: navigationResults
          } as any);
        } catch (e) {
          console.error('Dashboard search error:', e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setDashboardResults({ items: [], bookings: [], orders: [], reviews: [] });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [dashboardSearchQuery, id, currentBusiness?.id]);

  // Initialize lastSeenCounts from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`dashboard_seen_${id}`);
    if (saved) {
      try {
        setLastSeenCounts(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing lastSeenCounts:', e);
      }
    }
  }, [id]);

  useEffect(() => {
    async function initLayout() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        // 1. Fetch Profile
        const { data: profile } = await getUserProfile(authUser.id);
        if (profile) {
          setUser({
            id: authUser.id,
            name: profile.full_name || 'Commerçant',
            username: profile.email || '',
            initials: (profile.full_name || 'C').split(' ').map((n: string) => n[0]).join('').toUpperCase()
          });
        }

        // 2. Fetch Stores
        const { data: stores } = await getUserStores(authUser.id);
        if (stores) {
          const bizList = stores.map((s: any) => ({ id: s.id, name: s.name }));
          setBusinesses(bizList);

          const active = bizList.find(b => b.id === Number(id));
          if (active) setCurrentBusiness(active);
        }
      }
    }

    async function fetchStats() {
      if (id) {
        const res = await getSidebarStats(Number(id));
        setStats(res);
      }
    }

    initLayout();
    fetchStats();

    // Add auth listener to react to logout instantly
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [id]);

  interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { href: '/', label: 'Back to Marketplace', icon: <Home className="w-5 h-5" /> },
    { href: `/dashboard/${id}`, label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: `/dashboard/${id}/profile`, label: 'Business Profile', icon: <Briefcase className="w-5 h-5" /> },
    { href: `/dashboard/${id}/products`, label: 'Products & Promo', icon: <Package className="w-5 h-5" /> },
    { href: `/dashboard/${id}/reels`, label: 'Discovery & Stories', icon: <Video className="w-5 h-5" /> },
    { href: `/dashboard/${id}/leads`, label: 'Customer Actions', icon: <Bell className="w-5 h-5" />, badge: Math.max(0, stats.leads - (lastSeenCounts[`/dashboard/${id}/leads`] || 0)) },
    { href: `/dashboard/${id}/transactions`, label: 'Transactions', icon: <Home className="w-5 h-5" /> },
    { href: `/dashboard/${id}/intelligence`, label: 'Social Intelligence & Reviews', icon: <Sparkles className="w-5 h-5 text-purple-400" />, badge: Math.max(0, stats.reviews - (lastSeenCounts[`/dashboard/${id}/intelligence`] || 0)) },
    { href: `/dashboard/${id}/support/tickets`, label: 'Support & Messages', icon: <LifeBuoy className="w-5 h-5" /> },
  ];

  // Update lastSeenCounts when visiting a page
  useEffect(() => {
    const currentNavItem = navItems.find(item => item.href === pathname);
    if (currentNavItem && 'badge' in currentNavItem) {
      const category = pathname.split('/').pop() || '';
      const isReviewPage = category === 'reviews' || category === 'intelligence';
      const currentCount = isReviewPage ? stats.reviews : stats.leads;

      if (currentCount !== lastSeenCounts[pathname]) {
        const updated = { ...lastSeenCounts, [pathname]: currentCount };
        setLastSeenCounts(updated);
        localStorage.setItem(`dashboard_seen_${id}`, JSON.stringify(updated));
      }
    }
  }, [pathname, stats, id]);

  const isActive = (href: string) => {
    if (href === `/dashboard/${id}`) {
      return pathname === `/dashboard/${id}`;
    }
    return pathname.startsWith(href);
  };

  return (
    <UploadProvider>
      <div className="flex h-screen bg-[#050811] text-white overflow-hidden">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -80 }}
          animate={{ x: 0 }}
          className={cn(
            'hidden md:flex fixed md:relative z-40 h-screen flex-col transition-all bg-card border-r border-border',
            sidebarOpen ? 'w-64' : 'w-20'
          )}
        >
          <div className="flex items-center justify-center p-6 border-b border-white/10">
            {currentBusiness ? (
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
                {currentBusiness.name.substring(0, 2).toUpperCase()}
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
                RO
              </div>
            )}
          </div>

          <nav className={cn('flex-1 overflow-y-auto px-4 py-8 space-y-6 flex flex-col', sidebarOpen ? 'items-start' : 'items-center')}>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={item.label}
                  className={cn(
                    'relative flex items-center transition-all duration-300 group',
                    sidebarOpen ? 'justify-start w-full px-4 py-2' : 'justify-center w-14 h-14',
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  )}
                >
                  {item.icon}
                  {sidebarOpen && <span className="ml-3 text-sm font-medium truncate">{item.label}</span>}
                  {Boolean(item.badge && item.badge > 0) && !isActive(item.href) && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-black shadow-lg">
                      {item.badge}
                    </span>
                  )}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-4 px-3 py-1 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg text-xs font-bold text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </motion.button>
              </Link>
            ))}
          </nav>

          <div className={cn('p-4 border-t', sidebarOpen ? 'border-border' : 'border-border')}>
            <motion.button
              whileHover={{ scale: 1.1, rotate: -10 }}
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/');
                router.refresh();
              }}
              title="Logout"
              className={cn(
                'flex items-center justify-center rounded-2xl transition-all',
                sidebarOpen ? 'w-full py-2 justify-start px-4' : 'w-14 h-14'
              )}
            >
              <LogOut className="w-6 h-6" />
              {sidebarOpen && <span className="ml-3">Logout</span>}
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full -z-10" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full -z-10" />

          <header className="sticky top-0 h-16 border-b bg-card z-30 flex items-center px-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-white/5 rounded-md text-white/40 hover:text-white transition"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-white truncate">
                {(() => {
                  const parts = pathname.split('/').filter(Boolean);
                  const last = parts[parts.length - 1] || 'Dashboard';
                  return last.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                })()}
              </h1>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm">
                    {currentBusiness?.name || 'Sélectionnez...'} <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border border-border rounded-md p-1 min-w-[200px]">
                  {businesses.map(b => (
                    <DropdownMenuItem
                      key={b.id}
                      onClick={() => router.push(`/dashboard/${b.id}`)}
                      className="cursor-pointer flex items-center justify-between"
                    >
                      {b.name}
                      {b.id === Number(id) && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem
                    onClick={() => router.push('/merchants/business/add')}
                    className="cursor-pointer flex items-center gap-2 text-green-400 focus:text-green-300 focus:bg-green-500/10"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un établissement
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex-1 flex justify-center px-4 relative">
              <div className="relative w-full max-w-md group">
                <Search className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300",
                  isSearching ? "text-primary scale-110 drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "text-white/40"
                )} />
                <Input
                  placeholder="Rechercher réservations, avis, clients..."
                  className="pl-10 bg-white/5 border-white/10 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all rounded-xl h-10"
                  value={dashboardSearchQuery}
                  onChange={(e) => setDashboardSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && dashboardSearchQuery.trim()) {
                      router.push(`/dashboard/${id}/search?q=${encodeURIComponent(dashboardSearchQuery)}`);
                      setDashboardSearchQuery('');
                    }
                  }}
                />
                
                {/* Dashboard Search Results Dropdown - FIXED to bypass clipping */}
                {dashboardSearchQuery.trim().length > 1 && (
                  <div className="fixed top-[64px] left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0c101b] border border-white/10 rounded-b-2xl shadow-2xl overflow-hidden z-[100] backdrop-blur-2xl animate-in fade-in slide-in-from-top-1 duration-200 pointer-events-auto">
                    <div className="max-h-[420px] overflow-y-auto p-3 space-y-1 custom-scrollbar">
                      {isSearching ? (
                        <div className="p-12 text-center flex flex-col items-center gap-3">
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest animate-pulse">Recherche en cours...</span>
                        </div>
                      ) : (
                        <>
                          {/* Results list or Empty State */}
                          {Object.values(dashboardResults).every(arr => arr.length === 0) ? (
                            <div className="p-12 text-center">
                              <p className="text-sm text-white/40 font-medium">Aucun résultat trouvé pour "{dashboardSearchQuery}"</p>
                              <p className="text-[10px] text-white/20 mt-1 uppercase tracking-tighter">Essayez un autre mot-clé</p>
                            </div>
                          ) : (
                            <>
                              {/* Navigation Section (Direct Category Access) */}
                              {(dashboardResults as any).navigation?.length > 0 && (
                                <div className="mb-3">
                                  <div className="px-3 py-1.5 text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Zap className="w-3 h-3 fill-primary" /> Navigation Rapide
                                  </div>
                                  {(dashboardResults as any).navigation.map((nav: any) => (
                                    <button
                                      key={nav.id}
                                      onClick={() => {
                                        router.push(nav.href);
                                        setDashboardSearchQuery('');
                                      }}
                                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-primary/10 rounded-xl transition group/item border border-transparent hover:border-primary/20"
                                    >
                                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover/item:scale-110 transition-transform">
                                        <LayoutDashboard className="w-4 h-4" />
                                      </div>
                                      <span className="text-sm font-bold text-white group-hover/item:text-primary transition-colors">{nav.name}</span>
                                    </button>
                                  ))}
                                  <div className="h-px bg-white/5 my-2 mx-3" />
                                </div>
                              )}

                              {/* Items Section */}
                              {dashboardResults.items.length > 0 && (
                                <div className="mb-3">
                                  <div className="px-3 py-1.5 text-[10px] font-black text-primary/60 uppercase tracking-widest flex items-center gap-2">
                                    <Package className="w-3 h-3" /> Produits
                                  </div>
                                  {dashboardResults.items.map((item: any) => (
                                    <button
                                      key={item.id}
                                      onClick={() => {
                                        router.push(`/dashboard/${id}/products`);
                                        setDashboardSearchQuery('');
                                      }}
                                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-xl transition group/item"
                                    >
                                      <span className="text-sm font-medium text-white/80 group-hover/item:text-white">{item.name}</span>
                                      <span className="text-xs text-primary/60 font-mono">{item.price} DT</span>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Bookings/Orders Section */}
                              {(dashboardResults.bookings.length > 0 || dashboardResults.orders.length > 0) && (
                                <div className="mb-3">
                                  <div className="px-3 py-1.5 text-[10px] font-black text-white/30 uppercase tracking-widest">Réservations & Commandes</div>
                                  {[...dashboardResults.bookings, ...dashboardResults.orders].slice(0, 5).map((action: any) => (
                                    <button
                                      key={action.id}
                                      onClick={() => {
                                        router.push(`/dashboard/${id}/leads`);
                                        setDashboardSearchQuery('');
                                      }}
                                      className="w-full flex flex-col px-3 py-2 hover:bg-white/10 rounded-xl transition group/item text-left"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-white group-hover/item:text-primary transition-colors">{action.customer_name}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 uppercase font-bold tracking-tighter">
                                          {action.status}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-white/40">
                                        {action.total_price ? `${action.total_price} DT` : 'Réservation en attente'}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Reviews Section */}
                              {dashboardResults.reviews.length > 0 && (
                                <div>
                                  <div className="px-3 py-1.5 text-[10px] font-black text-white/30 uppercase tracking-widest">Avis Clients</div>
                                  {dashboardResults.reviews.map((rev: any) => (
                                    <button
                                      key={rev.id}
                                      onClick={() => {
                                        router.push(`/dashboard/${id}/intelligence`);
                                        setDashboardSearchQuery('');
                                      }}
                                      className="w-full flex flex-col px-3 py-2 hover:bg-white/5 rounded-xl transition group/item text-left"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-white/80 group-hover/item:text-white">{rev.author?.full_name || 'Anonyme'}</span>
                                        <div className="flex items-center gap-1">
                                          <Sparkles className="w-3 h-3 text-yellow-500" />
                                          <span className="text-xs text-yellow-500 font-bold">{rev.rating}</span>
                                        </div>
                                      </div>
                                      <p className="text-[10px] text-white/40 line-clamp-1 italic">"{rev.comment}"</p>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button asChild size="sm" variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
                <Link href={`/dashboard/${id}/support/tickets`}>Support</Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 rounded-md hover:bg-white/5 text-white/40 hover:text-white transition-all">
                    <Bell className="w-5 h-5" />
                    {(() => {
                      const unreadLeads = Math.max(0, stats.leads - (lastSeenCounts[`/dashboard/${id}/leads`] || 0));
                      const unreadReviews = Math.max(0, stats.reviews - (lastSeenCounts[`/dashboard/${id}/intelligence`] || 0));
                      const totalNotifications = unreadLeads + unreadReviews;
                      
                      if (totalNotifications > 0) {
                        return (
                          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-black text-white bg-gradient-to-r from-rose-500 to-pink-600 rounded-full shadow-lg shadow-rose-500/20">
                            {totalNotifications}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 bg-[#0c101b] border-white/10 p-2 rounded-2xl shadow-2xl backdrop-blur-xl mt-2" align="end">
                  <div className="p-4 border-b border-white/5">
                    <h3 className="font-black text-white text-sm uppercase tracking-widest">Notifications</h3>
                  </div>
                  <div className="py-2">
                    {(() => {
                      const unreadLeads = Math.max(0, stats.leads - (lastSeenCounts[`/dashboard/${id}/leads`] || 0));
                      const unreadReviews = Math.max(0, stats.reviews - (lastSeenCounts[`/dashboard/${id}/intelligence`] || 0));
                      
                      if (unreadLeads === 0 && unreadReviews === 0) {
                        return (
                          <div className="p-8 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest opacity-50">
                            Aucune nouvelle notification
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-1">
                          {unreadLeads > 0 && (
                            <DropdownMenuItem className="p-4 cursor-pointer focus:bg-white/5 rounded-xl group" onClick={() => router.push(`/dashboard/${id}/leads`)}>
                              <div className="flex items-center gap-4 w-full">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                  <Bell className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{unreadLeads} nouvelles actions clients</p>
                                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Commandes et réservations en attente</p>
                                </div>
                              </div>
                            </DropdownMenuItem>
                          )}
                          {unreadReviews > 0 && (
                            <DropdownMenuItem className="p-4 cursor-pointer focus:bg-white/5 rounded-xl group" onClick={() => router.push(`/dashboard/${id}/intelligence`)}>
                              <div className="flex items-center gap-4 w-full">
                                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                                  <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{unreadReviews} nouveaux avis clients</p>
                                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Analysez les retours par IA</p>
                                </div>
                              </div>
                            </DropdownMenuItem>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button asChild variant="ghost" size="icon" className="relative p-2 rounded-md hover:bg-white/5 text-white/40 hover:text-white transition-all">
                <Link href={`/dashboard/${id}/support/tickets`}>
                  <MessageCircle className="w-5 h-5" />
                </Link>
              </Button>

              <UserDropdown
                user={user || { name: 'Commerçant', username: '', initials: 'C' }}
                onAction={(action) => {
                  if (action === 'logout') {
                    const supabase = createClient();
                    supabase.auth.signOut().then(() => {
                      fetch('/api/auth/logout', { method: 'POST' }).then(() => {
                        router.push('/');
                        router.refresh();
                      });
                    });
                  }
                }}
              />
            </div>
          </header>

          <div className="flex-1 overflow-auto overflow-x-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                transition={{ 
                  duration: 0.25, 
                  ease: [0.23, 1, 0.32, 1] // Custom pro cubic-bezier
                }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 md:hidden z-30"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              className="fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border p-4 md:hidden overflow-y-auto"
            >
              <nav className="flex flex-col space-y-4">
                {navItems.map(item => (
                  <Link key={item.href} href={item.href} className={cn(
                    'flex items-center gap-2 p-2 rounded-md transition-colors',
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                  )}>
                    {item.icon}
                    <span className="text-sm truncate">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
        <Toaster position="top-right" richColors />
        <AIAgent storeId={id} />
        <UploadProgressManager />
      </div>
    </UploadProvider>
  );
}
