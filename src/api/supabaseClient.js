// Config + basic queries for DB.

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON;

export const supabase = createClient(url, anon, {
  realtime: { params: { eventsPerSecond: 10 } }
});
