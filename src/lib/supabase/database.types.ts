
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
      empresas: { // New table for companies
        Row: {
          id: string // UUID
          codigo_empresa: number // SERIAL, auto-incrementing
          nombre: string
          industria: string | null
          email_contacto: string | null
          estado: string | null // e.g., 'Activo', 'Inactivo'
          direccion: string | null
          user_id: string | null // UUID, references auth.users.id
          created_at: string // TIMESTAMPTZ
          updated_at: string // TIMESTAMPTZ
        }
        Insert: {
          id?: string // Default is gen_random_uuid()
          codigo_empresa?: never // SERIAL, handled by database
          nombre: string
          industria?: string | null
          email_contacto?: string | null
          estado?: string | null // Default is 'Activo'
          direccion?: string | null
          user_id: string // Associated user
          created_at?: string // Default is NOW()
          updated_at?: string // Default is NOW()
        }
        Update: {
          id?: string
          codigo_empresa?: never // Should not be updated directly
          nombre?: string
          industria?: string | null
          email_contacto?: string | null
          estado?: string | null
          direccion?: string | null
          user_id?: string // Typically not changed after creation
          created_at?: string
          updated_at?: string // Handled by trigger
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
    }
    Views: {
      // Add your view definitions here
    }
    Functions: {
      // Add your function definitions here
      // Example of how handle_profile_updated_at might be typed if directly callable via RPC
      // (though it's a trigger function, so not typically called directly):
      // handle_profile_updated_at: {
      //   Args: {}
      //   Returns: unknown // Actually returns a trigger type
      // }
      handle_empresa_updated_at: { // Function for empresas table
        Args: {}
        Returns: unknown 
      }
    }
    Enums: {
      // Add your enum definitions here
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
