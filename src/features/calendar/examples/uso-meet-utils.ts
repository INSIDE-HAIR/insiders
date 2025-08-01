/**
 * Ejemplos de uso de las utilidades de Google Meet
 */

import { extractMeetId, getMeetInfo, hasMeetEnabled, formatMeetId } from "../utils/meetUtils";
import { GoogleCalendarEvent } from "../types";

// Ejemplo 1: Evento creado con Google Meet API
const eventoConMeet: GoogleCalendarEvent = {
  id: "evento123",
  summary: "Reunión de equipo",
  start: { dateTime: "2024-02-01T10:00:00Z", timeZone: "Europe/Madrid" },
  end: { dateTime: "2024-02-01T11:00:00Z", timeZone: "Europe/Madrid" },
  hangoutLink: "https://meet.google.com/abc-defg-hij",
  conferenceData: {
    conferenceId: "abc-defg-hij",
    conferenceSolution: {
      name: "Google Meet",
      iconUri: "https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png"
    },
    entryPoints: [
      {
        entryPointType: "video",
        uri: "https://meet.google.com/abc-defg-hij",
        label: "meet.google.com/abc-defg-hij"
      }
    ]
  }
};

// Extraer Meet ID
const meetId = extractMeetId(eventoConMeet);
console.log("Meet ID:", meetId); // "abc-defg-hij"

// Verificar si tiene Meet habilitado
const tieneMeet = hasMeetEnabled(eventoConMeet);
console.log("¿Tiene Meet?:", tieneMeet); // true

// Obtener información completa
const meetInfo = getMeetInfo(eventoConMeet);
console.log("Información de Meet:", meetInfo);
// {
//   meetId: "abc-defg-hij",
//   meetUrl: "https://meet.google.com/abc-defg-hij",
//   conferenceType: "Google Meet",
//   entryPoints: [...]
// }

// Formatear Meet ID
const meetIdSinGuiones = "abcdefghij";
const meetIdFormateado = formatMeetId(meetIdSinGuiones);
console.log("Meet ID formateado:", meetIdFormateado); // "abc-defg-hij"

// Ejemplo 2: Evento sin Google Meet
const eventoSinMeet: GoogleCalendarEvent = {
  id: "evento456",
  summary: "Tarea personal",
  start: { date: "2024-02-01" },
  end: { date: "2024-02-01" }
};

const meetIdVacio = extractMeetId(eventoSinMeet);
console.log("Meet ID (evento sin Meet):", meetIdVacio); // null

const tieneMeet2 = hasMeetEnabled(eventoSinMeet);
console.log("¿Tiene Meet?:", tieneMeet2); // false

// Ejemplo 3: Uso en una función de procesamiento
async function procesarEventosConMeet(eventos: GoogleCalendarEvent[]) {
  const eventosConMeet = eventos.filter(evento => hasMeetEnabled(evento));
  
  console.log(`Encontrados ${eventosConMeet.length} eventos con Google Meet`);
  
  for (const evento of eventosConMeet) {
    const info = getMeetInfo(evento);
    if (info) {
      console.log(`
        Evento: ${evento.summary}
        Meet ID: ${info.meetId}
        URL: ${info.meetUrl}
        Tipo: ${info.conferenceType}
      `);
    }
  }
}

// Ejemplo 4: Manipular Meet ID en actualización de evento
async function actualizarEventoConMeetInfo(evento: GoogleCalendarEvent) {
  const meetInfo = getMeetInfo(evento);
  
  if (!meetInfo) {
    console.log("Este evento no tiene Google Meet");
    return;
  }
  
  // Añadir Meet ID a la descripción
  const nuevaDescripcion = `${evento.description || ''}

📹 Google Meet ID: ${meetInfo.meetId}
🔗 Enlace: ${meetInfo.meetUrl}`;
  
  // Aquí harías la llamada a la API para actualizar
  console.log("Nueva descripción:", nuevaDescripcion);
  
  // También podrías usar el Meet ID para otras operaciones
  // como logging, analytics, etc.
}

export { procesarEventosConMeet, actualizarEventoConMeetInfo };