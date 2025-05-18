
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit3, Trash2, Eye, Loader2, Truck } from "lucide-react";
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Database, Tables, Enums } from "@/lib/supabase/database.types";
import { CargaConductor } from "./CargaConductor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";

type Conductor = Tables<'conductores'>;
type Empresa = Tables<'empresas'>;
type EstadoConductor = Enums<'estado_conductor'>;

// Extend Conductor type to potentially include empresa_nombre
type ConductorConEmpresa = Conductor & {
  empresas?: { nombre: string } | null; 
};

export function ListarConductores() {
  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();

  const [conductores, setConductores] = useState<ConductorConEmpresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conductorToEdit, setConductorToEdit] = useState<Conductor | null>(null);
  
  const [conductorToDelete, setConductorToDelete] = useState<Conductor | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const fetchConductores = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('conductores')
        .select('*, empresas(nombre)') // Changed to single-line string
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }
      setConductores(data as ConductorConEmpresa[] || []);
    } catch (err: any) {
      console.error("Error fetching conductores:", err);
      const errorMessage = err.message || "Error al cargar datos de conductores.";
      setError(errorMessage);
      setConductores([]);
      toast({ variant: 'destructive', title: 'Error de Carga', description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConductores();
  }, []);

  const getStatusBadgeVariant = (status: EstadoConductor | null): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Activo':
        return 'default'; 
      case 'Inactivo':
        return 'destructive';
      case 'De Viaje':
        return 'secondary'; 
      case 'En Descanso':
        return 'outline'; 
      default:
        return 'outline';
    }
  };

  const handleOpenCreateModal = () => {
    setConductorToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (conductor: Conductor) => {
    setConductorToEdit(conductor);
    setIsModalOpen(true);
  };
  
  const handleDeleteClick = (conductor: Conductor) => {
    setConductorToDelete(conductor);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!conductorToDelete) return;
    
    console.log("Confirm delete for:", conductorToDelete.nombre_completo);
    toast({ title: 'Función Deshabilitada', description: `La eliminación de ${conductorToDelete.nombre_completo} está deshabilitada en esta demo.` });
    setIsAlertOpen(false);
    setConductorToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
        <span className="text-lg text-muted-foreground">Cargando conductores...</span>
      </div>
    );
  }

  if (error) {
     return (
      <Card className="shadow-md rounded-lg w-full my-4 border-destructive bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-destructive">Error al Cargar Conductores</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">{error}</p>
          <Button onClick={fetchConductores} className="mt-4" variant="secondary">Reintentar</Button>
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
              < Truck className="mr-2 h-6 w-6" /> Listado de Conductores
            </CardTitle>
            <CardDescription className="text-md mt-1">
              Gestiona la información de los conductores registrados.
            </CardDescription>
          </div>
          <Button onClick={handleOpenCreateModal} className="bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-5 w-5" />
            Cargar Nuevo Conductor
          </Button>
        </CardHeader>
        <CardContent>
          {conductores.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-lg">No hay conductores registrados todavía.</p>
              <p>¡Empieza cargando uno nuevo para verlo aquí!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] whitespace-nowrap">Código</TableHead>
                    <TableHead className="whitespace-nowrap">Nombre Completo</TableHead>
                    <TableHead className="whitespace-nowrap">Teléfono</TableHead>
                    <TableHead className="whitespace-nowrap">Email</TableHead>
                    <TableHead className="whitespace-nowrap">Empresa Asociada</TableHead>
                    <TableHead className="whitespace-nowrap">Estado</TableHead>
                    <TableHead className="text-right w-[180px] whitespace-nowrap">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conductores.map((conductor) => (
                    <TableRow key={conductor.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono">{String(conductor.codigo_conductor).padStart(4, '0')}</TableCell>
                      <TableCell className="font-medium">{conductor.nombre_completo}</TableCell>
                      <TableCell>{conductor.telefono || '-'}</TableCell>
                      <TableCell>{conductor.email || '-'}</TableCell>
                      <TableCell>{conductor.empresas?.nombre || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(conductor.estado)}
                          className={conductor.estado === 'Activo' ? 'bg-accent text-accent-foreground' : ''}
                        >
                          {conductor.estado || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1 md:space-x-2">
                        <Button variant="outline" size="sm" className="hover:border-primary hover:text-primary px-2" aria-label={`Ver ${conductor.nombre_completo}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="hover:border-primary hover:text-primary px-2" aria-label={`Modificar ${conductor.nombre_completo}`} onClick={() => handleOpenEditModal(conductor)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="hover:border-destructive hover:text-destructive px-2" aria-label={`Eliminar ${conductor.nombre_completo}`} onClick={() => handleDeleteClick(conductor)}>
                           <Trash2 className="h-4 w-4" />
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

      <CargaConductor
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        conductorToEdit={conductorToEdit}
        onFormSubmit={fetchConductores}
      />
      
      {conductorToDelete && (
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Confirmar Eliminación?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar al conductor "{conductorToDelete?.nombre_completo}"?
                <br /> <strong className="text-destructive">(La funcionalidad de eliminación está deshabilitada en esta demo.)</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConductorToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
