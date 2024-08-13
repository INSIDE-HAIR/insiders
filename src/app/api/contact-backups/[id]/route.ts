// app/api/contact-backups/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backup = await prisma.contactBackup.findUnique({
      where: { id: params.id },
    });
    if (!backup) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 });
    }
    return NextResponse.json(backup);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch backup" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.contactBackup.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Backup deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete backup" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isFavorite } = await request.json();
    const updatedBackup = await prisma.contactBackup.update({
      where: { id: params.id },
      data: { isFavorite },
    });
    return NextResponse.json(updatedBackup);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update backup" },
      { status: 500 }
    );
  }
}
