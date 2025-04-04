declare module '@supabase/auth-helpers-nextjs' {
  import { SupabaseClient } from '@supabase/supabase-js';
  import { NextApiRequest, NextApiResponse } from 'next';
  import { NextRequest, NextResponse } from 'next/server';
  
  export interface Session {
    user: {
      id: string;
      email?: string;
      user_metadata?: Record<string, any>;
      app_metadata?: Record<string, any>;
    };
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    expires_at?: number;
    token_type?: string;
  }

  export function createClientComponentClient(): SupabaseClient;
  export function createMiddlewareClient(req: NextRequest, res: NextResponse): SupabaseClient;
  export function createPagesBrowserClient(): SupabaseClient;
  export function createPagesServerClient(context: {
    req: NextApiRequest;
    res: NextApiResponse;
  }): SupabaseClient;
}
