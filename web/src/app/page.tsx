
'use client';

import { useBookingViewModel } from '@/hooks/viewmodels/useBookingViewModel';
import { useState, useEffect } from 'react';


import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths, addDays } from 'date-fns';

export default function BookingPage() {
  const { state, actions } = useBookingViewModel();
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateStr, setDateStr] = useState('');

  // Calendar State
  const [viewDate, setViewDate] = useState(new Date()); 
  const [selectedDetailDate, setSelectedDetailDate] = useState<string | null>(null); // 클릭한 날짜 (상세보기용)

  // 1. 파서 결과 자동 반영
  useEffect(() => {
    if (state.parsedDate) {
      const formatted = format(state.parsedDate, 'yyyy-MM-dd');
      setDateStr(formatted);
      setViewDate(state.parsedDate);
    }
    if (state.parsedName) setName(state.parsedName);
    if (state.parsedPhone) setPhone(state.parsedPhone);
  }, [state.parsedDate, state.parsedName, state.parsedPhone]);

  // 폼 초기화 (성공 시)
  useEffect(() => {
    if (state.lastCompletedBooking) {
      setName('');
      setPhone('');
      setDateStr('');
      (document.getElementById('success-modal') as HTMLDialogElement)?.showModal();
    }
  }, [state.lastCompletedBooking]);

  const getGoogleCalendarUrl = (booking: { date: string, name: string }) => {
     // YYYY-MM-DD -> YYYYMMDD
     const startDate = new Date(booking.date);
     const endDate = addDays(startDate, 1);
     
     const startStr = format(startDate, 'yyyyMMdd');
     const endStr = format(endDate, 'yyyyMMdd');
     
     const title = `[NeoBooking] ${booking.name}님 예약`;
     const details = `예약자: ${booking.name}\n날짜: ${booking.date}`;
     
     return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(details)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fallback: Use parsed data if form is empty but parser has data
    const finalName = name || state.parsedName || '';
    const finalPhone = phone || state.parsedPhone || '';
    const finalDate = dateStr || (state.parsedDate ? format(state.parsedDate, 'yyyy-MM-dd') : '');

    if (!finalName || !finalPhone || !finalDate) {
      alert('모든 정보를 입력해주세요. (이름, 전화번호, 날짜)');
      return;
    }
    
    // Update local state for consistency (optional)
    if (!name) setName(finalName);
    if (!phone) setPhone(finalPhone);
    if (!dateStr) setDateStr(finalDate);

    actions.createBooking({ name: finalName, phone: finalPhone, date: finalDate });
  };

  // Calendar Logic (date-fns)
  const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

  const getCalendarDays = () => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  // 상세 보기용 필터링
  const getBookingsForDate = (date: string) => {
      return state.bookings.filter(b => b.date === date && b.status !== 'cancelled');
  };

  return (
    <main className="min-h-screen p-6 bg-[#020402] text-[#F0FDF4] font-sans flex flex-col items-center relative">
      
      {/* ... (Header & Check Button) ... */}
      <div className="w-full max-w-md flex justify-between items-center mb-8 mt-4">
        <h1 className="text-4xl font-bold tracking-tighter text-[#CCFF00]">
          NEO<br/>BOOKING
        </h1>
        <button 
          onClick={() => {
              (document.getElementById('calendar-modal') as HTMLDialogElement)?.showModal();
              // 모달 열 때 오늘 날짜 선택
              setSelectedDetailDate(format(new Date(), 'yyyy-MM-dd'));
          }}
          className="bg-[#0A1F13] text-[#CCFF00] border border-[#CCFF00] px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#CCFF00] hover:text-[#020402] transition-colors"
        >
          예약 확인
        </button>
      </div>

      <div className="w-full max-w-md mb-8">
        <label className="text-xs font-bold text-[#6B9C88] uppercase tracking-widest mb-2 block">
          빠른 예약 (Quick Request)
        </label>
        <input 
          type="text" 
          placeholder="예: 3월 15일 홍길동 010-1234-5678"
          className="w-full bg-[#0A1F13] border border-[#1F4031] p-4 text-lg text-[#F0FDF4] placeholder-[#1F4031] focus:border-[#CCFF00] focus:outline-none transition-all rounded-sm"
          onChange={(e) => actions.processTextInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // 폼 자동 제출 방지
                // TODO: 여기서 바로 제출하고 싶으면 폼 값 채워진거 확인 후 제출 로직 호출
            }
          }}
          value={state.inputText}
        />
        {state.parsedDate && (
          <div className="mt-2 flex flex-col gap-1">
             <p className="text-[#CCFF00] text-sm flex items-center gap-1">
              ⚡ 날짜 인식: {state.parsedDate.toLocaleDateString()}
            </p>
            {state.parsedName && <p className="text-[#6B9C88] text-xs">👤 이름: {state.parsedName}</p>}
            {state.parsedPhone && <p className="text-[#6B9C88] text-xs">📞 전화: {state.parsedPhone}</p>}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div className="space-y-1">
          <label htmlFor="date" className="text-xs font-bold text-[#6B9C88] uppercase">Date</label>
          <input 
            id="date"
            type="date" 
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full bg-[#020402] border border-[#1F4031] p-3 text-[#F0FDF4] focus:border-[#CCFF00] focus:outline-none rounded-none"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="name" className="text-xs font-bold text-[#6B9C88] uppercase">Name</label>
          <input 
            id="name"
            type="text" 
            placeholder="홍길동"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#020402] border border-[#1F4031] p-3 text-[#F0FDF4] focus:border-[#CCFF00] focus:outline-none rounded-none"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="phone" className="text-xs font-bold text-[#6B9C88] uppercase">Phone</label>
          <input 
            id="phone"
            type="tel" 
            placeholder="010-1234-5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-[#020402] border border-[#1F4031] p-3 text-[#F0FDF4] focus:border-[#CCFF00] focus:outline-none rounded-none"
          />
        </div>

        <button 
          type="submit"
          disabled={state.isLoading}
          className="w-full bg-[#CCFF00] text-[#020402] font-bold py-4 mt-6 text-lg hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#1F4031] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {state.isLoading ? '예약 중...' : '예약 하기'}
        </button>
      </form>

      <div className="w-full max-w-md mt-12 border-t border-[#1F4031] pt-8">
        <h2 className="text-[#6B9C88] font-bold text-sm mb-4">RECENT BOOKINGS</h2>
        {state.bookings.length === 0 ? (
          <p className="text-[#1F4031] text-sm italic">No bookings yet.</p>
        ) : (
          <ul className="space-y-3">
            {state.bookings.map((b) => (
              <li key={b.id} className="bg-[#0A1F13] border border-[#1F4031] p-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-[#F0FDF4]">{b.date}</p>
                  <p className="text-xs text-[#6B9C88]">{b.name}</p>
                </div>
                <span className={`text-xs px-2 py-1 border ${b.status === 'confirmed' ? 'border-[#CCFF00] text-[#CCFF00]' : 'border-red-500 text-red-500'}`}>
                  {b.status === 'confirmed' ? '예약' : '취소'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <dialog id="calendar-modal" className="bg-[#0A1F13] text-[#F0FDF4] border border-[#CCFF00] p-6 max-w-md w-full backdrop:bg-black/90 shadow-[0_0_50px_rgba(204,255,0,0.1)]">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
              <button aria-label="Previous Month" onClick={handlePrevMonth} className="text-[#CCFF00] text-xl font-bold p-2 hover:bg-[#1F4031]">&lt;</button>
              <h3 className="text-xl font-bold text-[#CCFF00]">
                  {format(viewDate, 'yyyy년 M월')}
              </h3>
              <button aria-label="Next Month" onClick={handleNextMonth} className="text-[#CCFF00] text-xl font-bold p-2 hover:bg-[#1F4031]">&gt;</button>
          </div>
          <form method="dialog">
            <button className="text-[#6B9C88] text-xs hover:text-[#CCFF00] uppercase font-bold tracking-widest">Close</button>
          </form>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center mb-2 border-b border-[#1F4031] pb-2">
           {['일','월','화','수','목','금','토'].map((d, i) => (
               <div key={i} className={`text-xs font-bold ${i === 0 ? 'text-red-500' : 'text-[#6B9C88]'}`}>{d}</div>
           ))}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-6">
          {getCalendarDays().map((date, i) => {
             const dateString = format(date, 'yyyy-MM-dd');
             const dayBookings = getBookingsForDate(dateString);
             const count = dayBookings.length;
             const isBooked = count > 0;
             const isCurrentMonth = isSameDay(date, startOfMonth(viewDate)) || (date >= startOfMonth(viewDate) && date <= endOfMonth(viewDate));
             const isToday = isSameDay(date, new Date());
             const isSelected = selectedDetailDate === dateString;

             return (
               <div key={i} 
                 onClick={() => setSelectedDetailDate(dateString)}
                 className={`
                 aspect-square flex flex-col items-center justify-center text-sm border transition-all cursor-pointer relative
                 ${!isCurrentMonth ? 'opacity-20' : ''}
                 ${isSelected ? 'border-[#F0FDF4] bg-[#1F4031]' : 'border-[#1F4031]'}
                 ${isBooked 
                    ? 'bg-[#1F2F1E] text-[#CCFF00] font-bold shadow-[inset_0_0_10px_#0A1F13]' // 예약됨 (스타일 복구 및 개선)
                    : 'text-[#F0FDF4] hover:bg-[#1F4031]'}
                 ${isToday ? 'ring-1 ring-white' : ''}
               `}>
                 <span>{format(date, 'd')}</span>
                 {isBooked && (
                   <span className="absolute bottom-1 right-1 bg-[#CCFF00] text-[#020402] text-[9px] font-bold px-1 rounded-sm w-4 h-4 flex items-center justify-center">
                     {count}
                   </span>
                 )}
               </div>
             )
          })}
        </div>

        {/* Selected Date Details */}
        <div className="border-t border-[#1F4031] pt-4 min-h-[120px]">
            {selectedDetailDate ? (
                <>
                    <h4 className="text-[#CCFF00] font-bold mb-3 flex justify-between items-center">
                        {selectedDetailDate} 상세
                        <button 
                            onClick={() => {
                                setDateStr(selectedDetailDate);
                                (document.getElementById('calendar-modal') as HTMLDialogElement).close();
                            }}
                            className="text-[10px] border border-[#6B9C88] px-2 py-1 text-[#6B9C88] hover:border-[#CCFF00] hover:text-[#CCFF00]"
                        >
                            이 날짜 선택
                        </button>
                    </h4>
                    
                    {getBookingsForDate(selectedDetailDate).length > 0 ? (
                        <ul className="space-y-2 max-h-[150px] overflow-y-auto">
                            {getBookingsForDate(selectedDetailDate).map(b => (
                                <li key={b.id} className="text-sm bg-[#0A1F13] p-2 flex justify-between items-center border-l-2 border-[#CCFF00]">
                                    <span>{b.name}</span>
                                    <span className={`text-xs ${b.status === 'confirmed' ? 'text-[#CCFF00]' : 'text-red-500'}`}>
                                        {b.status === 'confirmed' ? '예약' : '취소'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-[#6B9C88] text-sm italic">예약 내역이 없습니다.</p>
                    )}
                </>
            ) : (
                <p className="text-[#6B9C88] text-sm text-center pt-8">날짜를 클릭하여 상세 일정을 확인하세요.</p>
            )}
        </div>
      </dialog>

      <dialog id="success-modal" className="bg-[#CCFF00] text-[#020402] border-0 p-8 max-w-sm w-full shadow-[0_0_100px_rgba(204,255,0,0.5)] backdrop:bg-black/95">
        <div className="flex flex-col items-center text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-2xl font-bold mb-2">예약 완료!</h3>
            <p className="text-sm font-bold opacity-80 mb-6 max-w-[200px]">
                {state.lastCompletedBooking?.date} 일자로<br/>
                예약이 확정되었습니다.
            </p>

            {state.lastCompletedBooking && (
                <div className="w-full">
                    <p className="text-[10px] text-[#020402] opacity-60 mb-2 font-bold uppercase tracking-widest">Optional</p>
                    <a 
                      href={getGoogleCalendarUrl(state.lastCompletedBooking)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full border border-[#020402] text-[#020402] py-3 text-sm font-bold mb-4 hover:bg-[#020402] hover:text-[#CCFF00] transition-colors flex items-center justify-center gap-2"
                    >
                       <span>📅</span> 내 캘린더에 추가
                    </a>
                </div>
            )}
            
            <div className="border-t border-[#1F4031] pt-6 mb-6">
                 <h4 className="text-[#6B9C88] text-xs font-bold uppercase tracking-widest mb-3">예약 취소가 필요하신가요?</h4>
                 
                 {/* 1. 카카오톡 문의 */}
                 <a 
                    href="https://open.kakao.com/o/sExample" // TODO: 실제 오픈채팅 링크로 교체 필요
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#FAE100] text-[#3B1E1E] text-sm font-bold rounded-sm mb-4 hover:opacity-90 transition-opacity"
                 >
                    <span>💬</span> 카카오톡으로 문의하기
                 </a>

                 {/* 2. 직접 취소 */}
                 <details className="text-left w-full group">
                    <summary className="text-[10px] text-[#6B9C88] underline cursor-pointer hover:text-[#CCFF00] list-none">
                        ▼ 혹시 직접 취소하고 싶으신가요?
                    </summary>
                    <div className="mt-3 p-3 bg-[#0A1F13] border border-[#1F4031] rounded-sm">
                        <p className="text-xs text-[#F0FDF4] mb-2">예약 시 입력한 휴대폰 전번호 뒷 4자리</p>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                maxLength={4}
                                placeholder="1234"
                                className="flex-1 bg-[#020402] border border-[#1F4031] p-2 text-center text-[#CCFF00] font-bold outline-none focus:border-[#CCFF00]"
                                id="cancel-phone-input"
                                aria-label="Phone Last 4 Digits"
                            />
                            <button 
                                onClick={async () => {
                                    const input = (document.getElementById('cancel-phone-input') as HTMLInputElement).value;
                                    if (state.lastCompletedBooking?.id && state.lastCompletedBooking?.phone) {
                                        const success = await actions.cancelBooking(state.lastCompletedBooking.id, input, state.lastCompletedBooking.phone);
                                        if(success) actions.resetSuccessState();
                                    }
                                }}
                                className="bg-red-500/20 border border-red-500/50 text-red-500 px-3 py-2 text-xs font-bold hover:bg-red-500 hover:text-white transition-colors"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                 </details>
            </div>

            <form method="dialog">
                <button 
                    onClick={actions.resetSuccessState}
                    className="w-full bg-[#020402] text-[#CCFF00] py-3 text-sm font-bold uppercase hover:opacity-90 transition-opacity"
                >
                    확인 (닫기)
                </button>
            </form>
        </div>
      </dialog>

    </main>
  );
}
