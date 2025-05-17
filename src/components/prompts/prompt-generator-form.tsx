
'use client';

import { useState, type FormEvent } from 'react';
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

const PREDEFINED_PAGE_INTEGRATION_FILES = [
  { id: 'navbar', path: 'src/components/layout/navbar.tsx', label: 'Añadir enlace en Navbar (src/components/layout/navbar.tsx)' },
  { id: 'footer', path: 'src/components/layout/footer.tsx', label: 'Añadir enlace en Footer (src/components/layout/footer.tsx)' },
];

const PREDEFINED_COMPONENT_INTEGRATION_FILES = [
  { id: 'homePage', path: 'src/app/page.tsx', label: 'Página de Inicio (src/app/page.tsx)' },
  { id: 'promptsPage', path: 'src/app/prompts/page.tsx', label: 'Página de Prompts (src/app/prompts/page.tsx)' },
  { id: 'loginPage', path: 'src/app/login/page.tsx', label: 'Página de Login (src/app/login/page.tsx)' },
  { id: 'signupPage', path: 'src/app/signup/page.tsx', label: 'Página de Signup (src/app/signup/page.tsx)' },
  { id: 'mainLayout', path: 'src/app/layout.tsx', label: 'Layout Principal (src/app/layout.tsx) - (Usar con precaución para componentes globales)' },
  { id: 'navbarComponent', path: 'src/components/layout/navbar.tsx', label: 'Componente Navbar (si es parte del navbar)' },
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

  // Reset selected files when element type changes
  const handleElementTypeChange = (value: ElementType) => {
    setElementType(value);
    setSelectedIntegrationFiles([]);
    setCustomIntegrationPaths('');
  }

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
      const route = elementName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '');
      prompt += `   - Instrucción de Ubicación: Crea la página en 'src/app/${route}/page.tsx'. Si ya existe, modifícala.\n`;
    } else {
      prompt += `   - Instrucción de Ubicación: Crea el archivo del componente. Sugiere la ruta completa (ej. 'src/components/feature/${elementName}.tsx' o similar) o utiliza tu mejor criterio para la ubicación dentro de 'src/components/'. Si ya existe en la ruta sugerida, modifícalo.\n`;
    }

prompt += `
**2. Propósito Detallado y Funcionalidad Clave:**
   ${detailedDescription.split('\n').map(line => `   - ${line}`).join('\n')}
   (Infiere los detalles de contenido, props necesarias, y manejo de estado a partir de esta descripción)
`;

    const allIntegrationPaths = [...selectedIntegrationFiles];
    if (customIntegrationPaths.trim()) {
      allIntegrationPaths.push(...customIntegrationPaths.split(',').map(p => p.trim()).filter(p => p));
    }

    if (allIntegrationPaths.length > 0) {
      prompt += `
**3. Integración (Opcional):**
   - Por favor, ${elementType === 'page' ? 'añade un enlace a esta nueva página en' : 'integra este nuevo componente en'} los siguientes archivos si es aplicable:
${allIntegrationPaths.map(path => `     - ${path}`).join('\n')}
   (Por ejemplo, si es un componente, impórtalo y úsalo donde se especifica. Si es una página, añade un enlace donde se indica.)
`;
    } else {
      prompt += `
**3. Integración (Opcional):**
   - No se especificaron archivos de integración. Si es un componente y su uso es obvio en alguna página existente (ej. un nuevo componente de UI general en la página de inicio), puedes mostrar un ejemplo de uso allí.
`;
    }

    prompt += `
**4. Directrices Adicionales para la IA (Importante - La IA debe gestionar estos puntos):**
   - **Diseño y Estilo:** Determina e implementa un diseño visualmente agradable y profesional utilizando componentes de **ShadCN UI** y **Tailwind CSS**. Asegura que la implementación sea responsive y siga la estética general de la aplicación (colores primarios: azul cielo #7BC8F6, fondo: gris claro #F5F5F5, acento: verde suave #A0D995).
   - **Iconos:** Utiliza iconos de **lucide-react** donde sean apropiados para mejorar la interfaz.
   - **Dependencias y Stack:** Todo el código debe ser compatible con **Next.js App Router** y **TypeScript**. No añadas nuevas dependencias NPM a menos que sea absolutamente esencial y lo justifiques.
   - **Mejores Prácticas:** Sigue las mejores prácticas de accesibilidad (atributos ARIA, semántica HTML) y de código limpio y mantenible.
   - **Componentes (si aplica):** Define las props necesarias de manera clara. Maneja el estado interno del componente si es preciso.
   - **Salida Esperada:** En tu respuesta, detalla claramente todos los archivos que crearás o modificarás con su ruta completa.

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
  
  const currentIntegrationFiles = elementType === 'page' 
    ? PREDEFINED_PAGE_INTEGRATION_FILES 
    : elementType === 'component' 
    ? PREDEFINED_COMPONENT_INTEGRATION_FILES 
    : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="elementType">Tipo de Elemento</Label>
        <Select value={elementType} onValueChange={handleElementTypeChange}>
          <SelectTrigger id="elementType" aria-label="Tipo de Elemento">
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
          placeholder={elementType === 'page' ? "Ej: Configuración de Cuenta" : "Ej: UserProfileCard"}
        />
         <p className="text-xs text-muted-foreground">
          {elementType === 'page' 
            ? "Para páginas, usa un nombre descriptivo (ej: 'Directorio de Transportistas'). La ruta se generará automáticamente (ej: /directorio-transportistas)."
            : "Para componentes, usa PascalCase (ej: 'UserProfileCard'). Especifica la ruta completa si tienes una preferencia (ej: 'src/components/user/UserProfileCard.tsx'), sino la IA sugerirá una."
          }
        </p>
      </div>
      
      {elementType && (
        <div className="space-y-2">
          <Label>Archivo(s) de Integración (Opcional)</Label>
          <div className="space-y-2 rounded-md border p-4">
            {currentIntegrationFiles.map(file => (
              <div key={file.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`integration-${file.id}`}
                  checked={selectedIntegrationFiles.includes(file.path)}
                  onCheckedChange={() => handleIntegrationFileChange(file.path)}
                  aria-labelledby={`label-integration-${file.id}`}
                />
                <Label htmlFor={`integration-${file.id}`} id={`label-integration-${file.id}`} className="font-normal text-sm">{file.label}</Label>
              </div>
            ))}
            <Textarea 
              id="customIntegrationPaths"
              value={customIntegrationPaths}
              onChange={(e) => setCustomIntegrationPaths(e.target.value)}
              placeholder="O escribe rutas adicionales separadas por coma si no están en la lista (ej: src/app/otra-pagina/page.tsx)..."
              rows={2}
              className="mt-2"
              aria-label="Rutas de integración personalizadas"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="detailedDescription">Descripción Detallada del Propósito y Funcionalidad</Label>
        <Textarea 
          id="detailedDescription" 
          value={detailedDescription} 
          onChange={(e) => setDetailedDescription(e.target.value)} 
          rows={8} 
          placeholder="Describe la funcionalidad principal, qué debe hacer el elemento, qué información debe mostrar o gestionar. La IA inferirá los detalles de UI y contenido necesarios basados en esto." 
        />
         <p className="text-xs text-muted-foreground">
           Ej: "Necesito una página que muestre una lista de productos con filtros por categoría y precio. Cada producto debe tener imagen, nombre, precio y un botón de 'añadir al carrito'". O para un componente: "Un modal de confirmación que reciba un título, mensaje y dos acciones (confirmar/cancelar)".
        </p>
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
              aria-label="Prompt generado"
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

