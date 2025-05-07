# Documentación Técnica: Sistema de Recordatorios para Errores

## Visión General

El sistema de recordatorios para reportes de errores está diseñado para notificar periódicamente sobre errores que permanecen en determinados estados, evitando que queden olvidados o sin resolver. Los recordatorios se envían a los usuarios asignados a cada reporte.

## Arquitectura

### Componentes Principales

1. **Modelo de Datos (Prisma)**

   - `DriveErrorReminder`: Almacena la configuración de los recordatorios
   - `DriveErrorReport`: Contiene los reportes de errores que se monitorean
   - `User`: Contiene información de los usuarios que pueden ser asignados a reportes
   - `DriveErrorReportConfig`: Configuración general de destinatarios (fallback)

2. **API REST**

   - Endpoints CRUD para gestionar los recordatorios
   - POST: `/api/drive/error-reminders`
   - GET: `/api/drive/error-reminders`
   - PUT/DELETE: `/api/drive/error-reminders/[id]`
   - POST: `/api/drive/error-report/[id]/reminder` (envío inmediato)
   - GET: `/api/cron/check-reminders` (cron job)

3. **Componente de UI**

   - `ReminderManager`: Interfaz para administrar los recordatorios
   - Botón de sobre en la tabla de reportes para enviar recordatorios inmediatos
   - Integración con la pestaña de recordatorios en la página de gestión de errores

4. **Sistema de Notificaciones**
   - Job programado para verificar y enviar recordatorios periódicamente
   - Emails HTML personalizados para cada reporte

## Modelos de Datos

```prisma
model DriveErrorReminder {
  id        String    @id @default(auto()) @map("_id") @db.ObjectId
  status    String    // "pending" o "in-progress"
  frequency String    // "hourly", "daily", "weekly", o "monthly"
  interval  Int       // Número de intervalos (ej: cada 7 días)
  active    Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  lastSent  DateTime? // Última vez que se envió este recordatorio
}

model DriveErrorReportConfig {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  recipients    String[] // Lista de correos que reciben las notificaciones (fallback)
  ccRecipients  String[] // Lista de correos en copia
  bccRecipients String[] // Lista de correos en copia oculta
  active        Boolean  @default(true)
  updatedAt     DateTime @updatedAt
}
```

## Lógica de Destinatarios

Para cada reporte de error, los recordatorios se envían según la siguiente lógica:

1. **Si el reporte tiene usuarios asignados**:

   - Se envían correos a los emails de los usuarios asignados al reporte
   - Los usuarios asignados se almacenan en el campo `assignedTo` del modelo `DriveErrorReport`

2. **Si el reporte no tiene usuarios asignados**:
   - Se utiliza la configuración general de destinatarios (`DriveErrorReportConfig`)
   - Los correos se envían a los destinatarios definidos en el campo `recipients`

## Flujo de Notificaciones Programadas

1. **Programación**: Un cron job ejecuta el endpoint `/api/cron/check-reminders` periódicamente
2. **Verificación**: Se verifican qué recordatorios están programados para ejecutarse
   - Se comprueba la frecuencia, intervalo y último envío de cada recordatorio
3. **Consulta**: Para cada recordatorio activo, se buscan los reportes que:
   - Tengan el estado especificado en el recordatorio (pending/in-progress)
   - No estén resueltos (resolvedAt == null)
4. **Notificación**: Para cada reporte encontrado:
   - Se determinan los destinatarios (usuarios asignados o configuración general)
   - Se envía un correo con detalles del reporte y enlace directo
   - Se actualiza la fecha de último envío del recordatorio

## Recordatorios Inmediatos

El sistema también permite enviar recordatorios inmediatos desde la interfaz:

1. El usuario hace clic en el icono de sobre en la tabla de reportes
2. El sistema determina los destinatarios según la misma lógica anterior
3. Se envía un correo inmediato con la información del reporte
4. No se actualiza la fecha de último envío del recordatorio programado

## Implementación del Job de Verificación

```javascript
// Pseudocódigo del proceso de verificación y envío
async function checkReminders() {
  // Obtener todos los recordatorios activos
  const reminders = await prisma.driveErrorReminder.findMany({
    where: { active: true },
  });

  for (const reminder of reminders) {
    // Verificar si toca enviar este recordatorio basado en su frecuencia e intervalo
    if (shouldSendReminder(reminder)) {
      // Buscar reportes que coincidan con el estado del recordatorio
      const reports = await prisma.driveErrorReport.findMany({
        where: {
          status: reminder.status,
          resolvedAt: null, // No resueltos
        },
      });

      // Procesar cada reporte encontrado
      for (const report of reports) {
        // Determinar destinatarios (usuarios asignados o config general)
        const recipients = await determineRecipients(report);

        if (recipients.length > 0) {
          // Enviar correo de recordatorio
          await sendReminderEmail(recipients, report);
        }
      }

      // Actualizar la última fecha de envío
      await updateReminderLastSent(reminder.id);
    }
  }
}
```

## Configuración Recomendada para Recordatorios Semanales

Para reportes pendientes:

```json
{
  "status": "pending",
  "frequency": "weekly",
  "interval": 1,
  "active": true
}
```

Para reportes en progreso:

```json
{
  "status": "in-progress",
  "frequency": "weekly",
  "interval": 1,
  "active": true
}
```

## Consideraciones de Seguridad

- El acceso a los endpoints de API está protegido por autenticación
- El endpoint del cron job requiere un token secreto (CRON_SECRET)
- Solo usuarios con rol ADMIN pueden gestionar los recordatorios
