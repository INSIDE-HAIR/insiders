import { NextRequest, NextResponse } from "next/server";
import { ApiKeyAuth } from "@/src/middleware/api-key-auth";

export async function GET(request: NextRequest) {
  try {
    // Obtener contexto de la API Key desde los headers
    const apiKeyValidation = await ApiKeyAuth.validateApiKey(request);
    const userId = request.headers.get("x-api-key-user-id");
    const keyId = request.headers.get("x-api-key-id");

    if (!apiKeyValidation.valid || !apiKeyValidation.context) {
      return NextResponse.json(
        {
          error: apiKeyValidation.error || "No API Key context found",
          message: "This endpoint requires a valid API Key",
        },
        { status: apiKeyValidation.statusCode || 401 }
      );
    }

    const apiKeyContext = apiKeyValidation.context;

    return NextResponse.json({
      success: true,
      message: "API Key authentication successful",
      data: {
        userId: apiKeyContext.userId,
        keyId: apiKeyContext.keyId,
        authenticatedAt: new Date().toISOString(),
        headers: {
          "x-api-key-user-id": userId,
          "x-api-key-id": keyId,
        },
      },
    });
  } catch (error) {
    console.error("Error in test-auth route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Something went wrong processing your request",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKeyValidation = await ApiKeyAuth.validateApiKey(request);

    if (!apiKeyValidation.valid || !apiKeyValidation.context) {
      return NextResponse.json(
        {
          error: apiKeyValidation.error || "No API Key context found",
          message: "This endpoint requires a valid API Key",
        },
        { status: apiKeyValidation.statusCode || 401 }
      );
    }

    const apiKeyContext = apiKeyValidation.context;

    const body = await request.json();

    return NextResponse.json({
      success: true,
      message: "POST request with API Key authentication successful",
      data: {
        userId: apiKeyContext.userId,
        keyId: apiKeyContext.keyId,
        receivedData: body,
        authenticatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in test-auth POST route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Something went wrong processing your request",
      },
      { status: 500 }
    );
  }
}
