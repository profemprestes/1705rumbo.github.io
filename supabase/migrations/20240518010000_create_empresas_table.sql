
-- Create the empresas table
CREATE TABLE public.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_empresa SERIAL UNIQUE, -- Auto-incrementing unique code starting from 1
  nombre TEXT NOT NULL,
  industria TEXT,
  email_contacto TEXT,
  estado TEXT DEFAULT 'Activo', -- Default state, can be 'Activo', 'Inactivo', 'Pendiente', etc.
  direccion TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.handle_empresa_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER on_empresa_update
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_empresa_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- Policies for empresas table
-- 1. Users can see their own companies.
CREATE POLICY "Allow individual read access"
  ON public.empresas
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Users can insert their own companies.
CREATE POLICY "Allow individual insert access"
  ON public.empresas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own companies.
CREATE POLICY "Allow individual update access"
  ON public.empresas
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Users can delete their own companies.
CREATE POLICY "Allow individual delete access"
  ON public.empresas
  FOR DELETE
  USING (auth.uid() = user_id);

-- Optional: Add comments to table and columns for clarity
COMMENT ON TABLE public.empresas IS 'Stores company information linked to users.';
COMMENT ON COLUMN public.empresas.codigo_empresa IS 'Unique, auto-incrementing code for the company.';
COMMENT ON COLUMN public.empresas.estado IS 'Current status of the company (e.g., Activo, Inactivo).';
