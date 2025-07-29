# 📸 GUÍA VISUAL - OAuth2 Playground Paso a Paso

## 🎯 Objetivo
Obtener el **REFRESH_TOKEN** necesario para que tu aplicación acceda a Google Calendar sin intervención manual.

---

## 📋 ANTES DE EMPEZAR

### ✅ Necesitas tener:
1. **CLIENT_ID** y **CLIENT_SECRET** de Google Cloud Console
2. **OAuth2 Playground** agregado como redirect URI en tu proyecto
3. **Navegador en MODO INCÓGNITO** 🥷

### 🚫 Errores comunes a evitar:
- NO incluyas comillas en las credenciales
- NO dejes espacios al inicio o final
- NO uses credenciales antiguas con refresh tokens nuevos

---

## 🔧 PASO A PASO DETALLADO

### 📍 PASO 1: Abrir OAuth2 Playground
```
🌐 URL: https://developers.google.com/oauthplayground/
🥷 IMPORTANTE: Usa modo incógnito
```

---

### ⚙️ PASO 2: Configurar TUS Credenciales

1. **Click en ⚙️ Settings** (esquina superior derecha)

2. **Aparece panel de configuración:**
   ```
   OAuth flow: Server-side
   OAuth endpoints: Google
   
   ☐ Use your own OAuth credentials  ← MARCA ESTA CASILLA ✅
   ```

3. **Después de marcar, aparecen dos campos:**
   ```
   OAuth Client ID:     [_________________________________]
   OAuth Client secret: [_________________________________]
   ```

4. **Pega TUS credenciales (ejemplo):**
   ```
   OAuth Client ID:     YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
   OAuth Client secret: YOUR_GOOGLE_CLIENT_SECRET
   ```

5. **Click en "Close"**

---

### 📚 PASO 3: Seleccionar Calendar API

**Panel izquierdo - Lista de APIs:**

```
📁 Google Calendar API v3
   ☐ https://www.googleapis.com/auth/calendar         ← MARCA SOLO ESTA ✅
   ☐ https://www.googleapis.com/auth/calendar.events
   ☐ https://www.googleapis.com/auth/calendar.readonly
   ☐ https://www.googleapis.com/auth/calendar.settings.readonly
```

⚠️ **IMPORTANTE:** Solo marca la primera opción (acceso completo)

---

### 🔐 PASO 4: Autorizar

1. **Click en el botón azul:** `[Authorize APIs]`

2. **Ventana de Google - Selecciona cuenta:**
   ```
   Elige una cuenta
   
   👤 sistemas@insidesalons.com    ← SELECCIONA ESTA
   👤 otra@cuenta.com
   
   + Usar otra cuenta
   ```

3. **Si aparece advertencia:**
   ```
   ⚠️ Google no ha verificado esta app
   
   [Volver a la seguridad]    [Avanzado ▼]  ← CLICK EN AVANZADO
                              
                              Ir a TuApp (no seguro) ← CLICK AQUÍ
   ```

4. **Permisos solicitados:**
   ```
   TuApp quiere acceder a tu cuenta
   
   ✓ Ver, editar, compartir y eliminar permanentemente 
     todos los calendarios a los que puedes acceder 
     mediante Google Calendar
   
   [Cancelar]  [Permitir]  ← CLICK EN PERMITIR
   ```

---

### 🔄 PASO 5: Intercambiar código

**Vuelves a OAuth2 Playground:**

```
Step 2: Exchange authorization code for tokens

Authorization code: 4/0AQlEd8xKLjCA9... [Auto-rellenado]

[Exchange authorization code for tokens] ← CLICK AQUÍ
```

---

### 🎯 PASO 6: Copiar Refresh Token

**Panel derecho - Respuesta:**

```json
{
  "access_token": "ya29.a0AcM612xKuVp8Bw...",
  "scope": "https://www.googleapis.com/auth/calendar",
  "token_type": "Bearer",
  "expires_in": 3599,
  "refresh_token": "YOUR_REFRESH_TOKEN_FROM_OAUTH_PLAYGROUND"
                    ↑
                    COPIA TODO ESTE VALOR (empieza con 1//)
}
```

### 📝 Qué copiar exactamente:
```
✅ CORRECTO: YOUR_REFRESH_TOKEN_FROM_OAUTH_PLAYGROUND
❌ INCORRECTO: "YOUR_REFRESH_TOKEN_FROM_OAUTH_PLAYGROUND"
❌ INCORRECTO: refresh_token: "1//04kgHC2OBceKz..."
```

---

### 💾 PASO 7: Actualizar .env.local

**Tu archivo `.env.local`:**

```bash
# Antes (vacío)
GOOGLE_CALENDAR_REFRESH_TOKEN=

# Después (con tu token)
GOOGLE_CALENDAR_REFRESH_TOKEN=YOUR_REFRESH_TOKEN_FROM_OAUTH_PLAYGROUND
```

---

### ✅ PASO 8: Verificar

1. **Reinicia tu app:**
   ```bash
   Ctrl+C
   npm run dev
   ```

2. **Ve al dashboard:**
   ```
   http://localhost:3000/admin/calendar
   ```

3. **Deberías ver:**
   ```
   ✅ Conectado a Google Calendar
   📧 Cuenta Google: sistemas@insidesalons.com
   📅 Los eventos se crearán en: academia@insidesalons.com
   ```

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### ❌ "Error 401: invalid_client"
```
CHECKLIST:
□ ¿Agregaste https://developers.google.com/oauthplayground a redirect URIs?
□ ¿Esperaste 5-10 minutos después de agregar?
□ ¿Copiaste las credenciales SIN espacios ni comillas?
□ ¿Estás en el proyecto correcto de Google Cloud?
```

### ❌ No aparece refresh_token
```
SOLUCIÓN:
1. Ve a: https://myaccount.google.com/permissions
2. Busca tu aplicación
3. Click en "Quitar acceso"
4. Vuelve a intentar desde el PASO 1
```

### ❌ "This app is blocked"
```
CAUSA: Tu dominio Google Workspace tiene restricciones
SOLUCIÓN: Contacta al administrador de Google Workspace
```

---

## 💡 TIPS PRO

### 🎯 Para múltiples calendarios:
Si necesitas acceder a calendarios de diferentes cuentas:
1. Usa `sistemas@insidesalons.com` (admin) como cuenta principal
2. Esa cuenta puede gestionar calendarios de otros usuarios

### 🔐 Seguridad:
- El refresh_token NO expira (salvo casos especiales)
- Guárdalo de forma segura
- No lo compartas públicamente
- Funciona mientras no cambies la contraseña

### 🔄 Renovación:
Solo necesitas renovar si:
- Cambias las credenciales OAuth2
- Revocas el acceso manualmente
- Cambias la contraseña de la cuenta
- Pasan >6 meses sin uso

---

## 📞 ¿NECESITAS AYUDA?

Si después de seguir todos los pasos sigues con problemas:

1. **Verifica en Google Cloud Console:**
   - Calendar API está habilitada
   - OAuth2 credentials son correctas
   - Redirect URIs incluyen OAuth2 Playground

2. **Revisa tu .env.local:**
   - Sin comillas en los valores
   - Sin espacios extra
   - Refresh token completo

3. **Intenta en otro navegador** o limpia caché/cookies

---

🎉 **¡Listo! Ya tienes tu refresh_token configurado**