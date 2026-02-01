
import { createClient } from '@supabase/supabase-js';

// Fallback to empty string to prevent immediate crash, handled by checks later
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('🔴 Critical: Supabase credentials missing in environment variables.');
}

// Ensure valid URL format or fallback to prevent createClient crash
const validUrl = supabaseUrl.startsWith('http') ? supabaseUrl : 'https://example.supabase.co';

export const supabase = createClient(validUrl, supabaseKey);
