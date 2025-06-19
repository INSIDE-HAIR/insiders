import { NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
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
    console.log("Test upload request body:", JSON.stringify(body, null, 2));

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

    // Simular delay de upload
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const uploadResults = [];

    // Simular upload exitoso para todos los archivos
    for (const [index, fileData] of files.entries()) {
      const simulatedFile = {
        id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: fileData.name,
        mimeType: fileData.mimeType,
        size: fileData.size,
        parents: [folderId],
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
        webViewLink: `https://drive.google.com/file/d/test-${index}/view`,
      };

      uploadResults.push({
        index,
        success: true,
        file: simulatedFile,
        originalName: fileData.name,
      });
    }

    // Respuesta exitosa
    const response = {
      success: true,
      uploadedFiles: uploadResults,
      errors: [],
      summary: {
        total: files.length,
        successful: uploadResults.length,
        failed: 0,
      },
      message: "Test upload completed successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in test upload:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
