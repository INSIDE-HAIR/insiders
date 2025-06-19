import { NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleDriveService } from "@/src/features/drive/services/drive/GoogleDriveService";
import { z } from "zod";

const deleteSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
});

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Solo admins pueden eliminar archivos
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log("Delete request received:", body);

    const validationResult = deleteSchema.safeParse(body);

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

    const { fileId } = validationResult.data;

    // Inicializar Google Drive service
    const driveService = new GoogleDriveService();
    await driveService.initialize();

    // Eliminar el archivo (el service ahora maneja la lógica de mover a la papelera)
    try {
      const deleteResult = await driveService.deleteFile(fileId);

      console.log("File deletion result:", deleteResult);

      if (!deleteResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: deleteResult.message,
            fileId: fileId,
            alreadyDeleted: deleteResult.alreadyDeleted,
          },
          { status: 404 }
        );
      }

      // Éxito - archivo movido a la papelera o ya estaba allí
      return NextResponse.json({
        success: true,
        message: deleteResult.message,
        alreadyDeleted: deleteResult.alreadyDeleted,
        deletedFile: {
          id: fileId,
          name: deleteResult.fileInfo?.name || "Unknown",
          mimeType: deleteResult.fileInfo?.mimeType || "Unknown",
        },
      });
    } catch (error) {
      console.error("Error moving file to trash:", error);

      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        if (
          errorMessage.includes("permission") ||
          errorMessage.includes("forbidden")
        ) {
          return NextResponse.json(
            { error: "Permission denied to move this file to trash" },
            { status: 403 }
          );
        }
      }

      return NextResponse.json(
        {
          error: "Failed to move file to trash",
          details: error instanceof Error ? error.message : "Unknown error",
          fileId: fileId,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in delete endpoint:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
