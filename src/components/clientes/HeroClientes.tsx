
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export function HeroClientes() {
  return (
    <Card className="shadow-lg rounded-lg mb-6">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary flex items-center">
          <Users className="mr-3 h-8 w-8" />
          Gestión Integral de Clientes
        </CardTitle>
        <CardDescription className="text-lg mt-1">
          Administra la información de tus clientes. Visualiza, crea, edita y elimina registros de clientes de forma eficiente.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
