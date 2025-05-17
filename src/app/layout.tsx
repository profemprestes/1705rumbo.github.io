import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google'; // Corrected import for new Next.js font handling
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster"

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ // Corrected naming convention
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'RumboEnvios - Gestión de Envíos Simplificada',
    template: '%s | RumboEnvios',
  },
  description: 'RumboEnvios facilita la gestión de tus envíos. Inicia sesión o regístrate para comenzar.',
  keywords: ['envíos', 'logística', 'paquetería', 'gestión de envíos', 'RumboEnvios', 'shipping', 'logistics', 'parcel management'],
  applicationName: 'RumboEnvios',
  authors: [{ name: 'RumboEnvios Team' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'es_ES', // Assuming Spanish as primary language
    url: 'https://rumboenvios.example.com', // Replace with actual domain
    title: 'RumboEnvios - Gestión de Envíos Simplificada',
    description: 'La plataforma ideal para organizar y rastrear todos tus envíos de manera eficiente.',
    siteName: 'RumboEnvios',
    // images: [ // Add a default OG image
    //   {
    //     url: 'https://rumboenvios.example.com/og-image.png',
    //     width: 1200,
    //     height: 630,
    //     alt: 'RumboEnvios Logo',
    //   },
    // ],
  },
  // twitter: { // Add Twitter card metadata
  //   card: 'summary_large_image',
  //   title: 'RumboEnvios - Gestión de Envíos Simplificada',
  //   description: 'Organiza y rastrea tus envíos con RumboEnvios.',
  //   // site: '@rumboenvios', // Replace with actual Twitter handle
  //   // creator: '@rumboenvios_dev', // Replace
  //   // images: ['https://rumboenvios.example.com/twitter-image.png'], // Replace
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-grow container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
