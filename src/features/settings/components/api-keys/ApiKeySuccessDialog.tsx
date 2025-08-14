"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { 
  Key, 
  Copy, 
  Download, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle,
  Shield,
  Clock,
  Activity
} from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { ApiKey } from "../../types";

interface ApiKeySuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: ApiKey;
  secretKey: string;
}

export function ApiKeySuccessDialog({
  open,
  onOpenChange,
  apiKey,
  secretKey
}: ApiKeySuccessDialogProps) {
  const [keyVisible, setKeyVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, type: string = "clave") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "¡Copiado!",
        description: `La ${type} se ha copiado al portapapeles`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      });
    }
  };

  const downloadKey = () => {
    const keyData = {
      name: apiKey.name,
      description: apiKey.description,
      key: secretKey,
      keyId: apiKey.id,
      status: apiKey.status,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      instructions: {
        usage: "Include this key in your requests using the Authorization header",
        header: `Authorization: Bearer ${secretKey}`,
        alternativeHeader: `X-API-Key: ${secretKey}`,
        endpoint: `${window.location.origin}/api/v1/`,
        documentation: `${window.location.origin}/docs/api`
      }
    };

    const blob = new Blob([JSON.stringify(keyData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-key-${apiKey.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Descargado",
      description: "Los datos de la API Key se han descargado",
    });
  };

  const exampleUsage = `
// JavaScript/Node.js
const response = await fetch('${window.location.origin}/api/v1/meet/rooms', {
  headers: {
    'Authorization': 'Bearer ${secretKey}',
    'Content-Type': 'application/json'
  }
});

// cURL
curl -H "Authorization: Bearer ${secretKey}" \\
     -H "Content-Type: application/json" \\
     ${window.location.origin}/api/v1/meet/rooms

// Python
import requests

headers = {
    'Authorization': 'Bearer ${secretKey}',
    'Content-Type': 'application/json'
}

response = requests.get('${window.location.origin}/api/v1/meet/rooms', headers=headers)
  `.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>¡API Key Creada Exitosamente!</span>
          </DialogTitle>
          <DialogDescription>
            Tu nueva API Key ha sido generada. <strong>Esta es la única vez que verás la clave completa.</strong>
            Asegúrate de copiarla y guardarla en un lugar seguro.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Security Warning */}
          <Card className="border-warning bg-warning/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-warning">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Importante - Guarda esta información</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-warning space-y-1">
                <li>• Esta clave no se volverá a mostrar completa</li>
                <li>• Guárdala en un gestor de contraseñas o archivo seguro</li>
                <li>• No la compartas ni la incluyas en código público</li>
                <li>• Puedes regenerarla si la pierdes</li>
              </ul>
            </CardContent>
          </Card>

          {/* API Key Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-4 w-4" />
                <span>Detalles de la API Key</span>
              </CardTitle>
              <CardDescription>
                Información y configuración de tu nueva API Key
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Nombre:</span>
                  <div className="font-medium">{apiKey.name}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">ID:</span>
                  <div className="font-mono text-xs">{apiKey.id}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Estado:</span>
                  <Badge variant="outline" className="ml-1 bg-green-100 text-green-800">
                    {apiKey.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Expira:</span>
                  <div className="font-medium">
                    {apiKey.expiresAt ? new Date(apiKey.expiresAt).toLocaleDateString('es-ES') : 'Nunca'}
                  </div>
                </div>
              </div>

              {apiKey.description && (
                <div>
                  <span className="text-muted-foreground text-sm">Descripción:</span>
                  <div className="text-sm mt-1">
                    {apiKey.description}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Secret Key */}
          <Card className="border-success bg-success/5">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span>Tu API Key</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setKeyVisible(!keyVisible)}
                  >
                    {keyVisible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(secretKey)}
                    className={copied ? "text-green-600" : ""}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-primary/5 rounded-lg font-mono text-sm break-all border">
                {keyVisible ? secretKey : "•".repeat(secretKey.length)}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Incluye esta clave en el header Authorization: Bearer [tu-clave]
              </div>
            </CardContent>
          </Card>

          {/* Usage Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Ejemplo de Uso</span>
              </CardTitle>
              <CardDescription>
                Cómo usar tu API Key en diferentes lenguajes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Código de ejemplo:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(exampleUsage, "código de ejemplo")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
                <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto whitespace-pre">
                  {exampleUsage}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button 
              onClick={() => copyToClipboard(secretKey)} 
              className="flex-1"
              variant={copied ? "outline" : "default"}
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "¡Copiado!" : "Copiar API Key"}
            </Button>
            
            <Button 
              onClick={downloadKey} 
              variant="outline"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Datos
            </Button>
            
            <Button 
              onClick={() => onOpenChange(false)}
              variant="secondary"
              className="flex-1"
            >
              Cerrar
            </Button>
          </div>

          {/* Next Steps */}
          <Card className="bg-warning/5 border-warning">
            <CardHeader className="pb-3">
              <CardTitle className="text-warning text-sm">Próximos Pasos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-warning space-y-1">
                <li>• Guarda la API Key en tu gestor de contraseñas</li>
                <li>• Configura tu aplicación para usar la clave</li>
                <li>• Prueba la conexión con una request de ejemplo</li>
                <li>• Monitorea el uso desde el panel de administración</li>
                <li>• Consulta la documentación de la API para más detalles</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}