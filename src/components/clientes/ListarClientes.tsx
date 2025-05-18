
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit3, Trash2, Eye, Loader2, Users } from "lucide-react";
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Database, Tables } from "@/lib/supabase/database.types";
import { CargaCliente } from "./CargaCliente";
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

type Cliente = Tables<'clientes'>;
type Empresa = Tables<'empresas'>;

// Extend Cliente type to potentially include empresa_nombre
type ClienteConEmpresa = Cliente & {
  empresas?: { nombre: string } | null; // Supabase relation convention
};


export function ListarClientes() {
  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();

  const [clientes, setClientes] = useState<ClienteConEmpresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);
  
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const fetchClientes = async () => {
    setLoading(true);
    setError(null);
    // Fetch clientes and join with empresas table to get empresa.nombre
    const { data, error: fetchError } = await supabase
      .from('clientes')
      .select(`
        *,
        empresas (
          nombre
        )
      `)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error("Error fetching clientes:", fetchError);
      setError(fetchError.message);
      setClientes([]);
    } else {
      setClientes(data as ClienteConEmpresa[] || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const getStatusBadgeVariant = (status: string | null): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case 'activo':
        return 'default'; // Greenish if default is accent
      case 'inactivo':
        return 'destructive';
      case 'potencial':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleOpenCreateModal = () => {
    setClienteToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cliente: Cliente) => {
    setClienteToEdit(cliente);
    setIsModalOpen(true);
  };
  
  const handleDeleteClick = (cliente: Cliente) => {
    setClienteToDelete(cliente);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!clienteToDelete) return;
    
    // Placeholder for actual delete logic
    // const { error: deleteError } = await supabase.from('clientes').delete().eq('id', clienteToDelete.id);
    // if (deleteError) {
    //   toast({ variant: 'destructive', title: 'Error', description: `No se pudo eliminar el cliente: ${deleteError.message}`});
    // } else {
    //   toast({ title: 'Cliente Eliminado', description: `El cliente ${clienteToDelete.nombre_completo} ha sido eliminado.` });
    //   fetchClientes(); // Refresh list
    // }
    // setIsAlertOpen(false);
    // setClienteToDelete(null);

    console.log("Confirm delete for:", clienteToDelete.nombre_completo);
    toast({ title: 'Función Deshabilitada', description: `La eliminación de ${clienteToDelete.nombre_completo} está deshabilitada en esta demo.` });
    setIsAlertOpen(false);
    setClienteToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
        <span className="text-lg text-muted-foreground">Cargando clientes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-destructive">
        <p className="text-lg font-semibold">Error al cargar clientes</p>
        <p>{error}</p>
        <Button onClick={fetchClientes} className="mt-4">Reintentar</Button>
      </div>
    );
  }

  return (
    <>
      <Card className="shadow-md rounded-lg w-full">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground flex items-center">
              <Users className="mr-2 h-6 w-6" /> Listado de Clientes
            </CardTitle>
            <CardDescription className="text-md mt-1">
              Gestiona la información de los clientes registrados.
            </CardDescription>
          </div>
          <Button onClick={handleOpenCreateModal} className="bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-5 w-5" />
            Cargar Nuevo Cliente
          </Button>
        </CardHeader>
        <CardContent>
          {clientes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-lg">No hay clientes registrados todavía.</p>
              <p>¡Empieza cargando uno nuevo para verlo aquí!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] whitespace-nowrap">Código</TableHead>
                    <TableHead className="whitespace-nowrap">Nombre Completo</TableHead>
                    <TableHead className="whitespace-nowrap">Email</TableHead>
                    <TableHead className="whitespace-nowrap">Teléfono</TableHead>
                    <TableHead className="whitespace-nowrap">Empresa Asociada</TableHead>
                    <TableHead className="whitespace-nowrap">Estado</TableHead>
                    <TableHead className="text-right w-[180px] whitespace-nowrap">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((cliente) => (
                    <TableRow key={cliente.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono">{String(cliente.codigo_cliente).padStart(4, '0')}</TableCell>
                      <TableCell className="font-medium">{cliente.nombre_completo}</TableCell>
                      <TableCell>{cliente.email || '-'}</TableCell>
                      <TableCell>{cliente.telefono || '-'}</TableCell>
                      <TableCell>{cliente.empresas?.nombre || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(cliente.estado)}
                          className={cliente.estado?.toLowerCase() === 'activo' ? 'bg-accent text-accent-foreground' : ''}
                        >
                          {cliente.estado || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1 md:space-x-2">
                        <Button variant="outline" size="sm" className="hover:border-primary hover:text-primary px-2" aria-label={`Ver ${cliente.nombre_completo}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="hover:border-primary hover:text-primary px-2" aria-label={`Modificar ${cliente.nombre_completo}`} onClick={() => handleOpenEditModal(cliente)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="hover:border-destructive hover:text-destructive px-2" aria-label={`Eliminar ${cliente.nombre_completo}`} onClick={() => handleDeleteClick(cliente)}>
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

      <CargaCliente
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        clienteToEdit={clienteToEdit}
        onFormSubmit={fetchClientes}
      />
      
      {clienteToDelete && (
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Confirmar Eliminación?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar al cliente "{clienteToDelete?.nombre_completo}"?
                <br /> <strong className="text-destructive">(La funcionalidad de eliminación está deshabilitada en esta demo.)</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setClienteToDelete(null)}>Cancelar</AlertDialogCancel>
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
