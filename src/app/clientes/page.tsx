
import type { Metadata } from 'next';
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HeroClientes } from '@/components/clientes/HeroClientes';
import { ListarClientes } from '@/components/clientes/ListarClientes';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gestión de Clientes',
  description: 'Administra la información de los clientes registrados en RumboEnvios.',
};

export default async function ClientesPage() {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }
  } catch (error) {
    console.error("Error fetching user in ClientesPage:", error);
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Error del Servidor</h1>
            <p className="text-muted-foreground mb-4">No se pudo verificar la autenticación del usuario. Por favor, inténtalo de nuevo más tarde.</p>
            <Button asChild>
                <Link href="/">Volver al Inicio</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeroClientes />
      <ListarClientes />
    </div>
  );
}
