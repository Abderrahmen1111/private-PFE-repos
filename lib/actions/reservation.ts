'use server';

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';
import { revalidatePath } from 'next/cache';
import { syncBookingTransaction } from './transactions';
import { analyzeFraud, saveFraudAnalysis } from './fraud-detection';
import { createNotification } from './notifications';

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
    // Sync to transactions immediately (even if PENDING)
    await syncBookingTransaction(booking, supabase);

    // ─── FRAUD ANALYSIS ───────────────────────────────────────────────────────
    try {
      const fraudAnalysis = await analyzeFraud({
        customer_id: user.id,
        store_id: data.store_id as number,
        item_id: data.item_id as number,
        total: data.price as number,
        entity_type: 'BOOKING'
      });
      await saveFraudAnalysis(booking.id, fraudAnalysis, 'BOOKING');
    } catch (fraudErr) {
      console.error('[createBooking] Fraud Analysis failed:', fraudErr);
    }
    // ──────────────────────────────────────────────────────────────────────────

    // Notify Store Owner
    await createNotification({
      userId: store.owner_id,
      title: 'Nouvelle réservation !',
      description: `Vous avez reçu une nouvelle demande de réservation ${bookingNumber} pour le ${data.booking_date} à ${data.start_time.split('T')[1]?.slice(0, 5) || ''}.`,
      type: 'BOOKING',
      link: `/dashboard/${data.store_id}/leads`,
      metadata: { bookingId: booking.id, storeId: data.store_id }
    });
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
import { createAdminClient } from '../supabase/admin';

export async function updateBookingStatus(
  bookingId: number, 
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
) {
  const supabase = createClient();
  const adminSupabase = createAdminClient();
  
  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Vous devez être connecté.');
  }

  console.log('[updateBookingStatus] Received bookingId:', bookingId, 'Status:', status, 'User:', user.id);

  if (!bookingId || isNaN(bookingId)) {
    throw new Error(`ID de réservation invalide: ${bookingId}`);
  }

  // 2. If it's a cancellation, verify ownership or store ownership
  if (status === 'CANCELLED') {
    const { data: booking, error: fetchError } = await adminSupabase
      .from('bookings')
      .select('customer_id, store_id')
      .eq('id', bookingId)
      .single();
    
    if (fetchError || !booking) {
      throw new Error('Réservation non trouvée.');
    }

    // Check if user is either the customer or the store owner
    const { data: store } = await adminSupabase
      .from('stores')
      .select('owner_id')
      .eq('id', booking.store_id)
      .single();

    const isCustomer = booking.customer_id === user.id;
    const isOwner = store?.owner_id === user.id;

    if (!isCustomer && !isOwner) {
      throw new Error('Vous n\'êtes pas autorisé à annuler cette réservation.');
    }
  }

  const updateData: any = { status, updated_at: new Date().toISOString() };
  
  if (status === 'CONFIRMED') {
    updateData.confirmed_at = new Date().toISOString();
    // Generate a unique tracking code for QR scanning
    const trackingCode = `QR-BOK-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`;
    updateData.tracking_code = trackingCode;
  }
  if (status === 'COMPLETED') updateData.completed_at = new Date().toISOString();

  // 3. Use admin client to bypass RLS
  const { data: results, error } = await adminSupabase
    .from('bookings')
    .update({ 
      ...updateData,
      status: status
    })
    .eq('id', bookingId)
    .select();

  if (error) {
    console.error('[updateBookingStatus] Admin update error:', error);
    throw new Error(`Erreur lors de la mise à jour : ${error.message}`);
  }

  if (!results || results.length === 0) {
    throw new Error(`Échec de la mise à jour de la réservation.`);
  }

  const data = results[0];

  if (data) {
    await syncBookingTransaction(data, adminSupabase as any);
  }

  if (data) {
    revalidatePath(`/dashboard/${data.store_id}/leads`);
  }
  revalidatePath(`/profile/user`); 
  revalidatePath(`/profile/cart`);
  
  if (data && data.customer_id) {
    const statusLabels: Record<string, string> = {
      'CONFIRMED': 'confirmée',
      'CANCELLED': 'annulée',
      'COMPLETED': 'terminée',
    };
    
    if (statusLabels[status]) {
      await createNotification({
        userId: data.customer_id,
        title: `Réservation ${statusLabels[status]}`,
        description: `Votre réservation ${data.booking_number} pour le ${data.booking_date} a été ${statusLabels[status]}.`,
        type: 'BOOKING',
        link: `/profile/user?view=bookings`,
        metadata: { bookingId: data.id, status }
      });
    }
  }

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

/**
 * Get booking by tracking code (QR token)
 * Used to retrieve booking details when QR code is scanned
 */
export async function getBookingByTrackingCode(trackingCode: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      stores (
        id,
        name,
        owner_id
      ),
      items (
        id,
        name,
        main_image
      )
    `)
    .eq('tracking_code', trackingCode)
    .eq('status', 'CONFIRMED')
    .single();

  if (error) {
    console.error('Error fetching booking by tracking code:', error);
    throw new Error('Réservation non trouvée ou déjà complétée');
  }

  return data as any;
}
