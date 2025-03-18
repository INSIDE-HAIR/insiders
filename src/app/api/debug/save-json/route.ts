import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { filename, content } = data;

    // Validación básica
    if (!filename || !content) {
      return NextResponse.json(
        { success: false, error: "Filename and content are required" },
        { status: 400 }
      );
    }

    // Asegurar que el nombre del archivo sea seguro
    const safeName = filename.replace(/[^a-z0-9_-]/gi, "_");

    // Construir la ruta para guardar el archivo
    const filePath = path.join(process.cwd(), "debug_files");

    // Crear el directorio si no existe
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true });
    }

    // Ruta completa al archivo
    const fullPath = path.join(filePath, `${safeName}.json`);

    // Guardar el contenido
    fs.writeFileSync(fullPath, JSON.stringify(content, null, 2));

    return NextResponse.json({
      success: true,
      path: fullPath,
      message: `JSON saved to ${fullPath}`,
    });
  } catch (error) {
    console.error("Error saving JSON:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
