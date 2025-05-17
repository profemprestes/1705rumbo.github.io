import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
  description: 'Inicia sesión en tu cuenta de RumboEnvios para gestionar tus envíos.',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Suspense fallback={<div>Cargando formulario de inicio de sesión...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
