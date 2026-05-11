'use client';

import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  Bell, 
  MessageSquare, 
  ShoppingBag, 
  Settings, 
  Circle, 
  CheckCircle2, 
  Calendar,
  MoreHorizontal,
  Sparkles
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'MESSAGE': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'ORDER': return <ShoppingBag className="w-4 h-4 text-green-500" />;
      case 'BOOKING': return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'AI_RECOMMENDATION': return <Sparkles className="w-4 h-4 text-amber-400" />;
      default: return <Bell className="w-4 h-4 text-stone-400" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative group/bell w-10 h-10 flex items-center justify-center rounded-2xl bg-[#11111198] hover:bg-[#111111d1] backdrop-blur-sm border border-white/10 transition-all duration-300">
          <Bell className="w-5 h-5 text-white/70 group-hover/bell:text-white transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-black animate-in zoom-in duration-300">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-[380px] rounded-3xl bg-black/90 backdrop-blur-2xl border border-white/10 shadow-2xl p-2" 
        align="end"
        sideOffset={12}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="p-0 text-base font-black text-white uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                markAllAsRead();
              }}
              className="text-[10px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
        
        <DropdownMenuSeparator className="bg-white/5 mx-2" />

        <div className="max-h-[450px] overflow-y-auto py-2 custom-scrollbar">
          {loading && (
            <div className="py-8 text-center text-white/20 text-xs font-bold uppercase tracking-widest">
              Chargement...
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="py-12 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <Bell className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Aucune notification
              </p>
            </div>
          )}

          {!loading && notifications.map((notif) => (
            <Link 
              key={notif.id} 
              href={notif.link || '#'}
              onClick={() => !notif.is_read && markAsRead(notif.id)}
            >
              <DropdownMenuItem 
                className={cn(
                  "flex flex-col items-start gap-1 p-4 rounded-2xl border transition-all cursor-pointer group mb-1 mx-1",
                  notif.type === 'AI_RECOMMENDATION' 
                    ? "bg-amber-500/5 border-amber-500/10 hover:bg-amber-500/10 hover:border-amber-500/20" 
                    : "border-transparent hover:border-white/5 focus:bg-white/5"
                )}
              >
                <div className="flex items-center justify-between w-full gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                      notif.type === 'AI_RECOMMENDATION' ? "bg-amber-500/20" : "bg-white/5 group-hover:bg-white/10"
                    )}>
                      {getIcon(notif.type)}
                    </div>
                    <span className={cn(
                      "text-[13px] font-black transition-colors",
                      notif.type === 'AI_RECOMMENDATION' ? "text-amber-200 group-hover:text-amber-100" : "text-white group-hover:text-red-400"
                    )}>
                      {notif.title}
                    </span>
                  </div>
                  {!notif.is_read && (
                    <Circle className={cn(
                      "w-2 h-2 fill-current",
                      notif.type === 'AI_RECOMMENDATION' ? "text-amber-500" : "text-red-500"
                    )} />
                  )}
                </div>
                
                {notif.description && (
                  <p className="text-[12px] text-white/50 line-clamp-2 pl-[38px] leading-relaxed">
                    {notif.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between w-full pl-[38px] mt-1">
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })}
                  </span>
                </div>
              </DropdownMenuItem>
            </Link>
          ))}
        </div>

        <DropdownMenuSeparator className="bg-white/5 mx-2" />
        
        <div className="p-2">
          <Link href="/profile/notifications">
            <button className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-all">
              Afficher toutes les notifications
            </button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
