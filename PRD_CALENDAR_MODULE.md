# PRD - Módulo de Calendar

## Resumen Ejecutivo

El módulo Calendar será una funcionalidad completa para la gestión de calendarios de Google Calendar integrada en la aplicación, siguiendo los mismos patrones arquitectónicos implementados en el módulo Drive. Permitirá crear, gestionar y visualizar eventos de calendario a través de formularios web, importación JSON y carga CSV, utilizando una cuenta de Google Calendar independiente.

## Objetivos

### Objetivo Principal
Implementar un sistema completo de gestión de calendarios que permita crear eventos en Google Calendar de manera eficiente y escalable.

### Objetivos Específicos
1. **Integración con Google Calendar API**: Conexión completa con Google Calendar API usando credenciales independientes
2. **Múltiples métodos de creación**: Formulario web, importación JSON y carga CSV
3. **Gestión de eventos**: Crear, leer, actualizar y eliminar eventos de calendario
4. **Interfaz administrativa**: Panel de administración para gestión completa de calendarios
5. **Documentación completa**: Variables de entorno y guías de uso

## Arquitectura del Sistema

### Estructura de Archivos
Siguiendo el patrón del módulo Drive:

```
src/
├── features/calendar/
│   ├── types/
│   │   ├── calendar.ts           # Tipos base para Calendar API
│   │   ├── event.ts              # Tipos para eventos
│   │   └── index.ts
│   ├── services/
│   │   ├── auth/
│   │   │   └── GoogleCalendarAuthProvider.ts
│   │   ├── calendar/
│   │   │   └── GoogleCalendarService.ts
│   │   └── events/
│   │       └── EventService.ts
│   └── utils/
│       ├── logger.ts
│       ├── dateUtils.ts
│       └── eventValidation.ts
├── components/calendar/
│   ├── forms/
│   │   ├── EventForm.tsx
│   │   ├── CalendarSelector.tsx
│   │   └── RecurrenceSettings.tsx
│   ├── import/
│   │   ├── JsonImporter.tsx
│   │   ├── CsvImporter.tsx
│   │   └── ImportPreview.tsx
│   ├── views/
│   │   ├── CalendarView.tsx
│   │   ├── EventList.tsx
│   │   └── EventDetails.tsx
│   └── ui/
│       ├── CalendarToasts.tsx
│       └── LoadingStates.tsx
├── app/api/calendar/
│   ├── events/
│   │   ├── route.ts              # GET, POST eventos
│   │   └── [id]/
│   │       └── route.ts          # GET, PUT, DELETE evento específico
│   ├── calendars/
│   │   └── route.ts              # Listar calendarios
│   ├── import/
│   │   ├── json/
│   │   │   └── route.ts          # Importar desde JSON
│   │   └── csv/
│   │       └── route.ts          # Importar desde CSV
│   └── auth/
│       └── token/
│           └── route.ts          # Autenticación de Calendar
└── app/[lang]/admin/calendar/
    ├── page.tsx                  # Dashboard principal
    ├── events/
    │   ├── page.tsx              # Lista de eventos
    │   ├── create/
    │   │   └── page.tsx          # Crear evento
    │   └── [id]/
    │       └── page.tsx          # Editar evento
    ├── import/
    │   ├── page.tsx              # Portal de importación
    │   ├── json/
    │   │   └── page.tsx          # Importar JSON
    │   └── csv/
    │       └── page.tsx          # Importar CSV
    └── settings/
        └── page.tsx              # Configuraciones de calendario
```

## Funcionalidades Detalladas

### 1. Integración con Google Calendar API

#### Servicios Core
- **GoogleCalendarAuthProvider**: Manejo de autenticación OAuth2
- **GoogleCalendarService**: Operaciones CRUD con Google Calendar API
- **EventService**: Lógica de negocio para eventos

#### Operaciones Soportadas
- Listar calendarios disponibles
- Crear eventos (simples y recurrentes)
- Leer eventos existentes
- Actualizar eventos
- Eliminar eventos
- Gestión de invitados y notificaciones

### 2. Formulario de Creación de Eventos

