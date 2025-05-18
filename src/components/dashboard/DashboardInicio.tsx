
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChartBig, Edit3, PlusCircle, Trash2, Home as HomeIcon } from "lucide-react";

// Placeholder data for companies - this could be passed as a prop in a real scenario
const placeholderCompanies = [
  { id: '1', name: 'Tech Solutions Inc.', industry: 'Software', contactEmail: 'contact@techsolutions.com', status: 'Activa' },
  { id: '2', name: 'Green Energy Co.', industry: 'Renovables', contactEmail: 'info@greenenergy.co', status: 'Activa' },
  { id: '3', name: 'Global Logistics Ltd.', industry: 'Transporte', contactEmail: 'support@globallogistics.com', status: 'Pendiente' },
  { id: '4', name: 'Innovate Builders', industry: 'Construcción', contactEmail: 'projects@innovatebuilders.com', status: 'Activa' },
];

export function DashboardInicio() {
  // In a real application, you might fetch data or handle state here
  // For now, we'll use the placeholder data.

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
          <Button className="mt-4 md:mt-0">
            <PlusCircle className="mr-2 h-5 w-5" />
            Cargar Nueva Empresa
          </Button>
        </CardHeader>
      </Card>

      {/* Summary Metrics / Charts Section */}
      <Card className="shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <BarChartBig className="mr-2 h-6 w-6 text-accent" />
            Resumen de Empresas
          </CardTitle>
          <CardDescription>Visualización del estado general de las empresas.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[250px] w-full bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground border border-dashed">
             <p className="p-4 text-center">Aquí se mostraría un gráfico de resumen (ej. empresas por industria, estado, etc.) utilizando ShadCN Charts / Recharts.</p>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table Section */}
      <Card className="shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl">Listado de Empresas</CardTitle>
          <CardDescription>Explora y gestiona las empresas registradas en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Industria</TableHead>
                <TableHead>Email de Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderCompanies.map((company) => (
                <TableRow key={company.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.industry}</TableCell>
                  <TableCell>{company.contactEmail}</TableCell>
                  <TableCell>
                    <Badge
                      variant={company.status === 'Activa' ? 'default' : 'secondary'}
                      className={company.status === 'Activa' ? 'bg-accent text-accent-foreground' : ''}
                    >
                      {company.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" className="hover:border-primary hover:text-primary">
                      <Edit3 className="mr-1 h-4 w-4" />
                      Modificar
                    </Button>
                    <Button variant="outline" size="sm" className="hover:border-destructive hover:text-destructive">
                      <Trash2 className="mr-1 h-4 w-4" />
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {placeholderCompanies.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-lg">No hay empresas registradas todavía.</p>
              <p>¡Empieza cargando una nueva para verla aquí!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
