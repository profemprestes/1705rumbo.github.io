
import type { Metadata } from 'next';
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from '@/components/shared/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Información de Repartos',
  description: 'Consulta información detallada sobre los ítems de reparto individuales.',
};

export default async function InfoRepartosPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Información de Repartos Individuales"
        description="Detalles y seguimiento de cada ítem de entrega."
      />
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>En Desarrollo</AlertTitle>
        <AlertDescription>
          Esta sección está actualmente en desarrollo. Próximamente podrás ver un listado detallado
          de todos los ítems de reparto individuales, con opciones de búsqueda y filtrado.
          Por ahora, puedes acceder a los reportes individuales de cada ítem de reparto a través de 
          la sección de "Repartos" (en la tabla de Viajes, una vez que se implemente la navegación al detalle del viaje y sus ítems).
        </AlertDescription>
      </Alert>
      {/* 
        Placeholder para el futuro componente que listará todos los ítems de reparto:
        <ListarTodosLosItemsDeReparto /> 
      */}
    </div>
  );
}
    