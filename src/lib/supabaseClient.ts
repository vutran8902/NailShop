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
// Define the Database type
type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; // UUID
          email: string;
          full_name: string | null;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          id: string; // UUID
          email: string;
          full_name?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string; // UUID
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
      };
      salon_technicians: {
        Row: {
          id: string; // UUID
          email: string;
          user_email: string;
          name: string;
          specialty: string | null;
          bio: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string; // UUID
          email: string;
          user_email: string;
          name: string;
          specialty?: string | null;
          bio?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string; // UUID
          email?: string;
          user_email?: string;
          name?: string;
          specialty?: string | null;
          bio?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      salon_services: {
        Row: {
          id: string; // UUID
          user_email: string;
          name: string;
          description: string | null;
          duration_minutes: number;
          price: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string; // UUID
          user_email: string;
          name: string;
          description?: string | null;
          duration_minutes: number;
          price: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string; // UUID
          user_email?: string;
          name?: string;
          description?: string | null;
          duration_minutes?: number;
          price?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      technician_schedules: {
        Row: {
          id: string; // UUID
          technician_id: string;
          user_email: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_working: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string; // UUID
          technician_id: string;
          user_email: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_working?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string; // UUID
          technician_id?: string;
          user_email?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_working?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      technician_time_blocks: {
        Row: {
          id: string; // UUID
          technician_id: string;
          user_email: string;
          block_date: string | null;
          day_of_week: number | null;
          start_time: string;
          end_time: string;
          block_type: string;
          title: string | null;
          notes: string | null;
          is_recurring: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string; // UUID
          technician_id: string;
          user_email: string;
          block_date?: string | null;
          day_of_week?: number | null;
          start_time: string;
          end_time: string;
          block_type: string;
          title?: string | null;
          notes?: string | null;
          is_recurring?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string; // UUID
          technician_id?: string;
          user_email?: string;
          block_date?: string | null;
          day_of_week?: number | null;
          start_time?: string;
          end_time?: string;
          block_type?: string;
          title?: string | null;
          notes?: string | null;
          is_recurring?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointment_schedule: {
        Row: {
          id: string; // UUID
          customer_email: string;
          user_email: string;
          technician_id: string;
          service_id: string;
          appointment_date: string;
          duration_minutes: number;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string; // UUID
          customer_email: string;
          user_email: string;
          technician_id: string;
          service_id?: string;
          appointment_date: string;
          duration_minutes: number;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string; // UUID
          customer_email?: string;
          user_email?: string;
          technician_id?: string;
          service_id?: string;
          appointment_date?: string;
          duration_minutes?: number;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true
  }
});

// Example of how to use it later:
// import { supabase } from '@/lib/supabaseClient';
// const { data, error } = await supabase.from('customers').select('*');
