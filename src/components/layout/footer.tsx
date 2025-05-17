
'use client'; 

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Footer() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const displayYear = currentYear ?? new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background py-8 text-center text-sm text-muted-foreground">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p>&copy; {displayYear} RumboEnvios. Todos los derechos reservados.</p>
        <p className="mt-1">Una solución moderna para la gestión de envíos.</p>
        <div className="mt-4 space-x-2">
          <Link href="/inicio" className="text-primary hover:underline">
            Inicio
          </Link>
          <span className="text-muted-foreground">|</span>
          <Link href="/prompts" className="text-primary hover:underline">
            Generar Prompts
          </Link>
          {/* Add other footer links here if needed */}
        </div>
      </div>
    </footer>
  );
}
