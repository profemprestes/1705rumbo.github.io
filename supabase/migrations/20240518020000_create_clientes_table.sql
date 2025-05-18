
-- Create a custom type for client status if needed, or use TEXT
-- For simplicity, using TEXT for estado here.
-- CREATE TYPE public.type_client_status AS ENUM (
-- 'Activo',
-- 'Inactivo',
-- 'Potencial'
-- );
CREATE TABLE public.clientes (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  codigo_cliente serial NOT NULL,
  nombre_completo text NOT NULL,
  email text NULL,
  telefono text NULL,
  direccion text NULL,
  id_empresa_asociada uuid NULL,
  estado text NULL DEFAULT 'Activo'::text,
  user_id uuid NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT clientes_pkey PRIMARY KEY (id),
  CONSTRAINT clientes_codigo_cliente_key UNIQUE (codigo_cliente),
  CONSTRAINT clientes_email_key UNIQUE (email),
  CONSTRAINT clientes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT clientes_id_empresa_asociada_fkey FOREIGN KEY (id_empresa_asociada) REFERENCES public.empresas (id) ON DELETE SET NULL -- Or CASCADE/RESTRICT as needed
);

-- Secure the table with Row Level Security
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Policies for clientes table
CREATE POLICY "Los usuarios pueden ver sus propios clientes" ON public.clientes
  FOR SELECT
  USING (auth.uid () = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propios clientes" ON public.clientes
  FOR INSERT
  WITH CHECK (auth.uid () = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios clientes" ON public.clientes
  FOR UPDATE
  USING (auth.uid () = user_id)
  WITH CHECK (auth.uid () = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios clientes" ON public.clientes
  FOR DELETE
  USING (auth.uid () = user_id);

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_cliente_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for clientes table
CREATE TRIGGER on_cliente_update
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_cliente_updated_at();
