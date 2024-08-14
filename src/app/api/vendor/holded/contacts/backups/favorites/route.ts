// app/api/vendor/holded/contacts/backups/favorites/route.ts

import {
  addToFavorites,
  getFavorites,
} from "@/src/lib/utils/holdedContactsFavoriteUtils";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const favorites = await getFavorites();
    return NextResponse.json(favorites);
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

export async function POST(request: NextRequest) {
  try {
    const { backupType, backupId, name } = await request.json();
    const favorite = await addToFavorites(backupType, backupId, name);
    return NextResponse.json(favorite);
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
