
import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();
  let supabase;
  let session = null;

  try {
    supabase = await createSupabaseMiddlewareClient(request, response);
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch (error) {
    console.error('Error in middleware during Supabase operation:', error);
    response = NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Public paths accessible to everyone
  const publicPaths = [
    '/login',
    '/signup',
    '/auth/auth-code-error',
    '/', // Root is public for welcome
  ];

  // Paths for authentication flow (users already logged in should be redirected away from these)
  const authFlowPaths = ['/login', '/signup'];

  const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/api/auth/callback');
  const isAuthFlowPath = authFlowPaths.includes(pathname);

  // If the user is logged in and tries to access login/signup, redirect to /inicio
  if (session && isAuthFlowPath) {
    return NextResponse.redirect(new URL('/inicio', request.url));
  }

  // If the user is not logged in and tries to access a non-public path, redirect to /login
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
