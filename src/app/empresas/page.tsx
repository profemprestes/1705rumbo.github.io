
import type { Metadata } from 'next';
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ListarEmpresas } from "@/components/empresas/ListarEmpresas";
import { HeroEmpresas } from '@/components/empresas/HeroEmpresas';
// Removed Button and Link as they are not used in the simplified error case
// import { Button } from '@/components/ui/button';
// import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gestión de Empresas',
  description: 'Administra la información de las empresas registradas en RumboEnvios.',
};

export default async function EmpresasPage() {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }
  } catch (error) {
    console.error("Error fetching user in EmpresasPage:", error);
    // Return a very simple text response for debugging
    return new Response("Error del Servidor: No se pudo verificar la autenticación del usuario. Por favor, inténtalo de nuevo más tarde.", {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return (
    <div className="space-y-6">
      <HeroEmpresas />
      <ListarEmpresas />
    </div>
  );
}
