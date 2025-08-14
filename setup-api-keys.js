#!/usr/bin/env node

/**
 * Script de configuración rápida para API Keys
 * Este script te ayuda a configurar y probar el sistema de API Keys
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Configuración rápida del sistema de API Keys\n");

// Verificar que estamos en el directorio correcto
if (!fs.existsSync("package.json")) {
  console.log(
    "❌ No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
  );
  process.exit(1);
}

// Verificar que existe el archivo de middleware
if (!fs.existsSync("src/middleware/api-key-auth.ts")) {
  console.log(
    "❌ No se encontró el archivo api-key-auth.ts. Asegúrate de que el middleware esté configurado."
  );
  process.exit(1);
}

console.log("✅ Archivos de configuración encontrados");

// Función para ejecutar comandos
function runCommand(command, description) {
  try {
    console.log(`\n📋 ${description}...`);
    const result = execSync(command, { encoding: "utf8", stdio: "pipe" });
    console.log("✅ Completado");
    return result;
  } catch (error) {
    console.log("❌ Error:", error.message);
    return null;
  }
}

// Función para generar un userId de ejemplo
function generateExampleUserId() {
  return (
    "clm_" +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

async function setup() {
  console.log("\n🔧 Configurando sistema de API Keys...\n");

  // 1. Verificar que Prisma esté configurado
  console.log("1️⃣ Verificando configuración de Prisma...");
  if (!fs.existsSync("prisma/schema/api-keys.prisma")) {
    console.log(
      "❌ No se encontró el esquema de API Keys. Asegúrate de que esté configurado."
    );
    return;
  }
  console.log("✅ Esquema de API Keys encontrado");

  // 2. Generar Prisma client si es necesario
  runCommand("npx prisma generate", "Generando cliente de Prisma");

  // 3. Verificar conexión a la base de datos
  console.log("\n2️⃣ Verificando conexión a la base de datos...");
  try {
    execSync("npx prisma db push --accept-data-loss", { stdio: "pipe" });
    console.log("✅ Base de datos configurada");
  } catch (error) {
    console.log("❌ Error configurando base de datos:", error.message);
    console.log(
      "💡 Asegúrate de que tu base de datos esté configurada correctamente"
    );
    return;
  }

  // 4. Generar una API Key de ejemplo
  console.log("\n3️⃣ Generando API Key de ejemplo...");
  const exampleUserId = generateExampleUserId();
  const apiKeyResult = runCommand(
    `npm run generate-api-key ${exampleUserId} "API Key de Ejemplo"`,
    "Generando API Key de ejemplo"
  );

  if (!apiKeyResult) {
    console.log("❌ No se pudo generar la API Key. Verifica la configuración.");
    return;
  }

  // Extraer la API Key del resultado
  const apiKeyMatch = apiKeyResult.match(/API Key: (ak_dev_[a-zA-Z0-9]{32})/);
  if (!apiKeyMatch) {
    console.log("❌ No se pudo extraer la API Key del resultado.");
    return;
  }

  const apiKey = apiKeyMatch[1];
  console.log(`✅ API Key generada: ${apiKey}`);

  // 5. Crear archivo de configuración de ejemplo
  console.log("\n4️⃣ Creando archivo de configuración de ejemplo...");
  const configContent = `# Configuración de API Keys - Ejemplo
# Este archivo contiene la configuración para probar el sistema de API Keys

# API Key de ejemplo generada
API_KEY=${apiKey}

# Usuario de ejemplo
USER_ID=${exampleUserId}

# URL base (cambia según tu configuración)
BASE_URL=http://localhost:3000

# Comandos de ejemplo para probar:
# 
# 1. Probar la API Key:
#    npm run test-api-key ${apiKey}
#
# 2. Listar API Keys del usuario:
#    npm run list-api-keys ${exampleUserId}
#
# 3. Probar con curl:
#    curl -H "Authorization: Bearer ${apiKey}" ${BASE_URL}/api/v1/auth/test
#
# 4. Probar con X-API-Key header:
#    curl -H "X-API-Key: ${apiKey}" ${BASE_URL}/api/v1/auth/test
`;

  fs.writeFileSync("api-keys-config.env", configContent);
  console.log("✅ Archivo de configuración creado: api-keys-config.env");

  // 6. Mostrar información de prueba
  console.log("\n🎉 Configuración completada!\n");
  console.log("📋 Información de prueba:");
  console.log(`   API Key: ${apiKey}`);
  console.log(`   Usuario ID: ${exampleUserId}`);
  console.log(`   URL de prueba: http://localhost:3000/api/v1/auth/test`);
  console.log("");

  console.log("🧪 Para probar el sistema:");
  console.log(`   1. npm run test-api-key ${apiKey}`);
  console.log(
    `   2. curl -H "Authorization: Bearer ${apiKey}" http://localhost:3000/api/v1/auth/test`
  );
  console.log(
    `   3. curl -H "X-API-Key: ${apiKey}" http://localhost:3000/api/v1/auth/test`
  );
  console.log("");

  console.log("📚 Documentación completa: API_KEYS_SETUP.md");
  console.log("");

  console.log(
    "🚀 ¡Listo para usar! El middleware protegerá automáticamente las rutas configuradas."
  );
}

// Ejecutar configuración
setup().catch((error) => {
  console.error("❌ Error durante la configuración:", error);
  process.exit(1);
});
