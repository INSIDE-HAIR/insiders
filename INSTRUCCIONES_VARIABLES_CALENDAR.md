# 🔧 INSTRUCCIONES: Corrección de Variables de Entorno - Calendar

## 🚨 **PROBLEMAS DETECTADOS EN TU CONFIGURACIÓN**

### **1. Error de Tipeo Crítico**
```bash
# ❌ INCORRECTO (falta la G inicial):
OOGLE_CALENDAR_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com

# ✅ CORRECTO:
GOOGLE_CALENDAR_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

### **2. Variable Crítica Vacía**
```bash
# ❌ INCORRECTO (vacía):
GOOGLE_CALENDAR_REFRESH_TOKEN=

# ✅ DEBE SER:
GOOGLE_CALENDAR_REFRESH_TOKEN=YOUR_REFRESH_TOKEN_FROM_OAUTH_PLAYGROUND
```

## 🛠️ **PASOS PARA CORREGIR**

### **Paso 1: Corregir el Error de Tipeo**

1. Abre tu archivo `.env.local`
2. Busca la línea:
   ```
   OOGLE_CALENDAR_CLIENT_ID=714590...
   ```
3. Cámbiala por:
   ```
   GOOGLE_CALENDAR_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
   ```

### **Paso 2: Obtener el REFRESH_TOKEN**

El `REFRESH_TOKEN` determina **QUÉ CUENTA DE GOOGLE** usará la aplicación para crear eventos.

#### **Opción A: OAuth2 Playground (Recomendado)**

1. **Ve a:** [OAuth2 Playground](https://developers.google.com/oauthplayground)

2. **Step 1 - Select & authorize APIs:**
   - Busca "Calendar API v3"
   - Marca: `https://www.googleapis.com/auth/calendar`
   - Haz clic en "Authorize APIs"

3. **Autorizar con la cuenta correcta:**
   - Usa la cuenta donde quieres crear los eventos (ej: `formacion@tuempresa.com`)
   - Autoriza el acceso

4. **Step 2 - Exchange authorization code for tokens:**
   - Haz clic en "Exchange authorization code for tokens"
   - **Copia el `refresh_token`** que aparece

5. **Agregar al .env.local:**
   ```bash
   GOOGLE_CALENDAR_REFRESH_TOKEN=YOUR_REFRESH_TOKEN_FROM_OAUTH_PLAYGROUND
   ```

#### **Opción B: Usar tus credenciales existentes**

Si ya tienes configurado Google Cloud Console:

1. **Configurar OAuth2 Playground:**
   - Ve a la configuración (⚙️ arriba a la derecha)
   - Marca "Use your own OAuth credentials"
   - Client ID: `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`
   - Client Secret: `YOUR_GOOGLE_CLIENT_SECRET`

2. **Sigue los pasos anteriores** para obtener el refresh_token

## 📝 **ARCHIVO .env.local COMPLETO**

Tu archivo `.env.local` debe quedar así:

```bash
# ==================== GOOGLE CALENDAR API ====================
# ✅ CORREGIDO - Agregada la G inicial
GOOGLE_CALENDAR_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com

# ✅ YA CONFIGURADO
GOOGLE_CALENDAR_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# 🔧 PENDIENTE - Obtener de OAuth2 Playground
GOOGLE_CALENDAR_REFRESH_TOKEN=1//0TU_REFRESH_TOKEN_AQUI

# ✅ OPCIONAL - Valor por defecto
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/calendar/auth/callback

# ✅ OPCIONAL - Valores por defecto
GOOGLE_CALENDAR_DEFAULT_CALENDAR_ID=primary
GOOGLE_CALENDAR_DEFAULT_TIMEZONE=Europe/Madrid
```

## 🔍 **VERIFICACIÓN**

### **1. Verificar en el Dashboard**

Después de hacer los cambios:

1. **Reinicia la aplicación:**
   ```bash
   npm run dev
   # o
   yarn dev
   ```

2. **Ve a:** `/admin/calendar`

3. **Busca la sección:** "Estado de Variables de Entorno"

4. **Debe mostrar:**
   - ✅ Configuración Completa
   - ✅ Todas las variables en verde

### **2. Verificar la Cuenta Activa**

En la sección "📧 Cuenta y Calendario Activos" debe aparecer:
- **Cuenta Google:** [la cuenta que usaste en OAuth2 Playground]
- **Mensaje:** "Los eventos se crearán en: [tu-cuenta]"

### **3. API de Verificación**

También puedes verificar directamente:

```bash
# Verificar variables de entorno
curl http://localhost:3000/api/calendar/env/health

# Verificar autenticación
curl http://localhost:3000/api/calendar/auth/token
```

## 🚨 **ERRORES COMUNES**

### **Error: "Client authentication failed"**
- **Causa:** REFRESH_TOKEN incorrecto o expirado
- **Solución:** Generar nuevo token en OAuth2 Playground

### **Error: "Calendar not found"**
- **Causa:** La cuenta no tiene acceso al calendario
- **Solución:** Verificar que usaste la cuenta correcta en OAuth2 Playground

### **Error: "Invalid client"**
- **Causa:** CLIENT_ID o CLIENT_SECRET incorrectos
- **Solución:** Verificar que estén copiados correctamente de Google Cloud Console

## ⚡ **ORDEN DE PRIORIDAD**

1. **🔥 CRÍTICO:** Corregir `OOGLE_CALENDAR_CLIENT_ID` → `GOOGLE_CALENDAR_CLIENT_ID`
2. **🔥 CRÍTICO:** Obtener y configurar `GOOGLE_CALENDAR_REFRESH_TOKEN`
3. **✅ OPCIONAL:** Configurar variables opcionales
4. **🔄 VERIFICAR:** Reiniciar app y verificar en dashboard

## 📞 **¿NECESITAS AYUDA?**

Si sigues teniendo problemas:

1. **Revisa los logs** de la aplicación para errores específicos
2. **Verifica** que Google Cloud Console tenga habilitada la Calendar API
3. **Confirma** que la cuenta usada en OAuth2 Playground sea la correcta
4. **Consulta** la documentación completa en `/admin/calendar`

---

**Una vez completados estos pasos, tendrás el módulo Calendar completamente funcional y podrás crear eventos en la cuenta de Google que especifiques.**