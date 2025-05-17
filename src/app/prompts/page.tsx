
import type { Metadata } from 'next';
import { PromptGeneratorForm } from '@/components/prompts/prompt-generator-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Definir Elemento',
  description: 'Completa los detalles para generar tu prompt técnico para la IA.',
};

export default function PromptsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Definir Elemento</CardTitle>
          <CardDescription className="text-md">
            Completa los detalles para generar tu prompt técnico.
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

