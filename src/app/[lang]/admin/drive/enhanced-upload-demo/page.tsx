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
  Upload,
  Zap,
  Edit,
  List,
  Trash2,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import {
  EnhancedFileUploadManager,
  FileUploadManager,
} from "@/src/components/drive/upload";
import type { UploadFileItem } from "@/src/components/drive/upload";

export default function EnhancedUploadDemoPage() {
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
    id: "1uksAN7jXW_xhNcLhKP2EIBZGDS8QJqmF", // Marketing salon folder from content-data.json
    name: "Carpeta Demo",
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
      icon: <Upload className='w-5 h-5' />,
      title: "Sin Modal",
      description:
        "Todo integrado en la zona de drop - no más ventanas emergentes",
    },
    {
      icon: <Edit className='w-5 h-5' />,
      title: "Edición de Nombres",
      description: "Cambia nombres de archivos antes de subir",
    },
    {
      icon: <List className='w-5 h-5' />,
      title: "Gestión de Lista",
      description: "Añade, quita y reordena archivos fácilmente",
    },
    {
      icon: <Zap className='w-5 h-5' />,
      title: "Progreso en Tiempo Real",
      description: "Ve el progreso de cada archivo individualmente",
    },
    {
      icon: <RotateCcw className='w-5 h-5' />,
      title: "Reintentos",
      description: "Reintenta archivos que fallaron automáticamente",
    },
    {
      icon: <Trash2 className='w-5 h-5' />,
      title: "Control Total",
      description: "Limpia la lista o elimina archivos específicos",
    },
  ];

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='text-center space-y-4'>
        <h1 className='text-3xl font-bold'>
          Sistema de Carga de Archivos Mejorado
        </h1>
        <p className='text-gray-600 max-w-2xl mx-auto'>
          Una experiencia de carga de archivos completamente rediseñada sin
          modales, con gestión avanzada de archivos y mejor UX/UI.
        </p>
        <Alert>
          <CheckCircle className='h-4 w-4' />
          <AlertDescription>
            <strong>Carpeta de demo:</strong> {demoFolder.name} (ID:{" "}
            {demoFolder.id})
          </AlertDescription>
        </Alert>
      </div>

      {/* Features */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
        {features.map((feature, index) => (
          <Card key={index} className='text-center'>
            <CardContent className='pt-4'>
              <div className='flex justify-center mb-2 text-blue-600'>
                {feature.icon}
              </div>
              <h3 className='font-semibold mb-1'>{feature.title}</h3>
              <p className='text-sm text-gray-600'>{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistics */}
      {uploadStats.lastUpload && (
        <Alert className='mb-6'>
          <CheckCircle className='h-4 w-4' />
          <AlertDescription>
            <strong>Última carga exitosa:</strong> {uploadStats.totalFiles}{" "}
            archivo(s),
            {formatFileSize(uploadStats.totalSize)} total -{" "}
            {uploadStats.lastUpload.toLocaleTimeString()}
          </AlertDescription>
        </Alert>
      )}

      {/* Demo Tabs */}
      <Tabs defaultValue='enhanced' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='enhanced' className='flex items-center gap-2'>
            <Zap className='w-4 h-4' />
            Nueva Experiencia
            <Badge variant='default' className='bg-green-500'>
              Mejorado
            </Badge>
          </TabsTrigger>
          <TabsTrigger value='classic' className='flex items-center gap-2'>
            <Upload className='w-4 h-4' />
            Experiencia Clásica
            <Badge variant='outline'>Original</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='enhanced' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Zap className='w-5 h-5 text-green-600' />
                Experiencia Mejorada - Sin Modal
              </CardTitle>
              <CardDescription>
                Toda la funcionalidad integrada directamente en la zona de drop.
                Gestiona archivos, edita nombres, ve progreso y más - todo en un
                solo lugar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedFileUploadManager
                folderId={demoFolder.id}
                folderName={`${demoFolder.name} (Mejorada)`}
                onUploadComplete={handleUploadComplete}
              />
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Cómo usar la nueva experiencia</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className='list-decimal list-inside space-y-2 text-sm'>
                <li>
                  Arrastra archivos a la zona de drop o haz clic para
                  seleccionar
                </li>
                <li>
                  Ve la lista de archivos aparecer directamente en la zona
                </li>
                <li>
                  Haz clic en el icono de editar para cambiar nombres de
                  archivos
                </li>
                <li>
                  Usa &quot;Añadir más&quot; para seguir agregando archivos
                </li>
                <li>Elimina archivos individuales o limpia toda la lista</li>
                <li>Ve el progreso de cada archivo en tiempo real</li>
                <li>Reintenta archivos que fallaron con un clic</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='classic' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Upload className='w-5 h-5 text-blue-600' />
                Experiencia Clásica - Con Modal
              </CardTitle>
              <CardDescription>
                La implementación original que abre un modal para gestionar la
                carga de archivos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploadManager
                folderId={demoFolder.id}
                folderName={`${demoFolder.name} (Clásica)`}
              />
            </CardContent>
          </Card>

          {/* Limitations */}
          <Card>
            <CardHeader>
              <CardTitle>Limitaciones de la experiencia clásica</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className='list-disc list-inside space-y-2 text-sm text-gray-600'>
                <li>Requiere abrir un modal que puede ser intrusivo</li>
                <li>Flujo menos natural para añadir más archivos</li>
                <li>Menos visibilidad del progreso general</li>
                <li>Experiencia más fragmentada</li>
                <li>Más clics necesarios para tareas básicas</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Comparación de Características</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='border-b'>
                  <th className='text-left p-2'>Característica</th>
                  <th className='text-center p-2'>Clásica</th>
                  <th className='text-center p-2'>Mejorada</th>
                </tr>
              </thead>
              <tbody className='text-sm'>
                <tr className='border-b'>
                  <td className='p-2'>Drag & Drop</td>
                  <td className='text-center p-2'>✅</td>
                  <td className='text-center p-2'>✅</td>
                </tr>
                <tr className='border-b'>
                  <td className='p-2'>Edición de nombres</td>
                  <td className='text-center p-2'>✅</td>
                  <td className='text-center p-2'>✅</td>
                </tr>
                <tr className='border-b'>
                  <td className='p-2'>Progreso individual</td>
                  <td className='text-center p-2'>✅</td>
                  <td className='text-center p-2'>✅</td>
                </tr>
                <tr className='border-b'>
                  <td className='p-2'>Sin modal</td>
                  <td className='text-center p-2'>❌</td>
                  <td className='text-center p-2'>✅</td>
                </tr>
                <tr className='border-b'>
                  <td className='p-2'>Añadir más archivos fácilmente</td>
                  <td className='text-center p-2'>❌</td>
                  <td className='text-center p-2'>✅</td>
                </tr>
                <tr className='border-b'>
                  <td className='p-2'>Gestión visual de lista</td>
                  <td className='text-center p-2'>⚠️</td>
                  <td className='text-center p-2'>✅</td>
                </tr>
                <tr className='border-b'>
                  <td className='p-2'>Reintentos fáciles</td>
                  <td className='text-center p-2'>❌</td>
                  <td className='text-center p-2'>✅</td>
                </tr>
                <tr className='border-b'>
                  <td className='p-2'>Flujo ininterrumpido</td>
                  <td className='text-center p-2'>❌</td>
                  <td className='text-center p-2'>✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
