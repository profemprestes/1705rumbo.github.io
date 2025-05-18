
import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = await createSupabaseMiddlewareClient(request, response);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Define public paths that don't require authentication or are part of the auth flow
  const publicPaths = [
    '/login',
    '/signup',
    '/auth/auth-code-error',
    // REMOVED: '/prompts' - it's now protected
    // REMOVED: '/inicio' - it's now protected
  ];

  const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/api/auth/callback') || pathname === '/';


  // if user is signed in and the current path is /login or /signup, redirect to /inicio
  if (session && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/inicio', request.url));
  }

  // if user is not signed in and the current path is not a public one, redirect to /login
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
