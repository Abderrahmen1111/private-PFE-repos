'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export type NotificationType = 'ORDER' | 'MESSAGE' | 'SYSTEM' | 'BOOKING' | 'SUPPORT' | 'AI_RECOMMENDATION';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: NotificationType;
  link: string | null;
  is_read: boolean;
  metadata: any;
  created_at: string;
}

/**
 * Creates a new notification for a user AND sends a push notification
 * to all registered mobile devices for that user.
 * Truncates description to approximately 10 words if necessary.
 */
export async function createNotification(data: {
  userId: string;
  title: string;
  description?: string;
  type: NotificationType;
  link?: string;
  metadata?: any;
}) {
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Truncate description to ~10 words
  let processedDescription = data.description || '';
  const words = processedDescription.split(/\s+/);
  if (words.length > 10) {
    processedDescription = words.slice(0, 10).join(' ') + '...';
  }

  const { data: notification, error } = await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: data.userId,
      title: data.title,
      description: processedDescription,
      type: data.type,
      link: data.link,
      metadata: data.metadata || {},
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }

  // ── Fire-and-forget push notification to mobile ──────────────────────────────
  try {
    const { data: tokens } = await supabaseAdmin
      .from('user_push_tokens')
      .select('token')
      .eq('user_id', data.userId);

    if (tokens && tokens.length > 0) {
      const messages = tokens.map((row: { token: string }) => ({
        to: row.token,
        title: data.title,
        body: processedDescription || data.title,
        data: {
          type: data.type,
          link: data.link,
          notificationId: notification.id,
          ...(data.metadata || {}),
        },
        sound: 'default',
        channelId: 'default',
        priority: 'high',
      }));

      const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
      for (let i = 0; i < messages.length; i += 100) {
        const chunk = messages.slice(i, i + 100);
        await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(process.env.EXPO_ACCESS_TOKEN
              ? { Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}` }
              : {}),
          },
          body: JSON.stringify(chunk),
        }).catch((e) => console.error('[Push] send error:', e));
      }
    }
  } catch (pushError) {
    console.error('[Push] Failed to send push notification:', pushError);
  }

  return { success: true, data: notification };
}

/**
 * Fetches notifications for the current user.
 */
export async function getNotifications(limit = 20) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data, error } = await (supabase
    .from('notifications') as any)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error };
  }

  return { success: true, data: data as Notification[] };
}

/**
 * Marks a notification as read.
 */
export async function markAsRead(notificationId: string) {
  const supabase = createClient();
  
  const { error } = await (supabase
    .from('notifications') as any)
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error };
  }

  revalidatePath('/');
  return { success: true };
}

/**
 * Marks all notifications as read for the current user.
 */
export async function markAllAsRead() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await (supabase
    .from('notifications') as any)
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error };
  }

  revalidatePath('/');
  return { success: true };
}

/**
 * Gets the count of unread notifications.
 */
export async function getUnreadCount() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await (supabase
    .from('notifications') as any)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }

  return count || 0;
}
