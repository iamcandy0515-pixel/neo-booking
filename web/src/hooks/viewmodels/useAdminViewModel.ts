
import { useState, useCallback, useEffect } from 'react';
import { BookingService } from '@/services/bookingService';
import { Booking } from '@/types/booking';

interface UseAdminViewModelState {
  bookings: Booking[];
  isLoading: boolean;
  isAuthenticated: boolean;
  passcode: string;
  filterStatus: 'all' | 'confirmed' | 'cancelled'; // 필터 상태 추가
}

export const useAdminViewModel = () => {
  const [state, setState] = useState<UseAdminViewModelState>({
    bookings: [],
    isLoading: false,
    isAuthenticated: false, 
    passcode: '',
    filterStatus: 'confirmed' // 기본값: 예약된 건만 보기
  });

  // 예약 불러오기 (인증된 경우에만)
  const fetchBookings = useCallback(async () => {
    if (!state.isAuthenticated) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const data = await BookingService.getAll();
      setState(prev => ({ ...prev, bookings: data, isLoading: false }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isAuthenticated]);

  // 비밀번호 확인 로직 (간편 인증)
  const checkPasscode = useCallback((input: string) => {
    // 실제 운영 시에는 환경변수나 DB값과 비교해야 함. 
    // MVP: '1234'로 하드코딩
    if (input === '1234') { 
        setState(prev => ({ ...prev, isAuthenticated: true, passcode: '' }));
    } else {
        alert('비밀번호가 틀렸습니다.');
    }
  }, []);

  const updateBookingStatus = useCallback(async (id: string, status: 'confirmed' | 'cancelled') => {
      if (status === 'cancelled') {
          if (!confirm('정말 이 예약을 취소하시겠습니까?')) return;
          
          try {
              await BookingService.cancelBooking(id);
              await fetchBookings(); // 목록 갱신
              alert('예약이 취소되었습니다.');
          } catch (err) {
              alert('취소 실패: ' + err);
          }
      } else {
          alert('아직 지원되지 않는 상태 변경입니다.');
      }
  }, [fetchBookings]);

  // 인증되면 데이터 로드
  useEffect(() => {
    if (state.isAuthenticated) {
        fetchBookings();
    }
  }, [state.isAuthenticated, fetchBookings]);

  return {
    state,
    actions: {
        setPasscode: (code: string) => setState(prev => ({ ...prev, passcode: code })),
        setFilterStatus: (status: 'all' | 'confirmed' | 'cancelled') => setState(prev => ({ ...prev, filterStatus: status })),
        checkPasscode,
        fetchBookings,
        updateBookingStatus
    }
  };
};
