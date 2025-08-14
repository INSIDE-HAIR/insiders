import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Obtener todos los headers para debug
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return NextResponse.json({
      success: true,
      message: "Debug middleware route",
      data: {
        method: request.method,
        url: request.url,
        pathname: request.nextUrl.pathname,
        headers,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in debug middleware route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Something went wrong processing your request",
      },
      { status: 500 }
    );
  }
}
