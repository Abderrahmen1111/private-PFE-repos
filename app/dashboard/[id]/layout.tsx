'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '@/app/globals.css';
import { useParams, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Package,
  Star,
  Bell,
  Zap,
  Settings,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Home,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

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

  const navItems = [
    {
      href: '/',
      label: 'Back to Marketplace',
      icon: <Home className="w-5 h-5" />,
    },
    {
      href: `/dashboard/${id}`,
      label: 'Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      href: `/dashboard/${id}/profile`,
      label: 'Business Profile',
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      href: `/dashboard/${id}/products`,
      label: 'Products & Services',
      icon: <Package className="w-5 h-5" />,
      badge: 4,
    },
    {
      href: `/dashboard/${id}/reviews`,
      label: 'Reviews & Reputation',
      icon: <Star className="w-5 h-5" />,
      badge: 5,
    },
    {
      href: `/dashboard/${id}/leads`,
      label: 'Customer Actions',
      icon: <Bell className="w-5 h-5" />,
      badge: 7,
    },
    {
      href: `/dashboard/${id}/promotions`,
      label: 'Promotions & Offers',
      icon: <Zap className="w-5 h-5" />,
    },
    {
      href: `/dashboard/${id}/account`,
      label: 'Account & Subscription',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

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
        className="hidden md:flex fixed md:relative z-40 h-screen flex-col bg-white/5 backdrop-blur-3xl border-r border-white/10 w-24"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-center p-6 border-b border-white/10">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            RO
          </div>
        </div>

        {/* Navigation - Icons Only */}
        <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-6 flex flex-col items-center">
          {navItems.map((item, idx) => (
            <Link key={item.href} href={item.href}>
              <motion.button
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.95 }}
                title={item.label}
                className={cn(
                  'relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 group',
                  isActive(item.href)
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl shadow-blue-500/40 ring-1 ring-white/30'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                )}
              >
                {item.icon}
                {item.badge && !isActive(item.href) && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-black shadow-lg">
                    {item.badge}
                  </span>
                )}
                {/* Tooltip hint on hover */}
                <div className="absolute left-full ml-4 px-3 py-1 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg text-xs font-bold text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              </motion.button>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10">
          <motion.button
            whileHover={{ scale: 1.1, rotate: -10 }}
            title="Logout"
            className="flex items-center justify-center w-14 h-14 rounded-2xl transition-all text-white/40 hover:text-rose-400 hover:bg-rose-400/10"
          >
            <LogOut className="w-6 h-6" />
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full -z-10" />

        {/* Top Bar */}
        <header className="flex items-center justify-between px-8 py-6 bg-white/5 backdrop-blur-md border-b border-white/10 z-30">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:block p-3 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all ring-1 ring-transparent hover:ring-white/10"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-3 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-xl font-bold text-white tracking-tight">Overview</h2>
              <p className="text-xs text-white/30 font-medium">Business Performance Insight</p>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-sm font-bold text-white">Elegance Boutique</p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest leading-none">Pro Plan</p>
              </div>
            </div>
            <div className="relative group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg ring-2 ring-white/10 group-hover:ring-white/30 transition-all">
                EB
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-[#050811] rounded-full" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="h-full">{children}</div>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <Toaster position="top-right" richColors />
    </div>
  );
}
