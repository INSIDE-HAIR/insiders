#!/usr/bin/env node

const crypto = require("crypto");

const apiKey = "ak_dev_172c35f21f3aee4ac602327df99f31ee";

console.log("🔍 Comparando métodos de hash para:", apiKey);
console.log("");

// Método 1: Node.js crypto (usado en el script de generación)
const hash1 = crypto.createHash("sha256").update(apiKey).digest("hex");
console.log("1️⃣ Node.js crypto SHA256:", hash1);

// Método 2: Node.js crypto con encoding específico
const hash2 = crypto.createHash("sha256").update(apiKey, "utf8").digest("hex");
console.log("2️⃣ Node.js crypto SHA256 (utf8):", hash2);

// Método 3: Buffer directo
const buffer = Buffer.from(apiKey, "utf8");
const hash3 = crypto.createHash("sha256").update(buffer).digest("hex");
console.log("3️⃣ Buffer directo SHA256:", hash3);

// Método 4: Con salt o encoding diferente
const hash4 = crypto.createHash("sha256").update(apiKey, "ascii").digest("hex");
console.log("4️⃣ Node.js crypto SHA256 (ascii):", hash4);

console.log("");
console.log("🔍 Hash esperado (del script de debug):");
console.log(
  "   277ddc3d2b30e26f2b14ac062df6fd07d121ca5e10c7781b860f00abb7a2fe7d"
);
console.log("");

// Verificar cuál coincide
const expectedHash =
  "277ddc3d2b30e26f2b14ac062df6fd07d121ca5e10c7781b860f00abb7a2fe7d";

console.log("✅ Coincidencias:");
console.log("   Hash 1:", hash1 === expectedHash ? "✅" : "❌");
console.log("   Hash 2:", hash2 === expectedHash ? "✅" : "❌");
console.log("   Hash 3:", hash3 === expectedHash ? "✅" : "❌");
console.log("   Hash 4:", hash4 === expectedHash ? "✅" : "❌");
