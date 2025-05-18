
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit3, Trash2, Eye } from "lucide-react";
import type { Tables } from "@/lib/supabase/database.types";

// Define a type for the company data, using the Row type from database.types
type Empresa = Tables<'empresas'>;

// Placeholder data for companies - this would typically come from props or a Supabase query
const placeholderEmpresas: Empresa[] = [
  { id: '1', codigo_empresa: 1, nombre: 'Tech Solutions Inc.', industria: 'Software', email_contacto: 'contact@techsolutions.com', estado: 'Activo', direccion: '123 Tech Ave, Silicon Valley', user_id: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', codigo_empresa: 2, nombre: 'Green Energy Co.', industria: 'Renovables', email_contacto: 'info@greenenergy.co', estado: 'Activo', direccion: '456 Eco Park, Greentown', user_id: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', codigo_empresa: 3, nombre: 'Global Logistics Ltd.', industria: 'Transporte', email_contacto: 'support@globallogistics.com', estado: 'Pendiente', direccion: '789 Port Rd, Shipping City', user_id: 'user2', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', codigo_empresa: 4, nombre: 'Innovate Builders', industria: 'Construcción', email_contacto: 'projects@innovatebuilders.com', estado: 'Inactivo', direccion: '101 Construct St, Buildville', user_id: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

interface ListarEmpresasProps {
  // empresas: Empresa[]; // In the future, pass empresas as a prop
}

export function ListarEmpresas({}: ListarEmpresasProps) {
  // For now, we'll use the placeholder data.
  // In a real app, you'd fetch this data, likely in a server component and pass it down,
  // or fetch it client-side if interactions require it.
  const empresas = placeholderEmpresas;

  const getStatusBadgeVariant = (status: string | null): "default" | "secondary" | "destructive" => {
    switch (status?.toLowerCase()) {
      case 'activo':
        return 'default'; // Will use accent color defined in badgeVariants
      case 'inactivo':
        return 'destructive';
      case 'pendiente':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="shadow-md rounded-lg w-full">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-2xl font-bold text-foreground">Listado de Empresas</CardTitle>
          <CardDescription className="text-md mt-1">
            Gestiona la información de las empresas registradas.
          </CardDescription>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" />
          Cargar Nueva Empresa
        </Button>
      </CardHeader>
      <CardContent>
        {empresas.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p className="text-lg">No hay empresas registradas todavía.</p>
            <p>¡Empieza cargando una nueva para verla aquí!</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Industria</TableHead>
                <TableHead>Email de Contacto</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right w-[220px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empresas.map((empresa) => (
                <TableRow key={empresa.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono">{String(empresa.codigo_empresa).padStart(4, '0')}</TableCell>
                  <TableCell className="font-medium">{empresa.nombre}</TableCell>
                  <TableCell>{empresa.industria || '-'}</TableCell>
                  <TableCell>{empresa.email_contacto || '-'}</TableCell>
                  <TableCell>{empresa.direccion || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(empresa.estado)}
                      className={empresa.estado?.toLowerCase() === 'activo' ? 'bg-accent text-accent-foreground' : ''}
                    >
                      {empresa.estado || 'Desconocido'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                     <Button variant="outline" size="sm" className="hover:border-primary hover:text-primary" aria-label={`Ver ${empresa.nombre}`}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="hover:border-primary hover:text-primary" aria-label={`Modificar ${empresa.nombre}`}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="hover:border-destructive hover:text-destructive" aria-label={`Eliminar ${empresa.nombre}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
