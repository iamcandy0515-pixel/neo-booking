# ⚡ Supabase Setup & Troubleshooting Guide

> **CRITICAL**: Read this BEFORE creating tables or diagnosing data issues.
> **Last Updated**: 2026-01-31 (Post-Incident Review)

---

## 🛑 1. RLS (Row Level Security) - The Silent Killer

**Problem**: Data is inserted but `select()` returns empty array `[]` without error.
**Cause**: RLS is enabled, but no `SELECT` policy exists. Supabase default behavior is "Deny All" if RLS is on.

### ✅ Correct Table Creation SQL (Template)

Always use this pattern when creating public-facing tables:

```sql
-- 1. Create Table
create table bookings (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  phone text,
  date text,
  status text default 'pending'
);

-- 2. ENABLE RLS (Security)
alter table bookings enable row level security;

-- ⛔ CRITICAL STEP: Define Policies ⛔
-- Without these, your app receives EMPTY DATA.

-- Allow Public Read (Anonymous)
create policy "Public Read"
on bookings for select
to anon  -- or 'authenticated'
using (true);

-- Allow Public Insert (Anonymous)
create policy "Public Insert"
on bookings for insert
to anon
with check (true);
```

---

## 🌍 2. Environment Variables & Scripting

**Problem**: Node scripts (e.g., `check-db.js`) fail to connect (`Invalid API Key` or `Url`).
**Cause**: `process.env` is undefined because `dotenv` is not loaded in Node scripts (unlike Next.js which does it auto).

### ✅ Correct Script Pattern

Always explicitly load `.env.local`:

```javascript
// TOP of the file
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Check if loaded
if (!supabaseUrl) throw new Error("⚠️ .env.local not loaded!");
```

---

## 📅 3. Date & Timezone Handling

**Problem**: Calendar marks wrong day (off by one error).
**Cause**: Storing `YYYY-MM-DD` string is safer than `Date` object for simple bookings to avoid UTC/KST shifts.
**Rule**:

- DB Storage: User `text` type for date (e.g., `'2026-02-02'`) OR timestamp.
- Comparison: Use `date-fns` functions (`isSameDay`, `format`) instead of raw `===`.

---

<!--
# ⚠️ 수퍼베이스 설정 및 트러블슈팅 가이드 (한글 요약)

> **중요**: 테이블을 생성하거나 데이터가 안 보일 때 반드시 이 가이드를 먼저 읽으세요.
> **작성일**: 2026-01-31 (데이터 누락 사고 분석 기반)

---

## 🛑 1. RLS (행 수준 보안) - 침묵의 살인자

**문제상황**: 데이터는 분명히 넣었는데, `select()` 조회하면 에러 없이 빈 배열 `[]`만 나옴.
**원인**: RLS(보안)는 켜져 있는데, "누가 볼 수 있는지"에 대한 `SELECT` 정책이 없어서 그렇습니다. Supabase는 기본적으로 정책이 없으면 아무것도 안 보여줍니다(Deny All).

### ✅ 올바른 SQL 패턴 (필수)
새 테이블을 만들 때 아래 정책(Policy) 스크립트를 반드시 함께 실행해야 합니다:

1. **테이블 생성 및 RLS 켜기** (`enable row level security`)
2. **정책 추가 (가장 중요)**:
   - `create policy ... for select`: 이게 없으면 데이터 조회가 안 됨.
   - `create policy ... for insert`: 이게 없으면 예약 생성이 안 됨.
   *위의 영문 SQL 템플릿을 복사해서 쓰세요.*

---

## 🌍 2. 환경 변수와 스크립트 실행

**문제상황**: 터미널에서 `check-db.js` 같은 확인 스크립트를 돌리면 API Key 에러가 남.
**원인**: Next.js는 `.env.local`을 자동으로 불러오지만, 일반 Node 스크립트는 `dotenv` 라이브러리 없이 실행하면 환경 변수를 못 불러옵니다.

### ✅ 해결책
스크립트 파일 최상단에 항상 아래 코드를 넣으세요:
`require('dotenv').config({ path: '.env.local' });`

---

## 📅 3. 날짜 및 타임존 처리

**문제상황**: 2일에 예약했는데 달력에는 1일이나 3일에 표시됨.
**원인**: `Date` 객체는 UTC/Local 시간 변환 과정에서 하루가 밀릴 수 있습니다.
**해결책**:
- 단순 예약 시스템에서는 DB에 `'2026-02-02'` 처럼 **문자열(Text)**로 저장하는 것이 정신 건강에 좋습니다.
- 코드에서 비교할 때는 `===` 대신 `date-fns` 라이브러리의 `isSameDay()` 함수를 사용하세요.
-->
