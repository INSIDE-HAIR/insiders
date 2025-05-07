// Script para crear recordatorios para tareas pendientes y en progreso
// Ejecutar con: node create-reminders.js

const fetch = require("cross-fetch");

const pendingReminder = {
  status: "pending",
  frequency: "weekly",
  interval: 7, // Cada 7 días (semanal)
  emails: ["admin@insiders.com", "soporte@insiders.com"], // Ajustar según tus necesidades
  active: true,
};

const inProgressReminder = {
  status: "in-progress",
  frequency: "weekly",
  interval: 7, // Cada 7 días (semanal)
  emails: ["admin@insiders.com", "soporte@insiders.com"], // Ajustar según tus necesidades
  active: true,
};

async function createReminder(data) {
  try {
    const response = await fetch(
      "http://localhost:3000/api/drive/error-reminders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Error al crear recordatorio");
    }

    console.log(
      `Recordatorio para estado "${data.status}" creado exitosamente:`,
      result
    );
    return result;
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Crear ambos recordatorios
async function createBothReminders() {
  console.log("Creando recordatorio para tareas PENDIENTES...");
  await createReminder(pendingReminder);

  console.log("Creando recordatorio para tareas EN PROGRESO...");
  await createReminder(inProgressReminder);

  console.log("Proceso completado.");
}

createBothReminders();
