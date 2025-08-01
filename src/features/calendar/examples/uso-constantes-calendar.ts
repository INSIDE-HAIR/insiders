/**
 * Ejemplos de uso de las constantes de Calendar
 * 
 * Muestra cómo utilizar las constantes para trabajar
 * con el calendario de academia por defecto
 */

import { GoogleCalendarService } from "../services/calendar/GoogleCalendarService";
import { 
  ORGANIZATION_CALENDARS,
  DEFAULT_CALENDAR_ID,
  ACADEMIA_EVENT_TYPES,
  applyEventType,
  getCalendarId 
} from "../constants/calendar.constants";

// ==================== EJEMPLOS DE USO ====================

async function ejemplosDeUso() {
  const calendarService = new GoogleCalendarService();
  await calendarService.initialize();

  // 1️⃣ CREAR EVENTO EN ACADEMIA (por defecto)
  // No necesitas especificar calendarId, usa academia@insidesalons.com automáticamente
  const eventoAcademia = await calendarService.createEvent({
    summary: "Masterclass de Colorimetría",
    description: "Sesión avanzada sobre técnicas de color",
    startDate: "2024-02-20",
    startTime: "10:00",
    endDate: "2024-02-20",
    endTime: "12:00",
    allDay: false,
    timeZone: "Europe/Madrid",
    calendarId: "academia@insidesalons.com",
    attendees: [
      { email: "estudiante1@example.com", optional: false },
      { email: "estudiante2@example.com", optional: false }
    ],
    reminders: [],
    visibility: "default" as any,
    transparency: "opaque" as any,
    guestsCanInviteOthers: true,
    guestsCanModify: false,
    guestsCanSeeOtherGuests: true
  }); // <- NO se especifica calendarId, usa DEFAULT (academia)

  // 2️⃣ CREAR EVENTO CON TIPO ESPECÍFICO
  const eventoConTipo = applyEventType({
    summary: "Introducción a las Técnicas de Corte",
    description: "Formación básica de corte",
    startDate: "2024-02-21",
    startTime: "10:00",
    endDate: "2024-02-21",
    endTime: "12:00",
    allDay: false,
    timeZone: "Europe/Madrid",
    calendarId: "academia@insidesalons.com",
    attendees: [],
    reminders: [],
    visibility: "default" as any,
    transparency: "opaque" as any,
    guestsCanInviteOthers: true,
    guestsCanModify: false,
    guestsCanSeeOtherGuests: true
  }, 'FORMACION');
  
  // Resultado: summary = "[FORMACIÓN] Introducción a las Técnicas de Corte"
  // Y se aplicará el color verde (colorId: '10')
  await calendarService.createEvent(eventoConTipo);

  // 3️⃣ CREAR EVENTO EN CALENDARIO ESPECÍFICO
  // Si necesitas usar otro calendario diferente
  await calendarService.createEvent(
    {
      summary: "Reunión de Sistemas",
      description: "Revisión de infraestructura",
      startDate: "2024-02-22",
      startTime: "15:00",
      endDate: "2024-02-22",
      endTime: "16:00",
      allDay: false,
      timeZone: "Europe/Madrid",
      calendarId: ORGANIZATION_CALENDARS.SISTEMAS,
      attendees: [],
      reminders: [],
      visibility: "default" as any,
      transparency: "opaque" as any,
      guestsCanInviteOthers: true,
      guestsCanModify: false,
      guestsCanSeeOtherGuests: true
    },
    ORGANIZATION_CALENDARS.SISTEMAS // Usa sistemas@insidesalons.com
  );

  // 4️⃣ LISTAR EVENTOS DE ACADEMIA (por defecto)
  const eventosAcademia = await calendarService.getEvents();
  // Equivalente a: getEvents('academia@insidesalons.com')

  // 5️⃣ IMPORTAR EVENTOS JSON (todos van a academia por defecto)
  const eventosParaImportar = [
    {
      summary: "Taller de Peinados de Novia",
      description: "Técnicas especializadas",
      startDate: "2024-03-01",
      startTime: "10:00",
      endDate: "2024-03-01",
      endTime: "14:00",
      allDay: false,
      timeZone: "Europe/Madrid",
      calendarId: "academia@insidesalons.com",
      attendees: [],
      reminders: [],
      visibility: "default" as any,
      transparency: "opaque" as any,
      guestsCanInviteOthers: true,
      guestsCanModify: false,
      guestsCanSeeOtherGuests: true
    },
    {
      summary: "Certificación en Alisados",
      description: "Programa de certificación oficial",
      startDate: "2024-03-05",
      startTime: "09:00",
      endDate: "2024-03-05",
      endTime: "18:00",
      allDay: false,
      timeZone: "Europe/Madrid",
      calendarId: "academia@insidesalons.com",
      attendees: [],
      reminders: [],
      visibility: "default" as any,
      transparency: "opaque" as any,
      guestsCanInviteOthers: true,
      guestsCanModify: false,
      guestsCanSeeOtherGuests: true
    }
  ];
  
  const resultado = await calendarService.createEventsInBatch('academia@insidesalons.com', eventosParaImportar);
  // Todos se crean en academia@insidesalons.com por defecto

  // 6️⃣ USO DE HELPER getCalendarId
  const calendarioFormacion = getCalendarId('ACADEMIA'); // "academia@insidesalons.com"
  const calendarioSistemas = getCalendarId('SISTEMAS'); // "sistemas@insidesalons.com"
  const calendarioPorDefecto = getCalendarId(); // "academia@insidesalons.com"
}

// ==================== CONFIGURACIÓN EN JSON DE IMPORTACIÓN ====================

// Ejemplo de JSON que puede omitir calendarId (usará academia por defecto)
const jsonImportacionAcademia = {
  // calendarId es opcional, si no se especifica usa academia@insidesalons.com
  events: [
    {
      title: "Curso Intensivo de Barbería",
      description: "3 días de formación intensiva",
      startDate: "2024-04-01",
      startTime: "09:00",
      endDate: "2024-04-03",
      endTime: "18:00",
      eventType: "CERTIFICACION", // Se aplicará color y prefijo automáticamente
      attendees: ["alumno1@email.com", "alumno2@email.com"]
    }
  ]
};

// Si necesitas especificar otro calendario
const jsonImportacionSistemas = {
  calendarId: "sistemas@insidesalons.com", // Especifica calendario diferente
  events: [
    {
      title: "Mantenimiento del Sistema",
      description: "Actualización mensual",
      startDate: "2024-04-15",
      startTime: "22:00",
      endDate: "2024-04-15",
      endTime: "23:00"
    }
  ]
};

// ==================== RESUMEN DE VENTAJAS ====================

/**
 * VENTAJAS DE USAR LAS CONSTANTES:
 * 
 * 1. ✅ No necesitas recordar emails de calendarios
 * 2. ✅ Academia es el calendario por defecto (formación)
 * 3. ✅ Tipos de eventos con colores predefinidos
 * 4. ✅ Fácil cambiar entre calendarios de la organización
 * 5. ✅ Configuración centralizada en un solo lugar
 * 6. ✅ Validación automática de calendarios de la organización
 * 
 * CALENDARIO POR DEFECTO:
 * - Todas las operaciones usan academia@insidesalons.com
 * - Perfecto para el módulo de formación
 * - Configurable vía variable de entorno
 */

export { ejemplosDeUso };