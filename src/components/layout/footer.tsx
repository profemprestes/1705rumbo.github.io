export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border/40 bg-background py-8 text-center text-sm text-muted-foreground">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p>&copy; {currentYear} RumboEnvios. Todos los derechos reservados.</p>
        <p className="mt-1">Una solución moderna para la gestión de envíos.</p>
      </div>
    </footer>
  );
}
