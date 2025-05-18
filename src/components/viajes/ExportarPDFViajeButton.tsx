
'use client';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // Import autoTable plugin
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import type { Tables, Enums } from '@/lib/supabase/database.types';

// Re-define or import necessary types, mirroring those in DetalleViaje.tsx
type Viaje = Tables<'viajes'>;
type Reparto = Tables<'repartos'>;
type Conductor = Tables<'conductores'>;
type Empresa = Tables<'empresas'>;

type ViajeDetallado = Viaje & {
  conductores: (Conductor & { empresas: Empresa | null }) | null;
};

type RepartoConductor = Reparto & {
  conductores: Pick<Conductor, 'nombre_completo'> | null;
};

interface ExportarPDFViajeButtonProps {
  viaje: ViajeDetallado | null;
  repartos: RepartoConductor[];
  disabled?: boolean;
}

// Helper function to format dates, similar to DetalleViaje
const formatDateForPDF = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch (e) { return 'Fecha inválida'; }
};

export function ExportarPDFViajeButton({ viaje, repartos, disabled }: ExportarPDFViajeButtonProps) {
  const handleExportPDF = () => {
    if (!viaje) return;

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    let currentY = 20; // Initial Y position

    // Header
    doc.setFontSize(18);
    doc.text(`Detalle del Viaje #${String(viaje.codigo_viaje).padStart(4, '0')}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString('es-AR')}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Trip Information
    doc.setFontSize(14);
    doc.text('Información del Viaje', 14, currentY);
    currentY += 8;
    doc.setFontSize(10);

    const viajeDetails = [
      { label: 'Código de Viaje:', value: String(viaje.codigo_viaje).padStart(4, '0') },
      { label: 'Estado:', value: viaje.estado_viaje || 'N/A' },
      { label: 'Conductor:', value: viaje.conductores?.nombre_completo || 'N/A' },
      { label: 'Empresa Conductor:', value: viaje.conductores?.empresas?.nombre || 'N/A' },
      { label: 'Vehículo:', value: viaje.vehiculo_descripcion || 'N/A' },
      { label: 'Inicio Planificado:', value: formatDateForPDF(viaje.fecha_hora_inicio_planificado) },
      { label: 'Fin Estimado Plan.:', value: formatDateForPDF(viaje.fecha_hora_fin_estimada_planificado) },
      { label: 'Notas del Viaje:', value: viaje.notas_viaje || 'Sin notas.' },
      { label: 'ID Usuario Creador:', value: viaje.user_id || 'N/A'},
      { label: 'Fecha Creación:', value: formatDateForPDF(viaje.created_at)},
      { label: 'Última Actualización:', value: formatDateForPDF(viaje.updated_at)},
    ];

    viajeDetails.forEach(detail => {
      if (currentY > pageHeight - 20) { // Check for page break
        doc.addPage();
        currentY = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text(detail.label, 14, currentY);
      doc.setFont('helvetica', 'normal');
      // Wrap text if too long
      const valueLines = doc.splitTextToSize(detail.value, pageWidth - 14 - 40); // 40 is approx label width + margin
      doc.text(valueLines, 55, currentY);
      currentY += (valueLines.length * 5) + 2; // Adjust Y based on number of lines
    });

    currentY += 10;

    // Associated Deliveries
    if (repartos.length > 0) {
      if (currentY > pageHeight - 40) { // Check for page break before table
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(14);
      doc.text('Repartos Asociados', 14, currentY);
      currentY += 8;

      const tableColumn = ["Cód.", "Destino", "Estado", "Inicio", "Fin Est."];
      const tableRows: (string | null)[][] = [];

      repartos.forEach(reparto => {
        const repartoData = [
          String(reparto.codigo_reparto).padStart(4, '0'),
          reparto.destino_direccion,
          reparto.estado_reparto,
          formatDateForPDF(reparto.fecha_hora_inicio),
          formatDateForPDF(reparto.fecha_hora_fin_estimada),
        ];
        tableRows.push(repartoData);
      });

      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: currentY,
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133] }, // Example primary color
        styles: { fontSize: 8, cellPadding: 1.5 },
        columnStyles: {
            1: { cellWidth: 60 }, // Destino
        }
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;
    } else {
      if (currentY > pageHeight - 20) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(10);
      doc.text('No hay repartos asociados a este viaje.', 14, currentY);
      currentY += 7;
    }

    // Footer with Page Numbers
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 25, pageHeight - 10);
    }

    doc.save(`Viaje_${String(viaje.codigo_viaje).padStart(4, '0')}_Detalle.pdf`);
  };

  return (
    <Button
      variant="outline"
      onClick={handleExportPDF}
      disabled={!viaje || disabled}
      className="bg-primary hover:bg-primary/90 text-primary-foreground"
    >
      <FileDown className="mr-2 h-4 w-4" />
      Exportar Viaje a PDF
    </Button>
  );
}
