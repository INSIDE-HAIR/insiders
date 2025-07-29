# Guía de Importación de Eventos IBMEU con Google Meet Avanzado

Esta guía explica cómo usar el archivo JSON mejorado `ibmeu_ed12_events_enhanced.json` para crear eventos de calendario con todas las características avanzadas de Google Meet.

## 🚀 Características Implementadas

### ✅ Google Meet con Funcionalidades Avanzadas
- **Grabación automática** habilitada para todas las sesiones
- **Transcripción automática** en español
- **Notas automáticas con Gemini AI** para resúmenes inteligentes
- **Subtítulos en tiempo real** en español
- **Todos los invitados como co-organizadores** (hosts)
- **Salas de grupos (breakout rooms)** disponibles
- **Compartir pantalla** habilitado para todos los participantes

### ✅ Configuración de Eventos Mejorada
- Recordatorios múltiples (1 día, 1 hora, 30 minutos antes)
- Descripciones enriquecidas con emojis e información detallada
- Propiedades extendidas para seguimiento del curso
- IDs únicos de Meet para cada sesión

## 📋 Formato JSON Mejorado

### Estructura Principal
```json
{
  "calendarId": "primary",
  "defaultTimeZone": "Europe/Madrid",
  "events": [
    // Array de eventos...
  ]
}
```

### Evento Individual (Ejemplo Completo)
```json
{
  "summary": "IBMEU_ED12 - Módulo 1 (08/09/2025)",
  "description": "Descripción detallada con emojis y funcionalidades",
  "location": "Google Meet (Enlace generado automáticamente)",
  "startDate": "2025-09-08",
  "startTime": "09:30",
  "endDate": "2025-09-08", 
  "endTime": "13:30",
  "allDay": false,
  "timeZone": "Europe/Madrid",
  
  "attendees": [
    {
      "email": "lorena@insidesalons.com",
      "displayName": "Lorena - Inside Salons",
      "optional": false
    }
  ],
  
  "reminders": [
    {
      "method": "email",
      "minutes": 1440
    },
    {
      "method": "popup", 
      "minutes": 30
    }
  ],
  
  "conferenceData": {
    "createRequest": {
      "requestId": "meet-ibmeu-ed12-mod1-2025",
      "conferenceSolutionKey": {
        "type": "hangoutsMeet"
      }
    }
  },
  
  "extendedProperties": {
    "private": {
      "recording": "enabled",
      "transcription": "enabled",
      "gemini_notes": "enabled",
      "captions": "enabled",
      "caption_language": "es",
      "translation_target": "es",
      "all_attendees_hosts": "true",
      "breakout_rooms": "enabled",
      "chat_enabled": "true",
      "screen_sharing": "all_participants",
      "recording_storage": "google_drive",
      "transcript_language": "spanish",
      "meeting_series": "IBMEU_ED12_SEP25_NOV25",
      "module_number": "1",
      "course_type": "training"
    }
  }
}
```

## 🔧 Cómo Importar

### Opción 1: API Endpoint
```bash
curl -X POST http://localhost:3000/api/calendar/import/json \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @ibmeu_ed12_events_enhanced.json
```

### Opción 2: Interfaz Web
1. Ve a `/admin/calendar/import/json`
2. Sube el archivo `ibmeu_ed12_events_enhanced.json`
3. Revisa la preview de eventos
4. Confirma la importación

### Opción 3: Usando el Dashboard
1. Accede a `/admin/calendar`
2. Haz clic en "Importar JSON"
3. Selecciona el archivo mejorado
4. Procede con la importación

## 📅 Eventos Incluidos

El archivo incluye 12 módulos del curso IBMEU_ED12:

