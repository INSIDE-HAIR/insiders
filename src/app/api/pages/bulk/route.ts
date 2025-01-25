import { NextResponse } from "next/server";
import prisma from "@/prisma/database";

export async function PUT(request: Request) {
  try {
    const { ids, action } = await request.json();

    await prisma.dynamicPage.updateMany({
      where: {
        id: { in: ids },
        isEditable: true, // Only update editable pages
      },
      data: {
        status: action,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating pages:", error);
    return NextResponse.json(
      { error: "Failed to update pages" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await prisma.dynamicPage.deleteMany({
      where: {
        status: "deleted",
        isEditable: true, // Only delete editable pages
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error emptying trash:", error);
    return NextResponse.json(
      { error: "Failed to empty trash" },
      { status: 500 }
    );
  }
}
