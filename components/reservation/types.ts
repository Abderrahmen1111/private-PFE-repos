import { Item } from '@/lib/actions/items';

export interface TimeSlot {
  time: string;
  available: boolean;
  spotsLeft?: number; // undefined = fully available, 0 = full, 1-3 = few left
}

export interface ReservationData {
  businessId: string;
  businessName: string;
  date: Date | null;
  time: string | null;
  guests: number;
  specialRequest: string;
  customerName: string;
  customerPhone: string;
}

export interface WorkingHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface ReservationCardProps {
  onConfirm?: (data: ReservationData) => void;
  businessId: string;
  businessName: string;
  rating: number;
  reviewCount: number;
  reservationFee?: number;
  currency?: string;
  service?: Item;
  storeId?: number;
  workingHours?: Record<string, WorkingHours> | null;
}