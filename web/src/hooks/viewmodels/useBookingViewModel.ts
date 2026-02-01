import { useState, useCallback, useEffect } from 'react';
import { BookingService } from '@/services/bookingService';
import { NaturalLanguageParser } from '@/services/naturalLanguageParser';
import { Booking, CreateBookingDTO } from '@/types/booking';

interface UseBookingViewModelState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  
  // Hybrid Interface State
  inputText: string;
  parsedDate: Date | null;
  parsedName?: string;
  parsedPhone?: string;
  detectedIntent: string | null;

  // Success State
  lastCompletedBooking: Booking | null;
}

export const useBookingViewModel = () => {
  const [state, setState] = useState<UseBookingViewModelState>({
    bookings: [],
    isLoading: false,
    error: null,
    inputText: '',
    parsedDate: null,
    parsedName: undefined,
    parsedPhone: undefined,
    detectedIntent: null,
    lastCompletedBooking: null,
  });

  // 예약 불러오기 Logic
  const fetchBookings = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const data = await BookingService.getAll();
      setState(prev => ({ ...prev, bookings: data, isLoading: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false, error: err.message }));
    }
  }, []);

  // 예약 생성 Logic
  const createBooking = useCallback(async (data: CreateBookingDTO) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const newBooking = await BookingService.create(data);
      await fetchBookings(); // 목록 갱신
      
      // 성공 상태 업데이트 (Alert 대신 UI 표시용)
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        inputText: '', 
        parsedDate: null,
        lastCompletedBooking: newBooking 
      }));
      
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false, error: err.message }));
      alert('예약 실패: ' + err.message);
    }
  }, [fetchBookings]);

  // 예약 취소 Logic
  const cancelBooking = useCallback(async (id: string, phoneLast4: string, fullPhone: string) => {
    // 폰번호 검증 (010-1234-5678 -> 5678)
    const storedLast4 = fullPhone.replace(/-/g, '').slice(-4);
    if (storedLast4 !== phoneLast4) {
        alert('전화번호 뒷자리가 일치하지 않습니다.');
        return false;
    }

    if (!confirm('정말 예약을 취소하시겠습니까?')) return false;

    setState(prev => ({ ...prev, isLoading: true }));
    try {
        await BookingService.cancelBooking(id);
        await fetchBookings(); // 새로고침
        setState(prev => ({ ...prev, isLoading: false }));
        alert('예약이 정상적으로 취소되었습니다.');
        return true;
    } catch (err: any) {
        setState(prev => ({ ...prev, isLoading: false, error: err.message }));
        alert('취소 실패: ' + err.message);
        return false;
    }
  }, [fetchBookings]);

  // 성공 모달 닫기
  const resetSuccessState = useCallback(() => {
    setState(prev => ({ ...prev, lastCompletedBooking: null }));
  }, []);

  const processTextInput = useCallback((text: string) => {
    setState(prev => ({ ...prev, inputText: text }));
    
    // 파싱 실행
    const result = NaturalLanguageParser.parse(text);
    
    // 항상 최신 파싱 결과 반영
    setState(prev => ({ 
        ...prev, 
        parsedDate: result.date,
        parsedName: result.name,
        parsedPhone: result.phone,
        detectedIntent: result.intent || (result.date ? 'book' : null)
    }));
  }, []);

  // INIT: Load bookings on mount
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    state,
    actions: {
      fetchBookings,
      createBooking,
      cancelBooking,
      processTextInput,
      resetSuccessState, 
    },
  };
};
