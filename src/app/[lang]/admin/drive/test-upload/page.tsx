"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { FileUploadManager } from "@/src/components/drive/upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";
import { InfoIcon, CheckCircle, XCircle, Loader2, Bug } from "lucide-react";

export default function TestUploadPage() {
  const { data: session } = useSession();
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);

  // ID de carpeta de prueba - usar la carpeta raíz por defecto
  const testFolderId =
    process.env.NEXT_PUBLIC_GOOGLE_DRIVE_ROOT_FOLDER_ID ||
    "19wn0b3uaOT81NVxQARXLht8Nbukn-0u_";
  const testFolderName = "Carpeta de Prueba";

  const runDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    setDiagnosticData(null);

    try {
      const response = await fetch("/api/drive/diagnostic");
      const data = await response.json();
      setDiagnosticData(data);
    } catch (error) {
      setDiagnosticData({
        success: false,
        error: "Failed to run diagnostic",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className='w-4 h-4 text-green-500' />;
      case "fail":
        return <XCircle className='w-4 h-4 text-red-500' />;
      case "running":
        return <Loader2 className='w-4 h-4 text-blue-500 animate-spin' />;
      default:
        return <InfoIcon className='w-4 h-4 text-gray-500' />;
    }
  };

  if (!session) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Alert>
          <InfoIcon className='h-4 w-4' />
          <AlertDescription>
            Debes iniciar sesión para acceder a esta página de pruebas.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (session.user.role !== "ADMIN") {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Alert variant='destructive'>
          <InfoIcon className='h-4 w-4' />
          <AlertDescription>
            Solo los administradores pueden acceder a esta página de pruebas.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto space-y-8'>
        <div>
          <h1 className='text-3xl font-bold mb-2'>
            Testing: Upload de Archivos a Drive
          </h1>
          <p className='text-muted-foreground'>
            Página de pruebas para verificar la funcionalidad de upload de
            archivos a Google Drive.
          </p>
        </div>

        {/* Información de sesión */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Sesión</CardTitle>
            <CardDescription>Detalles del usuario autenticado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>Usuario:</span>
                <span>{session.user.name || session.user.email}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>Rol:</span>
                <Badge
                  variant={
                    session.user.role === "ADMIN" ? "default" : "secondary"
                  }
                >
                  {session.user.role}
                </Badge>
              </div>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>Email:</span>
                <span>{session.user.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de la prueba */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Prueba</CardTitle>
            <CardDescription>
              Parámetros para el testing del upload
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>Folder ID de Destino:</span>
                <code className='bg-muted px-2 py-1 rounded text-sm'>
                  {testFolderId}
                </code>
              </div>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>Nombre de Carpeta:</span>
                <span>{testFolderName}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instrucciones de testing */}
        <Card>
          <CardHeader>
            <CardTitle>Instrucciones de Testing</CardTitle>
            <CardDescription>
              Pasos para probar la funcionalidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className='list-decimal list-inside space-y-2 text-sm'>
              <li>
                Primero ejecuta el diagnóstico para verificar que Google Drive
                esté funcionando
              </li>
              <li>
                Arrastra archivos a la zona de drop abajo o haz clic en
                &quot;selecciona archivos&quot;
              </li>
              <li>Verifica que el modal de progreso se abra correctamente</li>
              <li>Cambia el nombre de algunos archivos en el modal</li>
              <li>
                Haz clic en &quot;Subir archivos&quot; para iniciar el proceso
              </li>
              <li>
                Observa las barras de progreso y los estados de cada archivo
              </li>
              <li>Verifica que los archivos aparezcan en Google Drive</li>
              <li>Prueba cancelar una subida en progreso</li>
              <li>Prueba subir archivos de diferentes tipos y tamaños</li>
            </ol>
          </CardContent>
        </Card>

        {/* Diagnóstico de Google Drive */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Bug className='w-5 h-5' />
              Diagnóstico de Google Drive
            </CardTitle>
            <CardDescription>
              Ejecuta pruebas paso a paso para verificar la configuración de
              Google Drive
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Button
              onClick={runDiagnostic}
              disabled={isRunningDiagnostic}
              className='w-full'
            >
              {isRunningDiagnostic ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Ejecutando diagnóstico...
                </>
              ) : (
                <>
                  <Bug className='w-4 h-4 mr-2' />
                  Ejecutar Diagnóstico
                </>
              )}
            </Button>

            {diagnosticData && (
              <div className='space-y-3'>
                <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                  <span className='font-medium'>
                    Estado general:{" "}
                    {diagnosticData.success ? "Exitoso" : "Fallido"}
                  </span>
                  {diagnosticData.success ? (
                    <CheckCircle className='w-5 h-5 text-green-500' />
                  ) : (
                    <XCircle className='w-5 h-5 text-red-500' />
                  )}
                </div>

                {diagnosticData.summary && (
                  <div className='text-sm text-muted-foreground'>
                    {diagnosticData.summary.passed}/
                    {diagnosticData.summary.total} pruebas pasaron
                  </div>
                )}

                {diagnosticData.diagnostics && (
                  <div className='space-y-2'>
                    {diagnosticData.diagnostics.map(
                      (test: any, index: number) => (
                        <div
                          key={index}
                          className='flex items-center justify-between p-2 border rounded'
                        >
                          <div className='flex items-center gap-2'>
                            {getStatusIcon(test.status)}
                            <span className='text-sm font-medium'>
                              {test.test}
                            </span>
                          </div>
                          {test.status === "fail" && (
                            <Badge variant='destructive'>Error</Badge>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}

                {diagnosticData.error && (
                  <Alert variant='destructive'>
                    <XCircle className='h-4 w-4' />
                    <AlertDescription>
                      <strong>Error:</strong> {diagnosticData.error}
                      {diagnosticData.details && (
                        <div className='mt-2 text-xs font-mono'>
                          {diagnosticData.details}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Zona de testing */}
        <Card>
          <CardHeader>
            <CardTitle>Zona de Upload de Prueba</CardTitle>
            <CardDescription>
              Arrastra archivos aquí para probar la funcionalidad
            </CardDescription>
          </CardHeader>
          <CardContent className='p-8'>
            <FileUploadManager
              folderId={testFolderId}
              folderName={testFolderName}
            />
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Alert variant='destructive'>
          <InfoIcon className='h-4 w-4' />
          <AlertDescription>
            <strong>⚠️ Modo REAL:</strong> Los archivos se subirán REALMENTE a
            Google Drive en la carpeta configurada. Asegúrate de usar archivos
            de prueba que puedas eliminar después. Si encuentras errores, revisa
            los logs de la consola.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
