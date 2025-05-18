
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, UserCircle, LogIn, UserPlus, Menu, X, Home, Package, Terminal, Building2, Users, Truck } from 'lucide-react';
import { logout } from '@/lib/actions/auth';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false); 
    }
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false); 
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const commonNavLinks: { href: string; label: string; icon: JSX.Element }[] = [];

  const authenticatedNavLinks = [
    { href: '/inicio', label: 'Inicio', icon: <Home className="h-4 w-4" /> },
    { href: '/empresas', label: 'Empresas', icon: <Building2 className="h-4 w-4" /> },
    { href: '/clientes', label: 'Clientes', icon: <Users className="h-4 w-4" /> },
    { href: '/conductores', label: 'Conductores', icon: <Truck className="h-4 w-4" /> },
    { href: '/prompts', label: 'Generar Prompts', icon: <Terminal className="h-4 w-4" /> },
  ];

  const commonLinkClasses = "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const activeLinkClasses = "bg-primary/10 text-primary";
  const inactiveLinkClasses = "text-foreground/70 hover:text-foreground hover:bg-muted";

  const renderNavLinksList = (links: typeof commonNavLinks | typeof authenticatedNavLinks, isMobile = false) => links.map(link => (
    <Link
      key={link.href}
      href={link.href}
      onClick={() => isMobile && setIsMobileMenuOpen(false)}
      className={`${commonLinkClasses} ${pathname === link.href ? activeLinkClasses : inactiveLinkClasses} ${isMobile ? 'w-full justify-start' : ''}`}
    >
      {link.icon}
      {link.label}
    </Link>
  ));
  
  const renderAuthButtons = (isMobile = false) => (
    <>
      <Button asChild variant="ghost" className={`${isMobile ? 'w-full justify-start text-foreground/70 hover:text-foreground' : 'text-sm'}`}>
        <Link href="/login" onClick={() => isMobile && setIsMobileMenuOpen(false)} className="flex items-center gap-2">
          <LogIn className="h-4 w-4" /> Iniciar Sesión
        </Link>
      </Button>
      <Button asChild variant="default" className={`bg-accent hover:bg-accent/90 text-accent-foreground ${isMobile ? 'w-full justify-start' : 'text-sm'}`}>
        <Link href="/signup" onClick={() => isMobile && setIsMobileMenuOpen(false)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" /> Registrarse
        </Link>
      </Button>
    </>
  );

  const renderUserMenu = (isMobile = false) => (
    <>
    {isMobile && commonNavLinks.length === 0 && authenticatedNavLinks.length > 0 && <div className="border-t border-border my-2"></div>}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`relative h-10 rounded-full ${isMobile ? 'w-full justify-start px-3 py-2 text-foreground/70 hover:text-foreground' : 'w-10'}`}>
          {isMobile && <UserCircle className="mr-2 h-4 w-4" />}
          <Avatar className={`h-8 w-8 ${isMobile ? 'hidden' : ''}`}>
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || ''} />
            <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          {isMobile && (user?.email || 'Mi Cuenta')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Conectado como</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={logout} className="w-full">
            <button type="submit" className="flex items-center w-full cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" suppressHydrationWarning>
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={user ? "/inicio" : "/"} className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
          <Package className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-primary">RumboEnvios</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-2 md:flex" suppressHydrationWarning>
          {renderNavLinksList(commonNavLinks)}
          {!loading && user && renderNavLinksList(authenticatedNavLinks)}
        </div>
        <div className="hidden items-center space-x-2 md:flex" suppressHydrationWarning>
          {!loading && !user && renderAuthButtons()}
          {!loading && user && renderUserMenu()}
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
           <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0">
              <SheetTitle className="sr-only">Menú de Navegación</SheetTitle> 
              <nav className="flex h-full flex-col" suppressHydrationWarning>
                <div className="flex items-center justify-between border-b p-4">
                  <Link href={user ? "/inicio" : "/"} className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <Package className="h-7 w-7 text-primary" />
                    <span className="text-lg font-bold text-primary">RumboEnvios</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-6 w-6" />
                    <span className="sr-only">Cerrar menú</span>
                  </Button>
                </div>
                <div className="flex-grow p-4 space-y-2">
                  {renderNavLinksList(commonNavLinks, true)}
                  {!loading && user && renderNavLinksList(authenticatedNavLinks, true)}
                  
                  {(!loading && !user && (commonNavLinks.length > 0 || authenticatedNavLinks.length > 0)) && <div className="border-t border-border my-2"></div>}
                  {(user && authenticatedNavLinks.length > 0 && commonNavLinks.length > 0) && <div className="border-t border-border my-2"></div>}

                  {!loading && !user && renderAuthButtons(true)}
                  {!loading && user && renderUserMenu(true)}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
