'use client';

import { useState } from 'react';
import { Star, Zap, Flame, ChevronDown, ChevronUp, MessageSquare, User, Phone as PhoneIcon } from 'lucide-react';
import { DatePicker } from './date-picker';
import { TimeSlotGrid, generateTimeSlots } from './time-slot-grid';
import { GuestSelector } from './guest-selector';
import { ReservationSummary } from './reservation-summary';
import { ReservationConfirmationModal } from './reservation-confirmation-modal';
import { ReservationData, ReservationCardProps } from './types';
import { createBooking, getStoreBookingsByDate } from '@/lib/actions/reservation';
import { format, addMinutes, parse } from 'date-fns';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function ReservationCard({
  businessId,
  businessName,
  rating,
  reviewCount,
  reservationFee = 0,
  currency = 'TND ',
  service,
  storeId,
  workingHours,
  onConfirm,
}: ReservationCardProps) {
  const [data, setData] = useState<ReservationData>({
    businessId,
    businessName,
    date: null,
    time: null,
    guests: 1,
    specialRequest: '',
    customerName: '',
    customerPhone: '',
  });

  const [showRequest,     setShowRequest]     = useState(false);
  const [isLoading,       setIsLoading]       = useState(false);
  const [confirmed,       setConfirmed]       = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const supabase = createClient();

  // Auto-fill user profile data if logged in
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('full_name, phone')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setData(prev => ({
            ...prev,
            customerName: prev.customerName || profile.full_name || '',
            customerPhone: prev.customerPhone || profile.phone || '',
          }));
        }
      }
    };
    fetchUserProfile();
  }, []);

  // Fetch bookings for the selected date to mark unavailable slots
  useEffect(() => {
    if (data.date && storeId) {
      const fetchBookings = async () => {
        try {
          const bookings = await getStoreBookingsByDate(storeId, format(data.date!, 'yyyy-MM-dd'));
          setExistingBookings(bookings);
        } catch (err) {
          console.error('Error fetching bookings:', err);
        }
      };
      fetchBookings();
    }
  }, [data.date, storeId]);

  const getDaySchedule = () => {
    // Fallback schedule if data is missing
    const defaultSchedule = { open: '08:00', close: '18:00', closed: false };
    
    if (!data.date) return null;
    if (!workingHours) return defaultSchedule;
    
    // Normalize keys to lowercase for robust lookup
    const normalizedHours: Record<string, any> = {};
    Object.entries(workingHours).forEach(([key, value]) => {
      normalizedHours[key.toLowerCase()] = value;
    });

    const enDay = format(data.date, 'eeee').toLowerCase();
    const frDays: Record<string, string> = {
      'monday': 'lundi', 'tuesday': 'mardi', 'wednesday': 'mercredi',
      'thursday': 'jeudi', 'friday': 'vendredi', 'saturday': 'samedi', 'sunday': 'dimanche'
    };
    const frDay = frDays[enDay];

    const foundSchedule = normalizedHours[enDay] || normalizedHours[frDay];
    
    // Return found schedule, or fallback to default if this specific day is missing in the object
    return foundSchedule || defaultSchedule;
  };

  const schedule = getDaySchedule();
  
  // Generate slots and mark as unavailable if already booked
  const rawSlots = (data.date && schedule && !schedule.closed) 
    ? generateTimeSlots(schedule.open, schedule.close, 60) 
    : [];

  const slots = rawSlots.map(slot => {
    const isBooked = existingBookings.some(b => b.start_time === slot.time);
    return {
      ...slot,
      available: slot.available && !isBooked
    };
  });

  const canReserve = !!data.date && !!data.time && !!data.customerName.trim() && !!data.customerPhone.trim();

  // Use service data if available, otherwise fallback to business data
  const displayRating = service?.rating_average ?? rating;
  const displayReviewCount = service?.total_reviews ?? reviewCount;
  const displayPrice = service?.price ?? 0;

  const handleReserve = async () => {
    if (!canReserve) return;
    setIsLoading(true);
    setError(null);

    try {
      if (!storeId || !service) {
        throw new Error("Informations sur l'établissement ou le service manquantes.");
      }

      // Calculate end_time based on start_time and service duration
      const startTimeDate = parse(data.time!, 'HH:mm', new Date());
      const endTimeDate = addMinutes(startTimeDate, service.duration_minutes ?? 30);
      const endTime = format(endTimeDate, 'HH:mm');

      const result = await createBooking({
        store_id: storeId,
        item_id: service.id,
        booking_date: format(data.date!, 'yyyy-MM-dd'),
        start_time: data.time!,
        end_time: endTime,
        duration_minutes: service.duration_minutes ?? 30,
        price: displayPrice,
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        notes: data.specialRequest || null,
        customer_email: null, // Optional for now
      });

      if (result.success) {
        if (onConfirm) {
          onConfirm(data);
        } else {
          setConfirmed(true);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue lors de la réservation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-[#e2e8f0] overflow-hidden">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {displayRating.toFixed(1)}
              <span className="text-slate-400 font-normal ml-0.5">({displayReviewCount} avis)</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <Zap className="w-3 h-3" /> Confirmation instantanée
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              <Flame className="w-3 h-3" /> Populaire aujourd'hui
            </div>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            <span className="font-semibold text-slate-600">Disponibilité garantie</span> pour la date choisie
          </p>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Customer Info (Mandatory) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom complet</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Votre nom"
                  value={data.customerName}
                  onChange={(e) => setData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone</label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="tel" 
                  placeholder="Votre numéro"
                  value={data.customerPhone}
                  onChange={(e) => setData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Date */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</p>
            <DatePicker
              selected={data.date}
              onChange={(date) => setData(prev => ({ ...prev, date, time: null }))}
            />
          </div>

          {/* Time slots — only after date selected */}
          {data.date && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Heure</p>
              <TimeSlotGrid
                slots={slots}
                selected={data.time}
                onSelect={(time) => setData(prev => ({ ...prev, time }))}
              />
              {slots.length === 0 && (
                <p className="text-center text-[10px] text-slate-400 italic bg-slate-50 py-3 rounded-xl border border-dashed border-slate-200">
                  Aucun créneau disponible pour ce jour.
                </p>
              )}
            </div>
          )}

          {/* Guests */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Invités</p>
            <GuestSelector
              value={data.guests}
              onChange={(guests) => setData(prev => ({ ...prev, guests }))}
            />
          </div>

          {/* Special request */}
          <div>
            <button
              type="button"
              onClick={() => setShowRequest(p => !p)}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Demande spéciale (optionnel)
              {showRequest
                ? <ChevronUp className="w-3.5 h-3.5" />
                : <ChevronDown className="w-3.5 h-3.5" />
              }
            </button>
            {showRequest && (
              <textarea
                value={data.specialRequest}
                onChange={e => setData(prev => ({ ...prev, specialRequest: e.target.value }))}
                placeholder="Ex : anniversaire, table en terrasse, chaise bébé…"
                rows={3}
                className="mt-2 w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none transition-all"
              />
            )}
          </div>

          {/* Summary */}
          {(data.date || data.time) && (
            <ReservationSummary data={{...data, businessId, businessName}} fee={reservationFee} currency={currency} price={displayPrice} />
          )}

          {error && (
            <p className="text-xs text-rose-500 font-bold text-center bg-rose-50 py-2 rounded-lg border border-rose-100">{error}</p>
          )}

          {/* Reserve button */}
          <button
            type="button"
            onClick={handleReserve}
            disabled={!canReserve || isLoading}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              canReserve && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-md shadow-blue-200'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Confirmation en cours…
              </>
            ) : canReserve
              ? 'Réserver maintenant'
              : !data.customerName.trim() || !data.customerPhone.trim()
                ? 'Complétez vos informations'
                : 'Choisissez une date et une heure'
            }
          </button>

          <p className="text-center text-xs text-slate-400">Aucun frais débité avant votre visite</p>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmed && (
        <ReservationConfirmationModal
          data={data}
          onClose={() => setConfirmed(false)}
        />
      )}
    </>
  );
}