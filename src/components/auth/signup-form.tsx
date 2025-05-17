'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Mail, Lock, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signup } from '@/lib/actions/auth';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={pending} aria-disabled={pending}>
      {pending ? 'Registrando...' : 'Registrarse'}
    </Button>
  );
}

export function SignupForm() {
  const initialState = { message: null, errors: {}, type: null };
  const [state, dispatch] = useFormState(signup, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message) {
      toast({
        variant: state.type === 'error' ? 'destructive' : 'default',
        title: state.type === 'error' ? 'Error de Registro' : 'Registro Enviado',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">RumboEnvios</CardTitle>
        <CardDescription>Crea una cuenta para empezar a gestionar tus envíos.</CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" name="email" type="email" placeholder="tu@ejemplo.com" required className="pl-10" />
            </div>
            {state?.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" name="password" type="password" placeholder="•••••••• (mínimo 6 caracteres)" required className="pl-10" />
            </div>
            {state?.errors?.password && <p className="text-sm text-destructive">{state.errors.password[0]}</p>}
          </div>
          {state?.type === 'success' && (
            <div className="rounded-md border border-green-500 bg-green-50 p-3 text-center text-sm text-green-700">
              <p>{state.message}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton />
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Inicia Sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
