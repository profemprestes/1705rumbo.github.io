
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerActionClient } from '@/lib/supabase/server';
import { z } from 'zod';

const emailSchema = z.string().email({ message: 'Correo electrónico inválido.' });
const passwordSchema = z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' });

const LoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const SignupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export async function login(prevState: any, formData: FormData) {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      type: 'error',
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Campos inválidos. Por favor, corrige los errores.',
    };
  }

  const { email, password } = validatedFields.data;

  // SIMULATED LOGIN: Check specific credentials
  if (email === 'admin@example.com' && password === '123456') {
    console.log('Simulating successful login for admin@example.com');
    revalidatePath('/inicio', 'layout'); // Or revalidatePath('/') if /inicio uses the root layout extensively
    redirect('/inicio'); // Changed from redirect('/')
  } else {
    console.log('Simulated login failed for:', email);
    return {
      type: 'error',
      message: 'Credenciales simuladas inválidas. Intenta con admin@example.com y 123456.',
    };
  }
  
  // This part will not be reached due to redirect or error return for simulation
  return {
    type: 'success',
    message: 'Inicio de sesión simulado exitosamente.',
  };
}

export async function signup(prevState: any, formData: FormData) {
  const supabase = createSupabaseServerActionClient();

  const validatedFields = SignupSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      type: 'error',
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Campos inválidos. Por favor, corrige los errores.',
    };
  }
  
  const { email, password } = validatedFields.data;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // emailRedirectTo: `${origin}/api/auth/callback`, // Handled by Supabase project settings
    },
  });

  if (error) {
     console.error('Signup error:', error.message);
    return {
      type: 'error',
      message: 'Error al registrarse: ' + (error.message.includes('User already registered') ? 'Este correo ya está registrado.' : 'Inténtalo de nuevo más tarde.'),
    };
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
     return {
      type: 'error',
      message: 'Error al registrarse: Este correo ya está registrado con un proveedor social (ej. Google). Intenta iniciar sesión con ese proveedor.',
    };
  }

  // if (data.session) { // Auto-login on signup
  //   revalidatePath('/', 'layout');
  //   redirect('/');
  // }

  return {
    type: 'success',
    message: '¡Registro exitoso! Revisa tu correo electrónico para confirmar tu cuenta.',
  };
}

export async function logout() {
  const supabase = createSupabaseServerActionClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

