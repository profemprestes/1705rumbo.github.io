
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Copy, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ElementType = 'page' | 'component' | '';

const PREDEFINED_INTEGRATION_FILES = [
  { id: 'navbar', path: 'src/components/layout/navbar.tsx', label: 'Navbar (src/components/layout/navbar.tsx)' },
  { id: 'homepage', path: 'src/app/page.tsx', label: 'Página de Inicio (src/app/page.tsx)' },
  { id: 'layout', path: 'src/app/layout.tsx', label: 'Layout Principal (src/app/layout.tsx)' },
];

export function PromptGeneratorForm() {
  const [elementType, setElementType] = useState<ElementType>('');
  const [elementName, setElementName] = useState('');
  const [selectedIntegrationFiles, setSelectedIntegrationFiles] = useState<string[]>([]);
  const [customIntegrationPaths, setCustomIntegrationPaths] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const { toast } = useToast();

  const handleIntegrationFileChange = (filePath: string) => {
    setSelectedIntegrationFiles(prev => 
      prev.includes(filePath) ? prev.filter(p => p !== filePath) : [...prev, filePath]
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!elementType) {
      toast({ variant: "destructive", title: "Error", description: "Por favor, selecciona un tipo de elemento." });
      return;
    }
    if (!elementName) {
      toast({ variant: "destructive", title: "Error", description: "Por favor, ingresa el nombre del nuevo elemento." });
      return;
    }
    if (!detailedDescription) {
      toast({ variant: "destructive", title: "Error", description: "Por favor, ingresa una descripción detallada." });
      return;
    }

    let prompt = `Hola, necesito que implementes una nueva sección o componente en RumboEnvios.

**1. Tipo y Nombre del Elemento:**
   - Tipo: ${elementType === 'page' ? 'Nueva Página' : 'Nuevo Componente'}
   - Nombre: '${elementName}'
`;

    if (elementType === 'page') {
      const route = elementName.toLowerCase().replace(/\s+/g, '-');
      prompt += `   - Ruta: '/${route}' (Crear en 'src/app/${route}/page.tsx')\n`;
    } else {
      prompt += `   - Instrucción de Ubicación: Crea el archivo '${elementName}.tsx'. Utiliza tu mejor criterio para la ubicación dentro de 'src/components/'. Si es relevante, crea un subdirectorio (ej. 'src/components/auth/${elementName}.tsx' o 'src/components/ui/${elementName}.tsx').\n`;
    }

prompt += `
**2. Descripción Detallada de la Funcionalidad y Contenido:**
   ${detailedDescription.split('\n').map(line => `   - ${line}`).join('\n')}
`;

    const allIntegrationPaths = [...selectedIntegrationFiles];
    if (customIntegrationPaths.trim()) {
      allIntegrationPaths.push(...customIntegrationPaths.split(',').map(p => p.trim()).filter(p => p));
    }

    if (allIntegrationPaths.length > 0) {
      prompt += `
**3. Integración (Opcional):**
   - Por favor, integra este nuevo elemento en los siguientes archivos si es aplicable:
${allIntegrationPaths.map(path => `     - ${path}`).join('\n')}
   (Por ejemplo, si es un componente, impórtalo y úsalo. Si es una página, añade un enlace en la navegación si se especifica 'navbar.tsx'.)
`;
    } else {
      prompt += `
**3. Integración (Opcional):**
   - No se especificaron archivos de integración. Si es un componente y su uso es obvio en alguna página existente (ej. un nuevo componente de UI general), puedes mostrar un ejemplo de uso.
`;
    }

    prompt += `
**4. Directrices para la IA (Importante):**
   - **Diseño y Estilo:** Utiliza componentes de **ShadCN UI** y **Tailwind CSS** para el diseño. Asegura que la implementación sea responsive y siga la estética general de la aplicación (colores primarios: azul cielo #7BC8F6, fondo: gris claro #F5F5F5, acento: verde suave #A0D995).
   - **Iconos:** Utiliza iconos de **lucide-react** cuando sea apropiado.
   - **Stack Tecnológico:** Todo el código debe ser compatible con **Next.js App Router** y **TypeScript**.
   - **Mejores Prácticas:** Sigue las mejores prácticas de accesibilidad (atributos ARIA, semántica HTML).
   - **Componentes:** Define las props necesarias de manera clara. Maneja el estado interno del componente si es preciso.
   - **Salida Esperada:** En tu respuesta, detalla los archivos que crearás o modificarás.

¡Gracias!`;

    setGeneratedPrompt(prompt);
  };

  const handleCopyToClipboard = async () => {
    if (!generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      toast({
        title: "Prompt Copiado",
        description: "El prompt generado ha sido copiado al portapapeles.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error al Copiar",
        description: "No se pudo copiar el prompt al portapapeles.",
      });
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="elementType">Tipo de Elemento</Label>
        <Select value={elementType} onValueChange={(value) => setElementType(value as ElementType)}>
          <SelectTrigger id="elementType">
            <SelectValue placeholder="Selecciona un tipo de elemento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="page">Página</SelectItem>
            <SelectItem value="component">Componente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="elementName">Nombre del Nuevo Elemento</Label>
        <Input 
          id="elementName" 
          value={elementName} 
          onChange={(e) => setElementName(e.target.value)} 
          placeholder="Ej: HeroBanner, UserProfileCard, settings.ts" 
        />
         <p className="text-xs text-muted-foreground">
          Para páginas, usa un nombre descriptivo (ej: "Configuración de Cuenta"). Para componentes, usa PascalCase (ej: "UserProfileCard").
        </p>
      </div>
      
      <div className="space-y-2">
        <Label>Archivo(s) de Integración (Opcional)</Label>
        <div className="space-y-2 rounded-md border p-4">
          {PREDEFINED_INTEGRATION_FILES.map(file => (
            <div key={file.id} className="flex items-center space-x-2">
              <Checkbox
                id={`integration-${file.id}`}
                checked={selectedIntegrationFiles.includes(file.path)}
                onCheckedChange={() => handleIntegrationFileChange(file.path)}
              />
              <Label htmlFor={`integration-${file.id}`} className="font-normal text-sm">{file.label}</Label>
            </div>
          ))}
          <Textarea 
            id="customIntegrationPaths"
            value={customIntegrationPaths}
            onChange={(e) => setCustomIntegrationPaths(e.target.value)}
            placeholder="O escribe rutas adicionales separadas por coma si no están en la lista..."
            rows={2}
            className="mt-2"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="detailedDescription">Descripción Detallada</Label>
        <Textarea 
          id="detailedDescription" 
          value={detailedDescription} 
          onChange={(e) => setDetailedDescription(e.target.value)} 
          rows={6} 
          placeholder="Describe la funcionalidad, contenido y cualquier detalle relevante que la IA deba considerar..." 
        />
      </div>

      <Button type="submit" variant="destructive" className="w-full bg-red-600 hover:bg-red-700 text-white">
        <FileText className="mr-2 h-5 w-5" />
        Generar Prompt
      </Button>

      {generatedPrompt && (
        <Card className="mt-6 shadow-inner">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Prompt Técnico Generado</CardTitle>
            <CardDescription>Copia este prompt y pégalo en la conversación con la IA.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={generatedPrompt}
              rows={15}
              className="text-sm font-mono bg-muted/20 border-dashed"
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleCopyToClipboard} variant="outline" className="w-full">
              <Copy className="mr-2 h-5 w-5" />
              Copiar al Portapapeles
            </Button>
          </CardFooter>
        </Card>
      )}
    </form>
  );
}
