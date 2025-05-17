import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PackageCheck, PlusCircle, History } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic'; // Ensures the page is dynamically rendered

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Middleware should handle redirect if not logged in, but as a fallback:
  if (!user) {
    // This part might not be reached if middleware is effective
    return (
      <div className="text-center">
        <p>Por favor, inicia sesión para acceder a esta página.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Iniciar Sesión</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">¡Bienvenido a RumboEnvios, {user.email?.split('@')[0] || 'Usuario'}!</CardTitle>
          <CardDescription className="text-lg">
            Estás en el centro de control para todos tus envíos. Desde aquí podrás gestionar, rastrear y organizar todo de manera eficiente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            Estamos trabajando para traerte una experiencia completa en la gestión de envíos. Pronto podrás:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
            <li>Registrar nuevos envíos con facilidad.</li>
            <li>Rastrear el estado de tus paquetes en tiempo real.</li>
            <li>Ver un historial detallado de todos tus movimientos.</li>
            <li>¡Y mucho más!</li>
          </ul>
           <div className="mt-8 p-6 bg-secondary/50 rounded-lg shadow">
             <h3 className="text-xl font-semibold text-primary mb-4">Próximas Funcionalidades</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
                 <PlusCircle className="w-12 h-12 text-accent mb-3" />
                 <h4 className="font-semibold mb-1">Nuevo Envío</h4>
                 <p className="text-sm text-muted-foreground text-center">Registra tus paquetes rápidamente.</p>
               </div>
               <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
                 <PackageCheck className="w-12 h-12 text-accent mb-3" />
                 <h4 className="font-semibold mb-1">Rastrear Paquetes</h4>
                 <p className="text-sm text-muted-foreground text-center">Sigue el estado de tus envíos.</p>
               </div>
               <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
                 <History className="w-12 h-12 text-accent mb-3" />
                 <h4 className="font-semibold mb-1">Historial</h4>
                 <p className="text-sm text-muted-foreground text-center">Consulta tus envíos pasados.</p>
               </div>
             </div>
           </div>
        </CardContent>
      </Card>
      
      <div className="text-center mt-10">
        <Image 
          src="https://placehold.co/600x300.png" 
          alt="Ilustración de logística y envíos" 
          width={600} 
          height={300}
          className="mx-auto rounded-lg shadow-md"
          data-ai-hint="logistics shipping"
        />
        <p className="mt-4 text-muted-foreground">Visualizando el futuro de la gestión de envíos.</p>
      </div>

    </div>
  );
}
