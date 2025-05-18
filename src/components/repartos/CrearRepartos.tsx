
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
import { DatePicker } from "@/components/ui/date-picker";
import { AddressAutocomplete } from '@/components/common/AddressAutocomplete';
import { useToast } from '@/hooks/use-toast';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Tables, TablesInsert, Enums } from '@/lib/supabase/database.types';
import { Loader2, CalendarClock, User, TruckIcon, MapPin, FileText } from 'lucide-react';

type Conductor = Tables<'conductores'>;
type EstadoReparto = Enums<'estado_reparto'>;
type EstadoViaje = Enums<'estado_viaje'>;

interface CrearRepartosProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onFormSubmit: () => void;
}

export function CrearRepartos({ isOpen, setIsOpen, onFormSubmit }: CrearRepartosProps) {
  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();

  const [fechaInicio, setFechaInicio] = useState<Date | undefined>(new Date());
  const [horaInicio, setHoraInicio] = useState<string>(`${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`);
  const [fechaFinEstimada, setFechaFinEstimada] = useState<Date | undefined>();
  const [horaFinEstimada, setHoraFinEstimada] = useState<string>('');
  const [idConductorAsignado, setIdConductorAsignado] = useState<string | null>(null);
  const [vehiculoDescripcion, setVehiculoDescripcion] = useState('');
  const [destinoDireccion, setDestinoDireccion] = useState('');
  const [notas, setNotas] = useState('');

  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [loadingConductores, setLoadingConductores] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchConductores() {
      if (!isOpen) return;
      setLoadingConductores(true);
      const { data, error } = await supabase
        .from('conductores')
        .select('id, nombre_completo, codigo_conductor')
        .eq('estado', 'Activo') 
        .order('nombre_completo');
      
      if (error) {
        console.error('Error fetching conductores:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los conductores activos.' });
      } else {
        setConductores(data || []);
      }
      setLoadingConductores(false);
    }
    fetchConductores();
  }, [isOpen, supabase, toast]);

  const resetForm = () => {
    setFechaInicio(new Date());
    setHoraInicio(`${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`);
    setFechaFinEstimada(undefined);
    setHoraFinEstimada('');
    setIdConductorAsignado(null);
    setVehiculoDescripcion('');
    setDestinoDireccion('');
    setNotas('');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (!fechaInicio || !horaInicio || !idConductorAsignado || !vehiculoDescripcion || !destinoDireccion) {
      toast({ variant: 'destructive', title: 'Error de Validación', description: 'Por favor, completa todos los campos obligatorios (Fecha/Hora Inicio, Conductor, Vehículo, Destino).' });
      setIsLoading(false);
      return;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast({ variant: 'destructive', title: 'Error de Autenticación', description: 'Debes estar autenticado para crear un reparto.' });
        setIsLoading(false);
        return;
    }

    const combinedFechaHoraInicio = `${fechaInicio.toISOString().split('T')[0]}T${horaInicio}:00Z`;
    let combinedFechaHoraFinEstimada = null;
    if (fechaFinEstimada && horaFinEstimada) {
      combinedFechaHoraFinEstimada = `${fechaFinEstimada.toISOString().split('T')[0]}T${horaFinEstimada}:00Z`;
    }

    try {
      // 1. Create a Viaje record for this single reparto
      const viajeToInsert: TablesInsert<'viajes'> = {
        id_conductor_asignado: idConductorAsignado,
        vehiculo_descripcion: vehiculoDescripcion,
        fecha_hora_inicio_planificado: combinedFechaHoraInicio,
        fecha_hora_fin_estimada_planificado: combinedFechaHoraFinEstimada,
        estado_viaje: 'Planificado' as EstadoViaje,
        notas_viaje: notas || null, // Use reparto notes for viaje notes in single creation
        user_id: user.id,
      };

      const { data: viajeData, error: viajeError } = await supabase
        .from('viajes')
        .insert(viajeToInsert)
        .select()
        .single();

      if (viajeError) throw viajeError;
      if (!viajeData) throw new Error("No se pudo crear el viaje para el reparto.");
      
      const nuevoViajeId = viajeData.id;

      // 2. Create the Reparto record linked to the new Viaje
      const repartoData: TablesInsert<'repartos'> = {
        id_viaje: nuevoViajeId,
        fecha_hora_inicio: combinedFechaHoraInicio,
        fecha_hora_fin_estimada: combinedFechaHoraFinEstimada,
        id_conductor_asignado: idConductorAsignado,
        vehiculo_descripcion: vehiculoDescripcion,
        destino_direccion: destinoDireccion,
        notas: notas || null,
        estado_reparto: 'Pendiente' as EstadoReparto,
        user_id: user.id,
      };

      const { error: repartoError } = await supabase.from('repartos').insert([repartoData]);
      if (repartoError) throw repartoError;

      toast({ title: 'Reparto Creado', description: `El nuevo reparto ha sido registrado y asignado al viaje #${viajeData.codigo_viaje}.` });
      onFormSubmit();
      resetForm();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error guardando reparto:', error);
      toast({
        variant: 'destructive',
        title: 'Error al Guardar Reparto',
        description: error.message || 'No se pudo registrar el nuevo reparto.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetForm();
      setIsOpen(open);
    }}>
      <DialogContent className="sm:max-w-lg shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary flex items-center">
            <TruckIcon className="mr-2 h-6 w-6" />
            Cargar Nuevo Reparto (y Viaje asociado)
          </DialogTitle>
          <DialogDescription>
            Completa la información para registrar un nuevo reparto. Se creará un viaje asociado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            
            <div className="space-y-2">
              <Label htmlFor="fechaInicio" className="flex items-center"><CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />Fecha de Inicio</Label>
              <DatePicker date={fechaInicio} setDate={setFechaInicio} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horaInicio">Hora de Inicio</Label>
              <Input id="horaInicio" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaFinEstimada" className="flex items-center"><CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />Fecha de Fin Estimada (Opcional)</Label>
              <DatePicker date={fechaFinEstimada} setDate={setFechaFinEstimada} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horaFinEstimada">Hora de Fin Estimada (Opcional)</Label>
              <Input id="horaFinEstimada" type="time" value={horaFinEstimada} onChange={(e) => setHoraFinEstimada(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="conductorAsignado" className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" />Conductor Asignado</Label>
              <Select 
                value={idConductorAsignado || ""} 
                onValueChange={(value) => setIdConductorAsignado(value || null)}
                required
              >
                <SelectTrigger id="conductorAsignado" disabled={loadingConductores}>
                  <SelectValue placeholder={loadingConductores ? "Cargando conductores..." : "Seleccionar conductor"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingConductores ? (
                    <SelectItem value="loading" disabled>Cargando...</SelectItem>
                  ) : (
                    conductores.map(conductor => (
                      <SelectItem key={conductor.id} value={conductor.id}>
                        {conductor.nombre_completo} (Cód: {String(conductor.codigo_conductor).padStart(4, '0')})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehiculoDescripcion" className="flex items-center"><TruckIcon className="mr-2 h-4 w-4 text-muted-foreground" />Descripción del Vehículo</Label>
              <Input
                id="vehiculoDescripcion"
                value={vehiculoDescripcion}
                onChange={(e) => setVehiculoDescripcion(e.target.value)}
                placeholder="Ej: Ford Transit Patente AB123CD"
                required
              />
            </div>

            <div className="space-y-2">
               <Label htmlFor="destinoDireccion" className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" />Destino / Ubicación de Entrega</Label>
              <AddressAutocomplete
                id="destinoDireccion"
                label=""
                initialValue={destinoDireccion}
                onAddressSelected={setDestinoDireccion}
                placeholder="Buscar dirección de destino..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notasReparto" className="flex items-center"><FileText className="mr-2 h-4 w-4 text-muted-foreground" />Notas / Descripción Contenido (Opcional)</Label>
              <Textarea
                id="notasReparto"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej: Paquete frágil, entregar en recepción..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading || loadingConductores} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Registrando...' : 'Registrar Reparto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
