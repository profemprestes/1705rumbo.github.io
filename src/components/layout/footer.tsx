'use client'; // Make it a client component to use useEffect

import { useState, useEffect } from 'react';

export function Footer() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    // This ensures getFullYear is called only on the client side after hydration
    setCurrentYear(new Date().getFullYear());
  }, []);

  // Display a fallback or loading state until the year is determined on the client
  const displayYear = currentYear ?? new Date().getFullYear(); // Fallback for initial render or if JS is disabled

  return (
    <footer className="border-t border-border/40 bg-background py-8 text-center text-sm text-muted-foreground">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p>&copy; {displayYear} RumboEnvios. Todos los derechos reservados.</p>
        <p className="mt-1">Una solución moderna para la gestión de envíos.</p>
      </div>
    </footer>
  );
}
