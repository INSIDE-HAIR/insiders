# Documentación Técnica: Sistema de Recordatorios para Errores

## Visión General

El sistema de recordatorios para reportes de errores está diseñado para notificar periódicamente sobre errores que permanecen en determinados estados, evitando que queden olvidados o sin resolver.

## Arquitectura

### Componentes Principales

1. **Modelo de Datos (Prisma)**

   - `DriveErrorReminder`: Almacena la configuración de los recordatorios
   - `DriveErrorReport`: Contiene los reportes de errores que se monitorean

2. **API REST**

   - Endpoints CRUD para gestionar los recordatorios
   - POST: `/api/drive/error-reminders`
   - GET: `/api/drive/error-reminders`
   - PUT/DELETE: `/api/drive/error-reminders/[id]`

3. **Componente de UI**

   - `ReminderManager`: Interfaz para administrar los recordatorios
   - Integración con la pestaña de recordatorios en la página de gestión de errores

4. **Sistema de Notificaciones**
   - Job programado para verificar y enviar recordatorios periódicamente

## Modelo de Datos

```prisma
model DriveErrorReminder {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  status    String   // "pending" o "in-progress"
  frequency String   // "hourly", "daily", "weekly", o "monthly"
  interval  Int      // Número de intervalos (ej: cada 7 días)
  emails    String[] // Correos destinatarios
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Flujo de Notificaciones

1. **Programación**: Un job se ejecuta periódicamente (ej: cada hora)
2. **Verificación**: El job verifica qué recordatorios están programados para ejecutarse
3. **Consulta**: Para cada recordatorio activo, consulta los reportes que:
   - Tengan el estado especificado en el recordatorio (pending/in-progress)
   - Lleven más de 24 horas sin actualizaciones
4. **Notificación**: Si hay reportes que cumplan las condiciones, envía un correo a los destinatarios con:
   - Listado de reportes
   - Enlaces directos a cada reporte
   - Resumen del tiempo que han estado en ese estado

## Implementación del Job de Recordatorios

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
          updatedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });

      if (reports.length > 0) {
        // Enviar correo de recordatorio
        await sendReminderEmail(reminder.emails, reports);

        // Actualizar la última fecha de envío
        await updateReminderLastSent(reminder.id);
      }
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
  "emails": ["admin@insiders.com", "soporte@insiders.com"],
  "active": true
}
```

Para reportes en progreso:

```json
{
  "status": "in-progress",
  "frequency": "weekly",
  "interval": 1,
  "emails": ["admin@insiders.com", "soporte@insiders.com", "dev@insiders.com"],
  "active": true
}
```

## Consideraciones de Seguridad

- Las direcciones de correo se validan antes de guardarlas
- El acceso a los endpoints de API está protegido por autenticación
- Solo usuarios con rol ADMIN pueden gestionar los recordatorios
