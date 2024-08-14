// app/api/vendor/holded/contacts/backups/favorites/[id]/route.ts

import { removeFavorite } from "@/src/lib/utils/holdedContactsFavoriteUtils";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await removeFavorite(params.id);
    return NextResponse.json({ message: "Favorite removed successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
