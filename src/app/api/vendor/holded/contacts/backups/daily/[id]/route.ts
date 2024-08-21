// app/api/vendor/holded/contacts/backups/monthly/[id]/route.ts
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
