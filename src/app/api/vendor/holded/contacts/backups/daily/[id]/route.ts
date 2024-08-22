// app/api/vendor/holded/contacts/backups/monthly/[id]/route.ts
import { getDailyBackupData } from "@/src/lib/utils/holdedContactsBackupUtils";
import { deleteBackupById } from "@/src/lib/utils/holdedContactsFavoriteUtils";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const type = "DAILY";

    await deleteBackupById(type, id);

    return NextResponse.json(
      { message: "Backup deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error deleting backup:", error);
    return NextResponse.json(
      { message: "Failed to delete backup" },
      { status: 500 }
    );
  }
}


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Obtiene los datos del backup utilizando la función correspondiente
    const backupData = await getDailyBackupData(id);

    if (!backupData) {
      // Si no se encuentra el backup, devuelve una respuesta 404
      return NextResponse.json(
        { message: "Backup not found" },
        { status: 404 }
      );
    }

    // Si se encuentra el backup, devuelve los datos como JSON
    return NextResponse.json(backupData, { status: 200 });
  } catch (error: unknown) {
    // Maneja cualquier error que ocurra durante la solicitud
    console.error("Error fetching backup data:", error);

    // Devuelve una respuesta 500 en caso de error del servidor
    return NextResponse.json(
      { message: "Failed to fetch backup data" },
      { status: 500 }
    );
  }
}