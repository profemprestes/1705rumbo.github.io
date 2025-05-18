
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
import { useToast } from '@/hooks/use-toast';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Tables, TablesInsert, TablesUpdate, Enums } from '@/lib/supabase/database.types';
import { Loader2 } from 'lucide-react';

type Conductor = Tables<'conductores'>;
type Empresa = Tables<'empresas'>;
type EstadoConductor = Enums<'estado_conductor'>;

const ESTADOS_CONDUCTOR: EstadoConductor[] = ['Activo', 'Inactivo', 'De Viaje', 'En Descanso'];

interface CargaConductorProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  conductorToEdit?: Conductor | null;
  onFormSubmit: () => void;
}

export function CargaConductor({ isOpen, setIsOpen, conductorToEdit, onFormSubmit }: CargaConductorProps) {
  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [passwordTemporal, setPasswordTemporal] = useState('');
  const [idEmpresaAsociada, setIdEmpresaAsociada] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoConductor>('Activo');
  
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
    if (conductorToEdit) {
      setNombreCompleto(conductorToEdit.nombre_completo || '');
      setTelefono(conductorToEdit.telefono || '');
      setEmail(conductorToEdit.email || '');
      setPasswordTemporal(''); // Do not prefill password
      setIdEmpresaAsociada(conductorToEdit.id_empresa_asociada || null);
      setEstado(conductorToEdit.estado || 'Activo');
    } else {
      // Reset form for new entry
      setNombreCompleto('');
      setTelefono('');
      setEmail('');
      setPasswordTemporal('');
      setIdEmpresaAsociada(null);
      setEstado('Activo');
    }
  }, [conductorToEdit, isOpen]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (!nombreCompleto) {
      toast({ variant: 'destructive', title: 'Error', description: 'El nombre completo del conductor es obligatorio.' });
      setIsLoading(false);
      return;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Debes estar autenticado.' });
        setIsLoading(false);
        return;
    }

    const conductorData: Partial<TablesInsert<'conductores'>> = {
      nombre_completo: nombreCompleto,
      telefono: telefono || null,
      email: email || null,
      // password_temporal is intentionally not saved for now, as its secure handling is complex.
      // If needed, a proper password reset/invite flow would be required.
      // password_temporal: passwordTemporal || null, 
      id_empresa_asociada: idEmpresaAsociada || null,
      estado,
    };
     if (passwordTemporal && !conductorToEdit) { // Only set for new users if provided
      conductorData.password_temporal = passwordTemporal;
    }


    try {
      if (conductorToEdit && conductorToEdit.id) {
        const updateData: TablesUpdate<'conductores'> = { ...conductorData };
        // Do not update password_temporal on edit unless explicitly designed to
        delete updateData.password_temporal; 

        const { error } = await supabase
          .from('conductores')
          .update(updateData)
          .eq('id', conductorToEdit.id);

        if (error) throw error;
        toast({ title: 'Conductor Actualizado', description: 'La información del conductor ha sido actualizada.' });
      } else {
        const insertData: TablesInsert<'conductores'> = { 
            ...conductorData, 
            user_id: user.id, 
            nombre_completo: nombreCompleto // ensure required field is present
        };
        const { error } = await supabase
          .from('conductores')
          .insert([insertData]);

        if (error) throw error;
        toast({ title: 'Conductor Creado', description: 'El nuevo conductor ha sido registrado.' });
      }
      onFormSubmit();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error guardando conductor:', error);
      toast({
        variant: 'destructive',
        title: 'Error al Guardar',
        description: error.message || 'No se pudo guardar la información del conductor.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">
            {conductorToEdit ? 'Modificar Conductor' : 'Cargar Nuevo Conductor'}
          </DialogTitle>
          <DialogDescription>
            {conductorToEdit ? 'Actualiza los detalles del conductor.' : 'Completa la información para registrar un nuevo conductor.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
              <Label htmlFor="nombreCompletoConductor" className="text-right col-span-1">
                Nombre
              </Label>
              <Input
                id="nombreCompletoConductor"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                className="col-span-3"
                placeholder="Nombre Apellido"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
              <Label htmlFor="telefonoConductor" className="text-right col-span-1">
                Teléfono
              </Label>
              <Input
                id="telefonoConductor"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="col-span-3"
                placeholder="+54 223 1234567"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
              <Label htmlFor="emailConductor" className="text-right col-span-1">
                Email
              </Label>
              <Input
                id="emailConductor"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                placeholder="conductor@ejemplo.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
              <Label htmlFor="passwordTemporalConductor" className="text-right col-span-1">
                Pass Temporal
              </Label>
              <Input
                id="passwordTemporalConductor"
                type="password"
                value={passwordTemporal}
                onChange={(e) => setPasswordTemporal(e.target.value)}
                className="col-span-3"
                placeholder={conductorToEdit ? "Dejar en blanco para no cambiar" : "••••••••"}
                autoComplete="new-password"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
              <Label htmlFor="empresaAsociadaConductor" className="text-right col-span-1">
                Empresa
              </Label>
              <Select value={idEmpresaAsociada || ''} onValueChange={(value) => setIdEmpresaAsociada(value || null)}>
                <SelectTrigger id="empresaAsociadaConductor" className="col-span-3" disabled={loadingEmpresas}>
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
              <Label htmlFor="estadoConductor" className="text-right col-span-1">
                Estado
              </Label>
              <Select value={estado} onValueChange={(value: EstadoConductor) => setEstado(value)}>
                <SelectTrigger id="estadoConductor" className="col-span-3">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_CONDUCTOR.map(s => (
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
              {isLoading ? (conductorToEdit ? 'Guardando...' : 'Registrando...') : (conductorToEdit ? 'Guardar Cambios' : 'Registrar Conductor')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
