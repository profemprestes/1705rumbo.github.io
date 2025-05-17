import type { Metadata } from 'next';
import { SignupForm } from '@/components/auth/signup-form';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Registrarse',
  description: 'Crea una nueva cuenta en RumboEnvios para gestionar tus envíos.',
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Suspense fallback={<div>Cargando formulario de registro...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
