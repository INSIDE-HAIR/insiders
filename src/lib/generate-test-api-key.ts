import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Genera una API Key de prueba para desarrollo
 */
export async function generateTestApiKey(
  userId: string,
  name: string = "Test API Key"
) {
  try {
    // Generar clave aleatoria
    const randomBytes = crypto.randomBytes(16);
    const apiKey = `ak_dev_${randomBytes.toString("hex")}`;

    // Hash de la clave para almacenamiento seguro
    const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

    // Prefijo para mostrar
    const keyPrefix = apiKey.substring(0, 12) + "...";

    // Crear en base de datos
    const apiKeyRecord = await prisma.apiKey.create({
      data: {
        name,
        keyHash,
        keyPrefix,
        status: "ACTIVE",
        userId,
        totalRequests: 0,
        expiresAt: null, // Nunca expira para pruebas
      },
    });

    console.log("✅ API Key generada exitosamente:");
    console.log("ID:", apiKeyRecord.id);
    console.log("Nombre:", apiKeyRecord.name);
    console.log("API Key:", apiKey);
    console.log("Prefijo:", keyPrefix);
    console.log("\n📝 Para usar en requests:");
    console.log("Header: Authorization: Bearer " + apiKey);
    console.log("Header: X-API-Key: " + apiKey);
    console.log("Query: ?api_key=" + apiKey);

    return {
      id: apiKeyRecord.id,
      apiKey,
      keyPrefix,
      name: apiKeyRecord.name,
    };
  } catch (error) {
    console.error("❌ Error generando API Key:", error);
    throw error;
  }
}

/**
 * Lista todas las API Keys de un usuario
 */
export async function listUserApiKeys(userId: string) {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        status: true,
        totalRequests: true,
        lastUsedAt: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("📋 API Keys del usuario:", userId);
    apiKeys.forEach((key) => {
      console.log(`- ${key.name} (${key.status}): ${key.keyPrefix}`);
    });

    return apiKeys;
  } catch (error) {
    console.error("❌ Error listando API Keys:", error);
    throw error;
  }
}

/**
 * Revoca una API Key
 */
export async function revokeApiKey(keyId: string) {
  try {
    await prisma.apiKey.update({
      where: { id: keyId },
      data: { status: "REVOKED" },
    });

    console.log("✅ API Key revocada:", keyId);
  } catch (error) {
    console.error("❌ Error revocando API Key:", error);
    throw error;
  }
}

/**
 * Script para ejecutar desde línea de comandos
 */
if (require.main === module) {
  const command = process.argv[2];
  const userId = process.argv[3];
  const name = process.argv[4] || "Test API Key";

  async function main() {
    try {
      switch (command) {
        case "generate":
          if (!userId) {
            console.error("❌ Debes proporcionar un userId");
            console.log("Uso: npm run generate-api-key <userId> [name]");
            process.exit(1);
          }
          await generateTestApiKey(userId, name);
          break;

        case "list":
          if (!userId) {
            console.error("❌ Debes proporcionar un userId");
            console.log("Uso: npm run list-api-keys <userId>");
            process.exit(1);
          }
          await listUserApiKeys(userId);
          break;

        case "revoke":
          if (!userId) {
            console.error("❌ Debes proporcionar un keyId");
            console.log("Uso: npm run revoke-api-key <keyId>");
            process.exit(1);
          }
          await revokeApiKey(userId); // userId aquí es el keyId
          break;

        default:
          console.log("Comandos disponibles:");
          console.log("  generate <userId> [name] - Genera una nueva API Key");
          console.log("  list <userId> - Lista las API Keys de un usuario");
          console.log("  revoke <keyId> - Revoca una API Key");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  }

  main();
}
