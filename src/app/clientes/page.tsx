
import type { Metadata } from 'next';
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HeroClientes } from '@/components/clientes/HeroClientes';
import { ListarClientes } from '@/components/clientes/ListarClientes';

export const metadata: Metadata = {
  title: 'Gestión de Clientes',
  description: 'Administra la información de los clientes registrados en RumboEnvios.',
};

export default async function ClientesPage() { // Renamed from EmpresasPage
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <HeroClientes />
      <ListarClientes />
    </div>
  );
}
