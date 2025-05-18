
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChartBig, Home as HomeIcon } from "lucide-react";
import { ListarEmpresas } from "@/components/empresas/ListarEmpresas"; // Import the new component

export function DashboardInicio() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg rounded-lg">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-primary flex items-center">
              <HomeIcon className="mr-3 h-8 w-8" />
              Dashboard de Inicio
            </CardTitle>
            <CardDescription className="text-lg mt-1">
              Gestiona la información de las empresas registradas y accede a las funcionalidades principales.
            </CardDescription>
          </div>
          {/* The "Cargar Nueva Empresa" button is now part of ListarEmpresas component header */}
        </CardHeader>
      </Card>

      {/* Summary Metrics / Charts Section */}
      <Card className="shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <BarChartBig className="mr-2 h-6 w-6 text-accent" />
            Resumen General
          </CardTitle>
          <CardDescription>Visualización del estado general del sistema.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[250px] w-full bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground border border-dashed">
             <p className="p-4 text-center">Aquí se mostraría un gráfico de resumen (ej. empresas activas, envíos recientes, etc.) utilizando ShadCN Charts / Recharts.</p>
          </div>
        </CardContent>
      </Card>

      {/* Companies List Section - Replaced with the new component */}
      <ListarEmpresas />
      
    </div>
  );
}
