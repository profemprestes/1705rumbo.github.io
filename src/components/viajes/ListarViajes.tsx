
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, ListFilter, Loader2, Route, ArrowUpDown, CalendarDays, Users, Truck } from "lucide-react";
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Database, Tables, Enums } from "@/lib/supabase/database.types";
import { useToast } from "@/hooks/use-toast";
import { DetalleViaje } from "./DetalleViaje"; 

type Viaje = Tables<'viajes'>;
type Conductor = Tables<'conductores'>;
type Empresa = Tables<'empresas'>;
type EstadoViaje = Enums<'estado_viaje'>;

type ViajeConDetalles = Viaje & {
  conductores: (Pick<Conductor, 'nombre_completo' | 'codigo_conductor'> & {
    empresas: Pick<Empresa, 'nombre'> | null;
  }) | null;
  repartos: { count: number }[]; // Array of count objects, could be empty
};

export function ListarViajes() {
  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();

  const [viajes, setViajes] = useState<ViajeConDetalles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedViajeId, setSelectedViajeId] = useState<string | null>(null);
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);

  const fetchViajes = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('viajes')
        .select('*, conductores(nombre_completo, codigo_conductor, empresas(nombre)), repartos(count)')
        .order('fecha_hora_inicio_planificado', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }
      setViajes(data as ViajeConDetalles[] || []);
    } catch (err: any) {
      console.error("Error fetching viajes:", err);
      const errorMessage = err.message || "Error al cargar datos de viajes.";
      setError(errorMessage);
      setViajes([]);
      toast({ variant: 'destructive', title: 'Error de Carga', description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViajes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusBadgeVariant = (status: EstadoViaje | null): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Planificado':
        return 'outline';
      case 'En Curso':
        return 'default';
      case 'Completado':
        return 'secondary';
      case 'Cancelado':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Fecha inválida';
    }
  };

  const handleOpenDetalleModal = (viajeId: string) => {
    setSelectedViajeId(viajeId);
    setIsDetalleModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
        <span className="text-lg text-muted-foreground">Cargando viajes...</span>
      </div>
    );
  }

  if (error) {
     return (
      <Card className="shadow-md rounded-lg w-full my-4 border-destructive bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-destructive">Error al Cargar Viajes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">{error}</p>
          <Button onClick={fetchViajes} className="mt-4" variant="secondary">Reintentar</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-md rounded-lg w-full mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center">
            <Route className="mr-3 h-7 w-7 text-primary" /> Listado de Viajes
          </CardTitle>
          <CardDescription className="text-md mt-1">
            Visualiza y gestiona los viajes planificados y en curso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center">
            <Input placeholder="Buscar por código de viaje, conductor..." className="max-w-xs" disabled />
            <Select disabled>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planificado">Planificado</SelectItem>
                <SelectItem value="en_curso">En Curso</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full sm:w-auto" disabled>
              <ListFilter className="mr-2 h-4 w-4" />
              Más Filtros
            </Button>
          </div>

          {viajes.length === 0 && !loading ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-lg">No hay viajes registrados todavía.</p>
              <p>Crea repartos para generar viajes asociados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] whitespace-nowrap"><Button variant="ghost" size="sm" disabled><ArrowUpDown className="mr-2 h-3 w-3" />Cód. Viaje</Button></TableHead>
                    <TableHead className="whitespace-nowrap"><Users className="inline-block mr-1 h-4 w-4" />Conductor</TableHead>
                    <TableHead className="whitespace-nowrap"><Truck className="inline-block mr-1 h-4 w-4" />Vehículo</TableHead>
                    <TableHead className="whitespace-nowrap"><CalendarDays className="inline-block mr-1 h-4 w-4" />Inicio Plan.</TableHead>
                    <TableHead className="whitespace-nowrap"><CalendarDays className="inline-block mr-1 h-4 w-4" />Fin Estim. Plan.</TableHead>
                    <TableHead className="whitespace-nowrap"><Button variant="ghost" size="sm" disabled><ArrowUpDown className="mr-2 h-3 w-3" />Estado</Button></TableHead>
                    <TableHead className="whitespace-nowrap text-center">N° Repartos</TableHead>
                    <TableHead className="text-right w-[120px] whitespace-nowrap">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viajes.map((viaje) => (
                    <TableRow key={viaje.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono">{String(viaje.codigo_viaje).padStart(4, '0')}</TableCell>
                      <TableCell>
                        {viaje.conductores?.nombre_completo || 'N/A'}
                        {viaje.conductores?.empresas?.nombre && (
                          <span className="block text-xs text-muted-foreground">
                            ({viaje.conductores.empresas.nombre})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{viaje.vehiculo_descripcion || '-'}</TableCell>
                      <TableCell>{formatDate(viaje.fecha_hora_inicio_planificado)}</TableCell>
                      <TableCell>{formatDate(viaje.fecha_hora_fin_estimada_planificado)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(viaje.estado_viaje)}
                          className={viaje.estado_viaje === 'En Curso' ? 'bg-primary text-primary-foreground' : viaje.estado_viaje === 'Completado' ? 'bg-accent text-accent-foreground' : ''}
                        >
                          {viaje.estado_viaje || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {/* Safely access count: check if repartos array exists, has elements, and the first element has a count */}
                        {(viaje.repartos && viaje.repartos.length > 0 && typeof viaje.repartos[0].count === 'number')
                          ? viaje.repartos[0].count
                          : 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:border-primary hover:text-primary px-2" 
                          aria-label={`Ver detalles del viaje ${viaje.codigo_viaje}`} 
                          onClick={() => handleOpenDetalleModal(viaje.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <DetalleViaje 
        viajeId={selectedViajeId}
        isOpen={isDetalleModalOpen}
        setIsOpen={setIsDetalleModalOpen}
      />
    </>
  );
}

