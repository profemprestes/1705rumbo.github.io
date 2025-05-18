
'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {  Truck } from 'lucide-react';

export function HeroConductores() {
  return (
    <Card className="shadow-lg rounded-lg mb-6">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary flex items-center">
          < Truck className="mr-3 h-8 w-8" />
          Gestión de Conductores
        </CardTitle>
        <CardDescription className="text-lg mt-1">
          Administra la información de los conductores. Visualiza, crea, edita y elimina registros de forma eficiente.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

