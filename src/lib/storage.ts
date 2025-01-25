import { put, del } from "@vercel/blob";
import { z } from "zod";

// Validación de tipos de archivo permitidos
const allowedMimeTypes = [
  // Imágenes
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  // Videos
  "video/mp4",
  "video/webm",
  "video/ogg",
  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  // Documentos
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const fileSchema = z.object({
  name: z.string(),
  type: z.string().refine((val) => allowedMimeTypes.includes(val), {
    message: "Tipo de archivo no permitido",
  }),
  size: z.number().max(1024 * 1024 * 50), // 50MB máximo
});

export async function uploadToStorage(file: File) {
  try {
    // Validar el archivo
    fileSchema.parse({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Generar un nombre único para el archivo
    const timestamp = Date.now();
    const uniqueName = `${timestamp}-${file.name}`;

    // Subir el archivo a Vercel Blob
    const result = await put(uniqueName, file, {
      access: "public",
      addRandomSuffix: true, // Agrega un sufijo aleatorio para evitar colisiones
    });

    return { url: result.url, size: file.size };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export async function deleteFromStorage(url: string) {
  try {
    await del(url);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}
