'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '@/app/globals.css';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Package,
  Bell,
  Zap,
  Settings,
  Menu,
  ChevronDown,
  LogOut,
  Home,
  Search,
  MessageCircle,
  Video,
  LifeBuoy,
  Mail,
  CreditCard,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { UserDropdown } from '@/components/ui/user-dropdown';
import { cn } from '@/lib/utils';
import { Toaster, toast } from 'sonner';
import AIAgent from '@/components/ai-agent/AIAgent';
import { getSidebarStats } from '@/lib/actions/overviews';

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

  // business switcher state
  const businesses = ['Elegance Boutique', 'Modern Salon'];
  const [currentBusiness, setCurrentBusiness] = useState(businesses[0]);

  const [stats, setStats] = useState({ reviews: 0, leads: 0 });
  const [lastSeenCounts, setLastSeenCounts] = useState<Record<string, number>>({});

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
    async function fetchStats() {
      if (id) {
        const res = await getSidebarStats(Number(id));
        setStats(res);
      }
    }
    fetchStats();
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
    { href: `/dashboard/${id}/products`, label: 'Products & Services', icon: <Package className="w-5 h-5" /> },
    { href: `/dashboard/${id}/reels`, label: 'Discovery Reels', icon: <Video className="w-5 h-5" /> },
    { href: `/dashboard/${id}/leads`, label: 'Customer Actions', icon: <Bell className="w-5 h-5" /> },
    { href: `/dashboard/${id}/promotions`, label: 'Promotions & Offers', icon: <Zap className="w-5 h-5" /> },
    { href: `/dashboard/${id}/support/tickets`, label: 'Client Support', icon: <LifeBuoy className="w-5 h-5" /> },
    { href: `/dashboard/${id}/support/chat`, label: 'Messages', icon: <Mail className="w-5 h-5" /> },
    { href: `/dashboard/${id}/account`, label: 'Account & Subscription', icon: <Settings className="w-5 h-5" /> },
    { href: `/dashboard/${id}/transactions`, label: 'Transactions', icon: <Home className="w-5 h-5" /> },
    { href: `/dashboard/${id}/refunds`, label: 'Refunds', icon: <CreditCard className="w-5 h-5" /> },
    { href: `/dashboard/${id}/reviews`, label: 'Reviews', icon: <MessageSquare className="w-5 h-5" />, badge: Math.max(0, stats.reviews - (lastSeenCounts[`/dashboard/${id}/reviews`] || 0)) },
  ];

  // Update lastSeenCounts when visiting a page
  useEffect(() => {
    const currentNavItem = navItems.find(item => item.href === pathname);
    if (currentNavItem && 'badge' in currentNavItem) {
      const category = pathname.split('/').pop() || '';
      const currentCount = category === 'reviews' ? stats.reviews : stats.leads;

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
    <div className="flex h-screen bg-[#050811] text-white">
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
            <img
              src={`/logos/${currentBusiness.replace(/\s+/g, '-').toLowerCase()}.png`}
              alt="Logo"
              className="w-12 h-12 rounded-2xl object-cover"
              onError={(e) => {(e.target as HTMLImageElement).src = '/coming-soon.webp';}}
            />
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
                  {currentBusiness} <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border border-border rounded-md p-1">
                {businesses.map(b => (
                  <DropdownMenuItem
                    key={b}
                    onClick={() => setCurrentBusiness(b)}
                    className="cursor-pointer"
                  >
                    {b}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex-1 flex justify-center px-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              <Input
                placeholder="Search reservations, reviews, customers..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button size="sm">Support</Button>

            <button className="relative p-2 rounded-md hover:bg-white/5 text-white/40 hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
                3
              </span>
            </button> 

            <button className="relative p-2 rounded-md hover:bg-white/5 text-white/40 hover:text-white">
              <MessageCircle className="w-5 h-5" />
            </button>

            <UserDropdown
              user={{ name: 'John Doe', username: '@jdoe', initials: 'JD' }}
              onAction={(action) => {
                console.log('profile action', action);
              }}
            />
          </div> 
        </header>

        <div className="flex-1 overflow-auto">
          <div className="h-full">{children}</div>
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
    </div>
  );
}
