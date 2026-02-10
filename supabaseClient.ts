
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qyrooxplzemustdhoygg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5cm9veHBsemVtdXN0ZGhveWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzI0MjcsImV4cCI6MjA4NjMwODQyN30.cUP0e4wA6oqKsYU-fvad_aEqguovpqWwqG_4GJ7DKHg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
