
'use client';

import { useState, useEffect, Fragment } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Info, ListChecks, AlertCircle, UserCircle, Truck, CalendarDays,StickyNote, Building } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Tables, Enums } from '@/lib/supabase/database.types';
import { useToast } from '@/hooks/use-toast';
import { ExportarPDFViajeButton } from './ExportarPDFViajeButton'; // Import the new component

type Viaje = Tables<'viajes'>;
type Reparto = Tables<'repartos'>;
type Conductor = Tables<'conductores'>;
type Empresa = Tables<'empresas'>;
type User = Tables<'profiles'>; 
type EstadoViaje = Enums<'estado_viaje'>;
type EstadoReparto = Enums<'estado_reparto'>;

type ViajeDetallado = Viaje & {
  conductores: (Conductor & { empresas: Empresa | null }) | null;
};

type RepartoConductor = Reparto & {
  conductores: Pick<Conductor, 'nombre_completo'> | null;
};

interface DetalleViajeProps {
  viajeId: string | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function DetalleViaje({ viajeId, isOpen, setIsOpen }: DetalleViajeProps) {
  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();

  const [viajeCargado, setViajeCargado] = useState<ViajeDetallado | null>(null);
  const [repartosDelViaje, setRepartosDelViaje] = useState<RepartoConductor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetallesViaje() {
      if (!viajeId || !isOpen) {
        setViajeCargado(null);
        setRepartosDelViaje([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data: viajeData, error: viajeError } = await supabase
          .from('viajes')
          .select('*, conductores (*, empresas (*))') // Updated to single-line string
          .eq('id', viajeId)
          .single();

        if (viajeError) throw viajeError;
        setViajeCargado(viajeData as ViajeDetallado);

        const { data: repartosData, error: repartosError } = await supabase
          .from('repartos')
          .select('*, conductores (nombre_completo)') // Updated to single-line string
          .eq('id_viaje', viajeId)
          .order('codigo_reparto', { ascending: true });

        if (repartosError) throw repartosError;
        setRepartosDelViaje(repartosData as RepartoConductor[]);

      } catch (err: any) {
        console.error("Error fetching viaje details:", err);
        setError(err.message || "Error al cargar los detalles del viaje.");
        toast({ variant: 'destructive', title: 'Error de Carga', description: err.message });
      } finally {
        setLoading(false);
      }
    }

    fetchDetallesViaje();
  }, [viajeId, isOpen, supabase, toast]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } catch (e) { return 'Fecha inválida'; }
  };
  
  const getEstadoViajeBadgeVariant = (status: EstadoViaje | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Planificado': return 'outline';
      case 'En Curso': return 'default';
      case 'Completado': return 'secondary';
      case 'Cancelado': return 'destructive';
      default: return 'outline';
    }
  };

  const getEstadoRepartoBadgeVariant = (status: EstadoReparto | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Pendiente': return 'outline';
      case 'En Curso': return 'default';
      case 'Completado': return 'secondary';
      case 'Cancelado': return 'destructive';
      default: return 'outline';
    }
  };

  const renderDetailItem = (label: string, value: React.ReactNode, icon?: React.ReactNode) => (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-dashed">
      <dt className="text-sm font-medium text-muted-foreground col-span-1 flex items-center">
        {icon && React.cloneElement(icon as React.ReactElement, { className: "mr-2 h-4 w-4" })}
        {label}
      </dt>
      <dd className="text-sm col-span-2">{value || 'N/A'}</dd>
    </div>
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl w-full shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary flex items-center">
            Detalle del Viaje #{viajeCargado?.codigo_viaje ? String(viajeCargado.codigo_viaje).padStart(4, '0') : '...'}
          </DialogTitle>
          <DialogDescription>
            Información completa del viaje y sus repartos asociados.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center items-center min-h-[300px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-3 text-lg text-muted-foreground">Cargando detalles del viaje...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col justify-center items-center min-h-[300px] text-center p-4 bg-destructive/10 rounded-md">
            <AlertCircle className="h-12 w-12 text-destructive mb-2" />
            <p className="text-lg font-semibold text-destructive">Error al Cargar</p>
            <p className="text-sm text-destructive-foreground">{error}</p>
          </div>
        )}

        {!loading && !error && viajeCargado && (
          <Tabs defaultValue="info_viaje" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info_viaje"><Info className="mr-2 h-4 w-4" />Información del Viaje</TabsTrigger>
              <TabsTrigger value="repartos_asociados"><ListChecks className="mr-2 h-4 w-4" />Repartos ({repartosDelViaje.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info_viaje">
              <ScrollArea className="h-[50vh] p-1">
                <Card>
                  <CardContent className="pt-6 space-y-1">
                    {renderDetailItem("Código de Viaje", String(viajeCargado.codigo_viaje).padStart(4, '0'))}
                    {renderDetailItem("Estado", <Badge variant={getEstadoViajeBadgeVariant(viajeCargado.estado_viaje)}>{viajeCargado.estado_viaje}</Badge>)}
                    {renderDetailItem("Conductor", viajeCargado.conductores?.nombre_completo, <UserCircle />)}
                    {viajeCargado.conductores?.empresas && renderDetailItem("Empresa Conductor", viajeCargado.conductores.empresas.nombre, <Building />)}
                    {renderDetailItem("Vehículo", viajeCargado.vehiculo_descripcion, <Truck />)}
                    {renderDetailItem("Inicio Planificado", formatDate(viajeCargado.fecha_hora_inicio_planificado), <CalendarDays />)}
                    {renderDetailItem("Fin Estimado Plan.", formatDate(viajeCargado.fecha_hora_fin_estimada_planificado), <CalendarDays />)}
                    {renderDetailItem("Notas del Viaje", viajeCargado.notas_viaje || "Sin notas.", <StickyNote />)}
                    {renderDetailItem("Creado por (ID)", viajeCargado.user_id)}
                    {renderDetailItem("Fecha Creación", formatDate(viajeCargado.created_at))}
                    {renderDetailItem("Última Actualización", formatDate(viajeCargado.updated_at))}
                  </CardContent>
                </Card>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="repartos_asociados">
              <ScrollArea className="h-[50vh] p-1">
                {repartosDelViaje.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cód. Reparto</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Inicio</TableHead>
                        <TableHead>Fin Estimado</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {repartosDelViaje.map((reparto) => (
                        <TableRow key={reparto.id}>
                          <TableCell className="font-mono">{String(reparto.codigo_reparto).padStart(4, '0')}</TableCell>
                          <TableCell className="max-w-[200px] truncate" title={reparto.destino_direccion || ''}>{reparto.destino_direccion || 'N/A'}</TableCell>
                          <TableCell><Badge variant={getEstadoRepartoBadgeVariant(reparto.estado_reparto)}>{reparto.estado_reparto}</Badge></TableCell>
                          <TableCell>{formatDate(reparto.fecha_hora_inicio)}</TableCell>
                          <TableCell>{formatDate(reparto.fecha_hora_fin_estimada)}</TableCell>
                          <TableCell className="max-w-[150px] truncate" title={reparto.notas || ''}>{reparto.notas || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No hay repartos asociados a este viaje.</p>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="mt-6 sm:justify-between">
          {viajeCargado && (
            <ExportarPDFViajeButton 
              viaje={viajeCargado} 
              repartos={repartosDelViaje} 
              disabled={loading || !!error}
            />
          )}
          <DialogClose asChild>
            <Button variant="outline" className="mt-2 sm:mt-0">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
