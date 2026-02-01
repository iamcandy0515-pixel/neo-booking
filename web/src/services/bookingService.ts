
import { supabase } from './supabase';
import { Booking, CreateBookingDTO } from '@/types/booking';

export const BookingService = {
  // 예약 생성
  async create(data: CreateBookingDTO): Promise<Booking | null> {
    console.log('🚀 Sending booking request:', data);
    const { data: newBooking, error } = await supabase
      .from('bookings')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase Error:', error);
      console.error('Details:', error.details, error.hint, error.message);
      throw error;
    }

    console.log('✅ Booking created successfully:', newBooking);
    return newBooking;
  },

  // 모든 예약 조회 (테스트용)
  async getAll(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
    return data || [];
  },
  async cancelBooking(id: string): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;
  }
};
