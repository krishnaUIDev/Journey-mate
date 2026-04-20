import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Next.js prerenders pages during build. If environment variables are missing (e.g., in CI or during static analysis),
// createClient will throw "supabaseUrl is required". We ensure the client is only created with valid credentials.
// We export a proxy or a nullable client, but since many components import this directly, 
// we'll use a conditional approach that's safe for module evaluation.

export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== '')
    ? createClient(supabaseUrl, supabaseAnonKey)
    : (null as any);

if (!supabase && typeof window !== 'undefined') {
    console.warn('Supabase client initialized with missing credentials. Database calls will fail.');
}
