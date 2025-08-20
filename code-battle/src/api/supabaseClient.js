// Config + basic queries for DB.

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error('Missing Supabase env vars. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON in .env')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
