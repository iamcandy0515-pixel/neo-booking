# 📅 Project Plan: QR Booking Lite (MVP)

> **Goal**: Build a frictionless QR-based booking web app using Next.js (MVVM), Supabase, and Vercel.  
> **Key Features**: Acid Lime/Dark Mode UI, No-Login Booking, Admin Dashboard.

## 🏗️ Tech Stack & Architecture

- **Framework**: **Next.js 16.1.3** (App Router)
    - _Note_: Design and implementation MUST align with features available in v16.1.3.
- **Architecture**: Hook-based React-MVVM (Strict `CODEBASE.md` adherence)
- **Styling**: Tailwind CSS v4 (Neo-Nature Theme)
- **Database**: Supabase (PostgreSQL + Realtime)
- **Deploy**: Vercel

---

## ✅ Phase 1: Foundation & Setup

- [ ] **1.1 Project Structure Update**: Create `hooks/viewmodels`, `services`, `types` folders. → Verify: Folders exist.
- [ ] **1.2 Supabase Client Setup**: Install `@supabase/supabase-js`, config env vars. → Verify: Client connects.
- [ ] **1.3 Database Schema**: Create `bookings` table (id, name, phone, date, status). → Verify: Table exists in Supabase Dashboard.

## 🚀 Phase 2: Core Feature (Hybrid Interface)

- [x] **2.1 Booking Service**: Implement `BookingService.create()` and `getAvailableSlots()`. → Verify: Can add/fetch data via script.
- [x] **2.2 Parser Logic**: Install `chrono-node`. Create `NaturalLanguageParser` service.
    - **Update**: Added Regex Fallback for "X월 X일" & Name/Phone Extraction.
    - → Verify: "3월 15일 홍길동 010-1234-5678" -> All fields parsed.
- [x] **2.3 Booking ViewModel**: Update `useBookingViewModel` to handle BOTH form data AND text input.
    - **Update**: Added `processTextInput` to sync parsed result to state.
    - → Verify: Text input updates state.
- [x] **2.4 Booking Page UI (Hybrid)**:
    - Top: Chat-like Input ("빠른 예약") w/ visual feedback.
    - Bottom: Date Picker & Form (Auto-filled by parser).
    - **Logic**: Enter key prevented. "Smart Submit" uses parsed data if form is empty.
    - → Verify: Typing "3월 15일" automatically selects March 15th on the picker.
- [x] **2.5 Success Page**: Success Modal with "Add to Google Calendar" (Optional).
    - → Verify: Redirects/Modals show after booking.

## 🛡️ Phase 3: Admin & QR (Manager)

- [x] **3.1 Admin Login**: Simple hardcoded Passcode ('1234') protection. → Verify: Protected route works.
- [x] **3.2 Booking List UI**: Dashboard table (Date/Name/Phone/Status). Added Cancel button.
    - **Update**: Status simplified to 'confirmed'/'cancelled'.
    - **Update**: Added Tabs to filter by [Confirmed], [Cancelled], [All].
    - → Verify: List renders data, Cancel updates status.
- [x] **3.3 QR Generator**: `react-qr-code` added. Generates current URL code. → Verify: QR scans correctly.

## 🏁 Phase 4: Polish & Deploy

- [ ] **4.1 Validation**: Run `checklist.py`. Fix MVVM violations. → Verify: Clean report.
- [ ] **4.2 Deployment**: Push to GitHub, Link to Vercel. → Verify: Live URL accessible.

---

## 📝 Notes

- **MVVM Rule**: `page.tsx` MUST NOT contain `async` logic or `useEffect`. All legacy logic to `viewmodel`.

## ⚠️ Critical Implementation Notes (Post-Test)

> **Lessons Learned during Phase 2 Debugging**

1.  **Supabase RLS is "Deny All" by default**:
    - Even with `ENABLE RLS`, if you don't add a `SELECT` policy, `supabase.from().select()` returns `[]` (empty) silently.
    - **Fix**: Always run `CREATE POLICY "Public Read" ...` immediately after creating table.
    - _Reference_: `c:\Booking\SUPABASE_GUIDE.md`

2.  **Date Handling & Timezones**:
    - `new Date()` in JS causes UTC/Local shifts (e.g., booked for 2nd, shows as 1st).
    - **Fix**: Store dates as `TEXT` ('YYYY-MM-DD') in DB. Use `date-fns` (`format`, `isSameDay`) for all comparisons.

3.  **ViewModel Initialization**:
    - ViewModels don't auto-fetch unless explicitly told to.
    - **Fix**: Add an internal `useEffect` inside `useBookingViewModel` to call `fetchBookings()` on mount.

