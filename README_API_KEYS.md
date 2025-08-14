# 🔐 Sistema de API Keys - Guía Rápida

## ⚡ Configuración Rápida

### 1. Configuración automática

```bash
npm run setup-api-keys
```

Este comando:

- ✅ Verifica la configuración de Prisma
- ✅ Configura la base de datos
- ✅ Genera una API Key de ejemplo
- ✅ Crea archivos de configuración
- ✅ Te muestra comandos de prueba

### 2. Generar API Key manualmente

```bash
npm run generate-api-key <userId> [nombre]
# Ejemplo:
npm run generate-api-key clm123456789 "Mi API Key"
```

### 3. Probar el sistema

```bash
npm run test-api-key <api_key>
# Ejemplo:
npm run test-api-key ak_dev_abc123def456ghi789jkl012mno345pqr678
```

## 🛠️ Comandos Disponibles

| Comando                                    | Descripción                       |
| ------------------------------------------ | --------------------------------- |
| `npm run setup-api-keys`                   | Configuración automática completa |
| `npm run generate-api-key <userId> [name]` | Genera nueva API Key              |
| `npm run list-api-keys <userId>`           | Lista API Keys de un usuario      |
| `npm run revoke-api-key <keyId>`           | Revoca una API Key                |
| `npm run test-api-key <api_key>`           | Prueba una API Key                |

## 📡 Uso de API Keys

### Headers soportados:

```bash
# Opción 1 (Recomendado)
Authorization: Bearer ak_dev_abc123def456ghi789jkl012mno345pqr678

# Opción 2
X-API-Key: ak_dev_abc123def456ghi789jkl012mno345pqr678

# Opción 3 (Menos seguro)
?api_key=ak_dev_abc123def456ghi789jkl012mno345pqr678
```

### Ejemplo con curl:

```bash
curl -H "Authorization: Bearer TU_API_KEY" \
     http://localhost:3000/api/v1/auth/test
```

## 🧪 Rutas de Prueba

- **GET** `/api/v1/auth/test` - Prueba autenticación GET
- **POST** `/api/v1/auth/test` - Prueba autenticación POST

## 🔒 Rutas Protegidas

El middleware protege automáticamente:

- `/api/v1/` - API v1 pública
- `/api/public/` - APIs públicas
- `/api/webhook/` - Webhooks
- `/api/external/` - APIs externas
- `/api/admin/` - APIs de administración
- `/api/calendar/` - APIs de calendario
- `/api/drive/` - APIs de drive
- `/api/marketing-salon/` - APIs de marketing salon
- `/api/training/` - APIs de training

## 📊 Formato de API Keys

```
ak_dev_abc123def456ghi789jkl012mno345pqr678
│   │   │
│   │   └── 32 caracteres hexadecimales
│   └── Entorno (dev/prod)
└── Prefijo fijo
```

## 🔧 Uso en Código

### Obtener contexto en rutas:

```typescript
import { useApiKeyContext } from "@/src/middleware/api-key-auth";

export async function GET(request: NextRequest) {
  const apiKeyContext = useApiKeyContext(request);

  if (!apiKeyContext) {
    return NextResponse.json({ error: "No API Key" }, { status: 401 });
  }

  const { userId, keyId } = apiKeyContext;
  // Tu lógica aquí...
}
```

### Headers disponibles:

```typescript
const userId = request.headers.get("x-api-key-user-id");
const keyId = request.headers.get("x-api-key-id");
```

## 🚨 Respuestas de Error

### 401 - API Key inválida:

```json
{
  "error": "Invalid or missing API Key",
  "code": "UNAUTHORIZED",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/auth/test"
}
```

### 401 - API Key expirada:

```json
{
  "error": "API Key has expired",
  "code": "UNAUTHORIZED"
}
```

## 📝 Logs de Desarrollo

El middleware incluye logs detallados:

```
🔐 Validando API Key para ruta: /api/v1/auth/test
✅ API Key válida para /api/v1/auth/test, usuario: clm123456789
```

## 🎯 Próximos Pasos

1. **Rate Limiting** - Implementar límites de uso
2. **Permisos granulares** - Sistema de permisos por endpoint
3. **Dashboard** - Interfaz para gestionar API Keys
4. **Audit logs** - Logs detallados de operaciones

## 📚 Documentación Completa

Para información detallada, consulta: `API_KEYS_SETUP.md`

---

**¡Listo para usar!** 🚀

El middleware protegerá automáticamente las rutas configuradas y proporcionará contexto de usuario a tus APIs.
