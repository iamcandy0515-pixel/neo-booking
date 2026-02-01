
-- 📅 QR Booking Schema (PostgreSQL)
-- Last Updated: 2026-01-31
-- Description: Core bookings table with RLS for public access.

-- 1. Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Core Booking Info
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  date TEXT NOT NULL, -- Format: 'YYYY-MM-DD'
  
  -- Status & Extras
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  qr_code TEXT -- Public URL for the QR code
);

-- 3. Security (RLS) Setup
-- 🛑 CRITICAL: Must enable RLS and add policies, otherwise data is invisible.

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone to read bookings (for Calendar check)
-- (In production, you might want to limit this to valid dates only, but for MVP/Lite this is fine)
CREATE POLICY "Public Read"
ON bookings FOR SELECT
USING (true);

-- Policy 2: Allow anyone to create a booking
CREATE POLICY "Public Insert"
ON bookings FOR INSERT
WITH CHECK (true);

-- Not adding Update/Delete policies for Anonymous users prevents malicious deletion.
-- Updates should be done via Admin (Service Role) or authenticated Manager account.
