
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
    // Allow request to proceed, user will be treated as unauthenticated
    // if session could not be retrieved.
    // Re-initialize response because the original one might have been modified by createSupabaseMiddlewareClient before throwing
    response = NextResponse.next(); 
    // It's important to ensure request headers are also passed along if `NextResponse.next(request)` was intended.
    // For simplicity, we'll just forward a basic next response.
    // If you have specific request headers to preserve, you'd do:
    // const newHeaders = new Headers(request.headers)
    // response = NextResponse.next({ request: { headers: newHeaders }})
  }

  const { pathname } = request.nextUrl;

  const publicPaths = [
    '/login',
    '/signup',
    '/auth/auth-code-error',
    '/', // Root is public for welcome
  ];

  const authFlowPaths = ['/login', '/signup'];

  const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/api/auth/callback');
  const isAuthFlowPath = authFlowPaths.includes(pathname);

  if (session && isAuthFlowPath) {
    return NextResponse.redirect(new URL('/inicio', request.url));
  }

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
