"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Badge } from "@/src/components/ui/badge";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
  CheckCircle,
  Wifi,
  WifiOff,
  Upload,
  Zap,
  AlertTriangle,
  Cloud,
  Server,
  FileX,
} from "lucide-react";
import {
  DirectFileUploadManager,
  EnhancedDropZone,
  TrueDirectUploadZone,
} from "@/src/components/drive/upload";
import type { UploadFileItem } from "@/src/components/drive/upload";

export default function DirectUploadDemoPage() {
  const [uploadStats, setUploadStats] = useState<{
    totalFiles: number;
    totalSize: number;
    lastUpload?: Date;
  }>({
    totalFiles: 0,
    totalSize: 0,
  });

  // Use a real folder ID from the marketing salon content data
  const demoFolder = {
    id: "19wn0b3uaOT81NVxQARXLht8Nbukn-0u_", // Marketing salon folder from content-data.json
    name: "Demo Direct Upload",
  };

  const handleUploadComplete = (files: UploadFileItem[]) => {
    const totalSize = files.reduce((sum, file) => sum + file.file.size, 0);
    setUploadStats({
      totalFiles: files.length,
      totalSize,
      lastUpload: new Date(),
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const features = [
    {
      icon: <Cloud className="w-5 h-5" />,
      title: "Sin Límites de Tamaño",
      description:
        "Sube archivos de cualquier tamaño directamente a Google Drive",
      color: "text-green-600",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Transferencia Resumible",
      description:
        "Los archivos grandes se suben en chunks, permitiendo pausar y reanudar",
      color: "text-blue-600",
    },
    {
      icon: <Wifi className="w-5 h-5" />,
      title: "Bypass Vercel",
      description:
        "Evita el límite de 4.5MB de las funciones serverless de Vercel",
      color: "text-purple-600",
    },
    {
      icon: <Server className="w-5 h-5" />,
      title: "Fallback Automático",
      description:
        "Si falla la subida directa, automáticamente usa el servidor",
      color: "text-orange-600",
    },
  ];

  const limitComparison = [
    {
      method: "Vercel Serverless Functions",
      limit: "4.5MB",
      suitable: "Archivos pequeños",
      icon: <Server className="w-4 h-4" />,
      color: "bg-red-100 text-red-800",
    },
    {
      method: "Direct Upload to Google Drive",
      limit: "15GB (Google Drive limit)",
      suitable: "Archivos de cualquier tamaño",
      icon: <Cloud className="w-4 h-4" />,
      color: "bg-green-100 text-green-800",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">
          Sistema de Subida Directa a Google Drive
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Solución avanzada que bypassa los límites de Vercel enviando archivos
          directamente a Google Drive usando resumable uploads.
        </p>
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Carpeta de demo:</strong> {demoFolder.name} (ID:{" "}
            {demoFolder.id})
          </AlertDescription>
        </Alert>
      </div>

      {/* Problem Statement */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Problema: Límite de 4.5MB en Vercel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-4">
            Las funciones serverless de Vercel tienen un límite de 4.5MB para el
            cuerpo de las peticiones, lo que impide subir archivos grandes. Este
            sistema soluciona el problema subiendo directamente a Google Drive
            desde el navegador.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {limitComparison.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg bg-white"
              >
                <div className={`p-2 rounded-full ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <div className="font-medium">{item.method}</div>
                  <div className="text-sm text-gray-600">
                    Límite: {item.limit}
                  </div>
                  <div className="text-xs text-gray-500">{item.suitable}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {features.map((feature, index) => (
          <Card key={index} className="text-center">
            <CardContent className="pt-4">
              <div className={`flex justify-center mb-2 ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistics */}
      {uploadStats.lastUpload && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Última carga exitosa:</strong> {uploadStats.totalFiles}{" "}
            archivo(s), {formatFileSize(uploadStats.totalSize)} total -{" "}
            {uploadStats.lastUpload.toLocaleTimeString()}
          </AlertDescription>
        </Alert>
      )}

      {/* Demo Tabs */}
      <Tabs defaultValue="smart" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="smart" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Smart Upload
            <Badge variant="default" className="bg-green-500">
              Recomendado
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="direct" className="flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Solo Directo
          </TabsTrigger>
          <TabsTrigger value="server" className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            Solo Servidor
            <Badge variant="destructive">4.5MB Límite</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="smart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                Smart Upload Manager
              </CardTitle>
              <CardDescription>
                Detecta automáticamente la mejor estrategia de subida. Usa
                subida directa cuando está disponible, y fallback al servidor
                para archivos pequeños.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DirectFileUploadManager
                folderId={demoFolder.id}
                folderName={`${demoFolder.name} (Smart)`}
                onUploadComplete={handleUploadComplete}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ventajas del Smart Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>
                  ✅ Detecta automáticamente si la subida directa está
                  disponible
                </li>
                <li>✅ Fallback automático al servidor si hay problemas</li>
                <li>✅ Interfaz de usuario que muestra el modo actual</li>
                <li>✅ Posibilidad de cambiar manualmente entre modos</li>
                <li>✅ Manejo inteligente de errores y reconexión</li>
                <li>
                  ✅ Experiencia de usuario optimizada para cada escenario
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="direct" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-600" />
                TRUE Direct Upload (Implementación Final)
              </CardTitle>
              <CardDescription>
                Verdadera subida directa a Google Drive usando resumable upload.
                Bypassa completamente Vercel • Sin límites de tamaño • Chunks de
                8MB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrueDirectUploadZone
                folderId={demoFolder.id}
                folderName={`${demoFolder.name} (Directo)`}
                onUploadComplete={handleUploadComplete}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cómo funciona la subida directa</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  El cliente solicita un token de acceso temporal al servidor
                </li>
                <li>
                  El servidor genera un token usando service account credentials
                </li>
                <li>
                  El cliente usa el token para autenticarse directamente con
                  Google Drive
                </li>
                <li>
                  Para archivos grandes (&gt;5MB), usa resumable upload con
                  chunks
                </li>
                <li>
                  El progreso se trackea en tiempo real sin sobrecargar el
                  servidor
                </li>
                <li>
                  No hay límites de tamaño excepto los de Google Drive (15GB)
                </li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="server" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-orange-600" />
                Subida via Servidor (Limitada)
              </CardTitle>
              <CardDescription>
                Método tradicional que pasa por las funciones serverless de
                Vercel. Limitado a 4.5MB por el API Gateway de Vercel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedDropZone
                folderId={demoFolder.id}
                folderName={`${demoFolder.name} (Servidor)`}
                onUploadComplete={handleUploadComplete}
              />
            </CardContent>
          </Card>

          <Alert variant="destructive">
            <FileX className="h-4 w-4" />
            <AlertDescription>
              <strong>⚠️ Limitación:</strong> Este método fallará con archivos
              mayores a 4.5MB debido al límite de Vercel. Usa los otros métodos
              para archivos grandes.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles Técnicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Aspecto</th>
                  <th className="text-center p-2">Servidor</th>
                  <th className="text-center p-2">Directo</th>
                  <th className="text-center p-2">Smart</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b">
                  <td className="p-2">Límite de tamaño</td>
                  <td className="text-center p-2">4.5MB</td>
                  <td className="text-center p-2">15GB</td>
                  <td className="text-center p-2">15GB</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Carga del servidor</td>
                  <td className="text-center p-2">Alta</td>
                  <td className="text-center p-2">Mínima</td>
                  <td className="text-center p-2">Mínima</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Velocidad</td>
                  <td className="text-center p-2">Media</td>
                  <td className="text-center p-2">Rápida</td>
                  <td className="text-center p-2">Rápida</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Resumable</td>
                  <td className="text-center p-2">❌</td>
                  <td className="text-center p-2">✅</td>
                  <td className="text-center p-2">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Fallback</td>
                  <td className="text-center p-2">❌</td>
                  <td className="text-center p-2">❌</td>
                  <td className="text-center p-2">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Compatibilidad</td>
                  <td className="text-center p-2">100%</td>
                  <td className="text-center p-2">95%</td>
                  <td className="text-center p-2">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Guía de Implementación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">
                1. Para uso general (recomendado):
              </h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {`import { DirectFileUploadManager } from '@/src/components/drive/upload';

<DirectFileUploadManager
  folderId={folderId}
  folderName={folderName}
  onUploadComplete={handleUploadComplete}
/>`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                2. Para subida directa únicamente (TRUE DIRECT):
              </h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {`import { TrueDirectUploadZone } from '@/src/components/drive/upload';

<TrueDirectUploadZone
  folderId={folderId}
  folderName={folderName}
  onUploadComplete={handleUploadComplete}
/>`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                3. Variables de entorno requeridas:
              </h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {`GOOGLE_DRIVE_CLIENT_EMAIL=tu-service-account@proyecto.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
GOOGLE_DRIVE_PROJECT_ID=tu-proyecto-id`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
