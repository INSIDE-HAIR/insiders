# Solución para Bypassing el Límite de 4.5MB de Vercel

## Problema

Vercel's serverless functions tienen un límite estricto de **4.5MB** para el cuerpo de las peticiones HTTP. Esto significa que cualquier archivo mayor a 4.5MB causará un error `413: FUNCTION_PAYLOAD_TOO_LARGE` cuando se suba a través de las funciones serverless.

### Error típico:

```
413: FUNCTION_PAYLOAD_TOO_LARGE
Error: El archivo es demasiado grande para ser procesado por la función
```

## Solución Implementada

Hemos implementado un sistema de **subida directa a Google Drive** que bypass completamente las funciones serverless de Vercel para archivos grandes, siguiendo las mejores prácticas recomendadas por Vercel.

### Arquitectura de la Solución

```
┌─────────────────┐    ┌────────────────┐    ┌─────────────────┐
│   Cliente       │    │ Vercel API     │    │ Google Drive    │
│   (Navegador)   │    │ (Token only)   │    │ API             │
└─────────────────┘    └────────────────┘    └─────────────────┘
         │                       │                      │
         │ 1. Solicita token     │                      │
         ├──────────────────────►│                      │
         │                       │                      │
         │ 2. Retorna token      │                      │
         │◄──────────────────────┤                      │
         │                       │                      │
         │ 3. Upload directo con token                   │
         ├─────────────────────────────────────────────►│
         │                       │                      │
         │ 4. Respuesta de Google Drive                 │
         │◄─────────────────────────────────────────────┤
```

## Componentes Creados

### 1. `DirectUploadDropZone`

Componente que sube archivos directamente a Google Drive sin pasar por Vercel.

**Características:**

- Sin límites de tamaño (hasta 15GB - límite de Google Drive)
- Resumable uploads para archivos >5MB
- Progreso en tiempo real
- Cancelación de uploads
- Retry automático

### 2. `DirectFileUploadManager`

Wrapper inteligente que detecta automáticamente la mejor estrategia de subida.

**Características:**

- Auto-detección de capacidades
- Fallback automático al servidor para archivos pequeños
- UI que muestra el modo actual
- Cambio manual entre modos

### 3. API Token Endpoint (`/api/drive/auth/token`)

Endpoint que proporciona tokens de acceso temporales para Google Drive.

## Implementación Técnica

### Para Archivos Pequeños (<5MB)

```javascript
// Usa multipart upload directo
const form = new FormData();
form.append(
  "metadata",
  new Blob([JSON.stringify(metadata)], { type: "application/json" })
);
form.append("file", file);

const response = await fetch(`${GOOGLE_DRIVE_API_URL}?uploadType=multipart`, {
  method: "POST",
  headers: { Authorization: `Bearer ${accessToken}` },
  body: form,
});
```

### Para Archivos Grandes (>5MB)

```javascript
// 1. Iniciar resumable upload
const initResponse = await fetch(
  `${GOOGLE_DRIVE_API_URL}?uploadType=resumable`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metadata),
  }
);

const uploadUrl = initResponse.headers.get("Location");

// 2. Subir en chunks de 256MB
const chunkSize = 256 * 1024 * 1024;
let uploadedBytes = 0;

while (uploadedBytes < file.size) {
  const chunk = file.slice(uploadedBytes, uploadedBytes + chunkSize);

  const chunkResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Length": chunk.size.toString(),
      "Content-Range": `bytes ${uploadedBytes}-${
        uploadedBytes + chunk.size - 1
      }/${file.size}`,
    },
    body: chunk,
  });

  uploadedBytes += chunk.size;
}
```

## Uso en Código

### Opción 1: Smart Upload (Recomendado)

```tsx
import { DirectFileUploadManager } from "@/src/components/drive/upload";

function MyComponent() {
  return (
    <DirectFileUploadManager
      folderId={folderId}
      folderName={folderName}
      onUploadComplete={(files) => {
        console.log("Archivos subidos:", files);
      }}
    />
  );
}
```

