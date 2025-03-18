const fetch = require("node-fetch");

// Lista de rutas a probar
const routes = [
  "/api/marketing-salon-drive/2025/january/insiders/cards",
  "/api/marketing-salon-drive/folders",
  "/api/test-folders",
  "/api/drive-folders",
];

async function testRoutes() {
  console.log("Probando rutas API...");

  for (const route of routes) {
    try {
      console.log(`\nProbando ruta: ${route}`);
      const response = await fetch(`http://localhost:3000${route}`);
      const status = response.status;

      console.log(`Status: ${status}`);

      if (response.ok) {
        console.log("Resultado: ✅ Ruta funciona correctamente");
        try {
          const data = await response.json();
          console.log(
            "Respuesta:",
            JSON.stringify(data, null, 2).substring(0, 200) + "..."
          );
        } catch (e) {
          console.log("Error al parsear JSON:", e.message);
        }
      } else {
        console.log(`Resultado: ❌ Error ${status}`);
      }
    } catch (error) {
      console.error(`Error al probar ${route}:`, error.message);
    }
  }
}

testRoutes();
