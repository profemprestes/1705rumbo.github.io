
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database.types';
import { useToast } from '@/hooks/use-toast';
import { Printer, ArrowLeft } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

// Define types based on the new schema
type RepartoItem = Tables<'repartos'>;
type ViajeItem = Tables<'viajes'>;
type ConductorItem = Tables<'conductores'>;

type ReportData = RepartoItem & {
  viajes: (ViajeItem & {
    conductores: Pick<ConductorItem, 'nombre_completo' | 'codigo_conductor'> | null;
  }) | null;
};

export default function DeliveryItemReportPage() {
  const params = useParams();
  const repartoId = params.id as string;
  const { toast } = useToast();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    if (repartoId) {
      const fetchReportData = async () => {
        setIsLoading(true);
        setReportData(null);
        try {
          const { data, error } = await supabase
            .from('repartos')
            .select(`
              *,
              viajes (
                *,
                conductores (
                  nombre_completo,
                  codigo_conductor
                )
              )
            `)
            .eq('id', repartoId)
            .single();

          if (error) {
            console.error("Supabase error fetching report data:", error);
            throw error;
          }

          if (!data) {
            console.error("No data returned for reparto ID:", repartoId);
            throw new Error(`No se encontraron datos para el ítem de reparto ID ${repartoId}.`);
          }
          
          setReportData(data as ReportData);

        } catch (error: any) {
          const errorMessage = error.message || "No se pudo cargar la información del ítem de reparto.";
          toast({
            title: "Error al cargar el reporte",
            description: errorMessage,
            variant: "destructive",
          });
          console.error("Error in fetchReportData:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchReportData();
    } else {
      setIsLoading(false);
      toast({
        title: "ID de Ítem de Reparto Inválido",
        description: "No se proporcionó un ID de ítem de reparto válido.",
        variant: "destructive",
      });
    }
  }, [repartoId, toast, supabase]);

  const handlePrint = () => {
    window.print();
  };

  const formatDateSafe = (dateInput: string | null | undefined) => {
    if (!dateInput) return "N/A";
    try {
      const date = parseISO(dateInput);
      if (isValid(date)) {
        return format(date, 'PPP p', { locale: es }); // Include time
      }
      return "Fecha inválida";
    } catch (e) {
      console.error("Error formatting date:", dateInput, e);
      return "Error de fecha";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Cargando Reporte del Ítem de Reparto..." />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Reporte no encontrado" description="No se pudo cargar la información para este ítem de reparto o el ID es inválido." />
         <Button variant="outline" asChild>
            <Link href="/repartos"> {/* Or a future /inforepartos listing page */}
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Link>
          </Button>
      </div>
    );
  }
  
  const viaje = reportData.viajes;
  const conductor = viaje?.conductores;

  return (
    <div className="space-y-6 p-1 md:p-2 lg:p-4 print:p-0">
      <div className="print-header-container print:mb-4 print:flex print:items-center print:gap-4">
        <img src="/favicon.svg" alt="RumboEnvios Logo" className="h-16 w-16 hidden print:block" data-ai-hint="logo company" />
        <PageHeader
          title={`Reporte del Ítem de Reparto #${String(reportData.codigo_reparto).padStart(4, '0')}`}
          description={`Detalles del ítem de reparto.`}
          actions={
            <div className="flex flex-wrap gap-2 print:hidden page-header-actions-print-hide">
              <Button variant="outline" asChild>
                <Link href="/repartos"> {/* Link to the main repartos/viajes page */}
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Link>
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Exportar a PDF
              </Button>
            </div>
          }
        />
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardHeader>
          <CardTitle>Información del Ítem de Reparto</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><strong>Código Reparto:</strong> {String(reportData.codigo_reparto).padStart(4, '0')}</div>
          <div><strong>Estado:</strong> <span className="font-semibold">{reportData.estado_reparto || 'N/A'}</span></div>
          <div><strong>Dirección de Destino:</strong> {reportData.destino_direccion || 'N/A'}</div>
          <div><strong>Notas/Detalle Entrega:</strong> {reportData.notas || 'N/A'}</div>
          <div><strong>Fecha Inicio Planificada:</strong> {formatDateSafe(reportData.fecha_hora_inicio)}</div>
          <div><strong>Fecha Fin Estimada:</strong> {formatDateSafe(reportData.fecha_hora_fin_estimada)}</div>
          <div><strong>Fecha Fin Real:</strong> {formatDateSafe(reportData.fecha_hora_fin_real)}</div>
        </CardContent>
      </Card>

      {viaje && (
        <Card className="print:shadow-none print:border-none">
          <CardHeader>
            <CardTitle>Información del Viaje Asociado</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>Código Viaje:</strong> {String(viaje.codigo_viaje).padStart(4, '0')}</div>
            <div><strong>Estado Viaje:</strong> {viaje.estado_viaje}</div>
            {conductor && (
              <div><strong>Conductor del Viaje:</strong> {conductor.nombre_completo} (Cód: {String(conductor.codigo_conductor).padStart(4, '0')})</div>
            )}
            <div><strong>Vehículo:</strong> {viaje.vehiculo_descripcion || 'N/A'}</div>
            <div><strong>Inicio Planificado Viaje:</strong> {formatDateSafe(viaje.fecha_hora_inicio_planificado)}</div>
            <div><strong>Fin Estimado Viaje:</strong> {formatDateSafe(viaje.fecha_hora_fin_estimada_planificado)}</div>
            <div><strong>Notas del Viaje:</strong> {viaje.notas_viaje || 'N/A'}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
    