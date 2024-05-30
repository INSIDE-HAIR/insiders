"use server";
import prisma from "@/prisma/database";
import * as z from "zod";
import { getHoldedContactById } from "@/src/lib/server-actions/vendors/holded/contacts";

// Define the validation schema with Zod
const UpdateHoldedIdSchema = z.object({
  userId: z.string().min(24, "El ID del usuario es requerido"),
  holdedId: z
    .string()
    .min(1, "El Holded ID es requerido")
    .length(24, "El Holded ID debe tener 24 caracteres"),
});

// Function to clean and transform Holded data
const transformHoldedData = (data: any) => {
  const transformFieldName = (field: string): string => {
    const accentsMap: { [key: string]: string } = {
      á: "a",
      é: "e",
      í: "i",
      ó: "o",
      ú: "u",
      Á: "A",
      É: "E",
      Í: "I",
      Ó: "O",
      Ú: "U",
    };

    return field
      .replace(/[áéíóúÁÉÍÓÚ]/g, (match) => accentsMap[match])
      .replace(/[\s-]/g, "");
  };

  return {
    holdedId: data.id,
    customId: data.customId || null,
    name: data.name || "",
    code: data.code || "",
    vatnumber: data.vatnumber || "",
    tradeName: data.tradeName ? String(data.tradeName) : "",
    email: data.email || "",
    mobile: data.mobile || "",
    phone: data.phone || "",
    type: data.type || "",
    iban: data.iban || "",
    swift: data.swift || "",
    groupId: data.groupId || "",
    clientRecord: data.clientRecord
      ? { connect: { id: data.clientRecord.id } }
      : undefined,
    supplierRecord: data.supplierRecord
      ? { connect: { id: data.supplierRecord.id } }
      : undefined,
    billAddress: data.billAddress
      ? {
          address: data.billAddress.address || "",
          city: data.billAddress.city || "",
          postalCode: data.billAddress.postalCode
            ? parseInt(data.billAddress.postalCode, 10)
            : 0,
          province: data.billAddress.province || "",
          country: data.billAddress.country || "",
          countryCode: data.billAddress.countryCode || "",
          info: data.billAddress.info || "",
        }
      : undefined,
    customFields: data.customFields
      ? data.customFields.map((field: any) => ({
          field: transformFieldName(field.field),
          value: field.value,
        }))
      : undefined,
    defaults: data.defaults
      ? {
          create: {
            salesChannel: data.defaults.salesChannel || 0,
            expensesAccount: data.defaults.expensesAccount || 0,
            dueDays: data.defaults.dueDays || 0,
            paymentDay: data.defaults.paymentDay || 0,
            paymentMethod: data.defaults.paymentMethod || 0,
            discount: data.defaults.discount || 0,
            language: data.defaults.language || "es",
            currency: data.defaults.currency || "eur",
            salesTax: data.defaults.salesTax || [],
            purchasesTax: data.defaults.purchasesTax || [],
            accumulateInForm347: data.defaults.accumulateInForm347 || "yes",
          },
        }
      : undefined,
    socialNetworks: data.socialNetworks
      ? {
          create: {
            facebook: data.socialNetworks.facebook || "",
            twitter: data.socialNetworks.twitter || "",
            instagram: data.socialNetworks.instagram || "",
            google: data.socialNetworks.google || "",
            linkedin: data.socialNetworks.linkedin || "",
            pinterest: data.socialNetworks.pinterest || "",
            foursquare: data.socialNetworks.foursquare || "",
            youtube: data.socialNetworks.youtube || "",
            vimeo: data.socialNetworks.vimeo || "",
            wordpress: data.socialNetworks.wordpress || "",
            website: data.socialNetworks.website || "",
          },
        }
      : undefined,
    tags: data.tags || [],
    notes: data.notes
      ? {
          create: data.notes.map((note: any) => ({
            noteId: note.noteId || "",
            name: note.name || "",
            description: note.description || "",
            color: note.color || "",
            updatedAt: note.updatedAt ? parseInt(note.updatedAt, 10) : 0,
          })),
        }
      : undefined,
    contactPersons: data.contactPersons || [],
    shippingAddresses: data.shippingAddresses || [],
    isPerson: data.isPerson === 1,
    createdAt: data.createdAt ? new Date(data.createdAt * 1000) : new Date(),
    updatedAt: data.updatedAt ? new Date(data.updatedAt * 1000) : new Date(),
    updatedHash: data.updatedHash || "",
  };
};

export const updateUserHoldedData = async (
  userId: string,
  holdedId: string
) => {
  // Validate the input parameters using the Zod schema
  const validatedFields = UpdateHoldedIdSchema.safeParse({ userId, holdedId });

  if (!validatedFields.success) {
    return {
      error: "Parámetros inválidos",
      issues: validatedFields.error.issues,
    };
  }

  try {
    // Get the user from the database
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

    // Get the Holded data
    const holdedContact = await getHoldedContactById(holdedId);
    if (!holdedContact) {
      return {
        error: "Contacto de Holded no encontrado",
      };
    }

    // Transform the Holded data
    const transformedHoldedData = transformHoldedData(holdedContact);

    if (user.holdedData) {
      // Update or create customFields if they exist
      const updatedCustomFields = transformedHoldedData.customFields
        ? await Promise.all(
            transformedHoldedData.customFields.map(async (field: any) => {
              // Fetch existing custom field to get the ID if it exists
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
            })
          )
        : [];

      // Update or create contactPersons
      const updatedContactPersons = await Promise.all(
        transformedHoldedData.contactPersons.map(async (person: any) => {
          // Fetch existing contact person to get the ID if it exists
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
              phone: person.phone || "",
              email: person.email || "",
              sendDocuments: person.sendDocuments ? 1 : 0,
            },
            create: {
              personId: person.personId,
              name: person.name || "",
              job: person.job || "",
              phone: person.phone || "",
              email: person.email || "",
              sendDocuments: person.sendDocuments ? 1 : 0,
              holdedDataId: user.holdedData!.id,
            },
          });
        })
      );

      // Update HoldedData without setting customFields or contactPersons directly
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
          billAddress: transformedHoldedData.billAddress
            ? {
                update: transformedHoldedData.billAddress,
              }
            : undefined,
          defaults: transformedHoldedData.defaults
            ? {
                update: transformedHoldedData.defaults.create,
              }
            : undefined,
          socialNetworks: transformedHoldedData.socialNetworks
            ? {
                update: transformedHoldedData.socialNetworks.create,
              }
            : undefined,
          // Removing customFields and contactPersons from direct update
        },
      });

      // Update the user
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
      const newContactPersons = transformedHoldedData.contactPersons.map(
        (person: any) => ({
          personId: person.personId,
          name: person.name || "",
          job: person.job || "",
          phone: person.phone || "",
          email: person.email || "",
          sendDocuments: person.sendDocuments ? 1 : 0,
        })
      );

      const newCustomFields = transformedHoldedData.customFields || [];

      const newHoldedData = await prisma.holdedData.create({
        data: {
          ...transformedHoldedData,
          userId: userId,
          contactPersons: {
            create: newContactPersons,
          },
          customFields: {
            create: newCustomFields,
          },
          billAddress: transformedHoldedData.billAddress
            ? {
                create: transformedHoldedData.billAddress,
              }
            : undefined,
          defaults: transformedHoldedData.defaults
            ? {
                create: transformedHoldedData.defaults.create,
              }
            : undefined,
          socialNetworks: transformedHoldedData.socialNetworks
            ? {
                create: transformedHoldedData.socialNetworks.create,
              }
            : undefined,
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
