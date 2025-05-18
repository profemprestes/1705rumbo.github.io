
import type { Metadata } from 'next';
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ListarEmpresas } from "@/components/empresas/ListarEmpresas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

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
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-center">
            <Building2 className="mr-3 h-8 w-8" />
            Gestión de Empresas
          </CardTitle>
          <CardDescription className="text-lg mt-1">
            Visualiza, crea, edita y gestiona todas las empresas.
          </CardDescription>
        </CardHeader>
      </Card>
      <ListarEmpresas />
    </div>
  );
}
