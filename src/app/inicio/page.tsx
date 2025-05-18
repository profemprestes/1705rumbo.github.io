
import type { Metadata } from 'next';
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardInicio } from '@/components/dashboard/DashboardInicio'; // Import the new component

export const metadata: Metadata = {
  title: 'Dashboard de Inicio',
  description: 'Dashboard principal para la gestión de empresas en RumboEnvios.',
};

export default async function InicioPage() {
  const supabase = createSupabaseServerClient();
  // const { data: { user } } = await supabase.auth.getUser();

  // if (!user) {
  //   redirect('/login'); // Temporarily commented out for simulated login
  // }

  return (
    <DashboardInicio /> // Render the new component
  );
}
