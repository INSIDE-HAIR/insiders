"use server";
import prisma from "@/prisma/database";
import * as z from "zod";
import { getHoldedContactById } from "@/src/lib/server-actions/vendors/holded/contacts";
import { transformHoldedData } from "@/src/lib/utils/clean-fields"; // Adjust the import path as necessary
// Definir el esquema de validación con Zod
const UpdateHoldedIdSchema = z.object({
  userId: z.string().min(24, "El ID del usuario es requerido"),
  holdedId: z
    .string()
    .min(1, "El Holded ID es requerido")
    .length(24, "El Holded ID debe tener 24 caracteres"),
});

export const updateUserHoldedData = async (
  userId: string,
  holdedId: string
) => {
  // Validar los parámetros de entrada usando el esquema de Zod
  const validatedFields = UpdateHoldedIdSchema.safeParse({ userId, holdedId });

  if (!validatedFields.success) {
    return {
      error: "Parámetros inválidos",
      issues: validatedFields.error.issues,
    };
  }

  try {
    // Obtener el usuario de la base de datos
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
          },
        },
      },
    });

    if (!user) {
      return {
        error: "Usuario no encontrado",
      };
    }

    // Obtener los datos de Holded
    const holdedContact = await getHoldedContactById(holdedId);
    if (!holdedContact) {
      return {
        error: "Contacto de Holded no encontrado",
      };
    }

    // Transformar los datos de Holded
    const transformedHoldedData = transformHoldedData(
      holdedContact,
      user.holdedData
    );

    if (user.holdedData) {
      // Actualizar HoldedData sin establecer customFields o contactPersons directamente
      const updatedHoldedData = await prisma.holdedData.update({
        where: { userId: userId },
        data: {
          holdedId: transformedHoldedData.holdedId,
          customId: transformedHoldedData.customId,
          name: transformedHoldedData.name,
          code: transformedHoldedData.code,
          vatnumber: transformedHoldedData.vatnumber,
          tradeName: transformedHoldedData.tradeName,
          email: transformedHoldedData.email,
          mobile: transformedHoldedData.mobile,
          phone: transformedHoldedData.phone,
          type: transformedHoldedData.type,
          iban: transformedHoldedData.iban,
          swift: transformedHoldedData.swift,
          groupId: transformedHoldedData.groupId,
          clientRecord: transformedHoldedData.clientRecord,
          supplierRecord: transformedHoldedData.supplierRecord,
          billAddress: transformedHoldedData.billAddress,
          defaults: transformedHoldedData.defaults,
          socialNetworks: transformedHoldedData.socialNetworks,
          // Removing customFields and contactPersons from direct update
        },
      });

      // Actualizar o crear customFields si existen
      await Promise.all(
        (transformedHoldedData.customFields?.create || []).map(
          async (field: any) => {
            const existingCustomField = await prisma.customField.findFirst({
              where: {
                field: field.field,
                holdedDataId: user.holdedData!.id,
              },
            });

            return prisma.customField.upsert({
              where: { id: existingCustomField?.id ?? "" },
              update: {
                value: field.value,
              },
              create: {
                field: field.field,
                value: field.value,
                holdedDataId: user.holdedData!.id,
              },
            });
          }
        )
      );

      // Actualizar o crear contactPersons
      await Promise.all(
        (transformedHoldedData.contactPersons?.create || []).map(
          async (person: any) => {
            const existingContactPerson = await prisma.contactPerson.findFirst({
              where: {
                personId: person.personId,
                holdedDataId: user.holdedData!.id,
              },
            });

            return prisma.contactPerson.upsert({
              where: { id: existingContactPerson?.id ?? "" },
              update: {
                name: person.name || "",
                job: person.job || "",
                phone: person.phone?.toString() || "",
                email: person.email || "",
                sendDocuments: person.sendDocuments ? 1 : 0,
              },
              create: {
                personId: person.personId,
                name: person.name || "",
                job: person.job || "",
                phone: person.phone?.toString() || "",
                email: person.email || "",
                sendDocuments: person.sendDocuments ? 1 : 0,
                holdedDataId: user.holdedData!.id,
              },
            });
          }
        )
      );

      // Actualizar el usuario
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          holdedId,
          lastHoldedSyncAt: new Date(),
        },
        include: { holdedData: true },
      });

      return {
        success: "Holded ID y datos actualizados exitosamente",
        user: updatedUser,
        lastHoldedSyncAt: updatedUser.lastHoldedSyncAt,
      };
    } else {
      // Crear nuevos datos de Holded
      const newHoldedData = await prisma.holdedData.create({
        data: {
          ...transformedHoldedData,
          userId: userId,
        },
      });

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          holdedId,
          lastHoldedSyncAt: new Date(),
        },
        include: { holdedData: true },
      });

      return {
        success: "Holded ID y datos actualizados exitosamente",
        user: updatedUser,
        lastHoldedSyncAt: updatedUser.lastHoldedSyncAt,
      };
    }
  } catch (error) {
    console.error("Error al actualizar el Holded ID y datos:", error);
    return {
      error:
        "Hubo un error al actualizar el Holded ID y datos. Inténtalo nuevamente más tarde.",
    };
  }
};
