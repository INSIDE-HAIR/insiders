import { NextRequest, NextResponse } from "next/server";
import { CodeService } from "@/src/features/drive/utils/marketing-salon/file-decoder-service";

// POST - Importar todos los códigos estáticos a la base de datos
export async function POST(request: NextRequest) {
  try {
    // TODO: Implementar autenticación

    // Importar todos los códigos estáticos
    await CodeService.importAllStaticCodes();

    return NextResponse.json({
      success: true,
      message: "Códigos importados correctamente",
    });
  } catch (error) {
    console.error("Error al importar códigos:", error);
    return NextResponse.json(
      {
        error: "Error al importar códigos",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
 