
'use client';

import { useState, useEffect, type FormEvent, useCallback } from 'react';
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from '@/hooks/use-toast';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Tables, TablesInsert, Enums } from '@/lib/supabase/database.types';
import { Loader2, CalendarClock, User, TruckIcon, Building, UsersIcon, PackagePlus } from 'lucide-react';

type Empresa = Tables<'empresas'>;
type Cliente = Tables<'clientes'>;
type Conductor = Tables<'conductores'>;
type EstadoReparto = Enums<'estado_reparto'>;
type EstadoViaje = Enums<'estado_viaje'>;

interface AsignarRepartosLoteProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onFormSubmit: () => void;
}

export function AsignarRepartosLote({ isOpen, setIsOpen, onFormSubmit }: AsignarRepartosLoteProps) {
  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();

  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);

  const [clientesEmpresa, setClientesEmpresa] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [selectedClienteIds, setSelectedClienteIds] = useState<Set<string>>(new Set());

  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [loadingConductores, setLoadingConductores] = useState(false);
  const [selectedConductorId, setSelectedConductorId] = useState<string | null>(null);

  const [fechaInicio, setFechaInicio] = useState<Date | undefined>(new Date());
  const [horaInicio, setHoraInicio] = useState<string>(`${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`);
  const [fechaFinEstimada, setFechaFinEstimada] = useState<Date | undefined>();
  const [horaFinEstimada, setHoraFinEstimada] = useState<string>('');
  const [vehiculoDescripcion, setVehiculoDescripcion] = useState('');
  const [notasViaje, setNotasViaje] = useState(''); // Renamed for clarity, these are common notes for the viaje

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setSelectedEmpresaId(null);
    setClientesEmpresa([]);
    setSelectedClienteIds(new Set());
    setSelectedConductorId(null);
    setFechaInicio(new Date());
    setHoraInicio(`${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`);
    setFechaFinEstimada(undefined);
    setHoraFinEstimada('');
    setVehiculoDescripcion('');
    setNotasViaje('');
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  useEffect(() => {
    async function fetchInitialData() {
      if (!isOpen) return;
      setLoadingEmpresas(true);
      const { data: empresasData, error: empresasError } = await supabase
        .from('empresas')
        .select('id, nombre, codigo_empresa')
        .order('nombre');
      if (empresasError) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las empresas.' });
      } else {
        setEmpresas(empresasData || []);
      }
      setLoadingEmpresas(false);

      setLoadingConductores(true);
      const { data: conductoresData, error: conductoresError } = await supabase
        .from('conductores')
        .select('id, nombre_completo, codigo_conductor')
        .eq('estado', 'Activo')
        .order('nombre_completo');
      if (conductoresError) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los conductores.' });
      } else {
        setConductores(conductoresData || []);
      }
      setLoadingConductores(false);
    }
    fetchInitialData();
  }, [isOpen, supabase, toast]);

  useEffect(() => {
    async function fetchClientesPorEmpresa() {
      if (!selectedEmpresaId) {
        setClientesEmpresa([]);
        setSelectedClienteIds(new Set());
        return;
      }
      setLoadingClientes(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nombre_completo, direccion, codigo_cliente')
        .eq('id_empresa_asociada', selectedEmpresaId)
        .order('nombre_completo');
      
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los clientes para la empresa seleccionada.' });
        setClientesEmpresa([]);
      } else {
        setClientesEmpresa(data || []);
      }
      setSelectedClienteIds(new Set()); // Reset client selection
      setLoadingClientes(false);
    }
    fetchClientesPorEmpresa();
  }, [selectedEmpresaId, supabase, toast]);

  const handleClienteSelection = (clienteId: string) => {
    setSelectedClienteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clienteId)) {
        newSet.delete(clienteId);
      } else {
        newSet.add(clienteId);
      }
      return newSet;
    });
  };

  const handleSelectAllClientes = () => {
    if (selectedClienteIds.size === clientesEmpresa.length) {
      setSelectedClienteIds(new Set());
    } else {
      setSelectedClienteIds(new Set(clientesEmpresa.map(c => c.id)));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!selectedEmpresaId || selectedClienteIds.size === 0 || !selectedConductorId || !fechaInicio || !horaInicio || !vehiculoDescripcion) {
      toast({ variant: 'destructive', title: 'Error de Validación', description: 'Por favor, complete todos los campos obligatorios: Empresa, al menos un Cliente, Conductor, Fecha/Hora Inicio y Vehículo.' });
      setIsSubmitting(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ variant: 'destructive', title: 'Error de Autenticación', description: 'Debes estar autenticado.' });
      setIsSubmitting(false);
      return;
    }

    const combinedFechaHoraInicioPlanificado = `${fechaInicio.toISOString().split('T')[0]}T${horaInicio}:00Z`;
    let combinedFechaHoraFinEstimadaPlanificado = null;
    if (fechaFinEstimada && horaFinEstimada) {
      combinedFechaHoraFinEstimadaPlanificado = `${fechaFinEstimada.toISOString().split('T')[0]}T${horaFinEstimada}:00Z`;
    }

    try {
      // 1. Create Viaje record
      const viajeToInsert: TablesInsert<'viajes'> = {
        id_conductor_asignado: selectedConductorId,
        vehiculo_descripcion: vehiculoDescripcion,
        fecha_hora_inicio_planificado: combinedFechaHoraInicioPlanificado,
        fecha_hora_fin_estimada_planificado: combinedFechaHoraFinEstimadaPlanificado,
        estado_viaje: 'Planificado' as EstadoViaje,
        notas_viaje: notasViaje || null,
        user_id: user.id,
      };

      const { data: viajeData, error: viajeError } = await supabase
        .from('viajes')
        .insert(viajeToInsert)
        .select()
        .single();

      if (viajeError) throw viajeError;
      if (!viajeData) throw new Error("No se pudo crear el viaje.");

      const nuevoViajeId = viajeData.id;

      // 2. Create Reparto records for each selected client, linked to the viaje
      const repartosToInsert: TablesInsert<'repartos'>[] = [];
      for (const clienteId of selectedClienteIds) {
        const cliente = clientesEmpresa.find(c => c.id === clienteId);
        if (!cliente || !cliente.direccion) {
          toast({ variant: 'warning', title: 'Cliente sin Dirección', description: `El cliente ${cliente?.nombre_completo || clienteId} no tiene una dirección asignada y será omitido.` });
          continue;
        }
        repartosToInsert.push({
          id_viaje: nuevoViajeId,
          fecha_hora_inicio: combinedFechaHoraInicioPlanificado, // Using viaje's planned start for individual repartos
          fecha_hora_fin_estimada: combinedFechaHoraFinEstimadaPlanificado, // Using viaje's planned end
          id_conductor_asignado: selectedConductorId, // Redundant if viaje has it, but good for direct query on repartos
          vehiculo_descripcion: vehiculoDescripcion, // Redundant
          destino_direccion: cliente.direccion,
          notas: notasViaje || null, // Common notes from viaje, can be overridden per reparto if needed later
          estado_reparto: 'Pendiente' as EstadoReparto,
          user_id: user.id,
        });
      }

      if (repartosToInsert.length === 0) {
        // If no valid repartos, consider deleting the created viaje or handling as needed
        // For now, we'll toast and not proceed with reparto insertion.
        // Potentially, delete the viaje: await supabase.from('viajes').delete().eq('id', nuevoViajeId);
        toast({ variant: 'info', title: 'No hay Repartos para Crear', description: 'Ninguno de los clientes seleccionados tenía una dirección válida. El viaje no contendrá repartos.' });
      } else {
        const { error: repartosError } = await supabase.from('repartos').insert(repartosToInsert);
        if (repartosError) throw repartosError;
        toast({ title: 'Repartos Asignados', description: `${repartosToInsert.length} reparto(s) creado(s) y asignados al viaje #${viajeData.codigo_viaje}.` });
      }
      
      onFormSubmit();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error asignando repartos en lote:', error);
      toast({ variant: 'destructive', title: 'Error al Asignar', description: error.message || 'No se pudieron crear los repartos.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary flex items-center">
            <PackagePlus className="mr-2 h-6 w-6" />
            Asignar Repartos en Lote (Nuevo Viaje)
          </DialogTitle>
          <DialogDescription>
            Selecciona una empresa, clientes y un conductor para crear un nuevo viaje con múltiples repartos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[70vh] p-1">
          <div className="grid gap-6 py-4 px-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="empresaLote" className="flex items-center"><Building className="mr-2 h-4 w-4 text-muted-foreground" />Empresa</Label>
                <Select value={selectedEmpresaId || ""} onValueChange={setSelectedEmpresaId} required>
                  <SelectTrigger id="empresaLote" disabled={loadingEmpresas}>
                    <SelectValue placeholder={loadingEmpresas ? "Cargando empresas..." : "Seleccionar empresa"} />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingEmpresas ? (<SelectItem value="loading" disabled>Cargando...</SelectItem>) : 
                      empresas.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.nombre} (Cód: {String(emp.codigo_empresa).padStart(4, '0')})</SelectItem>)
                    }
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="conductorLote" className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" />Conductor Asignado al Viaje</Label>
                <Select value={selectedConductorId || ""} onValueChange={setSelectedConductorId} required>
                  <SelectTrigger id="conductorLote" disabled={loadingConductores}>
                    <SelectValue placeholder={loadingConductores ? "Cargando conductores..." : "Seleccionar conductor"} />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingConductores ? (<SelectItem value="loading" disabled>Cargando...</SelectItem>) :
                      conductores.map(cond => <SelectItem key={cond.id} value={cond.id}>{cond.nombre_completo} (Cód: {String(cond.codigo_conductor).padStart(4, '0')})</SelectItem>)
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label className="flex items-center"><UsersIcon className="mr-2 h-4 w-4 text-muted-foreground" />Clientes para este Viaje</Label>
                    {clientesEmpresa.length > 0 && (
                        <Button type="button" variant="link" size="sm" onClick={handleSelectAllClientes} disabled={loadingClientes}>
                            {selectedClienteIds.size === clientesEmpresa.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                        </Button>
                    )}
                </div>
              {loadingClientes ? (<div className="flex items-center justify-center p-4"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando clientes...</div>) : 
               !selectedEmpresaId ? (<p className="text-sm text-muted-foreground p-4 text-center">Selecciona una empresa para ver sus clientes.</p>) :
               clientesEmpresa.length === 0 ? (<p className="text-sm text-muted-foreground p-4 text-center">No hay clientes para la empresa seleccionada.</p>) : (
                <ScrollArea className="h-48 rounded-md border p-2">
                  <div className="space-y-1">
                    {clientesEmpresa.map(cliente => (
                      <div key={cliente.id} className="flex items-center space-x-2 p-1.5 hover:bg-muted rounded-md">
                        <Checkbox
                          id={`cliente-lote-${cliente.id}`}
                          checked={selectedClienteIds.has(cliente.id)}
                          onCheckedChange={() => handleClienteSelection(cliente.id)}
                        />
                        <Label htmlFor={`cliente-lote-${cliente.id}`} className="font-normal flex-grow cursor-pointer">
                          {cliente.nombre_completo} <span className="text-xs text-muted-foreground">({cliente.direccion || 'Sin dirección'})</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicioLote" className="flex items-center"><CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />Fecha Inicio del Viaje</Label>
                <DatePicker date={fechaInicio} setDate={setFechaInicio} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaInicioLote">Hora Inicio del Viaje</Label>
                <Input id="horaInicioLote" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaFinEstimadaLote" className="flex items-center"><CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />Fecha Fin Estimada del Viaje (Opc.)</Label>
                <DatePicker date={fechaFinEstimada} setDate={setFechaFinEstimada} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaFinEstimadaLote">Hora Fin Estimada del Viaje (Opc.)</Label>
                <Input id="horaFinEstimadaLote" type="time" value={horaFinEstimada} onChange={(e) => setHoraFinEstimada(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehiculoDescripcionLote" className="flex items-center"><TruckIcon className="mr-2 h-4 w-4 text-muted-foreground" />Descripción del Vehículo del Viaje</Label>
              <Input
                id="vehiculoDescripcionLote"
                value={vehiculoDescripcion}
                onChange={(e) => setVehiculoDescripcion(e.target.value)}
                placeholder="Ej: Ford Transit Patente AB123CD"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notasViajeLote">Notas Comunes para el Viaje (Opcional)</Label>
              <Textarea
                id="notasViajeLote"
                value={notasViaje}
                onChange={(e) => setNotasViaje(e.target.value)}
                placeholder="Notas generales para este viaje/lote..."
                rows={2}
              />
            </div>
          </div>
          </ScrollArea>
          <DialogFooter className="mt-6 px-2 pb-2 pt-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || loadingEmpresas || loadingConductores || loadingClientes} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackagePlus className="mr-2 h-4 w-4" /> }
              {isSubmitting ? 'Creando Viaje y Repartos...' : `Crear Viaje con ${selectedClienteIds.size > 0 ? selectedClienteIds.size : ''} Reparto(s)`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
    