1. **Módulo 1** - 08/09/2025 - Introducción al programa
2. **Módulo 2** - 15/09/2025 - Desarrollo de competencias avanzadas
3. **Módulo 3** - 22/09/2025 - Técnicas avanzadas de implementación
4. **Módulo 4** - 29/09/2025 - Evaluación de progreso
5. **Módulo 5** - 06/10/2025 - Especialización temática
6. **Módulo 6** - 13/10/2025 - Análisis de resultados intermedio
7. **Módulo 7** - 20/10/2025 - Técnicas avanzadas de análisis
8. **Módulo 8** - 27/10/2025 - Integración de conocimientos
9. **Módulo 9** - 03/11/2025 - Proyectos finales
10. **Módulo 10** - 10/11/2025 - Revisión exhaustiva de contenidos
11. **Módulo 11** - 17/11/2025 - Simulacro de examen
12. **Módulo 12** - 24/11/2025 - Examen final y clausura

**Horario:** Todos los lunes de 9:30 a 13:30 (4 horas)
**Zona Horaria:** Europe/Madrid

## ⚙️ Configuración Automática de Google Meet

### Funcionalidades Habilitadas
- ✅ **Grabación**: Todas las sesiones se graban automáticamente
- ✅ **Transcripción**: Texto automático de la reunión en español
- ✅ **Gemini AI**: Notas inteligentes y resúmenes automáticos
- ✅ **Subtítulos**: Captions en tiempo real en español
- ✅ **Co-organizadores**: Todos los invitados pueden gestionar la reunión
- ✅ **Salas de grupos**: Disponibles para trabajos en equipo
- ✅ **Chat**: Habilitado para toda la sesión
- ✅ **Compartir pantalla**: Todos los participantes pueden compartir

### Configuraciones Técnicas
- **Almacenamiento**: Google Drive para grabaciones
- **Idioma**: Español para transcripciones y subtítulos
- **Traducción**: Objetivo español para contenido multiidioma
- **Serie**: Agrupado como "IBMEU_ED12_SEP25_NOV25"

## 🔍 Validación y Errores

### Campos Requeridos
- `summary`: Título del evento
- `startDate`: Fecha de inicio (YYYY-MM-DD)
- `endDate`: Fecha de fin (YYYY-MM-DD)

### Campos Opcionales
- `startTime/endTime`: Para eventos con hora específica
- `attendees`: Lista de invitados
- `reminders`: Recordatorios personalizados
- `conferenceData`: Configuración de Google Meet
- `extendedProperties`: Funcionalidades avanzadas

### Validación Automática
La API valida automáticamente:
- Formato de fechas y horas
- Emails válidos en invitados
- Rangos de tiempo correctos
- Configuraciones de Meet válidas

## 📋 Respuesta de Importación

```json
{
  "totalEvents": 12,
  "successfulImports": 12,
  "failedImports": 0,
  "errors": [],
  "importedEventIds": [
    "event_id_1",
    "event_id_2",
    // ...
  ]
}
```

## 🚨 Limitaciones Importantes

### Google Meet API
- Algunas configuraciones avanzadas requieren ajustes manuales en Meet
- La habilitación de co-organizadores puede requerir configuración adicional
- Las grabaciones automáticas dependen de los permisos de la cuenta

### Permisos Requeridos
- Cuenta con permisos de administrador de Google Workspace
- Google Calendar API habilitada
- Google Meet con funciones de grabación disponibles

## 🛠️ Troubleshooting

### Error: "Conference creation failed"
- Verificar permisos de Google Meet
- Asegurar que la cuenta tenga habilitada la creación de reuniones

### Error: "Recording not available"
- Verificar que Google Workspace tenga habilitada la grabación
- Confirmar permisos de administrador

### Error: "Transcription failed"
- Verificar disponibilidad de transcripción en la región
- Confirmar configuración de idioma español

### Error: "Co-host assignment failed"
- Configuración manual requerida en Google Meet
- Verificar permisos de la cuenta organizadora

## 📞 Soporte

Para problemas específicos:
1. Revisar logs de la API en `/api/calendar/import/json`
2. Verificar estado de autenticación en `/api/calendar/auth/token`  
3. Consultar documentación de variables de entorno
4. Verificar permisos de Google Workspace

---

**Nota**: Este formato JSON mejorado está optimizado para cursos de formación con múltiples sesiones y funcionalidades avanzadas de Google Meet. Para eventos simples, usar el formato estándar de importación.