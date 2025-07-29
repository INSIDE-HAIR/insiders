# Documentación de Variables de Entorno - Módulo Calendar

Esta documentación explica cómo configurar las variables de entorno necesarias para el funcionamiento del módulo Calendar que se integra con Google Calendar API.

## Variables de Entorno Requeridas

### ⚡ NOMBRES EXACTOS de Variables (copiar/pegar)

```env
# ==================== VARIABLES OBLIGATORIAS ====================
GOOGLE_CALENDAR_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CALENDAR_REFRESH_TOKEN=YOUR_REFRESH_TOKEN_FROM_OAUTH_PLAYGROUND
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/calendar/auth/callback

# ==================== VARIABLES OPCIONALES ====================
GOOGLE_CALENDAR_DEFAULT_CALENDAR_ID=primary
GOOGLE_CALENDAR_DEFAULT_TIMEZONE=Europe/Madrid
```

### 🎯 Descripción de Cada Variable

| Variable | Descripción | Dónde Obtenerla | ¿Obligatoria? |
|----------|-------------|-----------------|---------------|
| `GOOGLE_CALENDAR_CLIENT_ID` | ID público del cliente OAuth2 | Google Cloud Console → Credentials | ✅ SÍ |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | Secreto privado del cliente OAuth2 | Google Cloud Console → Credentials | ✅ SÍ |
| `GOOGLE_CALENDAR_REFRESH_TOKEN` | Token para renovar acceso automáticamente | OAuth2 Playground | ✅ SÍ |
| `GOOGLE_CALENDAR_REDIRECT_URI` | URL de callback después de autorización | Configurar en Google Cloud | ✅ SÍ |
| `GOOGLE_CALENDAR_DEFAULT_CALENDAR_ID` | ID del calendario por defecto | Lista de calendarios | ❌ No |
| `GOOGLE_CALENDAR_DEFAULT_TIMEZONE` | Zona horaria por defecto | Configuración regional | ❌ No |

## Proceso de Configuración

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Calendar API**:
   - Ve a "APIs & Services" > "Library"
   - Busca "Google Calendar API"
   - Haz clic en "Enable"

### 2. Configurar OAuth2 Credentials

1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configura la pantalla de consentimiento OAuth si no está configurada:
   - Tipo de aplicación: **Web application**
   - Nombre: Tu aplicación de Calendar
   - Authorized redirect URIs: `http://localhost:3000/api/calendar/auth/callback` (desarrollo) y tu URL de producción
4. Anota el **Client ID** y **Client Secret**

### 3. Obtener Refresh Token - GUÍA DETALLADA OAUTH2 PLAYGROUND

#### 🎯 Método 1: OAuth2 Playground (RECOMENDADO)

##### **PASO 1: Acceder a OAuth2 Playground**
1. **Abre tu navegador en MODO INCÓGNITO** (muy importante para evitar conflictos)
2. **Ve a:** https://developers.google.com/oauthplayground/

##### **PASO 2: Configurar TUS Credenciales**
1. **Haz clic en el ⚙️ (Settings/Configuración)** en la esquina superior derecha
2. **Aparecerá un panel de configuración**
3. **MARCA la casilla:** ✅ "Use your own OAuth credentials"
4. **Aparecerán dos campos:**
   ```
   OAuth Client ID: [pega aquí tu CLIENT_ID]
   OAuth Client secret: [pega aquí tu CLIENT_SECRET]
   ```
5. **COPIA EXACTAMENTE desde tu .env.local:**
   ```
   OAuth Client ID: YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
   OAuth Client secret: YOUR_GOOGLE_CLIENT_SECRET
   ```
6. **⚠️ IMPORTANTE:** NO incluyas comillas, espacios al inicio/final, ni saltos de línea
7. **Haz clic en "Close"** para cerrar el panel de configuración

##### **PASO 3: Seleccionar Google Calendar API**
1. **En el panel izquierdo**, verás una lista de APIs
2. **Busca o desplázate hasta:** "Google Calendar API v3"
3. **Haz clic para expandir** Google Calendar API v3
4. **Verás varias opciones, MARCA SOLO:**
   - ✅ `https://www.googleapis.com/auth/calendar`
   - ❌ NO marques las otras opciones (readonly, events, etc.)
5. **La casilla debe quedar azul** ✅

