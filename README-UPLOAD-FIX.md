# Solución para Subida de Archivos Grandes

## Problema Identificado

El error HTTP 413 "Content Too Large" ocurría en producción cuando se intentaban subir archivos grandes, mientras que funcionaba correctamente en local.

## Soluciones Implementadas

### 1. Configuración de Vercel (`vercel.json`)

```json
{
  "functions": {
    "src/app/api/drive/upload/route.ts": {
      "maxDuration": 300
    }
  }
}
```

- Aumenta el timeout de la función de upload a 5 minutos

### 2. Configuración de Next.js (`next.config.mjs`)

```js
experimental: {
  serverComponentsExternalPackages: ["googleapis"],
},
serverRuntimeConfig: {
  maxDuration: 300,
},
```

### 3. Configuración de la API de Upload

- **Timeout**: 300 segundos (5 minutos)
- **Límite por archivo**: 100MB
- **Límite total por request**: 500MB
- **Validación mejorada**: Verificación de tamaños antes del procesamiento
- **Logging mejorado**: Estadísticas detalladas de velocidad y tiempo

### 4. Mejoras en el Frontend

#### DropZone Component

- Validación de archivos antes de la subida
- Advertencias para archivos grandes (>10MB)
- Información de tamaño y tipo de archivo
- Límites claros mostrados al usuario

#### useFileUpload Hook

- Progreso mejorado para archivos grandes
- Mejor manejo de errores con mensajes específicos
- Timeout extendido para archivos grandes
- Logging detallado para debugging

## Límites Configurados

| Tipo                          | Límite    |
| ----------------------------- | --------- |
| Archivo individual            | 100MB     |
| Total por request             | 500MB     |
| Timeout de función            | 5 minutos |
| Advertencia de archivo grande | 10MB      |

## Mensajes de Error Específicos

- **413**: "Archivo demasiado grande (X MB). El servidor tiene un límite de tamaño."
- **Timeout**: "Timeout al subir archivo grande (X MB). Intenta de nuevo."
- **Quota**: "Se alcanzó el límite de cuota de Google Drive"
- **Permisos**: "Permission denied para upload"

## Verificación de Funcionamiento

1. **Archivos pequeños (<10MB)**: Deberían subir normalmente
2. **Archivos medianos (10-50MB)**: Mostrarán advertencia pero subirán
3. **Archivos grandes (50-100MB)**: Tiempo de subida extendido con progreso detallado
4. **Archivos muy grandes (>100MB)**: Rechazados con mensaje claro

## Variables de Entorno Requeridas

Asegúrate de que estas variables estén configuradas en producción:

```
GOOGLE_DRIVE_CLIENT_EMAIL=
GOOGLE_DRIVE_PRIVATE_KEY=
GOOGLE_DRIVE_PROJECT_ID=
```

## Monitoreo

Los logs ahora incluyen:

- Tiempo de subida por archivo
- Velocidad de transferencia (MB/s)
- Tamaño de archivos en MB
- Estadísticas totales del batch

## Siguiente Paso

Después de desplegar estos cambios, los uploads de archivos grandes deberían funcionar correctamente en producción.
