
import type { Metadata } from 'next';
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HeroConductores } from '@/components/conductores/HeroConductores';
import { ListarConductores } from '@/components/conductores/ListarConductores';

export const metadata: Metadata = {
  title: 'Gestión de Conductores',
  description: 'Administra la información de los conductores registrados en RumboEnvios.',
};

export default async function ConductoresPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <HeroConductores />
      <ListarConductores />
    </div>
  );
}
