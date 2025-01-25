import { NextResponse } from "next/server";
import { auth } from "@/src/config/auth/auth";
import prisma from "@/prisma/database";
import { uploadToStorage } from "@/src/lib/storage";
import { z } from "zod";
import { MediaType, MediaFormat } from "@prisma/client";

const metadataSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  altText: z.string().optional(),
  tags: z.array(z.string()).optional(),
  folderId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Obtener el archivo y los metadatos del FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validar y procesar metadatos
    const metadata = {
      title: formData.get("title"),
      description: formData.get("description"),
      altText: formData.get("altText"),
      tags: formData.getAll("tags"),
      folderId: formData.get("folderId"),
    };
    const validatedMetadata = metadataSchema.parse(metadata);

    // Subir archivo al almacenamiento
    const { url, size } = await uploadToStorage(file);

    // Crear registro en la base de datos
    const media = await prisma.media.create({
      data: {
        url,
        filename: file.name,
        mimeType: file.type,
        size,
        title: validatedMetadata.title,
        description: validatedMetadata.description,
        altText: validatedMetadata.altText,
        tags: validatedMetadata.tags || [],
        folder: validatedMetadata.folderId
          ? { connect: { id: validatedMetadata.folderId } }
          : undefined,
        type: determineFileType(file.type),
        format: determineFileFormat(file.name),
        metadata: {}, // Aquí podrías agregar metadatos específicos del tipo de archivo
        version: 1,
        isLatest: true,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function determineFileType(mimeType: string): MediaType {
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  if (mimeType.startsWith("audio/")) return "AUDIO";
  if (
    mimeType === "application/pdf" ||
    mimeType.includes("document") ||
    mimeType.includes("sheet") ||
    mimeType.includes("presentation")
  )
    return "DOCUMENT";
  return "OTHER";
}

function determineFileFormat(filename: string): MediaFormat {
  const format = filename.split(".").pop()?.toUpperCase() || "OTHER";
  return format as MediaFormat;
}
