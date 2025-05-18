
'use client';

import { useState, useEffect, type FormEvent } from 'react';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/database.types';
import { AddressAutocomplete } from '@/components/common/AddressAutocomplete'; // Assuming you might want this for client address too
import { Loader2 } from 'lucide-react';

type Cliente = Tables<'clientes'>;
type Empresa = Tables<'empresas'>;

const ESTADOS_CLIENTE = ['Activo', 'Inactivo', 'Potencial'] as const;
type EstadoCliente = typeof ESTADOS_CLIENTE[number];

interface CargaClienteProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  clienteToEdit?: Cliente | null;
  onFormSubmit: () => void;
}

export function CargaCliente({ isOpen, setIsOpen, clienteToEdit, onFormSubmit }: CargaClienteProps) {
  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [idEmpresaAsociada, setIdEmpresaAsociada] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoCliente>('Activo');
  
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchEmpresas() {
      setLoadingEmpresas(true);
      const { data, error } = await supabase.from('empresas').select('id, nombre, codigo_empresa').order('nombre');
      if (error) {
        console.error('Error fetching empresas:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las empresas.' });
      } else {
        setEmpresas(data || []);
      }
      setLoadingEmpresas(false);
    }
    if (isOpen) {
      fetchEmpresas();
    }
  }, [isOpen, supabase, toast]);

  useEffect(() => {
    if (clienteToEdit) {
      setNombreCompleto(clienteToEdit.nombre_completo || '');
      setEmail(clienteToEdit.email || '');
      setTelefono(clienteToEdit.telefono || '');
      setDireccion(clienteToEdit.direccion || '');
      setIdEmpresaAsociada(clienteToEdit.id_empresa_asociada || null);
      setEstado((clienteToEdit.estado as EstadoCliente) || 'Activo');
    } else {
      // Reset form for new entry
      setNombreCompleto('');
      setEmail('');
      setTelefono('');
      setDireccion('');
      setIdEmpresaAsociada(null);
      setEstado('Activo');
    }
  }, [clienteToEdit, isOpen]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (!nombreCompleto) {
      toast({ variant: 'destructive', title: 'Error', description: 'El nombre completo del cliente es obligatorio.' });
      setIsLoading(false);
      return;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Debes estar autenticado.' });
        setIsLoading(false);
        return;
    }

    const clienteData = {
      nombre_completo: nombreCompleto,
      email: email || null,
      telefono: telefono || null,
      direccion: direccion || null,
      id_empresa_asociada: idEmpresaAsociada || null,
      estado,
    };

    try {
      if (clienteToEdit && clienteToEdit.id) {
        const { error } = await supabase
          .from('clientes')
          .update(clienteData as TablesUpdate<'clientes'>)
          .eq('id', clienteToEdit.id);

        if (error) throw error;
        toast({ title: 'Cliente Actualizado', description: 'La información del cliente ha sido actualizada.' });
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert([{ ...clienteData, user_id: user.id }] as TablesInsert<'clientes'>[]);

        if (error) throw error;
        toast({ title: 'Cliente Creado', description: 'El nuevo cliente ha sido registrado.' });
      }
      onFormSubmit();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error guardando cliente:', error);
      toast({
        variant: 'destructive',
        title: 'Error al Guardar',
        description: error.message || 'No se pudo guardar la información del cliente.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddressSelected = (selectedAddress: string) => {
    setDireccion(selectedAddress);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">
            {clienteToEdit ? 'Modificar Cliente' : 'Cargar Nuevo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {clienteToEdit ? 'Actualiza los detalles del cliente.' : 'Completa la información para registrar un nuevo cliente.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
              <Label htmlFor="nombreCompleto" className="text-right col-span-1">
                Nombre
              </Label>
              <Input
                id="nombreCompleto"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                className="col-span-3"
                placeholder="Nombre Apellido"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
              <Label htmlFor="emailCliente" className="text-right col-span-1">
                Email
              </Label>
              <Input
                id="emailCliente"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                placeholder="cliente@ejemplo.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
              <Label htmlFor="telefonoCliente" className="text-right col-span-1">
                Teléfono
              </Label>
              <Input
                id="telefonoCliente"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="col-span-3"
                placeholder="2231234567"
              />
            </div>
             <div className="grid grid-cols-4 items-start gap-x-4 gap-y-2">
              <Label htmlFor="direccionCliente" className="text-right col-span-1 pt-2">
                Dirección
              </Label>
              <div className="col-span-3">
                 <AddressAutocomplete
                  id="direccionCliente"
                  label=""
                  initialValue={direccion}
                  onAddressSelected={handleAddressSelected}
                  placeholder="Buscar dirección en Mar del Plata..."
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
              <Label htmlFor="empresaAsociada" className="text-right col-span-1">
                Empresa
              </Label>
              <Select value={idEmpresaAsociada || ''} onValueChange={(value) => setIdEmpresaAsociada(value || null)}>
                <SelectTrigger id="empresaAsociada" className="col-span-3" disabled={loadingEmpresas}>
                  <SelectValue placeholder={loadingEmpresas ? "Cargando empresas..." : "Seleccionar empresa (opcional)"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingEmpresas ? (
                    <SelectItem value="loading" disabled>Cargando...</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="">Ninguna</SelectItem>
                      {empresas.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.nombre} (Cód: {String(emp.codigo_empresa).padStart(4, '0')})
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
              <Label htmlFor="estadoCliente" className="text-right col-span-1">
                Estado
              </Label>
              <Select value={estado} onValueChange={(value: EstadoCliente) => setEstado(value)}>
                <SelectTrigger id="estadoCliente" className="col-span-3">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_CLIENTE.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading || loadingEmpresas} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? (clienteToEdit ? 'Guardando...' : 'Registrando...') : (clienteToEdit ? 'Guardar Cambios' : 'Registrar Cliente')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
