import { NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleDriveService } from "@/src/features/drive/services/drive/GoogleDriveService";
import { z } from "zod";

const renameSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  newName: z.string().min(1, "New name is required").max(255, "Name too long"),
});

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Solo admins pueden renombrar archivos
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log("Rename request received:", body);

    const validationResult = renameSchema.safeParse(body);

    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.errors);
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { fileId, newName } = validationResult.data;

    // Inicializar Google Drive service
    const driveService = new GoogleDriveService();
    await driveService.initialize();

    // Verificar que el archivo existe antes de renombrar
    let fileInfo;
    try {
      // Intentar obtener como carpeta primero, luego como archivo si falla
      try {
        fileInfo = await driveService.getFolder(fileId);
      } catch {
        // Si no es una carpeta, usar el método general de files.get
        const response = await driveService.drive.files.get({
          fileId,
          fields: "id, name, mimeType",
          supportsAllDrives: true,
        });
        fileInfo = response.data;
      }
    } catch (error) {
      console.error("File verification failed:", error);
      return NextResponse.json(
        {
          error: "File not found or inaccessible",
          fileId: fileId,
        },
        { status: 404 }
      );
    }

    // Renombrar el archivo
    try {
      const renamedFile = await driveService.renameFile(fileId, newName);

      console.log("File renamed successfully:", {
        id: renamedFile.id,
        oldName: "unknown", // No tenemos el nombre anterior en este contexto
        newName: renamedFile.name,
      });

      return NextResponse.json({
        success: true,
        file: renamedFile,
        message: "File renamed successfully",
      });
    } catch (error) {
      console.error("Error renaming file:", error);

      // Determinar el tipo de error y devolver respuesta apropiada
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          return NextResponse.json(
            { error: "File not found" },
            { status: 404 }
          );
        }
        if (error.message.includes("permission")) {
          return NextResponse.json(
            { error: "Permission denied" },
            { status: 403 }
          );
        }
      }

      return NextResponse.json(
        {
          error: "Failed to rename file",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in rename endpoint:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