##### **PASO 4: Autorizar APIs**
1. **Haz clic en el botón azul:** "Authorize APIs"
2. **Se abrirá una ventana de Google**
3. **Selecciona o ingresa:** `sistemas@insidesalons.com` (o tu cuenta admin)
4. **Google mostrará:**
   - "Esta app quiere acceder a tu cuenta"
   - Permisos: "Ver, editar, compartir y eliminar permanentemente todos los calendarios"
5. **Si aparece advertencia "No verificada":**
   - Haz clic en "Avanzado" o "Advanced"
   - Luego en "Ir a [tu app] (no seguro)" o "Go to [app] (unsafe)"
   - Es normal, es tu propia aplicación
6. **Haz clic en "Continuar" o "Allow"**

##### **PASO 5: Intercambiar Código por Tokens**
1. **Volverás automáticamente a OAuth2 Playground**
2. **En "Step 2" verás:**
   - Authorization code: `4/0AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ`
3. **Haz clic en el botón:** "Exchange authorization code for tokens"
4. **ESPERA** unos segundos mientras se procesa

##### **PASO 6: Copiar el Refresh Token**
1. **En el panel derecho aparecerá algo como:**
   ```json
   {
     "access_token": "ya29.a0AfB_byBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
     "scope": "https://www.googleapis.com/auth/calendar",
     "token_type": "Bearer",
     "expires_in": 3599,
     "refresh_token": "YOUR_REFRESH_TOKEN_FROM_OAUTH_PLAYGROUND"
   }
   ```
2. **COPIA SOLO el valor de refresh_token** (el que empieza con `1//`)
3. **⚠️ NO copies:**
   - Las comillas
   - La coma final
   - Espacios
   - Solo el valor: `1//04xxxxxx...`

##### **PASO 7: Actualizar tu .env.local**
1. **Abre tu archivo** `.env.local`
2. **Busca la línea:**
   ```
   GOOGLE_CALENDAR_REFRESH_TOKEN=
   ```
3. **Pégalo así:**
   ```
   GOOGLE_CALENDAR_REFRESH_TOKEN=YOUR_REFRESH_TOKEN_FROM_OAUTH_PLAYGROUND
   ```
4. **GUARDA el archivo**

##### **PASO 8: Verificar**
1. **Reinicia tu aplicación** (Ctrl+C y `npm run dev`)
2. **Ve a:** http://localhost:3000/admin/calendar
3. **Deberías ver:** "✅ Conectado a Google Calendar"

#### 🚨 ERRORES COMUNES EN OAUTH2 PLAYGROUND

##### **"Error 400: invalid_request"**
- **Causa:** No configuraste tus propias credenciales
- **Solución:** Asegúrate de marcar "Use your own OAuth credentials" y pegar tus valores

##### **"Error 401: invalid_client"**
- **Causa:** Las credenciales son incorrectas o no tienes OAuth2 Playground en redirect URIs
- **Solución:** 
  1. Verifica en Google Cloud Console que `https://developers.google.com/oauthplayground` esté en redirect URIs
  2. Espera 5-10 minutos después de agregar
  3. Verifica que copiaste bien las credenciales (sin espacios)

##### **No aparece refresh_token**
- **Causa:** Ya autorizaste antes con esta cuenta
- **Solución:** 
  1. Ve a https://myaccount.google.com/permissions
  2. Revoca el acceso a tu aplicación
  3. Vuelve a intentar desde el paso 1

##### **"This app is blocked"**
- **Causa:** Restricciones de dominio en Google Workspace
- **Solución:** Contacta a tu administrador de Google Workspace

#### 💡 TIPS IMPORTANTES

1. **USA MODO INCÓGNITO** para evitar conflictos con sesiones
2. **COPIA/PEGA** las credenciales, no las escribas manualmente
3. **NO CIERRES** la ventana hasta copiar el refresh_token
4. **GUARDA** el refresh_token en un lugar seguro (durará años)
5. **AUTORIZA** con la cuenta que tiene permisos sobre los calendarios

#### Método 2: Usando la aplicación (avanzado)

1. Implementa temporalmente un endpoint de configuración inicial
2. Usa el método `getAuthUrl()` del `GoogleCalendarAuthProvider`
3. Sigue el flujo OAuth2 completo
4. Usa `getTokensFromCode()` para obtener los tokens

### 4. Configurar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env.local` (desarrollo) o configúralas en tu plataforma de despliegue:

