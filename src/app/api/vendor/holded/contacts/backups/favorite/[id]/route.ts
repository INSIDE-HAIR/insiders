import {
  deleteFavoriteBackup,
  getFavoriteBackupsData,
} from "@/src/lib/utils/holdedContactsFavoriteUtils";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = params.id;
    await deleteFavoriteBackup(id);
    return NextResponse.json({
      message: "Favorite backup deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting favorite backup:", error);
    return NextResponse.json(
      { error: "Error deleting favorite backup" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params;

    // Obtiene los datos del backup utilizando la función correspondiente
    const backupData = await getFavoriteBackupsData(id);

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
