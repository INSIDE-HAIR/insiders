import { NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleDriveService } from "@/src/features/drive/services/drive/GoogleDriveService";
import { z } from "zod";

const uploadSchema = z.object({
  folderId: z.string().min(1, "Folder ID is required"),
  files: z
    .array(
      z.object({
        name: z.string().min(1, "File name is required"),
        data: z.string(), // Base64 encoded file data
        mimeType: z.string().min(1, "MIME type is required"),
        size: z.number().positive("File size must be positive"),
      })
    )
    .min(1, "At least one file is required"),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Solo admins pueden subir archivos
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log("Upload request received:", {
      folderId: body.folderId,
      filesCount: body.files?.length || 0,
      fileNames:
        body.files?.map((f: any) => ({
          name: f.name,
          size: f.size,
          mimeType: f.mimeType,
        })) || [],
    });

    const validationResult = uploadSchema.safeParse(body);

    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.errors);
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.errors,
          receivedBody: body,
        },
        { status: 400 }
      );
    }

    const { folderId, files } = validationResult.data;

    // Inicializar Google Drive service
    const driveService = new GoogleDriveService();
    await driveService.initialize();

    // Verificar que la carpeta existe
    try {
      const folderInfo = await driveService.getFolder(folderId);
      console.log("Folder verification successful:", {
        id: folderInfo.id,
        name: folderInfo.name,
        mimeType: folderInfo.mimeType,
      });
    } catch (error) {
      console.error("Folder verification failed:", error);
      return NextResponse.json(
        {
          error: "Folder not found or inaccessible",
          folderId: folderId,
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 404 }
      );
    }

    const uploadResults = [];
    const errors = [];

    // Procesar cada archivo
    for (const [index, fileData] of files.entries()) {
      try {
        // Convertir datos base64 a buffer
        const buffer = Buffer.from(fileData.data, "base64");

        // Crear objeto File para el servicio
        const file = new File([buffer], fileData.name, {
          type: fileData.mimeType,
        });

        // Subir archivo a Google Drive
        console.log(
          `Starting upload of file: ${fileData.name} (${fileData.size} bytes, ${fileData.mimeType})`
        );

        const uploadedFile = await driveService.uploadFile(file, {
          parentId: folderId,
          description: `Uploaded via Drive Manager on ${new Date().toISOString()}`,
        });

        console.log("Successfully uploaded file:", {
          id: uploadedFile.id,
          name: uploadedFile.name,
          size: uploadedFile.size,
          mimeType: uploadedFile.mimeType,
          webViewLink: uploadedFile.webViewLink,
        });

        uploadResults.push({
          index,
          success: true,
          file: uploadedFile,
          originalName: fileData.name,
        });
      } catch (error) {
        console.error(`Error uploading file ${fileData.name}:`, {
          error: error instanceof Error ? error.message : "Upload failed",
          stack: error instanceof Error ? error.stack : undefined,
          fileName: fileData.name,
          fileSize: fileData.size,
          mimeType: fileData.mimeType,
          folderId: folderId,
        });

        errors.push({
          index,
          fileName: fileData.name,
          error: error instanceof Error ? error.message : "Upload failed",
        });
      }
    }

    // Respuesta con resultados
    const response = {
      success: uploadResults.length > 0,
      uploadedFiles: uploadResults,
      errors: errors,
      summary: {
        total: files.length,
        successful: uploadResults.length,
        failed: errors.length,
      },
    };

    // Status code basado en resultados
    const statusCode =
      errors.length === 0
        ? 200
        : uploadResults.length > 0
        ? 207 // Partial success
        : 400; // All failed

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    console.error("Error in drive upload:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
