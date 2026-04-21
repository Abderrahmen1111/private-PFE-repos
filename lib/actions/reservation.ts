'use server';

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';
import { revalidatePath } from 'next/cache';
import { syncBookingTransaction } from './transactions';

export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type BookingRow = Database['public']['Tables']['bookings']['Row'];

/**
 * Create a new booking
 */
export async function createBooking(data: Omit<BookingInsert, 'booking_number' | 'status' | 'customer_id'>) {
  const supabase = createClient();
  
  // 1. Get current session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Vous devez être connecté pour réserver.');
  }

  // 2. Check if the user is the owner of the store
  const { data: store, error: storeError } = await (supabase
    .from('stores') as any)
    .select('owner_id')
    .eq('id', data.store_id)
    .single();

  if (storeError || !store) {
    throw new Error('Store non trouvé.');
  }

  if (store.owner_id === user.id) {
    throw new Error('Vous ne pouvez pas réserver dans votre propre boutique.');
  }

  // Generate a unique booking number: BK-XXXXXX-XXXX
  const bookingNumber = `BK-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const { data: booking, error } = await (supabase
    .from('bookings') as any)
    .insert({
      ...data,
      customer_id: user.id,
      booking_number: bookingNumber,
      status: 'PENDING',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating booking:', error);
    throw new Error(`Erreur lors de la réservation : ${error.message}`);
  }

  if (booking) {
    await syncBookingTransaction(booking, supabase);
  }

  revalidatePath(`/merchants/business/${data.store_id}`);
  return { success: true, booking };
}

/**
 * Get all bookings for a specific store/business
 */
export async function getBusinessBookings(storeId: number) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('store_id', storeId)
    .order('booking_date', { ascending: false });

  if (error) {
    console.error('Error fetching business bookings:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Get all bookings for a specific customer
 */
export async function getUserBookings(customerId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      stores (
        name,
        logo_url
      ),
      items (
        name,
        main_image
      )
    `)
    .eq('customer_id', customerId)
    .order('booking_date', { ascending: false });

  if (error) {
    console.error('Error fetching user bookings:', error);
    throw new Error(error.message);
  }

  return data as any[];
}

/**
 * Update the status of a booking
 */
export async function updateBookingStatus(
  bookingId: number, 
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
) {
  const supabase = createClient();

  const updateData: any = { status, updated_at: new Date().toISOString() };
  
  if (status === 'CONFIRMED') updateData.confirmed_at = new Date().toISOString();
  if (status === 'COMPLETED') updateData.completed_at = new Date().toISOString();

  const { data, error } = await (supabase
    .from('bookings') as any)
    .update({ 
      ...updateData,
      status: status
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (data) {
    await syncBookingTransaction(data, supabase);
  }

  revalidatePath(`/dashboard/${data.store_id}/leads`);
  revalidatePath(`/profile/user`); // Also update customer view
  return data;
}

/**
 * Get all bookings for a specific store on a specific date
 */
export async function getStoreBookingsByDate(storeId: number, date: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('bookings')
    .select('start_time, end_time, status')
    .eq('store_id', storeId)
    .eq('booking_date', date)
    .neq('status', 'CANCELLED');

  if (error) {
    console.error('Error fetching bookings by date:', error);
    return [];
  }

  return data || [];
}
