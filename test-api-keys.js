#!/usr/bin/env node

/**
 * Script de prueba para API Keys
 * Uso: node test-api-keys.js <api_key>
 */

const API_KEY = process.argv[2];
const BASE_URL = "http://localhost:3000";

if (!API_KEY) {
  console.log("❌ Debes proporcionar una API Key");
  console.log("Uso: node test-api-keys.js <api_key>");
  console.log(
    "Ejemplo: node test-api-keys.js ak_dev_abc123def456ghi789jkl012mno345pqr678"
  );
  process.exit(1);
}

console.log("🧪 Probando API Keys...\n");

// Función para hacer requests
async function testRequest(method, url, headers = {}, body = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    return {
      status: response.status,
      data,
      success: response.ok,
    };
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      success: false,
    };
  }
}

// Función para mostrar resultados
function showResult(testName, result) {
  console.log(`📋 ${testName}:`);
  console.log(`   Status: ${result.status}`);
  console.log(`   Success: ${result.success ? "✅" : "❌"}`);
  console.log(`   Response:`, JSON.stringify(result.data, null, 2));
  console.log("");
}

async function runTests() {
  console.log("🔑 API Key:", API_KEY);
  console.log("🌐 Base URL:", BASE_URL);
  console.log("");

  // Test 1: Sin API Key (debe fallar)
  console.log("1️⃣ Probando sin API Key...");
  const noKeyResult = await testRequest("GET", `${BASE_URL}/api/v1/auth/test`);
  showResult("Sin API Key", noKeyResult);

  // Test 2: Con Authorization Bearer
  console.log("2️⃣ Probando con Authorization Bearer...");
  const bearerResult = await testRequest(
    "GET",
    `${BASE_URL}/api/v1/auth/test`,
    {
      Authorization: `Bearer ${API_KEY}`,
    }
  );
  showResult("Authorization Bearer", bearerResult);

  // Test 3: Con X-API-Key header
  console.log("3️⃣ Probando con X-API-Key header...");
  const xApiKeyResult = await testRequest(
    "GET",
    `${BASE_URL}/api/v1/auth/test`,
    {
      "X-API-Key": API_KEY,
    }
  );
  showResult("X-API-Key Header", xApiKeyResult);

  // Test 4: Con query parameter
  console.log("4️⃣ Probando con query parameter...");
  const queryResult = await testRequest(
    "GET",
    `${BASE_URL}/api/v1/auth/test?api_key=${API_KEY}`
  );
  showResult("Query Parameter", queryResult);

  // Test 5: POST request con Authorization Bearer
  console.log("5️⃣ Probando POST con Authorization Bearer...");
  const postResult = await testRequest(
    "POST",
    `${BASE_URL}/api/v1/auth/test`,
    {
      Authorization: `Bearer ${API_KEY}`,
    },
    {
      test: "data",
      timestamp: new Date().toISOString(),
    }
  );
  showResult("POST Request", postResult);

  // Test 6: Ruta protegida que no existe
  console.log("6️⃣ Probando ruta protegida inexistente...");
  const notFoundResult = await testRequest(
    "GET",
    `${BASE_URL}/api/v1/auth/test/not-found`,
    {
      Authorization: `Bearer ${API_KEY}`,
    }
  );
  showResult("Ruta Inexistente", notFoundResult);

  // Test 7: Ruta no protegida
  console.log("7️⃣ Probando ruta no protegida...");
  const publicResult = await testRequest(
    "GET",
    `${BASE_URL}/api/v1/auth/debug`
  );
  showResult("Ruta Pública", publicResult);

  console.log("🎉 Pruebas completadas!");
}

// Función para probar con curl commands
function showCurlCommands() {
  console.log("\n📝 Comandos curl equivalentes:");
  console.log("");
  console.log("# GET con Authorization Bearer");
  console.log(`curl -H "Authorization: Bearer ${API_KEY}" \\`);
  console.log(`     ${BASE_URL}/api/v1/auth/test`);
  console.log("");
  console.log("# GET con X-API-Key header");
  console.log(`curl -H "X-API-Key: ${API_KEY}" \\`);
  console.log(`     ${BASE_URL}/api/v1/auth/test`);
  console.log("");
  console.log("# POST con Authorization Bearer");
  console.log(`curl -X POST \\`);
  console.log(`     -H "Authorization: Bearer ${API_KEY}" \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"test": "data"}' \\`);
  console.log(`     ${BASE_URL}/api/v1/auth/test`);
  console.log("");
  console.log("# GET con query parameter");
  console.log(`curl "${BASE_URL}/api/v1/auth/test?api_key=${API_KEY}"`);
}

// Ejecutar pruebas
runTests()
  .then(() => {
    showCurlCommands();
  })
  .catch((error) => {
    console.error("❌ Error ejecutando pruebas:", error);
    process.exit(1);
  });
