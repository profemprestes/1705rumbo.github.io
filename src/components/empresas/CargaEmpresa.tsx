
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/database.types';

type Empresa = Tables<'empresas'>;

interface CargaEmpresaProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  empresaToEdit?: Empresa | null;
  onFormSubmit: () => void; // Callback to refresh list
}

const ESTADOS_EMPRESA = ['Activo', 'Inactivo', 'Pendiente'] as const;
type EstadoEmpresa = typeof ESTADOS_EMPRESA[number];

export function CargaEmpresa({ isOpen, setIsOpen, empresaToEdit, onFormSubmit }: CargaEmpresaProps) {
  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();

  const [nombre, setNombre] = useState('');
  const [industria, setIndustria] = useState('');
  const [emailContacto, setEmailContacto] = useState('');
  const [direccion, setDireccion] = useState('');
  const [estado, setEstado] = useState<EstadoEmpresa>('Activo');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (empresaToEdit) {
      setNombre(empresaToEdit.nombre || '');
      setIndustria(empresaToEdit.industria || '');
      setEmailContacto(empresaToEdit.email_contacto || '');
      setDireccion(empresaToEdit.direccion || '');
      setEstado((empresaToEdit.estado as EstadoEmpresa) || 'Activo');
    } else {
      // Reset form for new entry
      setNombre('');
      setIndustria('');
      setEmailContacto('');
      setDireccion('');
      setEstado('Activo');
    }
  }, [empresaToEdit, isOpen]); // Re-run if empresaToEdit changes or modal opens

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (!nombre) {
      toast({ variant: 'destructive', title: 'Error', description: 'El nombre de la empresa es obligatorio.' });
      setIsLoading(false);
      return;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user && !empresaToEdit) { // user is needed for new entries
        toast({ variant: 'destructive', title: 'Error', description: 'Debes estar autenticado para crear una empresa.' });
        setIsLoading(false);
        return;
    }

    const empresaData = {
      nombre,
      industria: industria || null,
      email_contacto: emailContacto || null,
      direccion: direccion || null,
      estado,
      // user_id is handled by RLS or default on insert if needed, or must be set if required by table
    };

    try {
      if (empresaToEdit && empresaToEdit.id) {
        // Update existing empresa
        const { error } = await supabase
          .from('empresas')
          .update(empresaData as TablesUpdate<'empresas'>)
          .eq('id', empresaToEdit.id);

        if (error) throw error;
        toast({ title: 'Empresa Actualizada', description: 'La información de la empresa ha sido actualizada.' });
      } else {
        // Create new empresa
        if (!user?.id) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo obtener el ID del usuario.' });
            setIsLoading(false);
            return;
        }
        const { error } = await supabase
          .from('empresas')
          .insert([{ ...empresaData, user_id: user.id }] as TablesInsert<'empresas'>[]);

        if (error) throw error;
        toast({ title: 'Empresa Creada', description: 'La nueva empresa ha sido registrada.' });
      }
      onFormSubmit(); // Refresh the list
      setIsOpen(false); // Close modal
    } catch (error: any) {
      console.error('Error guardando empresa:', error);
      toast({
        variant: 'destructive',
        title: 'Error al Guardar',
        description: error.message || 'No se pudo guardar la información de la empresa.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[525px] shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">
            {empresaToEdit ? 'Modificar Empresa' : 'Cargar Nueva Empresa'}
          </DialogTitle>
          <DialogDescription>
            {empresaToEdit ? 'Actualiza los detalles de la empresa.' : 'Completa la información para registrar una nueva empresa.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right col-span-1">
                Nombre
              </Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="col-span-3"
                placeholder="Nombre de la Empresa S.A."
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="industria" className="text-right col-span-1">
                Industria
              </Label>
              <Input
                id="industria"
                value={industria}
                onChange={(e) => setIndustria(e.target.value)}
                className="col-span-3"
                placeholder="Ej: Software, Transporte, Alimentos"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emailContacto" className="text-right col-span-1">
                Email Contacto
              </Label>
              <Input
                id="emailContacto"
                type="email"
                value={emailContacto}
                onChange={(e) => setEmailContacto(e.target.value)}
                className="col-span-3"
                placeholder="contacto@empresa.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="direccion" className="text-right col-span-1">
                Dirección
              </Label>
              <Textarea
                id="direccion"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="col-span-3"
                placeholder="Calle Falsa 123, Ciudad, Provincia"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="estado" className="text-right col-span-1">
                Estado
              </Label>
              <Select value={estado} onValueChange={(value: EstadoEmpresa) => setEstado(value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_EMPRESA.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? (empresaToEdit ? 'Guardando Cambios...' : 'Registrando Empresa...') : (empresaToEdit ? 'Guardar Cambios' : 'Registrar Empresa')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
