
import type { Metadata } from 'next';
import { PromptGeneratorForm } from '@/components/prompts/prompt-generator-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Generador de Prompts',
  description: 'Genera prompts detallados para solicitar nuevas funcionalidades o componentes a la IA.',
};

export default function PromptsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Generador de Prompts para IA</CardTitle>
          <CardDescription className="text-lg">
            Utiliza este formulario para estructurar tu solicitud. Un prompt detallado ayuda a la IA a entender mejor tus necesidades y generar el código correcto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Cargando generador de prompts...</div>}>
            <PromptGeneratorForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