### Opción 2: Solo Directo

```tsx
import { DirectUploadDropZone } from "@/src/components/drive/upload";

function MyComponent() {
  return (
    <DirectUploadDropZone
      folderId={folderId}
      folderName={folderName}
      onUploadComplete={(files) => {
        console.log("Archivos subidos directamente:", files);
      }}
    />
  );
}
```

## Ventajas de la Solución

### ✅ Sin Límites de Tamaño

- Archivos hasta 15GB (límite de Google Drive)
- No afectado por límites de Vercel

### ✅ Mejor Rendimiento

- Transferencia directa = más rápida
- No consume recursos del servidor
- Resumable uploads para archivos grandes

### ✅ Experiencia de Usuario Superior

- Progreso en tiempo real por archivo
- Posibilidad de cancelar/reanudar
- No timeouts por archivos grandes

### ✅ Escalabilidad

- No carga el servidor Vercel
- Múltiples usuarios pueden subir simultáneamente
- Costo reducido en uso de funciones

### ✅ Fallback Robusto

- Detección automática de capacidades
- Fallback a método servidor si es necesario
- Experiencia seamless para el usuario

## Configuración Requerida

### Variables de Entorno

```env
GOOGLE_DRIVE_CLIENT_EMAIL=tu-service-account@proyecto.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_PROJECT_ID=tu-proyecto-id
```

### Permisos Google Drive

La service account debe tener permisos de **Editor** o **Propietario** en las carpetas de destino.

## Páginas de Demo

### 1. `/admin/drive/direct-upload-demo`

Demostración completa con tres modos:

- **Smart Upload**: Detección automática + fallback
- **Solo Directo**: Subida directa únicamente
- **Solo Servidor**: Método tradicional (limitado a 4.5MB)

### 2. `/admin/drive/enhanced-upload-demo`

Demostración de la experiencia mejorada sin modal (ahora sin errores de contexto).

### 3. `/admin/drive/test-upload`

Página de testing básica para verificar funcionalidad.

## Migración desde Sistema Anterior

### Paso 1: Reemplazar Componente

```diff
- import { EnhancedFileUploadManager } from '@/src/components/drive/upload';
+ import { DirectFileUploadManager } from '@/src/components/drive/upload';

- <EnhancedFileUploadManager
+ <DirectFileUploadManager
    folderId={folderId}
    folderName={folderName}
    onUploadComplete={handleUploadComplete}
  />
```

### Paso 2: Verificar Variables de Entorno

Asegúrate de que las variables de Google Drive estén configuradas correctamente en Vercel.

### Paso 3: Testing

Usa la página `/admin/drive/direct-upload-demo` para verificar que todo funciona correctamente.

## Troubleshooting

### Error: "Failed to get access token"

- Verificar variables de entorno
- Confirmar que la service account tiene los permisos correctos
- Revisar que el proyecto de Google Cloud tiene habilitada la API de Drive

### Error: "Upload failed: 403"

- La service account no tiene permisos en la carpeta de destino
- Compartir la carpeta con el email de la service account

### Error: "Network error"

- Problemas de conectividad del cliente
- Firewall bloqueando requests a googleapis.com
- El sistema automáticamente fallback al método servidor

## Beneficios en Producción

### Costos Reducidos

- Menos uso de funciones serverless Vercel
- Menos transferencia de datos por el servidor
- Mejor utilización de recursos

### Mejor Experiencia

- Subidas más rápidas para archivos grandes
- Sin timeouts ni errores por tamaño
- Progreso más preciso y granular

### Escalabilidad

- El servidor maneja solo autenticación (requests pequeños)
- Google Drive maneja la transferencia pesada
- Capacidad virtualmente ilimitada de usuarios concurrentes

Esta solución está basada en las recomendaciones oficiales de Vercel para bypassing el límite de 4.5MB y representa la mejor práctica para handling de archivos grandes en aplicaciones Next.js desplegadas en Vercel.
