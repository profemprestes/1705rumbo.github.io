
-- Crea la tabla 'profiles' para almacenar información adicional del usuario.
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  username TEXT UNIQUE,
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 50)
);

-- Comentarios sobre las columnas
COMMENT ON COLUMN public.profiles.id IS 'Referencia al id del usuario en auth.users.';
COMMENT ON COLUMN public.profiles.full_name IS 'Nombre completo del usuario.';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL del avatar del usuario.';
COMMENT ON COLUMN public.profiles.username IS 'Nombre de usuario único.';

-- Habilitar Row Level Security (RLS) para la tabla 'profiles'
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para la tabla 'profiles':

-- 1. Los usuarios pueden ver su propio perfil.
CREATE POLICY "Users can view their own profile."
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- 2. Los usuarios pueden actualizar su propio perfil.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Los usuarios autenticados pueden ver los perfiles de otros (si es un perfil público).
-- Ajusta esta política si los perfiles deben ser privados por defecto.
CREATE POLICY "Authenticated users can view all profiles."
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- 4. Los usuarios pueden insertar su propio perfil.
-- Generalmente, esto se hace una vez, a menudo a través de una función o un trigger después del registro.
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Función para actualizar automáticamente el campo 'updated_at'
CREATE OR REPLACE FUNCTION public.handle_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para llamar a la función handle_profile_updated_at() cuando se actualiza un perfil
CREATE TRIGGER on_profile_updated
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_profile_updated_at();