#### Campos del Formulario
```typescript
interface EventForm {
  // Información básica
  title: string;
  description?: string;
  location?: string;
  
  // Fecha y hora
  startDate: Date;
  startTime: string;
  endDate: Date;
  endTime: string;
  allDay: boolean;
  timeZone: string;
  
  // Calendario destino
  calendarId: string;
  
  // Invitados
  attendees: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  
  // Recurrencia
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    count?: number;
    byWeekDay?: string[];
  };
  
  // Recordatorios
  reminders: Array<{
    method: 'email' | 'popup';
    minutes: number;
  }>;
  
  // Configuraciones adicionales
  visibility: 'default' | 'public' | 'private';
  transparency: 'opaque' | 'transparent';
}
```

#### Validaciones
- Fechas válidas y coherentes
- Formato de emails para invitados
- Límites de Google Calendar API
- Zona horaria válida

### 3. Importación JSON

#### Formato de Archivo JSON
```json
{
  "calendarId": "primary",
  "events": [
    {
      "title": "Reunión de equipo",
      "description": "Reunión semanal del equipo de desarrollo",
      "location": "Sala de conferencias A",
      "startDateTime": "2024-02-15T09:00:00",
      "endDateTime": "2024-02-15T10:00:00",
      "timeZone": "Europe/Madrid",
      "attendees": [
        {
          "email": "usuario@ejemplo.com",
          "displayName": "Usuario Ejemplo"
        }
      ],
      "reminders": [
        {
          "method": "email",
          "minutes": 15
        }
      ]
    }
  ]
}
```

#### Procesamiento
- Validación de estructura JSON
- Verificación de campos requeridos
- Preview antes de importar
- Manejo de errores por evento individual

### 4. Importación CSV

#### Estructura del CSV Template
```csv
title,description,location,startDate,startTime,endDate,endTime,allDay,timeZone,attendeeEmails,reminderMinutes,visibility
"Reunión de equipo","Reunión semanal","Sala A","2024-02-15","09:00","2024-02-15","10:00","false","Europe/Madrid","user1@example.com;user2@example.com","15;60","default"
"Conferencia","Conferencia anual de tecnología","Centro de convenciones","2024-03-01","08:00","2024-03-01","18:00","false","Europe/Madrid","","30","public"
```

#### Campos del CSV
- **title** (requerido): Título del evento
- **description**: Descripción del evento
- **location**: Ubicación del evento
- **startDate** (requerido): Fecha de inicio (YYYY-MM-DD)
- **startTime**: Hora de inicio (HH:MM)
- **endDate** (requerido): Fecha de fin (YYYY-MM-DD)
- **endTime**: Hora de fin (HH:MM)
- **allDay**: Si es evento de todo el día (true/false)
- **timeZone**: Zona horaria (ej: Europe/Madrid)
- **attendeeEmails**: Emails de invitados separados por ";"
- **reminderMinutes**: Minutos para recordatorios separados por ";"
- **visibility**: Visibilidad del evento (default/public/private)

### 5. Interfaz de Usuario

#### Dashboard Principal (`/admin/calendar`)
- Resumen de calendarios disponibles
- Estadísticas de eventos
- Accesos rápidos a funcionalidades principales
- Estado de la conexión con Google Calendar

#### Gestión de Eventos (`/admin/calendar/events`)
- Lista paginada de eventos
- Filtros por fecha, calendario, estado
- Acciones en lote (eliminar múltiples)
- Vista de calendario integrada

#### Portal de Importación (`/admin/calendar/import`)
- Selección de método de importación
- Upload de archivos JSON/CSV
- Preview de eventos a importar
- Progreso de importación en tiempo real

## APIs y Endpoints

### Eventos
- `GET /api/calendar/events` - Listar eventos con filtros
- `POST /api/calendar/events` - Crear nuevo evento
- `GET /api/calendar/events/[id]` - Obtener evento específico
- `PUT /api/calendar/events/[id]` - Actualizar evento
- `DELETE /api/calendar/events/[id]` - Eliminar evento

### Calendarios
- `GET /api/calendar/calendars` - Listar calendarios disponibles

