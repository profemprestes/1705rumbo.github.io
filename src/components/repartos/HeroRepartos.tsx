
'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPinned } from 'lucide-react';

export function HeroRepartos() {
  return (
    <Card className="shadow-lg rounded-lg mb-6">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary flex items-center">
          <MapPinned className="mr-3 h-8 w-8" />
          Gestión de Repartos
        </CardTitle>
        <CardDescription className="text-lg mt-1">
          Administra y visualiza todos los repartos asignados. Planifica rutas, actualiza estados y asegura entregas eficientes.
        </CardDescription>
      </CardHeader>
      {/* Additional content like a brief workflow explanation can be added here if needed */}
    </Card>
  );
}
