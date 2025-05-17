
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
  const [additionalConsiderations, setAdditionalConsiderations] = useState('Asegúrate de que todo el código sea compatible con Next.js App Router y TypeScript.');

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const { toast } = useToast();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    let prompt = `Hola, necesito que implementes una nueva sección en RumboEnvios para ${requestType === 'page' ? 'crear una nueva página' : 'crear un nuevo componente'}.

`;

    if (requestType === 'page') {
      prompt += `1. Nueva Página:
   - Nombre y Ruta: Crea una nueva página llamada '${pageName}' accesible en la ruta '${pageRoute}'.
`;
    } else {
      prompt += `1. Nuevo Componente:
   - Nombre y Ruta: Crea un nuevo componente llamado '${componentName}.tsx' en la ruta 'src/components/${componentPath}/'.
`;
    }

    prompt += `   - Propósito: ${purpose}
   - Contenido Inicial:\n     ${contentDetails.split('\n').join('\n     ')}
   - Diseño:\n     ${designDetails.split('\n').join('\n     ')}
`;

    if (requestType === 'page' && reusableComponentName) {
      prompt += `
2. Componente Reutilizable (Opcional):
   - Si consideras que una parte de esta página podría reutilizarse, crea un componente llamado '${reusableComponentName}.tsx' en 'src/components/${reusableComponentPath}/'.
`;
    }

    prompt += `
${(requestType === 'page' && reusableComponentName) ? '3' : '2'}. Integración:
   ${integrationDetails}
`;

    prompt += `
${(requestType === 'page' && reusableComponentName) ? '4' : '3'}. Dependencias Específicas:
   ${dependencies}
`;

    prompt += `
${(requestType === 'page' && reusableComponentName) ? '5' : '4'}. Resumen de lo que necesito que generes:
   ${expectedArtifacts}
`;
    prompt += `
${(requestType === 'page' && reusableComponentName) ? '6' : '5'}. Consideraciones Adicionales:
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
            <Label htmlFor="componentPath">Ruta del Componente (dentro de src/components/, ej. transportistas)</Label>
            <Input id="componentPath" value={componentPath} onChange={(e) => setComponentPath(e.target.value)} placeholder="shared/" />
            <p className="text-xs text-muted-foreground">Ej: si pones 'forms', el componente se creará en 'src/components/forms/'.</p>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="purpose">Propósito de la Página/Componente</Label>
        <Textarea id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Esta página mostrará..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contentDetails">Contenido Inicial / Detalles del Componente</Label>
        <Textarea id="contentDetails" value={contentDetails} onChange={(e) => setContentDetails(e.target.value)} rows={5} placeholder="Un título principal: '...' \nUna lista con: \n- Item 1 \n- Item 2" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="designDetails">Detalles de Diseño/Estilo</Label>
        <Textarea id="designDetails" value={designDetails} onChange={(e) => setDesignDetails(e.target.value)} placeholder="Utilizar Card de ShadCN. Debe ser responsive." />
      </div>

      {requestType === 'page' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="reusableComponentName">Componente Reutilizable (Opcional - Nombre, ej. InfoItemCard)</Label>
            <Input id="reusableComponentName" value={reusableComponentName} onChange={(e) => setReusableComponentName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reusableComponentPath">Ruta del Componente Reutilizable (Opcional - dentro de src/components/)</Label>
            <Input id="reusableComponentPath" value={reusableComponentPath} onChange={(e) => setReusableComponentPath(e.target.value)} placeholder="items/" />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="integrationDetails">Detalles de Integración</Label>
        <Textarea id="integrationDetails" value={integrationDetails} onChange={(e) => setIntegrationDetails(e.target.value)} placeholder="Añadir enlace en Navbar con texto '...' e icono '...'. Importar componente en 'src/app/otra-pagina/page.tsx' y usarlo así: <MiComponente />" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dependencies">Dependencias Específicas (ShadCN, Lucide, NPM)</Label>
        <Textarea id="dependencies" value={dependencies} onChange={(e) => setDependencies(e.target.value)} />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="expectedArtifacts">Resumen de Archivos a Generar/Modificar</Label>
        <Textarea id="expectedArtifacts" value={expectedArtifacts} onChange={(e) => setExpectedArtifacts(e.target.value)} placeholder="- src/app/nueva-ruta/page.tsx \n- src/components/nuevo-componente.tsx \n- Modificaciones en src/components/layout/navbar.tsx" />
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
