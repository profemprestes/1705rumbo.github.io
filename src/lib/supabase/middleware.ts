
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, type NextResponse } from 'next/server';
import type { Database } from '@/lib/supabase/database.types';

export async function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Log the error but avoid throwing, as middleware should not crash the request.
    // The calling function in middleware.ts should handle the case where client creation might fail.
    console.error('Supabase URL or Anon Key is missing in middleware environment. Supabase client for middleware could not be initialized.');
    // Depending on desired behavior, you might return null or a specific error indicator
    // For now, createServerClient will throw if keys are truly missing, which will be caught by the try/catch in middleware.ts
    // We pass potentially undefined values here and let createServerClient or the calling code handle it.
    // This function is more about setting up the cookie interaction.
  }

  return createServerClient<Database>(
    supabaseUrl!, // The try-catch in middleware.ts will handle if these are truly null
    supabaseAnonKey!, // The try-catch in middleware.ts will handle if these are truly null
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          // The `response` object is used to update the cookies in the browser.
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          // The `response` object is used to update the cookies in the browser.
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );
}
