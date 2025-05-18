
CREATE TYPE public.estado_conductor AS ENUM (
    'Activo',
    'Inactivo',
    'De Viaje',
    'En Descanso'
);

CREATE TABLE public.conductores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codigo_conductor SERIAL NOT NULL,
  nombre_completo TEXT NOT NULL,
  telefono TEXT NULL,
  email TEXT NULL,
  password_temporal TEXT NULL, -- Placeholder for temporary password if needed, not for primary auth
  id_empresa_asociada uuid NULL,
  estado public.estado_conductor NULL DEFAULT 'Activo'::public.estado_conductor,
  user_id uuid NULL, -- Tracks which app user created/manages this record
  created_at TIMESTAMPTZ NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NULL DEFAULT NOW(),
  CONSTRAINT conductores_pkey PRIMARY KEY (id),
  CONSTRAINT conductores_codigo_conductor_key UNIQUE (codigo_conductor),
  CONSTRAINT conductores_email_key UNIQUE (email),
  CONSTRAINT conductores_id_empresa_asociada_fkey FOREIGN KEY (id_empresa_asociada) REFERENCES public.empresas(id) ON DELETE SET NULL,
  CONSTRAINT conductores_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.conductores ENABLE ROW LEVEL SECURITY;

-- Policies for RLS
CREATE POLICY "Los usuarios pueden ver todos los conductores."
  ON public.conductores FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Los usuarios pueden insertar sus propios conductores."
  ON public.conductores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios conductores."
  ON public.conductores FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios conductores."
  ON public.conductores FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to automatically update "updated_at" timestamp
CREATE OR REPLACE FUNCTION public.handle_conductor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_conductor_update
  BEFORE UPDATE ON public.conductores
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_conductor_updated_at();
