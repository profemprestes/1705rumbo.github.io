
-- Crear el ENUM para el estado del viaje si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_viaje') THEN
        CREATE TYPE public.estado_viaje AS ENUM (
            'Planificado',
            'En Curso',
            'Completado',
            'Cancelado'
        );
    END IF;
END$$;

-- Crear tabla de viajes
CREATE TABLE public.viajes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    codigo_viaje serial NOT NULL,
    id_conductor_asignado uuid NULL,
    vehiculo_descripcion text NULL,
    fecha_hora_inicio_planificado timestamptz NOT NULL DEFAULT now(),
    fecha_hora_fin_estimada_planificado timestamptz NULL,
    estado_viaje public.estado_viaje NOT NULL DEFAULT 'Planificado'::public.estado_viaje,
    notas_viaje text NULL,
    user_id uuid NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT viajes_pkey PRIMARY KEY (id),
    CONSTRAINT viajes_codigo_viaje_key UNIQUE (codigo_viaje),
    CONSTRAINT viajes_id_conductor_asignado_fkey FOREIGN KEY (id_conductor_asignado) REFERENCES public.conductores(id) ON DELETE SET NULL,
    CONSTRAINT viajes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Asegurar que RLS está habilitada
ALTER TABLE public.viajes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para la tabla de viajes
CREATE POLICY "Los usuarios pueden ver sus propios viajes"
ON public.viajes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear viajes"
ON public.viajes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios viajes"
ON public.viajes FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios viajes"
ON public.viajes FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para actualizar 'updated_at' en la tabla de viajes
CREATE OR REPLACE FUNCTION public.handle_viaje_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_viaje_update
BEFORE UPDATE ON public.viajes
FOR EACH ROW EXECUTE FUNCTION public.handle_viaje_updated_at();

-- Modificar tabla de repartos para añadir la referencia al viaje
ALTER TABLE public.repartos
ADD COLUMN id_viaje uuid NULL,
ADD CONSTRAINT repartos_id_viaje_fkey FOREIGN KEY (id_viaje) REFERENCES public.viajes(id) ON DELETE SET NULL;

-- Actualizar la función de trigger de repartos si es necesario (generalmente no es necesario por añadir una columna)
-- Si la función 'handle_reparto_updated_at' ya existe y es genérica, está bien.
-- Si no existe o es específica, hay que crearla/ajustarla.
-- Asumiendo que ya existe por la migración anterior de repartos.

-- Comentario: El campo id_empresa_asociada en la tabla viajes podría ser útil si cada viaje pertenece a una empresa.
-- Por ahora, no se añade para mantener la simplicidad.
-- ALTER TABLE public.viajes ADD COLUMN id_empresa_asociada UUID NULL REFERENCES public.empresas(id) ON DELETE SET NULL;
      
