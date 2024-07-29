"use server";
import { deleteUserById } from "@/prisma/query/user";
import * as z from "zod";

// Define the validation schema with Zod
const DeleteUserIdSchema = z.object({
  userId: z.string().min(24, "El ID del usuario es requerido"),
});

export const deleteUser = async (userId: string) => {
  // Validate the input parameters using the Zod schema
  const validatedFields = DeleteUserIdSchema.safeParse({ userId });

  if (!validatedFields.success) {
    return {
      error: "Parámetros inválidos",
      issues: validatedFields.error.issues,
    };
  }

  try {
    // Delete the user and all related data in a single transaction
    await deleteUserById(userId);
    
    return {
      success: "Usuario eliminado exitosamente",
    };
  } catch (error) {
    const err = error as Error;
    console.error("Error al eliminar el usuario:", err.message);
    return {
      error:
        "Hubo un error al eliminar el usuario. Inténtalo nuevamente más tarde.",
    };
  }
};
