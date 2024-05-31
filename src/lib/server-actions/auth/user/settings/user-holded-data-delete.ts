"use server";
import prisma from "@/prisma/database";
import * as z from "zod";

// Define the validation schema with Zod
const DeleteHoldedIdSchema = z.object({
  userId: z.string().min(24, "El ID del usuario es requerido"),
});

export const deleteUserHoldedData = async (userId: string) => {
  // Validate the input parameters using the Zod schema
  const validatedFields = DeleteHoldedIdSchema.safeParse({ userId });

  if (!validatedFields.success) {
    return {
      error: "Parámetros inválidos",
      issues: validatedFields.error.issues,
    };
  }

  try {
    // Get the user and their Holded data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        holdedData: {
          include: {
            billAddress: true,
            defaults: true,
            socialNetworks: true,
            contactPersons: true,
            customFields: true,
            notes: true,
          },
        },
      },
    });

    if (!user) {
      return {
        error: "Usuario no encontrado",
      };
    }

    if (!user.holdedData) {
      return {
        error: "Datos de Holded no encontrados",
      };
    }

    // Delete all related data
    await prisma.$transaction(async (prisma) => {
      if (user.holdedData) {
        const holdedDataId = user.holdedData.id;

        await prisma.billAddress.deleteMany({ where: { holdedDataId } });
        await prisma.defaults.deleteMany({ where: { holdedDataId } });
        await prisma.socialNetworks.deleteMany({ where: { holdedDataId } });
        await prisma.contactPerson.deleteMany({ where: { holdedDataId } });
        await prisma.customField.deleteMany({ where: { holdedDataId } });
        await prisma.note.deleteMany({ where: { holdedDataId } });
        await prisma.clientRecord.deleteMany({ where: { holdedDataId } });
        await prisma.supplierRecord.deleteMany({ where: { holdedDataId } });

        // Delete the HoldedData itself
        await prisma.holdedData.delete({ where: { id: holdedDataId } });

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            holdedId: null,
            lastHoldedSyncAt: null,
          },
        });
      }
    });

    return {
      success: "Datos de Holded eliminados exitosamente",
    };
  } catch (error) {
    console.error("Error al eliminar los datos de Holded:", error);
    return {
      error:
        "Hubo un error al eliminar los datos de Holded. Inténtalo nuevamente más tarde.",
    };
  }
};
