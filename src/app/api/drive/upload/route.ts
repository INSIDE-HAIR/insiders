import { NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleDriveService } from "@/src/features/drive/services/drive/GoogleDriveService";
import { z } from "zod";

// Configuración para archivos grandes - siguiendo mejores prácticas de Vercel
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutos para uploads grandes
export const runtime = "nodejs"; // Optimal para procesamiento de archivos

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
  const startTime = Date.now();

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

    // Optimización siguiendo mejores prácticas de Vercel para parsing de JSON
    let body;
    try {
      // Para archivos pequeños, limitar el uso de memoria parseando de forma controlada
      const contentLength = request.headers.get("content-length");
      const maxJsonSize = 50 * 1024 * 1024; // 50MB max para JSON (base64 overhead)
      
      if (contentLength && parseInt(contentLength) > maxJsonSize) {
        return NextResponse.json(
          { error: "Request too large for JSON upload. Use resumable upload for large files." },
          { status: 413 }
        );
      }
      
      body = await request.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    console.log("Upload request received:", {
      folderId: body.folderId,
      filesCount: body.files?.length || 0,
      totalSize:
        body.files?.reduce((sum: number, f: any) => sum + (f.size || 0), 0) ||
        0,
      fileNames:
        body.files?.map((f: any) => ({
          name: f.name,
          size: f.size,
          mimeType: f.mimeType,
          sizeInMB: f.size ? (f.size / (1024 * 1024)).toFixed(2) : "0",
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

    // Verificar límites de tamaño
    const maxFileSize = 100 * 1024 * 1024; // 100MB por archivo
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const maxTotalSize = 500 * 1024 * 1024; // 500MB total por request

    for (const file of files) {
      if (file.size > maxFileSize) {
        return NextResponse.json(
          {
            error: `File "${file.name}" is too large (${(
              file.size /
              (1024 * 1024)
            ).toFixed(1)}MB). Maximum file size is 100MB.`,
            fileSize: file.size,
            maxSize: maxFileSize,
          },
          { status: 413 }
        );
      }
    }

    if (totalSize > maxTotalSize) {
      return NextResponse.json(
        {
          error: `Total upload size is too large (${(
            totalSize /
            (1024 * 1024)
          ).toFixed(1)}MB). Maximum total size is 500MB.`,
          totalSize: totalSize,
          maxTotalSize: maxTotalSize,
        },
        { status: 413 }
      );
    }

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

    // Procesar cada archivo de forma secuencial para optimizar memoria
    // Siguiendo mejores prácticas de Vercel para streaming y chunks
    for (const [index, fileData] of files.entries()) {
      const fileStartTime = Date.now();

      try {
        console.log(
          `[${index + 1}/${files.length}] Starting upload: ${fileData.name} (${(
            fileData.size /
            (1024 * 1024)
          ).toFixed(2)}MB)`
        );

        // Convertir datos base64 a buffer de forma controlada
        // Evitando cargar todo en memoria de una vez
        let buffer: Buffer;
        try {
          buffer = Buffer.from(fileData.data, "base64");
        } catch (bufferError) {
          throw new Error(`Failed to decode base64 data for ${fileData.name}: buffer too large or corrupted`);
        }

        // Verificar que el buffer tiene el tamaño esperado
        if (buffer.length !== fileData.size) {
          console.warn(
            `Buffer size mismatch for ${fileData.name}: expected ${fileData.size}, got ${buffer.length}`
          );
        }

        // Crear objeto File para el servicio
        const file = new File([buffer], fileData.name, {
          type: fileData.mimeType,
        });

        // Subir archivo a Google Drive con logging mejorado
        const uploadedFile = await driveService.uploadFile(file, {
          parentId: folderId,
          description: `Uploaded via Drive Manager on ${new Date().toISOString()}`,
        });

        const fileEndTime = Date.now();
        const fileUploadTime = fileEndTime - fileStartTime;

        console.log(`[${index + 1}/${files.length}] Upload successful:`, {
          id: uploadedFile.id,
          name: uploadedFile.name,
          size: uploadedFile.size,
          mimeType: uploadedFile.mimeType,
          webViewLink: uploadedFile.webViewLink,
          uploadTimeMs: fileUploadTime,
          uploadTimeSeconds: (fileUploadTime / 1000).toFixed(2),
          speedMBps:
            fileData.size > 0
              ? (
                  fileData.size /
                  (1024 * 1024) /
                  (fileUploadTime / 1000)
                ).toFixed(2)
              : "0",
        });

        uploadResults.push({
          index,
          success: true,
          file: uploadedFile,
          originalName: fileData.name,
          uploadTimeMs: fileUploadTime,
        });

        // Liberar memoria explícitamente siguiendo mejores prácticas de Vercel
        buffer = null as any;
        
        // Sugerir garbage collection para archivos grandes
        if (fileData.size > 1024 * 1024 && global.gc) {
          global.gc();
        }
      } catch (error) {
        const fileEndTime = Date.now();
        const fileUploadTime = fileEndTime - fileStartTime;

        console.error(
          `[${index + 1}/${files.length}] Upload failed for ${fileData.name}:`,
          {
            error: error instanceof Error ? error.message : "Upload failed",
            stack: error instanceof Error ? error.stack : undefined,
            fileName: fileData.name,
            fileSize: fileData.size,
            fileSizeMB: (fileData.size / (1024 * 1024)).toFixed(2),
            mimeType: fileData.mimeType,
            folderId: folderId,
            uploadTimeMs: fileUploadTime,
            base64Length: fileData.data.length,
          }
        );

        let errorMessage =
          error instanceof Error ? error.message : "Upload failed";

        // Proporcionar mensajes de error más específicos
        if (error instanceof Error) {
          if (
            error.message.includes("413") ||
            error.message.includes("too large")
          ) {
            errorMessage = `File too large: ${fileData.name} (${(
              fileData.size /
              (1024 * 1024)
            ).toFixed(1)}MB)`;
          } else if (
            error.message.includes("timeout") ||
            error.message.includes("ETIMEDOUT")
          ) {
            errorMessage = `Upload timeout for large file: ${fileData.name}`;
          } else if (
            error.message.includes("quota") ||
            error.message.includes("limit")
          ) {
            errorMessage = `Google Drive quota exceeded while uploading: ${fileData.name}`;
          } else if (
            error.message.includes("permission") ||
            error.message.includes("forbidden")
          ) {
            errorMessage = `Permission denied for upload: ${fileData.name}`;
          }
        }

        errors.push({
          index,
          fileName: fileData.name,
          fileSize: fileData.size,
          error: errorMessage,
          uploadTimeMs: fileUploadTime,
        });
      }
    }

    const endTime = Date.now();
    const totalUploadTime = endTime - startTime;

    // Respuesta con resultados y estadísticas
    const response = {
      success: uploadResults.length > 0,
      uploadedFiles: uploadResults,
      errors: errors,
      summary: {
        total: files.length,
        successful: uploadResults.length,
        failed: errors.length,
        totalUploadTimeMs: totalUploadTime,
        totalUploadTimeSeconds: (totalUploadTime / 1000).toFixed(2),
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        averageSpeedMBps:
          totalSize > 0
            ? (totalSize / (1024 * 1024) / (totalUploadTime / 1000)).toFixed(2)
            : "0",
      },
      timestamp: new Date().toISOString(),
    };

    console.log("Upload batch completed:", {
      successful: uploadResults.length,
      failed: errors.length,
      totalTimeSeconds: (totalUploadTime / 1000).toFixed(2),
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    });

    // Status code basado en resultados
    const statusCode =
      errors.length === 0
        ? 200
        : uploadResults.length > 0
        ? 207 // Partial success
        : 400; // All failed

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.error("Critical error in drive upload:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      totalTimeMs: totalTime,
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        processingTimeMs: totalTime,
      },
      { status: 500 }
    );
  }
}
