# Setup Rápido - Google Meet Members en Tabla de Eventos

## 1. Habilitar la API de Google Meet v2 Beta

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Seleccionar tu proyecto
3. Ir a "APIs y Servicios" → "Biblioteca"
4. Buscar "Google Meet API"
5. Click en "Habilitar"

## 2. Agregar Scopes OAuth

En la misma consola:
1. Ir a "APIs y Servicios" → "Pantalla de consentimiento OAuth"
2. Click en "Editar aplicación"
3. En la sección "Scopes", agregar:
   - `https://www.googleapis.com/auth/meetings.space.readonly`
   - `https://www.googleapis.com/auth/meetings.space.created`
4. Guardar cambios

## 3. Probar la Funcionalidad

### 3.1 Endpoint de Diagnóstico
1. Reiniciar la aplicación:
```bash
npm run dev
```

2. Primero, usar el endpoint de prueba para verificar configuración:
   - `GET /api/calendar/meet/test`
   - O con un space ID específico: `/api/calendar/meet/test?spaceId=cjp-mpdz-skw`

3. Revisar la respuesta para verificar:
   - ✅ Token scopes correctos
   - ❌ Errores de permisos o configuración

### 3.2 Tabla de Eventos
1. Ir a la página de eventos del calendario:
   - `/es/admin/calendar/events`

2. La columna "Miembros Meet" debería aparecer en la tabla

3. Revisar logs del navegador para diagnóstico detallado

## Notas Importantes

- **Solo funciona con espacios de Meet creados específicamente** (no meetings instantáneos)
- Los meetings creados desde Calendar típicamente no tienen "miembros" en el sentido de la API de Meet
- Para ver miembros, el espacio debe haber sido creado con la API de Meet y tener miembros asignados

## Cómo Verificar si Funciona

### Logs Esperados (Console del Navegador):
```
🔐 Current token scopes: https://www.googleapis.com/auth/calendar...
⚠️ Missing required Meet API scopes. Required: [...]
🔍 Attempting to fetch members for space: cjp-mpdz-skw
❌ Space cjp-mpdz-skw not found (404)
```

### Posibles Resultados:
1. **✅ Funciona correctamente**: Verás miembros en la columna
2. **⚠️ Faltan scopes**: Los scopes de Meet no están configurados
3. **❌ 404 Not Found**: Los spaces son de Calendar (normal)
4. **🚫 403 Forbidden**: Falta permisos o la API no está habilitada

## Limitaciones Actuales

- No muestra participantes de meetings ad-hoc
- Solo muestra miembros pre-configurados en el espacio
- Requiere permisos específicos de Google Workspace

## Troubleshooting

Si no ves la columna:
1. Verifica que la API esté habilitada
2. Revisa los logs del servidor para errores 403/404
3. Asegúrate de tener los scopes correctos

Si ves "Sin miembros" en todos los eventos:
- Es normal para meetings creados desde Calendar
- Los espacios de Meet deben crearse específicamente con miembros asignados