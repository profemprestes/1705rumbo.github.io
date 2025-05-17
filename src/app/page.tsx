
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
// Removed Button and other imports as they are no longer used directly on this page.

export const dynamic = 'force-dynamic'; // Ensures the page is dynamically rendered

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // If the user is logged in, redirect them to the new main dashboard page.
    redirect('/inicio');
  }

  // If the user is not logged in, the middleware should have already redirected them
  // to /login. This content would only show if middleware is bypassed or misconfigured.
  // Or if this page was intended to be a public landing page for non-logged-in users.
  // For now, we assume middleware handles unauthenticated access.
  // If this page needs to be a public landing, add that content here.
  // For this iteration, redirecting to /login (via middleware) is the expected behavior
  // for unauthenticated users trying to access '/'.
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
      <h1 className="text-4xl font-bold mb-4 text-primary">Bienvenido a RumboEnvios</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Gestiona tus envíos de forma simple y eficiente.
      </p>
      <p className="text-md text-muted-foreground">
        Por favor, <a href="/login" className="text-primary hover:underline font-semibold">inicia sesión</a> para acceder al dashboard.
      </p>
    </div>
  );
}
