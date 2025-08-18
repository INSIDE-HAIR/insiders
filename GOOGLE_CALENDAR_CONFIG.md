# Configuración Google Calendar - Guía Completa

## Resumen

Se ha implementado una configuración centralizada y robusta para Google Calendar API que incluye:

✅ **Calendario por defecto configurable**  
✅ **Scopes completos** (Calendar + Meet)  
✅ **Configuración centralizada**  
✅ **Validación automática**  
✅ **Logs de diagnóstico**  

## Variables de Entorno

### Configuración Básica (Requerida)

```env
# Google Calendar API (obligatorio)
GOOGLE_CALENDAR_CLIENT_ID="your-calendar-client-id"
GOOGLE_CALENDAR_CLIENT_SECRET="your-calendar-client-secret"
GOOGLE_CALENDAR_REFRESH_TOKEN="your-calendar-refresh-token"
```

### Configuración Opcional (Con Defaults)

```env
# Calendario por defecto (default: "primary")
GOOGLE_CALENDAR_DEFAULT_CALENDAR_ID="primary"

# O usar un calendar específico:
# GOOGLE_CALENDAR_DEFAULT_CALENDAR_ID="academia@insidesalons.com"

# Timezone por defecto (default: "Europe/Madrid")
GOOGLE_CALENDAR_DEFAULT_TIMEZONE="Europe/Madrid"

# URL de callback (default: auto-generada)
GOOGLE_CALENDAR_REDIRECT_URI="http://localhost:3000/api/calendar/auth/callback"
```

### Scopes Avanzados (Opcional)

```env
# Scopes personalizados (default: todos los disponibles)
GOOGLE_CALENDAR_SCOPES="https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/calendar.readonly,https://www.googleapis.com/auth/meetings.space.readonly"
```

## Scopes Incluidos por Defecto

La configuración incluye **TODOS** los scopes disponibles para máxima funcionalidad:

### 📅 Calendar Core
- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/calendar.readonly`

### 📝 Calendar Events  
- `https://www.googleapis.com/auth/calendar.events`
- `https://www.googleapis.com/auth/calendar.events.readonly`
- `https://www.googleapis.com/auth/calendar.events.owned`
- `https://www.googleapis.com/auth/calendar.events.owned.readonly`
- `https://www.googleapis.com/auth/calendar.events.public.readonly`
- `https://www.googleapis.com/auth/calendar.events.freebusy`

### 📋 Calendar Lists & Management
- `https://www.googleapis.com/auth/calendar.calendarlist`
- `https://www.googleapis.com/auth/calendar.calendarlist.readonly`
- `https://www.googleapis.com/auth/calendar.calendars`
- `https://www.googleapis.com/auth/calendar.calendars.readonly`

### 🔐 Access Control & Settings
- `https://www.googleapis.com/auth/calendar.acls`
- `https://www.googleapis.com/auth/calendar.acls.readonly`
- `https://www.googleapis.com/auth/calendar.settings.readonly`

### 📊 Additional Features
- `https://www.googleapis.com/auth/calendar.freebusy`
- `https://www.googleapis.com/auth/calendar.app.created`

### 🎥 Google Meet Integration
- `https://www.googleapis.com/auth/meetings.space.created`
- `https://www.googleapis.com/auth/meetings.space.readonly`
- `https://www.googleapis.com/auth/meetings.space.settings`

## Cómo Funciona

### 1. Configuración Automática
```typescript
// El sistema usa automáticamente la configuración por defecto
const calendarService = new GoogleCalendarService();
await calendarService.initialize();

// Obtiene calendario por defecto de GOOGLE_CALENDAR_DEFAULT_CALENDAR_ID
const defaultCalendar = calendarService.getDefaultCalendarId();
```

### 2. Validación Automática
Al inicializar, el sistema:
- ✅ Verifica que estén todas las variables requeridas
- ⚠️ Muestra warnings para configuraciones opcionales
- 📝 Registra la configuración en desarrollo

### 3. Logs de Diagnóstico
```
📅 Google Calendar Configuration:
  Default Calendar: primary
  Default Timezone: Europe/Madrid
  Scopes Count: 20
  Client ID: ✅ Set
  Client Secret: ✅ Set
  Refresh Token: ✅ Set
✅ Configuration is valid
```

## Casos de Uso

### Uso Básico (Default)
```typescript
// Usa "primary" como calendario por defecto
const events = await calendarService.getEvents();
```

### Uso con Calendar Específico
```typescript
// Override el calendario por defecto
const events = await calendarService.getEvents('academia@insidesalons.com');
```

### En APIs
```typescript
// Si no se especifica calendarId, usa el por defecto
GET /api/calendar/events 
// → Usa GOOGLE_CALENDAR_DEFAULT_CALENDAR_ID

GET /api/calendar/events?calendarId=custom@domain.com
// → Usa el calendar específico
```

## Configuración Recomendada por Entorno

### Desarrollo
```env
GOOGLE_CALENDAR_DEFAULT_CALENDAR_ID="primary"
GOOGLE_CALENDAR_DEFAULT_TIMEZONE="Europe/Madrid"
```

### Producción
```env
GOOGLE_CALENDAR_DEFAULT_CALENDAR_ID="academia@insidesalons.com"
GOOGLE_CALENDAR_DEFAULT_TIMEZONE="Europe/Madrid"
GOOGLE_CALENDAR_REDIRECT_URI="https://yourdomain.com/api/calendar/auth/callback"
```

## Troubleshooting

### Error: "Missing required Calendar auth configuration"
```bash
# Verificar que estén las variables obligatorias:
echo $GOOGLE_CALENDAR_CLIENT_ID
echo $GOOGLE_CALENDAR_CLIENT_SECRET
echo $GOOGLE_CALENDAR_REFRESH_TOKEN
```

### Warning: "GOOGLE_CALENDAR_DEFAULT_CALENDAR_ID is using placeholder value"
```env
# Cambiar de placeholder a valor real:
GOOGLE_CALENDAR_DEFAULT_CALENDAR_ID="your-actual-calendar@domain.com"
```

### Warning: "Google Meet scopes not configured"
```env
# Los scopes de Meet están incluidos por defecto
# Si los personalizas, asegúrate de incluir:
GOOGLE_CALENDAR_SCOPES="...,https://www.googleapis.com/auth/meetings.space.readonly"
```

## Beneficios de Esta Configuración

### ✅ Ventajas
1. **Sin hardcoding**: Todos los valores son configurables
2. **Defaults inteligentes**: Funciona sin configuración adicional
3. **Scopes completos**: Máxima funcionalidad disponible
4. **Validación automática**: Detecta errores de configuración
5. **Logs informativos**: Fácil debugging
6. **Backward compatible**: No rompe configuraciones existentes

### 🚀 Impacto
- **Flexibilidad**: Cambiar calendarios sin tocar código
- **Mantenibilidad**: Configuración centralizada
- **Robustez**: Validaciones automáticas
- **Escalabilidad**: Fácil agregar nuevas configuraciones

---

**La configuración está lista y funcionando** ✅

Ahora puedes:
1. Usar `primary` por defecto o configurar tu calendario específico
2. Todos los scopes están disponibles automáticamente
3. La validación te avisará si falta algo
4. Los logs te ayudarán a debuggear cualquier issue