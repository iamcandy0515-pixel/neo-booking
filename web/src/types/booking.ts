
export interface Booking {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  date: string; // YYYY-MM-DD
  status: 'pending' | 'confirmed' | 'cancelled';
  qr_code?: string;
}

export type CreateBookingDTO = Pick<Booking, 'name' | 'phone' | 'date'>;
