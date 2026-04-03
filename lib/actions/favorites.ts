'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Toggle a store in the user's saved places
 */
export async function toggleSaveAction(storeId: number) {
  const supabase = createClient();
  
  // 1. Get current session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Vous devez être connecté pour enregistrer un établissement.');
  }

  // 2. Check if already saved
  const { data: existing } = await (supabase
    .from('saved_places') as any)
    .select('id')
    .eq('user_id', user.id)
    .eq('store_id', storeId)
    .maybeSingle();

  if (existing) {
    // Unguarded delete since RLS should handle user ownership
    const { error } = await (supabase
      .from('saved_places') as any)
      .delete()
      .eq('id', existing.id);

    if (error) throw new Error(error.message);
    
    revalidatePath(`/merchants/business/${storeId}`);
    return { saved: false };
  } else {
    // Add new save
    const { error } = await (supabase
      .from('saved_places') as any)
      .insert({
        user_id: user.id,
        store_id: storeId
      });

    if (error) throw new Error(error.message);

    revalidatePath(`/merchants/business/${storeId}`);
    return { saved: true };
  }
}

/**
 * Check if the current user has saved a specific store
 */
export async function isStoreSaved(storeId: number) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await (supabase
    .from('saved_places') as any)
    .select('id')
    .eq('user_id', user.id)
    .eq('store_id', storeId)
    .maybeSingle();

  return !!data;
}

/**
 * Fetch all saved places for the current user
 */
export async function getUserSavedPlaces() {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return [];

  const { data, error } = await (supabase
    .from('saved_places') as any)
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
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved places:', error);
    return [];
  }

  return data || [];
}