4.  **Env Vars in Scripts**:
    - `node script.js` does NOT load `.env.local` automatically.
    - **Fix**: Must use `require('dotenv').config({path: '.env.local'})` at the top of any standalone script.

<!--
# 📅 프로젝트 계획: QR 예약 라이트 (MVP)

> **목표**: Next.js (MVVM), Supabase, Vercel을 사용하여 설치 없는 QR 기반 예약 웹 앱 구축.
> **핵심 기능**: 애시드 라임/다크 모드 UI, 로그인 없는 간편 예약, 관리자 대시보드.

## 🏗️ 기술 스택 & 아키텍처
- **프레임워크**: **Next.js 16.1.3** (App Router)
    - *참고*: 설계 및 구현은 반드시 v16.1.3 기능에 맞춰 진행해야 함.
- **아키텍처**: Hook 기반 React-MVVM (`CODEBASE.md` 엄격 준수)
- **스타일링**: Tailwind CSS v4 (Neo-Nature 테마)
- **데이터베이스**: Supabase (PostgreSQL + Realtime)
- **배포**: Vercel

---

## ✅ 1단계: 기초 & 설정
- [ ] **1.1 프로젝트 구조 업데이트**: `hooks/viewmodels`, `services`, `types` 폴더 생성. → 확인: 폴더 존재 여부.
- [ ] **1.2 Supabase 클라이언트 설정**: `@supabase/supabase-js` 설치, 환경 변수 설정. → 확인: 클라이언트 연결 성공.
- [ ] **1.3 데이터베이스 스키마**: `bookings` 테이블 생성 (id, 이름, 전화번호, 날짜, 상태). → 확인: 대시보드에서 테이블 확인.

## 🚀 2단계: 핵심 기능 (하이브리드 인터페이스)
- [x] **2.1 예약 서비스**: `BookingService.create()` 및 `getAvailableSlots()` 구현. → 확인: 스크립트로 데이터 추가/조회 가능.
- [x] **2.2 파서 로직**: `chrono-node` 설치. `NaturalLanguageParser` 서비스 생성.
    - **업데이트**: "X월 X일" 정규식 백업 & 이름/전화번호 추출 기능 추가.
    - → 확인: "3월 15일 홍길동 010-1234-5678" 입력 시 모든 필드 자동 인식.
- [x] **2.3 예약 뷰모델**: 폼 데이터와 텍스트 입력을 모두 처리하도록 업데이트. 상태 동기화 로직 추가.
- [x] **2.4 예약 페이지 UI (하이브리드)**:
    - 상단: 채팅형 입력창 ("빠른 예약") 및 인식 피드백.
    - 하단: 날짜 선택기 & 폼 (자동 입력).
    - **로직**: 엔터 키 제출 방지. 폼이 비어있어도 파서 데이터로 "스마트 제출".
    - → 확인: 입력 시 선택기가 자동으로 날짜 선택.
- [x] **2.5 완료 페이지**: 구글 캘린더 추가(선택) 기능이 있는 완료 모달.

## 🛡️ 3단계: 관리자 & QR (매니저용)
- [x] **3.1 관리자 로그인**: 간단한 하드코딩된 패스코드('1234') 보호. → 확인: 보호된 경로 작동.
- [x] **3.2 예약 목록 UI**: 대시보드 테이블 (날짜/이름/연락처/상태). 취소 버튼 추가.
    - **업데이트**: 상태를 '확정'/'취소됨'으로 단순화.
    - **업데이트**: [예약중], [취소건], [전체] 탭 필터링 추가.
    - → 확인: 데이터 목록 렌더링, 취소 시 상태 업데이트.
- [x] **3.3 QR 생성기**: `react-qr-code` 추가. 현재 URL용 QR 코드 생성. → 확인: QR 스캔 정상 작동.

## 🏁 4단계: 다듬기 & 배포
- [ ] **4.1 검증**: `checklist.py` 실행. MVVM 위반 사항 수정. → 확인: 클린 리포트.
- [ ] **4.2 배포**: GitHub 푸시, Vercel 연동. → 확인: 라이브 URL 접속 가능.

---

## 📝 참고 사항
- **MVVM 규칙**: `page.tsx`에는 `async` 로직이나 `useEffect`가 포함되어서는 안 됨. 모든 레거시 로직은 `viewmodel`로 이동.
- **UI 규칙**: `Neo-Nature` 컬러(`#CCFF00`/`#020402`)와 Sharp 지오메트리 엄격 준수.
-->
