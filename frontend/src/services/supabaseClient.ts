import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL)
  || 'https://rawheseawyxloytxymya.supabase.co';

export const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY)
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhd2hlc2Vhd3l4bG95dHh5bXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzODYzMjMsImV4cCI6MjEwMzk2MjMyM30.CXg0Z4TEyqH1Xm3pj6UXAW0rW6FiKG0Yb8vGowtcbTc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
