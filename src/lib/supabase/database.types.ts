
// This file is a placeholder for your Supabase database types.
// You can generate this file using the Supabase CLI:
// supabase gen types typescript --project-id <your-project-id> --schema public > src/lib/supabase/database.types.ts
// For now, we'll use a minimal definition.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string // UUID, references auth.users.id
          created_at: string // TIMESTAMPTZ
          updated_at: string // TIMESTAMPTZ
          full_name: string | null
          avatar_url: string | null
          username: string | null
        }
        Insert: {
          id: string // UUID, references auth.users.id
          created_at?: string // TIMESTAMPTZ, defaults to NOW()
          updated_at?: string // TIMESTAMPTZ, defaults to NOW()
          full_name?: string | null
          avatar_url?: string | null
          username?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string // TIMESTAMPTZ, will be updated by trigger
          full_name?: string | null
          avatar_url?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey" // Constraint name from SQL
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users" // Supabase's auth.users table
            referencedColumns: ["id"]
          }
        ]
      }
      empresas: {
        Row: {
          id: string
          codigo_empresa: number
          nombre: string
          industria: Database["public"]["Enums"]["type_industria"] | null
          email_contacto: string | null
          estado: string | null
          direccion: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo_empresa?: never
          nombre: string
          industria?: Database["public"]["Enums"]["type_industria"] | null
          email_contacto?: string | null
          estado?: string | null
          direccion?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          codigo_empresa?: never
          nombre?: string
          industria?: Database["public"]["Enums"]["type_industria"] | null
          email_contacto?: string | null
          estado?: string | null
          direccion?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      clientes: {
        Row: {
          id: string
          codigo_cliente: number
          nombre_completo: string
          email: string | null
          telefono: string | null
          direccion: string | null
          id_empresa_asociada: string | null
          estado: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo_cliente?: never
          nombre_completo: string
          email?: string | null
          telefono?: string | null
          direccion?: string | null
          id_empresa_asociada?: string | null
          estado?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          codigo_cliente?: never
          nombre_completo?: string
          email?: string | null
          telefono?: string | null
          direccion?: string | null
          id_empresa_asociada?: string | null
          estado?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_id_empresa_asociada_fkey"
            columns: ["id_empresa_asociada"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          }
        ]
      }
      conductores: { 
        Row: {
          id: string 
          codigo_conductor: number 
          nombre_completo: string
          telefono: string | null
          email: string | null
          password_temporal: string | null // Consider security implications
          id_empresa_asociada: string | null 
          estado: Database["public"]["Enums"]["estado_conductor"] | null 
          user_id: string | null 
          created_at: string 
          updated_at: string 
        }
        Insert: {
          id?: string 
          codigo_conductor?: never 
          nombre_completo: string
          telefono?: string | null
          email?: string | null
          password_temporal?: string | null
          id_empresa_asociada?: string | null
          estado?: Database["public"]["Enums"]["estado_conductor"] | null 
          user_id: string 
          created_at?: string 
          updated_at?: string 
        }
        Update: {
          id?: string
          codigo_conductor?: never
          nombre_completo?: string
          telefono?: string | null
          email?: string | null
          password_temporal?: string | null
          id_empresa_asociada?: string | null
          estado?: Database["public"]["Enums"]["estado_conductor"] | null
          user_id?: string
          created_at?: string
          updated_at?: string 
        }
        Relationships: [
          {
            foreignKeyName: "conductores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conductores_id_empresa_asociada_fkey"
            columns: ["id_empresa_asociada"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          }
        ]
      }
      repartos: {
        Row: {
          id: string
          codigo_reparto: number
          id_viaje: string | null // Nueva columna
          fecha_hora_inicio: string
          fecha_hora_fin_estimada: string | null
          fecha_hora_fin_real: string | null
          id_conductor_asignado: string | null
          vehiculo_descripcion: string | null
          estado_reparto: Database["public"]["Enums"]["estado_reparto"] | null
          destino_direccion: string | null
          notas: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo_reparto?: never
          id_viaje?: string | null // Nueva columna
          fecha_hora_inicio?: string
          fecha_hora_fin_estimada?: string | null
          fecha_hora_fin_real?: string | null
          id_conductor_asignado?: string | null
          vehiculo_descripcion?: string | null
          estado_reparto?: Database["public"]["Enums"]["estado_reparto"] | null
          destino_direccion?: string | null
          notas?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          codigo_reparto?: never
          id_viaje?: string | null // Nueva columna
          fecha_hora_inicio?: string
          fecha_hora_fin_estimada?: string | null
          fecha_hora_fin_real?: string | null
          id_conductor_asignado?: string | null
          vehiculo_descripcion?: string | null
          estado_reparto?: Database["public"]["Enums"]["estado_reparto"] | null
          destino_direccion?: string | null
          notas?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "repartos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repartos_id_conductor_asignado_fkey"
            columns: ["id_conductor_asignado"]
            isOneToOne: false
            referencedRelation: "conductores"
            referencedColumns: ["id"]
          },
          { // Nueva relación
            foreignKeyName: "repartos_id_viaje_fkey"
            columns: ["id_viaje"]
            isOneToOne: false
            referencedRelation: "viajes"
            referencedColumns: ["id"]
          }
        ]
      }
      viajes: { // Nueva tabla
        Row: {
          id: string
          codigo_viaje: number
          id_conductor_asignado: string | null
          vehiculo_descripcion: string | null
          fecha_hora_inicio_planificado: string
          fecha_hora_fin_estimada_planificado: string | null
          estado_viaje: Database["public"]["Enums"]["estado_viaje"]
          notas_viaje: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo_viaje?: never
          id_conductor_asignado?: string | null
          vehiculo_descripcion?: string | null
          fecha_hora_inicio_planificado?: string
          fecha_hora_fin_estimada_planificado?: string | null
          estado_viaje?: Database["public"]["Enums"]["estado_viaje"]
          notas_viaje?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          codigo_viaje?: never
          id_conductor_asignado?: string | null
          vehiculo_descripcion?: string | null
          fecha_hora_inicio_planificado?: string
          fecha_hora_fin_estimada_planificado?: string | null
          estado_viaje?: Database["public"]["Enums"]["estado_viaje"]
          notas_viaje?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "viajes_id_conductor_asignado_fkey"
            columns: ["id_conductor_asignado"]
            isOneToOne: false
            referencedRelation: "conductores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viajes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      // Add your view definitions here
    }
    Functions: {
      handle_empresa_updated_at: {
        Args: {}
        Returns: unknown
      }
      handle_cliente_updated_at: {
        Args: {}
        Returns: unknown
      }
      handle_conductor_updated_at: { 
        Args: {}
        Returns: unknown
      }
      handle_reparto_updated_at: {
        Args: {}
        Returns: unknown
      }
      handle_viaje_updated_at: { // Nueva función para trigger
        Args: {}
        Returns: unknown
      }
    }
    Enums: {
      type_industria: "delivery" | "viandas" | "mensajeria" | "flex"
      estado_conductor: "Activo" | "Inactivo" | "De Viaje" | "En Descanso"
      estado_reparto: "Pendiente" | "En Curso" | "Completado" | "Cancelado"
      estado_viaje: "Planificado" | "En Curso" | "Completado" | "Cancelado" // Nuevo ENUM
    }
    CompositeTypes: {
      // Add your composite type definitions here
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
      
