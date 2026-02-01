
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '.env.local'}); // Adjust path to env file

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Connecting to Supabase...');
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching bookings:', error);
    } else {
        console.log('✅ Current Booking Records:', data.length);
        console.log(JSON.stringify(data, null, 2));
    }
}

check();