```env
# Reemplaza con tus valores reales
GOOGLE_CALENDAR_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CALENDAR_REFRESH_TOKEN=YOUR_REFRESH_TOKEN_FROM_OAUTH_PLAYGROUND
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/calendar/auth/callback

# Configuraciones opcionales
GOOGLE_CALENDAR_DEFAULT_CALENDAR_ID=primary
GOOGLE_CALENDAR_DEFAULT_TIMEZONE=Europe/Madrid
```

## Descripción de Variables

### Variables Obligatorias

- **GOOGLE_CALENDAR_CLIENT_ID**: ID del cliente OAuth2 de Google Cloud Console
- **GOOGLE_CALENDAR_CLIENT_SECRET**: Secreto del cliente OAuth2 de Google Cloud Console  
- **GOOGLE_CALENDAR_REFRESH_TOKEN**: Token de actualización para obtener tokens de acceso
- **GOOGLE_CALENDAR_REDIRECT_URI**: URI de redirección configurada en OAuth2

### Variables Opcionales

- **GOOGLE_CALENDAR_DEFAULT_CALENDAR_ID**: ID del calendario por defecto (default: "primary")
- **GOOGLE_CALENDAR_DEFAULT_TIMEZONE**: Zona horaria por defecto (default: "Europe/Madrid")

## Verificación de Configuración

### Endpoint de Verificación

Puedes verificar que la configuración es correcta usando:

```http
GET /api/calendar/auth/token
```

**Respuesta exitosa:**
```json
{
  "authenticated": true,
  "tokenInfo": {
    "hasToken": true,
    "expiresAt": "2024-02-15T10:30:00.000Z"
  },
  "message": "Calendar authentication is valid"
}
```

**Respuesta con error:**
```json
{
  "authenticated": false,
  "error": "Calendar authentication failed",
  "message": "Please check your Google Calendar API credentials"
}
```

### Renovar Token

Si necesitas renovar el token de acceso:

```http
POST /api/calendar/auth/token
```

## Permisos Requeridos

La aplicación requiere los siguientes permisos de Google Calendar:

- `https://www.googleapis.com/auth/calendar` - Acceso completo a calendarios

## Troubleshooting

### 🚨 Error: "401: invalid_client" - GUÍA DETALLADA

Este error significa que las credenciales OAuth2 no están configuradas correctamente. Sigue estos pasos:

#### **1. Verifica el Proyecto en Google Cloud Console**
1. **Ve a:** https://console.cloud.google.com
2. **Asegúrate de estar en el proyecto correcto** (nombre del proyecto en la esquina superior)
3. **Ve a:** APIs & Services → Credentials

#### **2. Verifica las Credenciales OAuth2**
En la página de Credentials, busca:
- **OAuth 2.0 Client IDs**
- **Nombre:** Debería ver una entrada con el Client ID que tienes en `.env.local`

#### **3. Revisa la Configuración del Cliente OAuth2**
Haz clic en el Client ID para editar y verifica:
1. **Application type:** Web application
2. **Authorized redirect URIs** debe incluir EXACTAMENTE:
   ```
   http://localhost:3000/api/calendar/auth/callback
   https://developers.google.com/oauthplayground
   ```

#### **4. ⚠️ IMPORTANTE - Agregar OAuth2 Playground**
Si NO está `https://developers.google.com/oauthplayground` en las redirect URIs:
1. **Haz clic en:** "+ ADD URI"
2. **Agrega exactamente:**
   ```
   https://developers.google.com/oauthplayground
   ```
3. **Haz clic en:** "SAVE"
4. **ESPERA** 5-10 minutos para que los cambios se propaguen

#### **5. Verificar que Calendar API esté Habilitada**
1. **Ve a:** APIs & Services → Library
2. **Busca:** "Google Calendar API"
3. **Debe decir:** "MANAGE" (si dice "ENABLE", haz clic para habilitarla)

#### **🔧 Solución Rápida**
Si todo lo anterior está correcto, intenta esto en OAuth2 Playground:
1. **Limpia caché del navegador** o usa modo incógnito
2. **En OAuth2 Playground, verifica que:**
   - ✅ "Use your own OAuth credentials" esté marcado
   - Los valores NO tengan comillas ni espacios extra
   - Copia y pega EXACTAMENTE desde tu `.env.local`

#### **🚨 Alternativa - Usar las Credenciales por Defecto**
Si sigues teniendo problemas:
1. **NO marcar** "Use your own OAuth credentials"
2. **Autorizar normalmente** (usará las credenciales de Google)
3. **Obtener el refresh token**
4. Luego configurar tus propias credenciales en el código

