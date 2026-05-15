'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleFollowStore(storeId: number | string) {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Vous devez être connecté pour suivre une boutique.');
  }

  let finalStoreId: number;

  if (typeof storeId === 'string' && isNaN(Number(storeId))) {
    // It's a slug, look up the ID
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', storeId)
      .single();
    
    if (!store) throw new Error('Boutique introuvable');
    finalStoreId = store.id;
  } else {
    finalStoreId = Number(storeId);
  }

  // Check if already following
  const { data: existing } = await (supabase
    .from('store_follows' as any)
    .select('id')
    .eq('user_id', user.id)
    .eq('store_id', finalStoreId)
    .maybeSingle() as any);

  if (existing) {
    // Unfollow
    const { error } = await (supabase
      .from('store_follows' as any)
      .delete()
      .eq('id', (existing as any).id) as any);

    if (error) throw new Error(error.message);
    
    revalidatePath(`/merchants/business/${storeId}`);
    return { followed: false };
  } else {
    // Follow
    const { error } = await (supabase
      .from('store_follows' as any)
      .insert({
        user_id: user.id,
        store_id: storeId
      }) as any);

    if (error) throw new Error(error.message);

    revalidatePath(`/merchants/business/${storeId}`);
    return { followed: true };
  }
}

export async function isFollowingStore(storeId: number | string) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  let finalStoreId: number;

  if (typeof storeId === 'string' && isNaN(Number(storeId))) {
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', storeId)
      .single();
    
    if (!store) return false;
    finalStoreId = store.id;
  } else {
    finalStoreId = Number(storeId);
  }

  const { data } = await (supabase
    .from('store_follows' as any)
    .select('id')
    .eq('user_id', user.id)
    .eq('store_id', finalStoreId)
    .maybeSingle() as any);

  return !!data;
}

/**
 * Get all stores followed by the user
 */
export async function getUserFollowedStores() {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return [];

  const { data, error } = await (supabase
    .from('store_follows' as any)
    .select(`
      id,
      created_at,
      stores (
        id,
        name,
        slug,
        category,
        address,
        rating_average,
        total_reviews,
        logo_url
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }) as any);

  if (error) {
    console.error('Error fetching followed stores:', error);
    return [];
  }

  return data || [];
}
