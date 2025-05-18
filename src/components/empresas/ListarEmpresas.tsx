
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit3, Trash2, Eye, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Database, Tables } from "@/lib/supabase/database.types";
import { CargaEmpresa } from "./CargaEmpresa"; // Import the modal component
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

type Empresa = Tables<'empresas'>;

export function ListarEmpresas() {
  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [empresaToEdit, setEmpresaToEdit] = useState<Empresa | null>(null);
  
  const [empresaToDelete, setEmpresaToDelete] = useState<Empresa | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);


  const fetchEmpresas = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }
      setEmpresas(data || []);
    } catch (err: any) {
      console.error("Error fetching empresas:", err);
      setError(err.message || "Error al cargar datos de empresas.");
      setEmpresas([]);
      toast({ variant: 'destructive', title: 'Error de Carga', description: err.message || "No se pudieron cargar las empresas." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const getStatusBadgeVariant = (status: string | null): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case 'activo':
        return 'default';
      case 'inactivo':
        return 'destructive';
      case 'pendiente':
        return 'secondary';
      default:
        return 'outline'; // Changed from secondary to outline for unknown status
    }
  };

  const handleOpenCreateModal = () => {
    setEmpresaToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (empresa: Empresa) => {
    setEmpresaToEdit(empresa);
    setIsModalOpen(true);
  };
  
  const handleDeleteClick = (empresa: Empresa) => {
    setEmpresaToDelete(empresa);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!empresaToDelete) return;
    
    // Placeholder for actual delete logic
    // const { error: deleteError } = await supabase.from('empresas').delete().eq('id', empresaToDelete.id);
    // if (deleteError) {
    //   toast({ variant: 'destructive', title: 'Error', description: `No se pudo eliminar la empresa: ${deleteError.message}`});
    // } else {
    //   toast({ title: 'Empresa Eliminada', description: `La empresa ${empresaToDelete.nombre} ha sido eliminada.` });
    //   fetchEmpresas(); // Refresh list
    // }
    // setIsAlertOpen(false);
    // setEmpresaToDelete(null);

    console.log("Confirm delete for:", empresaToDelete.nombre);
    toast({ title: 'Función Deshabilitada', description: `La eliminación de ${empresaToDelete.nombre} está deshabilitada en esta demo.` });
    setIsAlertOpen(false);
    setEmpresaToDelete(null);
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
        <span className="text-lg text-muted-foreground">Cargando empresas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="shadow-md rounded-lg w-full my-4 border-destructive bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-destructive">Error al Cargar Empresas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">{error}</p>
          <Button onClick={fetchEmpresas} className="mt-4" variant="secondary">Reintentar</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-md rounded-lg w-full">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Listado de Empresas</CardTitle>
            <CardDescription className="text-md mt-1">
              Gestiona la información de las empresas registradas.
            </CardDescription>
          </div>
          <Button onClick={handleOpenCreateModal} className="bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-5 w-5" />
            Cargar Nueva Empresa
          </Button>
        </CardHeader>
        <CardContent>
          {empresas.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-lg">No hay empresas registradas todavía.</p>
              <p>¡Empieza cargando una nueva para verlo aquí!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] whitespace-nowrap">Código</TableHead>
                    <TableHead className="whitespace-nowrap">Nombre</TableHead>
                    <TableHead className="whitespace-nowrap">Industria</TableHead>
                    <TableHead className="whitespace-nowrap">Email de Contacto</TableHead>
                    <TableHead className="whitespace-nowrap">Dirección</TableHead>
                    <TableHead className="whitespace-nowrap">Estado</TableHead>
                    <TableHead className="text-right w-[220px] whitespace-nowrap">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresas.map((empresa) => (
                    <TableRow key={empresa.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono">{String(empresa.codigo_empresa).padStart(4, '0')}</TableCell>
                      <TableCell className="font-medium">{empresa.nombre}</TableCell>
                      <TableCell>{empresa.industria || '-'}</TableCell>
                      <TableCell>{empresa.email_contacto || '-'}</TableCell>
                      <TableCell className="min-w-[200px] truncate">{empresa.direccion || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(empresa.estado)}
                          className={empresa.estado?.toLowerCase() === 'activo' ? 'bg-accent text-accent-foreground' : ''}
                        >
                          {empresa.estado || 'Desconocido'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1 md:space-x-2">
                        <Button variant="outline" size="sm" className="hover:border-primary hover:text-primary px-2" aria-label={`Ver ${empresa.nombre}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="hover:border-primary hover:text-primary px-2" aria-label={`Modificar ${empresa.nombre}`} onClick={() => handleOpenEditModal(empresa)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="hover:border-destructive hover:text-destructive px-2" aria-label={`Eliminar ${empresa.nombre}`} onClick={() => handleDeleteClick(empresa)}>
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

      <CargaEmpresa
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        empresaToEdit={empresaToEdit}
        onFormSubmit={fetchEmpresas}
      />
      
      {empresaToDelete && (
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Confirmar Eliminación?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar la empresa "{empresaToDelete?.nombre}"?
                <br /> <strong className="text-destructive">(La funcionalidad de eliminación está deshabilitada en esta demo.)</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEmpresaToDelete(null)}>Cancelar</AlertDialogCancel>
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
