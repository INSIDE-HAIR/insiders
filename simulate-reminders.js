// Simulación de recordatorios para la gestión de errores
// Esta simulación muestra cómo se configurarían los recordatorios
// y cómo se enviarían a los usuarios asignados

// Recordatorio semanal para errores PENDIENTES
const pendingReminder = {
  id: "sim_pending_123", // Simulado
  status: "pending",
  frequency: "weekly",
  interval: 7, // Cada 7 días
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastSent: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // Hace 8 días
};

// Recordatorio semanal para errores EN PROGRESO
const inProgressReminder = {
  id: "sim_inprogress_456", // Simulado
  status: "in-progress",
  frequency: "weekly",
  interval: 7, // Cada 7 días
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastSent: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // Hace 6 días
};

// Simular reportes de errores
const errorReports = [
  {
    id: "sim_report_123",
    fileName: "A-A-2505-1109-01-01-01.jpg",
    status: "pending",
    assignedTo: ["user_1"], // ID del usuario asignado
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sim_report_456",
    fileName: "A-A-2505-0217-01-00-03.mp4",
    status: "in-progress",
    assignedTo: ["user_2", "user_3"], // IDs de los usuarios asignados
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sim_report_789",
    fileName: "archivo_general.pdf",
    status: "pending",
    assignedTo: [], // Sin usuarios asignados, usará la configuración general
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Simular usuarios
const users = [
  { id: "user_1", name: "Luis Sánchez", email: "luis@insiders.com" },
  { id: "user_2", name: "Ana Gómez", email: "ana@insiders.com" },
  { id: "user_3", name: "Carlos Pérez", email: "carlos@insiders.com" },
];

// Simular configuración general de destinatarios
const generalConfig = {
  id: "config_123",
  recipients: ["admin@insiders.com", "soporte@insiders.com"],
  ccRecipients: [],
  bccRecipients: [],
  active: true,
};

// Simular la creación
console.log("\n=== SIMULACIÓN DE RECORDATORIOS ===\n");

console.log("✅ Recordatorios configurados:");
console.log("1. Para reportes PENDIENTES: cada 7 días");
console.log("2. Para reportes EN PROGRESO: cada 7 días");
console.log("\n");

// Simular proceso de envío
console.log("=== PROCESO DE NOTIFICACIÓN ===");
console.log("Comprobando recordatorios que deberían ejecutarse...\n");

// Verificar pendingReminder
const lastSentPending = new Date(pendingReminder.lastSent);
const nextPendingDate = new Date(lastSentPending);
nextPendingDate.setDate(nextPendingDate.getDate() + pendingReminder.interval);

console.log(`📢 Recordatorio para reportes PENDIENTES:`);
console.log(
  `   Último envío: ${new Date(pendingReminder.lastSent).toLocaleDateString()}`
);
console.log(`   Próximo envío: ${nextPendingDate.toLocaleDateString()}`);
if (new Date() >= nextPendingDate) {
  console.log(`   Estado: DEBE EJECUTARSE AHORA ✓`);

  // Mostrar reportes que recibirían recordatorio
  const pendingReports = errorReports.filter((r) => r.status === "pending");
  console.log(`   Encontrados ${pendingReports.length} reportes pendientes:`);

  pendingReports.forEach((report) => {
    console.log(`   • ${report.fileName}`);

    // Determinar destinatarios
    const assignedUserIds = report.assignedTo || [];
    if (assignedUserIds.length > 0) {
      const assignedUsers = users.filter((u) => assignedUserIds.includes(u.id));
      console.log(
        `     → Enviar a usuarios asignados: ${assignedUsers
          .map((u) => u.email)
          .join(", ")}`
      );
    } else {
      console.log(
        `     → No hay usuarios asignados, se usará la configuración general:`
      );
      console.log(`     → Enviar a: ${generalConfig.recipients.join(", ")}`);
    }
  });
} else {
  console.log(
    `   Estado: Pendiente (${Math.ceil(
      (nextPendingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )} días restantes)`
  );
}

console.log("");

// Verificar inProgressReminder
const lastSentInProgress = new Date(inProgressReminder.lastSent);
const nextInProgressDate = new Date(lastSentInProgress);
nextInProgressDate.setDate(
  nextInProgressDate.getDate() + inProgressReminder.interval
);

console.log(`📢 Recordatorio para reportes EN PROGRESO:`);
console.log(
  `   Último envío: ${new Date(
    inProgressReminder.lastSent
  ).toLocaleDateString()}`
);
console.log(`   Próximo envío: ${nextInProgressDate.toLocaleDateString()}`);
if (new Date() >= nextInProgressDate) {
  console.log(`   Estado: DEBE EJECUTARSE AHORA ✓`);

  // Mostrar reportes que recibirían recordatorio
  const inProgressReports = errorReports.filter(
    (r) => r.status === "in-progress"
  );
  console.log(
    `   Encontrados ${inProgressReports.length} reportes en progreso:`
  );

  inProgressReports.forEach((report) => {
    console.log(`   • ${report.fileName}`);

    // Determinar destinatarios
    const assignedUserIds = report.assignedTo || [];
    if (assignedUserIds.length > 0) {
      const assignedUsers = users.filter((u) => assignedUserIds.includes(u.id));
      console.log(
        `     → Enviar a usuarios asignados: ${assignedUsers
          .map((u) => u.email)
          .join(", ")}`
      );
    } else {
      console.log(
        `     → No hay usuarios asignados, se usará la configuración general:`
      );
      console.log(`     → Enviar a: ${generalConfig.recipients.join(", ")}`);
    }
  });
} else {
  console.log(
    `   Estado: Pendiente (${Math.ceil(
      (nextInProgressDate.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    )} días restantes)`
  );
}

console.log("\n=== RECORDATORIO INMEDIATO ===");
console.log(
  "Ahora puedes enviar recordatorios inmediatos usando el botón de sobre"
);
console.log("en la tabla de reportes. Esto enviará un correo a los usuarios");
console.log(
  "asignados o a la configuración general si no hay usuarios asignados."
);
