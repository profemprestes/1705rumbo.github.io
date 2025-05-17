import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-destructive">Error de Autenticación</CardTitle>
          <CardDescription>
            Ocurrió un problema durante el proceso de autenticación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p>No pudimos completar tu solicitud de autenticación. Por favor, intenta iniciar sesión de nuevo.</p>
          <Link href="/login" className="text-primary hover:underline">
            Volver a Iniciar Sesión
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
