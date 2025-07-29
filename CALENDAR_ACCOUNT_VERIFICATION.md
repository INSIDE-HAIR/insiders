# 🔍 Verificación de Cuenta y Calendario - Módulo Calendar

## 🎯 **Cómo saber en qué cuenta y calendario se crean los eventos**

### **1. Dashboard Visual (Recomendado)**

Accede a `/admin/calendar` y verás claramente:

```
📧 Cuenta y Calendario Activos
┌─────────────────────────────────────────────────────┐
│ Cuenta Google: calendar@tuempresa.com               │
│ Calendario Principal: Calendar de Formación         │
│ Calendar ID: primary                                │
│ Calendarios Disponibles: 3 calendario(s)           │
│                                                     │
│ ℹ️ Los eventos se crearán en: calendar@tuempresa.com │
└─────────────────────────────────────────────────────┘
```

### **2. Verificación por API**

#### **Información de la cuenta**
```bash
GET /api/calendar/account/info
```

**Respuesta:**
```json
{
  "account": {
    "email": "calendar@tuempresa.com",
    "displayName": "Calendar de Formación",
    "totalCalendars": 3,
    "primaryCalendarId": "primary",
    "primaryCalendarName": "Calendar de Formación",
    "accessRole": "owner",
    "timeZone": "Europe/Madrid"
  },
  "calendars": [
    {
      "id": "primary",
      "summary": "calendar@tuempresa.com",
      "primary": true,
      "accessRole": "owner"
    },
    {
      "id": "abc123@group.calendar.google.com",
      "summary": "IBMEU Formación",
      "accessRole": "writer"
    }
  ]
}
```

#### **Estado de autenticación**
```bash
GET /api/calendar/auth/token
```

**Respuesta:**
```json
{
  "authenticated": true,
  "tokenInfo": {
    "hasToken": true,
    "expiresAt": "2024-02-15T10:30:00.000Z"
  }
}
```

## 🔧 **Control de Calendario Destino**

### **En el JSON de importación**

Puedes especificar el calendario exacto en tu JSON:

```json
{
  "calendarId": "primary",  // Calendario principal de la cuenta
  // O usar ID específico:
  "calendarId": "abc123@group.calendar.google.com",  // Calendario específico
  "events": [...]
}
```

### **Opciones de calendarId**

1. **`"primary"`** - Calendario principal de la cuenta autenticada
2. **`"email@example.com"`** - Calendario específico por email
3. **`"calendar_id@group.calendar.google.com"`** - Calendario compartido específico

### **Verificar calendarios disponibles**

```bash
GET /api/calendar/calendars
```

**Respuesta:**
```json
{
  "calendars": [
    {
      "id": "primary",
      "summary": "calendar@tuempresa.com",
      "primary": true,
      "accessRole": "owner",
      "timeZone": "Europe/Madrid"
    },
    {
      "id": "ibmeu-formacion@group.calendar.google.com",
      "summary": "IBMEU Formación",
      "accessRole": "writer",
      "timeZone": "Europe/Madrid"
    },
    {
      "id": "eventos-empresa@group.calendar.google.com", 
      "summary": "Eventos de Empresa",
      "accessRole": "reader",
      "timeZone": "Europe/Madrid"
    }
  ]
}
```

## 🏢 **Configuración de Cuenta Separada**

### **Variables de Entorno - Calendar**
```env
# Diferentes de Drive - Cuenta independiente
GOOGLE_CALENDAR_CLIENT_ID=calendar_specific_client_id
GOOGLE_CALENDAR_CLIENT_SECRET=calendar_specific_secret  
GOOGLE_CALENDAR_REFRESH_TOKEN=calendar_specific_refresh_token
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/calendar/auth/callback
```

### **Variables de Entorno - Drive** 
```env
# Cuenta diferente para Drive
GOOGLE_DRIVE_CLIENT_ID=drive_specific_client_id
GOOGLE_DRIVE_CLIENT_SECRET=drive_specific_secret
GOOGLE_DRIVE_REFRESH_TOKEN=drive_specific_refresh_token
```

## 📋 **Casos de Uso Comunes**

### **Caso 1: Cuenta Personal**
```json
{
  "calendarId": "primary",  // calendario@tuempresa.com
  "events": [...]
}
```

### **Caso 2: Calendario Compartido de Equipo**
```json
{
  "calendarId": "formacion@group.calendar.google.com",
  "events": [...]
}
```

### **Caso 3: Calendario Específico por Proyecto**
```json
{
  "calendarId": "ibmeu-ed12@group.calendar.google.com",
  "events": [...]  
}
```

## ⚠️ **Validaciones de Seguridad**

### **Verificación de acceso**
Antes de crear eventos, la API verifica:

1. **Autenticación válida** con Google Calendar
2. **Permisos de escritura** en el calendario destino
3. **Existencia del calendario** especificado
4. **Rol de administrador** en la aplicación

### **Código de validación**
```typescript
// En GoogleCalendarService.ts
const hasAccess = await calendarService.hasCalendarAccess(calendarId);
if (!hasAccess) {
  throw new Error(`No access to calendar: ${calendarId}`);
}
```

## 🔄 **Cambiar de Cuenta**

### **Opción 1: Cambiar Variables de Entorno**
1. Actualizar `GOOGLE_CALENDAR_REFRESH_TOKEN` con nueva cuenta
2. Reiniciar aplicación
3. Verificar en dashboard

### **Opción 2: Revocar y Reautenticar**
```bash
DELETE /api/calendar/auth/token  # Revocar token actual
# Luego seguir proceso OAuth2 para nueva cuenta
```

## 📊 **Monitoreo de Eventos Creados**

### **Lista de eventos recientes**
```bash
GET /api/calendar/events?maxResults=10&orderBy=updated
```

### **Eventos por calendario específico**
```bash
GET /api/calendar/events?calendarId=primary
```

### **Verificar evento específico**
```bash
GET /api/calendar/events/EVENT_ID?calendarId=primary
```

## 🚨 **Troubleshooting**

### **Error: "Calendar not found"**
- Verificar que `calendarId` existe en la cuenta
- Usar `/api/calendar/calendars` para listar disponibles

### **Error: "Access denied"**
- Verificar permisos de escritura en el calendario
- Confirmar que la cuenta tiene acceso al calendario compartido

### **Error: "Authentication failed"**
- Verificar variables de entorno de Calendar
- Renovar refresh token si ha expirado

### **Eventos aparecen en calendario incorrecto**
- Verificar `calendarId` en el JSON de importación
- Confirmar calendario primario en dashboard

## 📞 **Verificación Rápida**

**1-Minuto Check:**
1. Ve a `/admin/calendar` 
2. Revisa la sección "📧 Cuenta y Calendario Activos"
3. Confirma que muestra la cuenta correcta
4. Verifica que dice "Los eventos se crearán en: [tu-cuenta]"

**Si necesitas cambiar de cuenta:**
1. Actualiza las variables de entorno de Calendar
2. Reinicia la aplicación  
3. Verifica de nuevo en el dashboard

---

**Importante:** Las cuentas de Calendar y Drive son completamente independientes. Puedes usar `formacion@empresa.com` para Calendar y `archivos@empresa.com` para Drive simultáneamente.