
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export function HeroEmpresas() {
  return (
    <Card className="shadow-lg rounded-lg mb-6">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary flex items-center">
          <Building2 className="mr-3 h-8 w-8" />
          Gestión Integral de Empresas
        </CardTitle>
        <CardDescription className="text-lg mt-1">
          Visualiza, crea, edita y elimina la información de las empresas registradas en RumboEnvios. Accede a todas las herramientas necesarias para una administración eficiente.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
