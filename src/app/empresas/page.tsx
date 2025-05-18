
import type { Metadata } from 'next';
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ListarEmpresas } from "@/components/empresas/ListarEmpresas";
import { HeroEmpresas } from '@/components/empresas/HeroEmpresas'; // Importar el nuevo componente

export const metadata: Metadata = {
  title: 'Gestión de Empresas',
  description: 'Administra la información de las empresas registradas en RumboEnvios.',
};

export default async function EmpresasPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <HeroEmpresas /> {/* Usar el nuevo componente HeroEmpresas */}
      <ListarEmpresas />
    </div>
  );
}
