
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit3, Eye, XCircle, ListFilter, ArrowUpDown, Loader2, Route } from "lucide-react";
import type { Database, Tables, Enums } from "@/lib/supabase/database.types";
// import { CargaReparto } from "./CargaReparto"; // Modal for creating/editing - To be implemented
// import { createSupabaseBrowserClient } from '@/lib/supabase/client';
// import { useToast } from "@/hooks/use-toast";

type Reparto = Tables<'repartos'>;
type Conductor = Tables<'conductores'>;
type EstadoReparto = Enums<'estado_reparto'>;

type RepartoConDetalles = Reparto & {
  conductores?: { nombre_completo: string } | null;
};

// Placeholder data for now
const placeholderRepartos: RepartoConDetalles[] = [
  {
    id: '1',
    codigo_reparto: 1001,
    fecha_hora_inicio: new Date('2024-05-20T09:00:00Z').toISOString(),
    fecha_hora_fin_estimada: new Date('2024-05-20T17:00:00Z').toISOString(),
    fecha_hora_fin_real: null,
    id_conductor_asignado: 'conductor-1',
    conductores: { nombre_completo: 'Juan Pérez' },
    vehiculo_descripcion: 'Ford Transit Patente AB123CD',
    estado_reparto: 'En Curso',
    destino_direccion: 'Av. Colón 1234, Mar del Plata',
    notas: 'Entregar en recepción.',
    user_id: 'user-id-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    codigo_reparto: 1002,
    fecha_hora_inicio: new Date('2024-05-19T14:00:00Z').toISOString(),
    fecha_hora_fin_estimada: new Date('2024-05-19T18:00:00Z').toISOString(),
    fecha_hora_fin_real: new Date('2024-05-19T17:30:00Z').toISOString(),
    id_conductor_asignado: 'conductor-2',
    conductores: { nombre_completo: 'Ana Gómez' },
    vehiculo_descripcion: 'Renault Kangoo Patente CD456EF',
    estado_reparto: 'Completado',
    destino_direccion: 'San Martín 5678, Mar del Plata',
    notas: null,
    user_id: 'user-id-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    codigo_reparto: 1003,
    fecha_hora_inicio: new Date('2024-05-21T10:00:00Z').toISOString(),
    fecha_hora_fin_estimada: new Date('2024-05-21T15:00:00Z').toISOString(),
    fecha_hora_fin_real: null,
    id_conductor_asignado: 'conductor-1',
    conductores: { nombre_completo: 'Juan Pérez' },
    vehiculo_descripcion: 'Ford Transit Patente AB123CD',
    estado_reparto: 'Pendiente',
    destino_direccion: 'Luro 3210, Mar del Plata',
    notas: 'Llamar antes de llegar.',
    user_id: 'user-id-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function ListarRepartos() {
  // const supabase = createSupabaseBrowserClient();
  // const { toast } = useToast();

  const [repartos, setRepartos] = useState<RepartoConDetalles[]>(placeholderRepartos);
  const [loading, setLoading] = useState(false); // Set to false as we are using placeholder data
  const [error, setError] = useState<string | null>(null);

  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [repartoToEdit, setRepartoToEdit] = useState<Reparto | null>(null);
  
  // const [repartoToCancel, setRepartoToCancel] = useState<Reparto | null>(null);
  // const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);

  // const fetchRepartos = async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const { data, error: fetchError } = await supabase
  //       .from('repartos')
  //       .select('*, conductores(nombre_completo)')
  //       .order('fecha_hora_inicio', { ascending: false });

  //     if (fetchError) throw fetchError;
  //     setRepartos(data as RepartoConDetalles[] || []);
  //   } catch (err: any) {
  //     console.error("Error fetching repartos:", err);
  //     const errorMessage = err.message || "Error al cargar datos de repartos.";
  //     setError(errorMessage);
  //     setRepartos([]);
  //     toast({ variant: 'destructive', title: 'Error de Carga', description: errorMessage });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   // fetchRepartos(); // Uncomment when ready to fetch from Supabase
  // }, []);

  const getStatusBadgeVariant = (status: EstadoReparto | null): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Pendiente':
        return 'outline';
      case 'En Curso':
        return 'default'; // Using 'default' for 'En Curso' which is typically primary color
      case 'Completado':
        return 'secondary'; // Using 'secondary' for 'Completado' for a green-like accent
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
      return 'Fecha inválida';
    }
  };

  // const handleOpenCreateModal = () => {
  //   setRepartoToEdit(null);
  //   setIsModalOpen(true);
  // };

  // const handleOpenEditModal = (reparto: Reparto) => {
  //   setRepartoToEdit(reparto);
  //   setIsModalOpen(true);
  // };
  
  // const handleCancelClick = (reparto: Reparto) => {
  //   setRepartoToCancel(reparto);
  //   setIsCancelAlertOpen(true);
  // };

  // const confirmCancel = async () => {
  //   if (!repartoToCancel) return;
  //   // Logic to update reparto status to 'Cancelado' in Supabase
  //   toast({ title: 'Reparto Cancelado (Simulado)', description: `El reparto ${repartoToCancel.codigo_reparto} ha sido cancelado.` });
  //   setIsCancelAlertOpen(false);
  //   setRepartoToCancel(null);
  //   // fetchRepartos(); // Refresh list
  // };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
        <span className="text-lg text-muted-foreground">Cargando repartos...</span>
      </div>
    );
  }

  if (error) {
     return (
      <Card className="shadow-md rounded-lg w-full my-4 border-destructive bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-destructive">Error al Cargar Repartos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">{error}</p>
          {/* <Button onClick={fetchRepartos} className="mt-4" variant="secondary">Reintentar</Button> */}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-md rounded-lg w-full">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground flex items-center">
              <Route className="mr-2 h-6 w-6" /> Listado de Repartos
            </CardTitle>
            <CardDescription className="text-md mt-1">
              Visualiza y gestiona los repartos programados y en curso.
            </CardDescription>
          </div>
          <Button /*onClick={handleOpenCreateModal}*/ className="bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-5 w-5" />
            Cargar Nuevo Reparto
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center">
            <Input placeholder="Buscar por destino o código..." className="max-w-xs" disabled/>
            <Select disabled>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
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

          {repartos.length === 0 && !loading ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-lg">No hay repartos registrados todavía.</p>
              <p>Crea un nuevo reparto para comenzar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] whitespace-nowrap"><Button variant="ghost" size="sm" disabled><ArrowUpDown className="mr-2 h-3 w-3" />Código</Button></TableHead>
                    <TableHead className="whitespace-nowrap"><Button variant="ghost" size="sm" disabled><ArrowUpDown className="mr-2 h-3 w-3" />Inicio</Button></TableHead>
                    <TableHead className="whitespace-nowrap"><Button variant="ghost" size="sm" disabled><ArrowUpDown className="mr-2 h-3 w-3" />Fin Estimado</Button></TableHead>
                    <TableHead className="whitespace-nowrap">Conductor</TableHead>
                    <TableHead className="whitespace-nowrap">Vehículo</TableHead>
                    <TableHead className="whitespace-nowrap">Destino</TableHead>
                    <TableHead className="whitespace-nowrap"><Button variant="ghost" size="sm" disabled><ArrowUpDown className="mr-2 h-3 w-3" />Estado</Button></TableHead>
                    <TableHead className="text-right w-[200px] whitespace-nowrap">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repartos.map((reparto) => (
                    <TableRow key={reparto.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono">{String(reparto.codigo_reparto).padStart(4, '0')}</TableCell>
                      <TableCell>{formatDate(reparto.fecha_hora_inicio)}</TableCell>
                      <TableCell>{formatDate(reparto.fecha_hora_fin_estimada)}</TableCell>
                      <TableCell>{reparto.conductores?.nombre_completo || 'No asignado'}</TableCell>
                      <TableCell>{reparto.vehiculo_descripcion || '-'}</TableCell>
                      <TableCell className="min-w-[200px] max-w-[300px] truncate" title={reparto.destino_direccion || ''}>{reparto.destino_direccion || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(reparto.estado_reparto)}
                          className={reparto.estado_reparto === 'En Curso' ? 'bg-primary text-primary-foreground' : reparto.estado_reparto === 'Completado' ? 'bg-accent text-accent-foreground' : ''}
                        >
                          {reparto.estado_reparto || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1 md:space-x-2">
                        <Button variant="outline" size="sm" className="hover:border-primary hover:text-primary px-2" aria-label={`Ver ${reparto.codigo_reparto}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="hover:border-primary hover:text-primary px-2" aria-label={`Modificar ${reparto.codigo_reparto}`} /*onClick={() => handleOpenEditModal(reparto)}*/>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        {reparto.estado_reparto !== 'Completado' && reparto.estado_reparto !== 'Cancelado' && (
                          <Button variant="outline" size="sm" className="hover:border-destructive hover:text-destructive px-2" aria-label={`Cancelar ${reparto.codigo_reparto}`} /*onClick={() => handleCancelClick(reparto)}*/>
                             <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 
      <CargaReparto
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        repartoToEdit={repartoToEdit}
        onFormSubmit={fetchRepartos}
      />
      
      {repartoToCancel && (
        <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Confirmar Cancelación?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. ¿Estás seguro de que quieres cancelar el reparto código {repartoToCancel?.codigo_reparto}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setRepartoToCancel(null)}>No, mantener</AlertDialogCancel>
              <AlertDialogAction onClick={confirmCancel} className="bg-destructive hover:bg-destructive/90">
                Sí, Cancelar Reparto
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      */}
    </>
  );
}
