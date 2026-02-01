'use client';

import { useAdminViewModel } from '@/hooks/viewmodels/useAdminViewModel';
import QRCode from 'react-qr-code';
import { format } from 'date-fns';

export default function AdminPage() {
  const { state, actions } = useAdminViewModel();

  // 1. 로그인 화면 (Protect)
  if (!state.isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#020402] text-[#F0FDF4] flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold text-[#CCFF00] mb-8">ADMIN</h1>
        <div className="w-full max-w-xs space-y-4">
            <input 
                type="password" 
                placeholder="Passcode (hint: 1234)"
                className="w-full bg-[#0A1F13] border border-[#1F4031] p-4 text-center text-xl tracking-widest focus:border-[#CCFF00] focus:outline-none"
                value={state.passcode}
                onChange={(e) => actions.setPasscode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && actions.checkPasscode(state.passcode)}
            />
            <button 
                onClick={() => actions.checkPasscode(state.passcode)}
                className="w-full bg-[#CCFF00] text-[#020402] font-bold py-4 hover:opacity-90 transition-opacity"
            >
                LOGIN
            </button>
        </div>
      </main>
    );
  }

  // 2. 대시보드 화면
  const bookingUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <main className="min-h-screen bg-[#020402] text-[#F0FDF4] p-6">
      <header className="flex justify-between items-center mb-8 border-b border-[#1F4031] pb-4">
        <h1 className="text-2xl font-bold text-[#CCFF00]">NEO ADMIN (관리자)</h1>
        <button onClick={() => window.location.reload()} className="text-xs text-[#6B9C88] hover:text-[#CCFF00]">로그아웃</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT: Booking List */}
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-[#6B9C88] font-bold text-sm uppercase tracking-widest">
                    예약 관리 ({state.bookings.filter(b => state.filterStatus === 'all' || b.status === state.filterStatus).length})
                </h2>
                <div className="flex bg-[#0A1F13] border border-[#1F4031] rounded-sm overflow-hidden">
                    <button 
                        onClick={() => actions.setFilterStatus('confirmed')}
                        className={`px-3 py-1 text-xs font-bold ${state.filterStatus === 'confirmed' ? 'bg-[#CCFF00] text-[#020402]' : 'text-[#6B9C88] hover:text-[#CCFF00]'}`}
                    >
                        예약중
                    </button>
                    <div className="w-[1px] bg-[#1F4031]"></div>
                    <button 
                        onClick={() => actions.setFilterStatus('cancelled')}
                        className={`px-3 py-1 text-xs font-bold ${state.filterStatus === 'cancelled' ? 'bg-[#CCFF00] text-[#020402]' : 'text-[#6B9C88] hover:text-[#CCFF00]'}`}
                    >
                        취소건
                    </button>
                    <div className="w-[1px] bg-[#1F4031]"></div>
                     <button 
                        onClick={() => actions.setFilterStatus('all')}
                        className={`px-3 py-1 text-xs font-bold ${state.filterStatus === 'all' ? 'bg-[#CCFF00] text-[#020402]' : 'text-[#6B9C88] hover:text-[#CCFF00]'}`}
                    >
                        전체
                    </button>
                </div>
            </div>

            <div className="bg-[#0A1F13] border border-[#1F4031] overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#1F2F1E] text-[#CCFF00]">
                        <tr>
                            <th className="p-3 w-24 whitespace-nowrap">날짜</th>
                            <th className="p-3 w-20 whitespace-nowrap">예약자</th>
                            <th className="p-3 whitespace-nowrap">연락처</th>
                            {state.filterStatus === 'cancelled' && <th className="p-3 w-24 whitespace-nowrap">취소/생성일</th>}
                            <th className="p-3 w-16 whitespace-nowrap">상태</th>
                            {state.filterStatus !== 'cancelled' && <th className="p-3 w-16 whitespace-nowrap">관리</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F4031]">
                        {state.bookings
                            .filter(b => state.filterStatus === 'all' || b.status === state.filterStatus)
                            .map((b) => (
                            <tr key={b.id} className="hover:bg-[#1F4031] transition-colors">
                                <td className="p-3 font-bold whitespace-nowrap">{b.date}</td>
                                <td className="p-3 whitespace-nowrap">{b.name}</td>
                                <td className="p-3 opacity-70 whitespace-nowrap">{b.phone}</td>
                                {state.filterStatus === 'cancelled' && (
                                    <td className="p-3 text-xs text-[#6B9C88] whitespace-nowrap">
                                        {/* TODO: DB에 cancelled_at 컬럼이 없으므로 임시로 created_at 표시하거나 지금은 비워둠 */}
                                        {/* MVP: 그냥 created_at이라도 보여줌 */}
                                        {new Date(b.created_at!).toLocaleDateString()}
                                    </td>
                                )}
                                <td className="p-3 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs border ${b.status === 'confirmed' ? 'border-[#CCFF00] text-[#CCFF00]' : 'border-red-500 text-red-500'}`}>
                                        {b.status === 'confirmed' ? '예약' : '취소'}
                                    </span>
                                </td>
                                {state.filterStatus !== 'cancelled' && (
                                    <td className="p-3 whitespace-nowrap">
                                        {b.status === 'confirmed' && (
                                            <button 
                                                onClick={() => actions.updateBookingStatus(b.id, 'cancelled')}
                                                className="text-xs text-red-400 hover:text-red-200 underline"
                                            >
                                                취소
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {state.bookings.filter(b => state.filterStatus === 'all' || b.status === state.filterStatus).length === 0 && (
                    <div className="p-8 text-center text-[#6B9C88] italic">데이터가 없습니다.</div>
                )}
            </div>
        </section>

        {/* RIGHT: QR Code Generator */}
        <section className="flex flex-col items-center">
            <h2 className="text-[#6B9C88] font-bold text-sm mb-4 uppercase tracking-widest">
                매장 QR 코드 (인쇄용)
            </h2>
            <div className="bg-white p-4 rounded-lg shadow-[0_0_30px_rgba(204,255,0,0.2)]">
                <div style={{ height: "auto", margin: "0 auto", maxWidth: 200, width: "100%" }}>
                    <QRCode
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        value={bookingUrl}
                        viewBox={`0 0 256 256`}
                    />
                </div>
            </div>

            <p className="mt-4 text-[#CCFF00] font-mono text-xs break-all border border-[#1F4031] p-2 bg-[#0A1F13]">
                {bookingUrl}
            </p>
            <p className="mt-2 text-[#6B9C88] text-xs text-center max-w-xs">
                이 QR 코드를 인쇄하여 매장에 비치하세요.<br/>고객이 스캔하면 예약 페이지로 연결됩니다.
            </p>
        </section>
      </div>
    </main>
  );
}
