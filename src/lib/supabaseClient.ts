import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Create and export the Supabase client
// We are using the generic type <Database> which will be enhanced later
// when we generate types from the schema.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Example of how to use it later:
// import { supabase } from '@/lib/supabaseClient';
// const { data, error } = await supabase.from('customers').select('*');
