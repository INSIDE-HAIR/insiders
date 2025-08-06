#!/usr/bin/env node

// Cargar variables de entorno
require("dotenv").config({ path: ".env.local" });

const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function debugApiKey(apiKey) {
  try {
    console.log("🔍 Debuggeando API Key:", apiKey);

    // Hash de la clave para buscarla en BD
    const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
    console.log("🔍 Hash de la API Key:", keyHash);

    // Buscar en base de datos
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { keyHash },
      select: {
        id: true,
        name: true,
        status: true,
        expiresAt: true,
        userId: true,
        totalRequests: true,
        lastUsedAt: true,
      },
    });

    if (!apiKeyRecord) {
      console.log("❌ API Key no encontrada en la base de datos");
      return false;
    }

    console.log("✅ API Key encontrada:", apiKeyRecord);

    // Verificar estado
    if (apiKeyRecord.status !== "ACTIVE") {
      console.log(`❌ API Key está ${apiKeyRecord.status.toLowerCase()}`);
      return false;
    }

    // Verificar expiración
    if (apiKeyRecord.expiresAt && new Date() > apiKeyRecord.expiresAt) {
      console.log("❌ API Key ha expirado");
      return false;
    }

    console.log("✅ API Key válida");
    return true;
  } catch (error) {
    console.error("❌ Error debuggeando API Key:", error);
    return false;
  }
}

async function main() {
  const apiKey = process.argv[2];

  if (!apiKey) {
    console.log("❌ Debes proporcionar una API Key");
    console.log("Uso: node debug-api-key.js <api_key>");
    process.exit(1);
  }

  try {
    const isValid = await debugApiKey(apiKey);
    console.log("\n🎯 Resultado:", isValid ? "✅ VÁLIDA" : "❌ INVÁLIDA");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
