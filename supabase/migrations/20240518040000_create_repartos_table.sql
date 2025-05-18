
-- Create ENUM type for estado_reparto
CREATE TYPE public.estado_reparto AS ENUM (
    'Pendiente',
    'En Curso',
    'Completado',
    'Cancelado'
);

-- Create repartos table
CREATE TABLE public.repartos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codigo_reparto serial NOT NULL,
  fecha_hora_inicio timestamp with time zone NOT NULL DEFAULT now(),
  fecha_hora_fin_estimada timestamp with time zone NULL,
  fecha_hora_fin_real timestamp with time zone NULL,
  id_conductor_asignado uuid NULL,
  vehiculo_descripcion text NULL,
  estado_reparto public.estado_reparto NULL DEFAULT 'Pendiente'::public.estado_reparto,
  destino_direccion text NULL,
  notas text NULL,
  user_id uuid NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT repartos_pkey PRIMARY KEY (id),
  CONSTRAINT repartos_codigo_reparto_key UNIQUE (codigo_reparto),
  CONSTRAINT repartos_id_conductor_asignado_fkey FOREIGN KEY (id_conductor_asignado) REFERENCES public.conductores (id) ON DELETE SET NULL,
  CONSTRAINT repartos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE public.repartos ENABLE ROW LEVEL SECURITY;

-- Policies for repartos table
CREATE POLICY "Los usuarios pueden ver sus propios repartos" ON public.repartos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios repartos" ON public.repartos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios repartos" ON public.repartos
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios repartos" ON public.repartos
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.handle_reparto_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reparto_update
  BEFORE UPDATE ON public.repartos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_reparto_updated_at();