### Importación
- `POST /api/calendar/import/json` - Importar eventos desde JSON
- `POST /api/calendar/import/csv` - Importar eventos desde CSV

### Autenticación
- `GET /api/calendar/auth/token` - Verificar/renovar token de Calendar

## Variables de Entorno

### Nuevas Variables Requeridas
```env
# Google Calendar API Configuration
GOOGLE_CALENDAR_CLIENT_ID=your_calendar_client_id
GOOGLE_CALENDAR_CLIENT_SECRET=your_calendar_client_secret
GOOGLE_CALENDAR_REFRESH_TOKEN=your_calendar_refresh_token
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/calendar/auth/callback

# Calendar Settings
GOOGLE_CALENDAR_DEFAULT_CALENDAR_ID=primary
GOOGLE_CALENDAR_DEFAULT_TIMEZONE=Europe/Madrid
```

### Documentación de Variables
Se creará documentación detallada en el frontend explicando:
- Cómo obtener las credenciales de Google Calendar
- Proceso de configuración OAuth2
- Configuración de calendarios por defecto
- Troubleshooting común

## Consideraciones Técnicas

### Autenticación y Seguridad
- OAuth2 flow completo para Google Calendar
- Tokens de acceso seguros y renovación automática
- Validación de permisos por usuario
- Rate limiting para APIs de Google

### Performance
- Caché de calendarios y eventos frecuentemente accedidos
- Paginación para listas grandes de eventos
- Procesamiento asíncrono para importaciones masivas
- Optimización de queries a Google Calendar API

### Manejo de Errores
- Retry automático para fallos de red
- Logging detallado de errores de API
- Notificaciones de usuario informativas
- Rollback en caso de fallos de importación

## Fases de Implementación

### Fase 1: Infraestructura Base
- Servicios de autenticación y Calendar API
- Tipos y interfaces base
- Configuración de variables de entorno

### Fase 2: Funcionalidad Core
- CRUD básico de eventos
- Formulario de creación
- APIs REST principales

### Fase 3: Importación
- Importador JSON
- Importador CSV con template
- Preview e validación

### Fase 4: Interfaz Administrativa
- Dashboard principal
- Gestión completa de eventos
- Portal de importación

### Fase 5: Funcionalidades Avanzadas
- Eventos recurrentes
- Gestión avanzada de invitados
- Reportes y analytics

## Criterios de Aceptación

### Funcionalidad
- [ ] Crear eventos a través de formulario web
- [ ] Importar eventos desde archivo JSON válido
- [ ] Importar eventos desde archivo CSV usando template
- [ ] Listar y filtrar eventos existentes
- [ ] Editar y eliminar eventos
- [ ] Gestionar múltiples calendarios

### Técnico
- [ ] APIs RESTful completamente funcionales
- [ ] Manejo robusto de errores
- [ ] Logging completo de operaciones
- [ ] Tests unitarios para servicios core
- [ ] Documentación técnica completa

### Usuario
- [ ] Interfaz intuitiva y responsiva
- [ ] Feedback claro de operaciones
- [ ] Validación de formularios en tiempo real
- [ ] Preview de importaciones antes de ejecutar

## Riesgos y Mitigaciones

### Riesgos Técnicos
- **Límites de API de Google Calendar**: Implementar rate limiting y manejo de cuotas
- **Complejidad de zonas horarias**: Usar librerías especializadas como date-fns-tz
- **Fallos de importación masiva**: Procesamiento por lotes con rollback

### Riesgos de Negocio
- **Diferentes cuentas de Calendar**: Documentación clara de configuración
- **Sincronización de datos**: No persistir en BD, solo gestión en tiempo real
- **Escalabilidad**: Diseño modular para crecimiento futuro

## Conclusiones

El módulo Calendar seguirá las mejores prácticas establecidas en el módulo Drive, garantizando consistencia arquitectónica y mantenibilidad. La implementación modular permitirá crecimiento incremental y fácil extensión de funcionalidades.

La separación clara entre servicios, componentes y APIs facilitará el testing y mantenimiento a largo plazo. La documentación completa asegurará adopción exitosa por parte del equipo de desarrollo.