#### **📝 Checklist de Verificación**
- [ ] Google Calendar API está habilitada
- [ ] OAuth2 Playground está en las redirect URIs
- [ ] Client ID y Secret son correctos (sin comillas ni espacios)
- [ ] Estás en el proyecto correcto
- [ ] El OAuth2 Client está activo (no deshabilitado)
- [ ] Has esperado 5-10 minutos después de cambios

### Error: "Invalid client" (otras causas)
- Verifica que `GOOGLE_CALENDAR_CLIENT_ID` y `GOOGLE_CALENDAR_CLIENT_SECRET` sean correctos
- Asegúrate de que el proyecto tenga habilitada la Calendar API
- Confirma que no hay espacios o caracteres invisibles en las variables

### Error: "Invalid grant"
- El refresh token puede haber expirado o sido revocado
- El refresh token fue generado con credenciales diferentes
- Genera un nuevo refresh token siguiendo el proceso OAuth2

### Error: "Access denied"
- Verifica que la cuenta de Google tenga acceso al calendario especificado
- Revisa los permisos otorgados durante el proceso OAuth2
- Si usas `academia@insidesalons.com`, confirma que `sistemas@insidesalons.com` tiene permisos

### Error: "Redirect URI mismatch"
- Asegúrate de que `GOOGLE_CALENDAR_REDIRECT_URI` coincida exactamente con la configurada en Google Cloud Console
- Incluye el protocolo (http/https) y el puerto si es necesario
- Verifica mayúsculas/minúsculas (es case-sensitive)

## Seguridad y Mejores Prácticas

### Protección de Credenciales

1. **Nunca commitees** las credenciales en el repositorio
2. Usa variables de entorno separadas para desarrollo y producción
3. Rota las credenciales periódicamente
4. Usa el principio de menor privilegio (solo permisos necesarios)

### Configuración en Producción

Para producción, configura las variables de entorno en tu plataforma de despliegue:

#### Vercel
```bash
vercel env add GOOGLE_CALENDAR_CLIENT_ID
vercel env add GOOGLE_CALENDAR_CLIENT_SECRET
vercel env add GOOGLE_CALENDAR_REFRESH_TOKEN
vercel env add GOOGLE_CALENDAR_REDIRECT_URI
```

#### Netlify
En el dashboard de Netlify:
1. Ve a Site Settings > Environment Variables
2. Agrega cada variable individualmente

#### Docker/Kubernetes
```yaml
env:
  - name: GOOGLE_CALENDAR_CLIENT_ID
    valueFrom:
      secretKeyRef:
        name: calendar-secrets
        key: client-id
```

## Cuentas Separadas para Calendar vs Drive

El módulo Calendar está diseñado para usar una cuenta de Google diferente a la del módulo Drive. Esto permite:

1. **Separación de responsabilidades**: Calendarios y archivos gestionados independientemente
2. **Seguridad mejorada**: Permisos específicos por servicio
3. **Escalabilidad**: Diferentes límites de API y cuotas

### Configuración de Cuenta Separada

1. Usa una cuenta de Google específica para calendarios (ej: `calendar@tuempresa.com`)
2. Configura el proyecto OAuth2 con esta cuenta
3. Obtén el refresh token con esta cuenta específica
4. Asegúrate de que esta cuenta tenga acceso a los calendarios necesarios

## Monitoreo y Logs

El módulo incluye logging detallado para facilitar el debugging:

```typescript
// Los logs aparecerán en la consola con formato:
[2024-02-15T09:30:00.000Z] [INFO] [GoogleCalendarAuthProvider] Calendar auth configuration validated successfully
[2024-02-15T09:30:01.000Z] [INFO] [GoogleCalendarService] Found 3 calendars
```

### Niveles de Log

- **DEBUG**: Información detallada para desarrollo
- **INFO**: Operaciones normales
- **WARN**: Situaciones que requieren atención
- **ERROR**: Errores que impiden el funcionamiento

## Contacto y Soporte

Para problemas con la configuración:

1. Revisa los logs de la aplicación
2. Verifica que todas las variables estén configuradas correctamente
3. Prueba la autenticación usando el endpoint de verificación
4. Consulta la documentación oficial de Google Calendar API

---

**Nota**: Esta documentación asume que estás usando el módulo Calendar integrado en la aplicación INSIDE. Para implementaciones personalizadas, algunos pasos pueden variar.