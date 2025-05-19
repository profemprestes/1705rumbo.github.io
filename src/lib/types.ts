

export type ClientService = "reparto viandas" | "mensajería" | "delivery" | "otros";
export type DayOfWeek = "lunes" | "martes" | "miércoles" | "jueves" | "viernes" | "sábado" | "domingo";
export type FrecuenciaParada = "diario" | "lunes, miércoles y viernes" | "semanal (especificar semana)" | "único";
export type TipoRepartoCliente = "diario" | "semanal" | "quincenal";


// ClientesNuestros (corresponds to 'clientesnuestros' table)
export interface ClienteNuestro {
  id: string; // UUID
  nombre: string;
  direccion_retiro?: string | null; 
  servicios: ClientService[];
  dias_de_reparto: DayOfWeek[];
  zona_id: string; 
  zonas?: Pick<Zone, 'nombre'> | null; 
  otros_detalles?: string;
  created_at?: string;
  updated_at?: string;
}

// Paradas (This table might become less central for Repartos if DetallesReparto takes over)
export interface Stop {
  id: string; // UUID
  cliente_id: string; 
  direccion: string;
  horario_inicio?: string | null; 
  horario_fin?: string | null; 
  frecuencia?: FrecuenciaParada | null;
  zona_id: string; 
  zonas?: Pick<Zone, 'nombre'> | null; 
  notas_adicionales?: string;
  created_at?: string;
  updated_at?: string;
}

export type DriverStatus = "activo" | "inactivo";
// Repartidores (corresponds to 'repartidores' table)
export interface Driver {
  id: string; // UUID
  nombre: string;
  identificacion?: string;
  contacto?: string;
  tipo_vehiculo?: string;
  patente?: string;
  status: DriverStatus;
  created_at?: string;
  updated_at?: string;
}

export type DeliveryStatus = "pendiente" | "en curso" | "entregado" | "cancelado" | "reprogramado";
export type DetalleRepartoStatus = 'pendiente' | 'en_camino' | 'entregado' | 'no_entregado' | 'cancelado_item';


// DetallesReparto (corresponds to 'detallesreparto' table)
export interface DetalleReparto {
  id: string; // UUID
  reparto_id: string; // UUID
  cliente_reparto_id: number; // INTEGER, FK to ClientesReparto.id
  clientesreparto?: Pick<ClientReparto, 'id' | 'nombre' | 'direccion' | 'horario_inicio' | 'horario_fin' | 'restricciones' | 'contacto_nombre' | 'contacto_telefono'>; // Added contact info
  valor_entrega?: number | null; // NUMERIC
  detalle_entrega?: string | null; // TEXT
  orden_visita: number; // INTEGER
  estado_item_reparto: DetalleRepartoStatus; // Added new status field
  created_at?: string;
  updated_at?: string;
}

// Repartos (corresponds to 'repartos' table)
export interface Delivery {
  id: string; // UUID
  fecha: string | Date; 
  repartidor_id: string; 
  repartidores?: Pick<Driver, 'nombre'> | null; 
  cliente_nuestro_id?: string | null; 
  clientesnuestros?: Pick<ClienteNuestro, 'id' | 'nombre'> | null; 
  zona_id: string; 
  zonas?: Pick<Zone, 'nombre'> | null; 
  tanda: number; 
  estado_entrega: DeliveryStatus;
  detalles_reparto?: DetalleReparto[]; 
  created_at?: string;
  updated_at?: string;
}

// Zonas (corresponds to 'zonas' table)
export interface Zone {
  id: string; // UUID
  nombre: string;
  created_at?: string;
  updated_at?: string;
}

export type ProductStatus = "disponible" | "agotado" | "descontinuado";
// Productos (corresponds to 'productos' table)
export interface Product {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  precio: number;
  estado: ProductStatus;
  created_at?: string;
  updated_at?: string;
}

// ClientesReparto (corresponds to 'clientesreparto' table)
export interface ClientReparto {
  id: number; // SERIAL
  nombre: string;
  direccion: string;
  horario_inicio?: string | null; // TIME
  horario_fin?: string | null; // TIME
  restricciones?: string | null;
  tipo_reparto?: TipoRepartoCliente | null;
  dias_especificos?: DayOfWeek[] | null; 
  cliente_nuestro_id: string; 
  clientesnuestros?: Pick<ClienteNuestro, 'nombre'> | null; 
  // Added for mobile dashboard, assuming these fields would be useful.
  // If they don't exist in your DB, you'll need to add them or fetch from ClientesNuestros if applicable.
  contacto_nombre?: string | null; 
  contacto_telefono?: string | null; 
  created_at?: string;
  updated_at?: string;
}


// For Route Optimization form
export interface OptimizationStop {
  address: string;
  priority: number;
}

// Mobile Dashboard specific types
export interface MobileTask {
  id: string; // DetalleReparto.id
  repartoId: string; // Repartos.id
  clientName: string; // ClientesReparto.nombre
  address: string; // ClientesReparto.direccion
  timeWindowDisplay?: string; // Formatted time window
  status: DetalleRepartoStatus;
  contactName?: string | null; // From ClientesReparto.contacto_nombre
  contactPhone?: string | null; // From ClientesReparto.contacto_telefono
  specialInstructions?: string | null; // From ClientesReparto.restricciones or DetallesReparto.detalle_entrega
  valueToCollect?: number | null; // From DetallesReparto.valor_entrega
  ordenVisita: number;
}


// Constants for forms
export const ALL_SERVICES: ClientService[] = ["reparto viandas", "mensajería", "delivery", "otros"];
export const ALL_DAYS: DayOfWeek[] = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
export const ALL_FRECUENCIAS_PARADA: FrecuenciaParada[] = ["diario", "lunes, miércoles y viernes", "semanal (especificar semana)", "único"];
export const ALL_DRIVER_STATUSES: DriverStatus[] = ["activo", "inactivo"];
export const ALL_DELIVERY_STATUSES: DeliveryStatus[] = ["pendiente", "en curso", "entregado", "cancelado", "reprogramado"];
export const ALL_PRODUCT_STATUSES: ProductStatus[] = ["disponible", "agotado", "descontinuado"];
export const ALL_TIPO_REPARTO_CLIENTE: TipoRepartoCliente[] = ["diario", "semanal", "quincenal"];
export const ALL_DETALLE_REPARTO_STATUSES: DetalleRepartoStatus[] = ['pendiente', 'en_camino', 'entregado', 'no_entregado', 'cancelado_item'];


// Keeping old ALL_FREQUENCIES if it's used elsewhere, but new one is ALL_FRECUENCIAS_PARADA
export const ALL_FREQUENCIES: FrecuenciaParada[] = ["diario", "lunes, miércoles y viernes", "semanal (especificar semana)", "único"];
    
