'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getNotifications, getUnreadCount, Notification, markAsRead, markAllAsRead } from '@/lib/actions/notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [notifsRes, count] = await Promise.all([
      getNotifications(20),
      getUnreadCount()
    ]);

    if (notifsRes.success && notifsRes.data) {
      setNotifications(notifsRes.data);
    }
    setUnreadCount(count);
    setLoading(false);
  }, []);

  useEffect(() => {
    // 1. Initial Data Fetch
    fetchData();

    // 2. Auth Listener
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        fetchData();
      }
    });

    // 3. Realtime Listener Subscription
    let channel: any = null;
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('realtime_notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotif = payload.new as Notification;
            setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
            setUnreadCount((prev) => prev + 1);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchData();
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      authSub.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, fetchData]);

  const handleMarkAsRead = async (id: string) => {
    const res = await markAsRead(id);
    if (res.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    const res = await markAllAsRead();
    if (res.success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    refresh: fetchData
  };
}
