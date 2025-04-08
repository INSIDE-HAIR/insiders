import { NextResponse } from "next/server";
import { syncDriveRoutes } from "../../../../lib/tasks/syncCron";

// Protección básica con clave secreta para llamadas cron
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncDriveRoutes();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error during sync" },
      { status: 500 }
    );
  }
}
