import {
  addToFavorites,
  getFavorites,
} from "@/src/lib/utils/holdedContactsFavoriteUtils";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const favorites = await getFavorites();
    console.log("Favorites retrieved:", favorites);
    return NextResponse.json(favorites);
  } catch (error: unknown) {
    console.error(
      "Error in GET /api/vendor/holded/contacts/backups/favorites:",
      error
    );
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { backupType, backupId, name } = await request.json();
    const favorite = await addToFavorites(backupType, backupId, name);
    return NextResponse.json(favorite);
  } catch (error: unknown) {
    console.error(
      "Error in POST /api/vendor/holded/contacts/backups/favorites:",
      error
    );
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
