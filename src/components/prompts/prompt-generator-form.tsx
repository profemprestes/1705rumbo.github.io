
'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type RequestType = 'page' | 'component';

export function PromptGeneratorForm() {
  const [requestType, setRequestType] = useState<RequestType>('page');
  const [pageName, setPageName] = useState('');
  const [pageRoute, setPageRoute] = useState('');
  const [componentName, setComponentName] = useState('');
  const [componentPath, setComponentPath] = useState('');
  const [purpose, setPurpose] = useState('');
  const [contentDetails, setContentDetails] = useState('');
  const [designDetails, setDesignDetails] = useState('');
  const [reusableComponentName, setReusableComponentName] = useState('');
  const [reusableComponentPath, setReusableComponentPath] = useState('');
  const [integrationDetails, setIntegrationDetails] = useState('');
  const [dependencies, setDependencies] = useState('ShadCN UI, lucide-react, Next.js App Router, TypeScript');
  const [expectedArtifacts, setExpectedArtifacts] = useState('');
  const [additionalConsiderations, setAdditionalConsiderations] = useState('Asegúrate de que todo el código sea compatible con Next.js App Router y TypeScript. Sigue las mejores prácticas de accesibilidad.');

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const { toast } = useToast();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    let prompt = `Hola, necesito que implementes una nueva sección en RumboEnvios.

`;

    if (requestType === 'page') {
      prompt += `1. ${pageName ? `Página '${pageName}'` : 'Nueva Página'}:
   - Ruta Solicitada: '${pageRoute}'.
   - Instrucción: Por favor, crea esta página en 'src/app${pageRoute.startsWith('/') ? pageRoute : `/${pageRoute}`}/page.tsx' si no existe. Si ya existe una página en esa ruta, modifícala para incorporar los siguientes detalles.
   - Propósito: ${purpose}
   - Contenido Inicial:\n     ${contentDetails.split('\n').join('\n     ')}
   - Diseño:\n     ${designDetails.split('\n').join('\n     ')}
`;
    } else {
      prompt += `1. ${componentName ? `Componente '${componentName}'` : 'Nuevo Componente'}:
   - Nombre del Componente: '${componentName}.tsx'.
   - Ruta Sugerida para el Componente: 'src/components/${componentPath}'.
   - Instrucción: Por favor, crea este componente. Si la ruta sugerida no es óptima o el componente ya existe en una ruta diferente pero relevante, usa tu criterio para la mejor ubicación o para modificar el existente. Si ya existe en la ruta sugerida, modifícalo.
   - Propósito: ${purpose}
   - Detalles del Componente (props, estado, etc.):\n     ${contentDetails.split('\n').join('\n     ')}
   - Diseño:\n     ${designDetails.split('\n').join('\n     ')}
`;
    }

    if (requestType === 'page' && reusableComponentName) {
      prompt += `
2. Componente Reutilizable (Opcional):
   - Si consideras que una parte de esta página podría reutilizarse, crea un componente llamado '${reusableComponentName}.tsx'.
   - Ruta Sugerida para Componente Reutilizable: 'src/components/${reusableComponentPath}'.
   - Instrucción: Considera la ruta óptima para este componente reutilizable.
`;
    }

    const sectionNumberOffset = (requestType === 'page' && reusableComponentName) ? 1 : 0;

    prompt += `
${2 + sectionNumberOffset}. Integración:
   ${integrationDetails}
`;

    prompt += `
${3 + sectionNumberOffset}. Dependencias Específicas (Asegúrate de que estén listadas en package.json si son nuevas):
   ${dependencies}
`;

    prompt += `
${4 + sectionNumberOffset}. Resumen de Archivos a Generar/Modificar (sé específico sobre crear vs. modificar):
   ${expectedArtifacts}
   (Ej: Crear src/app/nueva-ruta/page.tsx. Modificar src/components/existente.tsx para añadir X.)
`;
    prompt += `
${5 + sectionNumberOffset}. Consideraciones Adicionales:
   ${additionalConsiderations}

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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <Label>Tipo de Solicitud</Label>
        <RadioGroup value={requestType} onValueChange={(value) => setRequestType(value as RequestType)} className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="page" id="type-page" />
            <Label htmlFor="type-page">Nueva Página</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="component" id="type-component" />
            <Label htmlFor="type-component">Nuevo Componente</Label>
          </div>
        </RadioGroup>
      </div>

      {requestType === 'page' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="pageName">Nombre de la Página (ej. Directorio de Transportistas)</Label>
            <Input id="pageName" value={pageName} onChange={(e) => setPageName(e.target.value)} placeholder="Mi Nueva Página" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pageRoute">Ruta de la Página (ej. /directorio-transportistas)</Label>
            <Input id="pageRoute" value={pageRoute} onChange={(e) => setPageRoute(e.target.value)} placeholder="/mi-nueva-pagina" />
            <p className="text-xs text-muted-foreground">Se creará en `src/app/.../page.tsx`. Si ya existe, se modificará.</p>
          </div>
        </>
      )}

      {requestType === 'component' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="componentName">Nombre del Componente (ej. TransportistaCard)</Label>
            <Input id="componentName" value={componentName} onChange={(e) => setComponentName(e.target.value)} placeholder="MiNuevoComponente" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="componentPath">Ruta Sugerida para el Componente (dentro de src/components/, ej. transportistas)</Label>
            <Input id="componentPath" value={componentPath} onChange={(e) => setComponentPath(e.target.value)} placeholder="shared/" />
            <p className="text-xs text-muted-foreground">Ej: si pones 'forms', se sugerirá 'src/components/forms/'. Se usará criterio para la ubicación óptima o para modificar uno existente.</p>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="purpose">Propósito de la Página/Componente</Label>
        <Textarea id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder={requestType === 'page' ? "Esta página mostrará..." : "Este componente se usará para..."} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contentDetails">{requestType === 'page' ? 'Contenido Inicial de la Página' : 'Detalles del Componente (props, estado, etc.)'}</Label>
        <Textarea id="contentDetails" value={contentDetails} onChange={(e) => setContentDetails(e.target.value)} rows={5} placeholder="Un título principal: '...' \nUna lista con: \n- Item 1 \n- Item 2" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="designDetails">Detalles de Diseño/Estilo</Label>
        <Textarea id="designDetails" value={designDetails} onChange={(e) => setDesignDetails(e.target.value)} placeholder="Utilizar Card de ShadCN. Debe ser responsive. Sombras suaves." />
      </div>

      {requestType === 'page' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="reusableComponentName">Componente Reutilizable (Opcional - Nombre, ej. InfoItemCard)</Label>
            <Input id="reusableComponentName" value={reusableComponentName} onChange={(e) => setReusableComponentName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reusableComponentPath">Ruta Sugerida para Componente Reutilizable (Opcional - dentro de src/components/)</Label>
            <Input id="reusableComponentPath" value={reusableComponentPath} onChange={(e) => setReusableComponentPath(e.target.value)} placeholder="items/" />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="integrationDetails">Detalles de Integración (cómo se usará o conectará)</Label>
        <Textarea id="integrationDetails" value={integrationDetails} onChange={(e) => setIntegrationDetails(e.target.value)} placeholder="Añadir enlace en Navbar con texto '...' e icono '...'. Importar componente en 'src/app/otra-pagina/page.tsx' y usarlo así: <MiComponente prop1='valor' />" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dependencies">Dependencias Específicas (ShadCN, Lucide, NPM)</Label>
        <Textarea id="dependencies" value={dependencies} onChange={(e) => setDependencies(e.target.value)} />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="expectedArtifacts">Resumen de Archivos a Generar/Modificar</Label>
        <Textarea 
          id="expectedArtifacts" 
          value={expectedArtifacts} 
          onChange={(e) => setExpectedArtifacts(e.target.value)} 
          placeholder="Ej: Crear src/app/nueva-ruta/page.tsx. Modificar src/components/existente.tsx para añadir X." 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalConsiderations">Consideraciones Adicionales</Label>
        <Textarea id="additionalConsiderations" value={additionalConsiderations} onChange={(e) => setAdditionalConsiderations(e.target.value)} />
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
        <Wand2 className="mr-2 h-5 w-5" />
        Generar Prompt
      </Button>

      {generatedPrompt && (
        <Card className="mt-8 shadow-inner">
          <CardHeader>
            <CardTitle className="text-xl text-accent">Prompt Generado</CardTitle>
            <CardDescription>Copia este prompt y pégalo en la conversación con la IA.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={generatedPrompt}
              rows={15}
              className="text-sm font-mono bg-muted/30"
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
