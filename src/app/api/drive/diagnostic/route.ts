import { NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import { GoogleDriveService } from "@/src/features/drive/services/drive/GoogleDriveService";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Solo admins pueden usar el diagnóstico
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const diagnosticResults = [];
    const folderId =
      process.env.NEXT_PUBLIC_GOOGLE_DRIVE_ROOT_FOLDER_ID ||
      "19wn0b3uaOT81NVxQARXLht8Nbukn-0u_";

    // Test 1: Verificar variables de entorno
    diagnosticResults.push({
      test: "Environment Variables",
      status: "running",
    });

    const envVars = {
      GOOGLE_DRIVE_CLIENT_EMAIL: !!process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      GOOGLE_DRIVE_PRIVATE_KEY: !!process.env.GOOGLE_DRIVE_PRIVATE_KEY,
      GOOGLE_DRIVE_PROJECT_ID: !!process.env.GOOGLE_DRIVE_PROJECT_ID,
      CLIENT_EMAIL_VALUE:
        process.env.GOOGLE_DRIVE_CLIENT_EMAIL?.substring(0, 20) + "...",
      PROJECT_ID_VALUE: process.env.GOOGLE_DRIVE_PROJECT_ID,
      PRIVATE_KEY_LENGTH: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.length || 0,
    };

    diagnosticResults[0] = {
      test: "Environment Variables",
      status: Object.values(envVars).slice(0, 3).every(Boolean)
        ? "pass"
        : "fail",
      details: envVars,
    };

    // Test 2: Inicializar servicio
    diagnosticResults.push({
      test: "Google Drive Service Initialization",
      status: "running",
    });

    let driveService;
    try {
      driveService = new GoogleDriveService();
      await driveService.initialize();

      diagnosticResults[1] = {
        test: "Google Drive Service Initialization",
        status: "pass",
        details: "Service initialized successfully",
      };
    } catch (error) {
      diagnosticResults[1] = {
        test: "Google Drive Service Initialization",
        status: "fail",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      };

      return NextResponse.json({
        success: false,
        diagnostics: diagnosticResults,
      });
    }

    // Test 3: Verificar acceso a carpeta
    diagnosticResults.push({
      test: "Folder Access Test",
      status: "running",
    });

    try {
      const folderInfo = await driveService.getFolder(folderId);

      diagnosticResults[2] = {
        test: "Folder Access Test",
        status: "pass",
        details: {
          id: folderInfo.id,
          name: folderInfo.name,
          mimeType: folderInfo.mimeType,
          parents: folderInfo.parents,
        },
      };
    } catch (error) {
      diagnosticResults[2] = {
        test: "Folder Access Test",
        status: "fail",
        details: error instanceof Error ? error.message : "Unknown error",
        folderId: folderId,
        stack: error instanceof Error ? error.stack : undefined,
      };
    }

    // Test 4: Listar archivos en la carpeta (si el test anterior pasó)
    if (diagnosticResults[2].status === "pass") {
      diagnosticResults.push({
        test: "List Files Test",
        status: "running",
      });

      try {
        const { files } = await driveService.listFiles({
          folderId: folderId,
          pageSize: 5,
        });

        diagnosticResults[3] = {
          test: "List Files Test",
          status: "pass",
          details: {
            filesCount: files.length,
            fileNames: files.map((f) => ({
              name: f.name,
              mimeType: f.mimeType,
            })),
          },
        };
      } catch (error) {
        diagnosticResults[3] = {
          test: "List Files Test",
          status: "fail",
          details: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        };
      }
    }

    // Test 5: Probar creación de archivo pequeño (simulado)
    if (diagnosticResults[2].status === "pass") {
      diagnosticResults.push({
        test: "Upload Capability Test (Dry Run)",
        status: "running",
      });

      try {
        // Crear un archivo de prueba muy pequeño
        const testContent = `Diagnostic test file created at ${new Date().toISOString()}`;
        const testFile = new File(
          [testContent],
          "insiders-diagnostic-test.txt",
          {
            type: "text/plain",
          }
        );

        console.log("Starting diagnostic upload test...");

        // Intentar upload (esto fallará o pasará dependiendo de los permisos)
        const uploadResult = await driveService.uploadFile(testFile, {
          parentId: folderId,
          description:
            "Diagnostic test file from Insiders Drive Manager - safe to delete",
        });

        console.log("Diagnostic upload successful:", uploadResult);

        diagnosticResults[4] = {
          test: "Upload Capability Test (Dry Run)",
          status: "pass",
          details: {
            fileId: uploadResult.id,
            fileName: uploadResult.name,
            fileSize: testFile.size,
            webViewLink: uploadResult.webViewLink,
            message:
              "✅ Upload successful! You can delete 'insiders-diagnostic-test.txt' from Google Drive",
            warning: "This was a real upload to Google Drive",
          },
        };
      } catch (error) {
        console.error("Diagnostic upload failed:", error);

        // Analizar el tipo de error específico
        let errorType = "unknown";
        let helpMessage = "";

        if (error instanceof Error) {
          const errorMessage = error.message.toLowerCase();

          if (
            errorMessage.includes("insufficient") ||
            errorMessage.includes("permission")
          ) {
            errorType = "permissions";
            helpMessage =
              "La service account no tiene permisos de escritura en esta carpeta. Necesitas dar permisos de 'Editor' o 'Propietario' a: " +
              process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
          } else if (
            errorMessage.includes("not found") ||
            errorMessage.includes("404")
          ) {
            errorType = "folder_not_found";
            helpMessage = "La carpeta especificada no existe o no es accesible";
          } else if (
            errorMessage.includes("quota") ||
            errorMessage.includes("limit")
          ) {
            errorType = "quota";
            helpMessage =
              "Se alcanzó el límite de cuota de la API de Google Drive";
          } else if (
            errorMessage.includes("credentials") ||
            errorMessage.includes("auth")
          ) {
            errorType = "authentication";
            helpMessage =
              "Problema de autenticación con Google Drive. Verifica las credenciales de la service account";
          }
        }

        diagnosticResults[4] = {
          test: "Upload Capability Test (Dry Run)",
          status: "fail",
          errorType: errorType,
          details: error instanceof Error ? error.message : "Unknown error",
          helpMessage: helpMessage,
          serviceAccount: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
          stack:
            error instanceof Error
              ? error.stack?.split("\n").slice(0, 5).join("\n")
              : undefined,
        };
      }
    }

    const allPassed = diagnosticResults.every(
      (result) => result.status === "pass"
    );

    return NextResponse.json({
      success: allPassed,
      summary: {
        total: diagnosticResults.length,
        passed: diagnosticResults.filter((r) => r.status === "pass").length,
        failed: diagnosticResults.filter((r) => r.status === "fail").length,
      },
      diagnostics: diagnosticResults,
      folderId: folderId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in diagnostic:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Diagnostic failed",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
