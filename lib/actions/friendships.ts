'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function sendFriendRequest(receiverId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Non authentifié' };
  if (user.id === receiverId) return { error: 'Vous ne pouvez pas vous inviter vous-même' };

  const { data, error } = await (supabase.from('friendships') as any)
    .insert([
      {
        user_id: user.id,
        friend_id: receiverId,
        status: 'PENDING'
      }
    ])
    .select()
    .single();

  if (!error) revalidatePath('/messages');
  return { data, error };
}

export async function unsendFriendRequest(targetId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Non authentifié' };

  const { error } = await (supabase.from('friendships') as any)
    .delete()
    .match({ user_id: user.id, friend_id: targetId, status: 'PENDING' });

  if (!error) revalidatePath('/messages');
  return { error };
}

export async function acceptFriendRequest(senderId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Non authentifié' };

  const { data, error } = await (supabase.from('friendships') as any)
    .update({ status: 'ACCEPTED', updated_at: new Date().toISOString() })
    .match({ user_id: senderId, friend_id: user.id })
    .select()
    .single();

  if (!error) revalidatePath('/messages');
  return { data, error };
}

export async function declineFriendRequest(senderId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Non authentifié' };

  const { error } = await (supabase.from('friendships') as any)
    .delete()
    .match({ user_id: senderId, friend_id: user.id });

  if (!error) revalidatePath('/messages');
  return { error };
}

export async function getFriendshipStatus(otherUserId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { status: null, direction: null };

  let { data, error } = await (supabase.from('friendships') as any)
    .select('*')
    .eq('user_id', user.id)
    .eq('friend_id', otherUserId)
    .maybeSingle();

  if (!data && !error) {
    const res = await (supabase.from('friendships') as any)
      .select('*')
      .eq('user_id', otherUserId)
      .eq('friend_id', user.id)
      .maybeSingle();
    data = res.data;
    error = res.error;
  }

  if (error || !data) return { status: null, direction: null };

  return {
    status: data.status as 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED',
    direction: data.user_id === user.id ? 'SENT' : 'RECEIVED',
    id: data.id
  };
}

export async function getPendingRequests() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await (supabase.from('friendships') as any)
    .select(`
      id,
      user_id,
      created_at,
      sender:users!friendships_user_id_fkey(id, full_name, avatar_url, city)
    `)
    .eq('friend_id', user.id)
    .eq('status', 'PENDING');

  if (error) {
    console.error('Error fetching pending requests:', error);
    return [];
  }

  return data || [];
}

export async function getFriends() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: sentAuth, error: sentError } = await (supabase.from('friendships') as any)
    .select('friend:users!friendships_friend_id_fkey(id, full_name, avatar_url)')
    .eq('user_id', user.id)
    .eq('status', 'ACCEPTED');

  const { data: receivedAuth, error: recError } = await (supabase.from('friendships') as any)
    .select('sender:users!friendships_user_id_fkey(id, full_name, avatar_url)')
    .eq('friend_id', user.id)
    .eq('status', 'ACCEPTED');
    
  if (sentError) console.error('Error fetching sent friends:', sentError);
  if (recError) console.error('Error fetching received friends:', recError);

  const friendsMap = new Map();

  if (sentAuth) {
    sentAuth.forEach((f: any) => {
      if (f.friend) friendsMap.set(f.friend.id, f.friend);
    });
  }
  
  if (receivedAuth) {
    receivedAuth.forEach((f: any) => {
      if (f.sender) friendsMap.set(f.sender.id, f.sender);
    });
  }

  return Array.from(friendsMap.values());
}
