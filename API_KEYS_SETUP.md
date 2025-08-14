# API Keys Setup & Usage Guide

## 📋 Resumen

Este proyecto implementa un sistema completo de autenticación por API Keys para proteger las rutas de la API. El middleware valida las API Keys en tiempo real y proporciona contexto de usuario a las rutas protegidas.

## 🚀 Configuración Inicial

### 1. Generar una API Key de prueba

```bash
# Generar una nueva API Key para un usuario
npm run generate-api-key <userId> [nombre_opcional]

# Ejemplo:
npm run generate-api-key clm123456789 "Mi API Key de Prueba"
```

### 2. Listar API Keys existentes

```bash
# Listar todas las API Keys de un usuario
npm run list-api-keys <userId>

# Ejemplo:
npm run list-api-keys clm123456789
```

### 3. Revocar una API Key

```bash
# Revocar una API Key específica
npm run revoke-api-key <keyId>

# Ejemplo:
npm run revoke-api-key clm123456789
```

## 🔐 Rutas Protegidas

El middleware protege automáticamente las siguientes rutas:

- `/api/v1/` - API v1 pública
- `/api/public/` - APIs públicas
- `/api/webhook/` - Webhooks
- `/api/external/` - APIs externas
- `/api/admin/` - APIs de administración
- `/api/calendar/` - APIs de calendario
- `/api/drive/` - APIs de drive
- `/api/marketing-salon/` - APIs de marketing salon
- `/api/training/` - APIs de training

## 📡 Cómo usar las API Keys

### Opción 1: Header Authorization (Recomendado)

```bash
curl -H "Authorization: Bearer ak_dev_abc123def456ghi789jkl012mno345pqr678" \
     http://localhost:3000/api/v1/auth/test
```

### Opción 2: Header X-API-Key

```bash
curl -H "X-API-Key: ak_dev_abc123def456ghi789jkl012mno345pqr678" \
     http://localhost:3000/api/v1/auth/test
```

### Opción 3: Query Parameter (Menos seguro)

```bash
curl "http://localhost:3000/api/v1/auth/test?api_key=ak_dev_abc123def456ghi789jkl012mno345pqr678"
```

## 🧪 Rutas de Prueba

### GET /api/v1/auth/test

Prueba la autenticación con GET:

```bash
curl -H "Authorization: Bearer TU_API_KEY" \
     http://localhost:3000/api/v1/auth/test
```

Respuesta exitosa:

```json
{
  "success": true,
  "message": "API Key authentication successful",
  "data": {
    "userId": "clm123456789",
    "keyId": "clm987654321",
    "authenticatedAt": "2024-01-15T10:30:00.000Z",
    "headers": {
      "x-api-key-user-id": "clm123456789",
      "x-api-key-id": "clm987654321"
    }
  }
}
```

### POST /api/v1/auth/test

Prueba la autenticación con POST:

```bash
curl -X POST \
     -H "Authorization: Bearer TU_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}' \
     http://localhost:3000/api/v1/auth/test
```

## 🔧 Uso en Rutas de la API

### Obtener contexto de la API Key en tus rutas

```typescript
import { NextRequest, NextResponse } from "next/server";
import { useApiKeyContext } from "@/src/middleware/api-key-auth";

export async function GET(request: NextRequest) {
  // Obtener contexto de la API Key
  const apiKeyContext = useApiKeyContext(request);

  if (!apiKeyContext) {
    return NextResponse.json(
      { error: "No API Key context found" },
      { status: 401 }
    );
  }

  // Usar el contexto
  const { userId, keyId } = apiKeyContext;

  return NextResponse.json({
    message: "Authenticated request",
    userId,
    keyId,
  });
}
```

### Obtener headers adicionales

```typescript
export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-api-key-user-id");
  const keyId = request.headers.get("x-api-key-id");

  return NextResponse.json({
    userId,
    keyId,
  });
}
```

## 📊 Formato de API Keys

Las API Keys siguen este formato:

- **Prefijo**: `ak_dev_` (desarrollo), `ak_prod_` (producción)
- **Longitud**: 32 caracteres hexadecimales
- **Ejemplo**: `ak_dev_abc123def456ghi789jkl012mno345pqr678`

## 🛡️ Seguridad

### Características de seguridad implementadas:

1. **Hash seguro**: Las API Keys se almacenan hasheadas en la base de datos
2. **Validación de formato**: Verificación del formato correcto de las keys
3. **Estado de la clave**: Control de estado (ACTIVE, INACTIVE, REVOKED)
4. **Expiración**: Soporte para fechas de expiración
5. **Logging**: Registro de intentos de acceso (exitosos y fallidos)
6. **Rate limiting**: Preparado para implementar límites de uso

### Headers de seguridad añadidos:

- `x-api-key-context`: Contexto completo de la API Key (JSON)
- `x-api-key-user-id`: ID del usuario propietario
- `x-api-key-id`: ID de la API Key utilizada

## 🚨 Manejo de Errores

### Error 401 - API Key inválida

```json
{
  "error": "Invalid or missing API Key",
  "code": "UNAUTHORIZED",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/auth/test"
}
```

### Error 401 - API Key expirada

```json
{
  "error": "API Key has expired",
  "code": "UNAUTHORIZED",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/auth/test"
}
```

### Error 401 - API Key revocada

```json
{
  "error": "API Key is revoked",
  "code": "UNAUTHORIZED",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/auth/test"
}
```

## 🔄 Flujo de Middleware

1. **Request llega** → Middleware intercepta
2. **Verifica ruta** → ¿Requiere API Key?
3. **Extrae API Key** → Headers o query params
4. **Valida formato** → Regex validation
5. **Busca en BD** → Hash comparison
6. **Verifica estado** → ACTIVE, INACTIVE, REVOKED
7. **Verifica expiración** → Fecha de expiración
8. **Actualiza uso** → lastUsedAt, totalRequests
9. **Añade contexto** → Headers para la ruta
10. **Continúa** → Request procesado

## 📝 Logs de Desarrollo

El middleware incluye logs detallados para desarrollo:

```
🔐 Validando API Key para ruta: /api/v1/auth/test
✅ API Key válida para /api/v1/auth/test, usuario: clm123456789
```

```
❌ API Key inválida para /api/v1/auth/test: Invalid API Key format
```

## 🎯 Próximos Pasos

1. **Rate Limiting**: Implementar límites de uso por API Key
2. **Permisos granulares**: Sistema de permisos por endpoint
3. **Audit logs**: Logs detallados de todas las operaciones
4. **Dashboard**: Interfaz para gestionar API Keys
5. **Webhooks**: Notificaciones de eventos de API Keys

## 🆘 Troubleshooting

### Error: "API Key is required"

- Verifica que estés enviando la API Key en el header correcto
- Usa `Authorization: Bearer` o `X-API-Key`

### Error: "Invalid API Key format"

- Verifica que la API Key tenga el formato correcto: `ak_dev_` + 32 caracteres hex
- Regenera una nueva API Key si es necesario

### Error: "API Key not found"

- La API Key no existe en la base de datos
- Verifica que la API Key no haya sido revocada
- Regenera una nueva API Key

### Error: "API Key has expired"

- La API Key ha expirado
- Genera una nueva API Key o actualiza la fecha de expiración
