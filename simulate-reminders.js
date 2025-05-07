// Simulación de recordatorios para la gestión de errores
// Esta simulación muestra cómo se configurarían los recordatorios
// si la API estuviera funcionando correctamente

// Recordatorio semanal para errores PENDIENTES
const pendingReminder = {
  id: "sim_pending_123", // Simulado
  status: "pending",
  frequency: "weekly",
  interval: 7, // Cada 7 días
  emails: ["admin@insiders.com", "soporte@insiders.com"],
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Recordatorio semanal para errores EN PROGRESO
const inProgressReminder = {
  id: "sim_inprogress_456", // Simulado
  status: "in-progress",
  frequency: "weekly",
  interval: 7, // Cada 7 días
  emails: ["admin@insiders.com", "soporte@insiders.com", "dev@insiders.com"],
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Simular la creación
console.log("\n=== SIMULACIÓN DE CREACIÓN DE RECORDATORIOS ===\n");

console.log("✅ Recordatorio para errores PENDIENTES configurado:");
console.log(JSON.stringify(pendingReminder, null, 2));
console.log("\n");

console.log("✅ Recordatorio para errores EN PROGRESO configurado:");
console.log(JSON.stringify(inProgressReminder, null, 2));
console.log("\n");

// Explicar cómo sería el proceso de envío real
console.log("=== PROCESO DE NOTIFICACIÓN ===");
console.log("Con estos recordatorios configurados:");
console.log(
  "1. Cada 7 días, el sistema verificará los reportes con estado 'pending'"
);
console.log(
  "   → Enviará un correo a: admin@insiders.com, soporte@insiders.com"
);
console.log(
  "\n2. Cada 7 días, el sistema verificará los reportes con estado 'in-progress'"
);
console.log(
  "   → Enviará un correo a: admin@insiders.com, soporte@insiders.com, dev@insiders.com"
);
console.log(
  "\nEstos recordatorios se pueden configurar desde la pestaña 'Recordatorios'"
);
console.log("en la sección de Gestión de Errores en Archivos.");
