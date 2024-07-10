"use server";
import prisma from "@/prisma/database";
import * as z from "zod";
import { getHoldedContactById } from "@/src/lib/server-actions/vendors/holded/contacts";
import { transformHoldedData } from "@/src/lib/utils/clean-fields";
import { dataBaseTranslation } from "@/db/constants";

const UpdateHoldedIdSchema = z.object({
  userId: z.string().min(24, "El ID del usuario es requerido"),
  holdedId: z
    .string()
    .min(1, "El Holded ID es requerido")
    .length(24, "El Holded ID debe tener 24 caracteres"),
});

const validateInput = (userId: string, holdedId: string) => {
  const validatedFields = UpdateHoldedIdSchema.safeParse({ userId, holdedId });
  if (!validatedFields.success) {
    return {
      error: "Parámetros inválidos",
      issues: validatedFields.error.issues,
    };
  }
  return null;
};

const findUser = async (userId: string) => {
  return prisma.user.findUnique({
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
};

const updateCustomFields = async (
  customFields: any[],
  holdedDataId: string
) => {
  await Promise.all(
    (customFields || []).map(async (field: any) => {
      const existingCustomField = await prisma.customField.findFirst({
        where: {
          field: field.field,
          holdedDataId,
        },
      });

      return prisma.customField.upsert({
        where: {
          ...(existingCustomField?.id
            ? { id: existingCustomField.id }
            : {
                field_holdedDataId: {
                  field: field.field,
                  holdedDataId,
                },
              }),
        },
        update: {
          value: field.value,
        },
        create: {
          field: field.field,
          value: field.value,
          holdedDataId,
        },
      });
    })
  );
};

const updateContactPersons = async (
  contactPersons: any[],
  holdedDataId: string
) => {
  await Promise.all(
    (contactPersons || []).map(async (person: any) => {
      const existingContactPerson = await prisma.contactPerson.findFirst({
        where: {
          personId: person.personId,
          holdedDataId,
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
          holdedDataId,
        },
      });
    })
  );
};

const updateClientFields = async (userId: string, customFields: any[]) => {
  const fieldModels = [
    { name: "salesFields", model: prisma.salesField },
    { name: "clientsFields", model: prisma.clientField },
    {
      name: "consultingAndMentoringFields",
      model: prisma.consultingAndMentoringField,
    },
    { name: "trainingsFields", model: prisma.trainingField },
    { name: "marketingFields", model: prisma.marketingField },
    { name: "creativitiesFields", model: prisma.creativityField },
  ];

  for (const { name, model } of fieldModels) {
    const fields =
      dataBaseTranslation
        .find((group) => group.id === name)
        ?.groups.flatMap((g) => g.fields) || [];

    for (const field of fields) {
      const customField = customFields.find(
        (cf: any) => cf.field === field.holdedFieldName
      );

      if (customField) {
        await (model as any).upsert({
          where: {
            userId_holdedFieldName: {
              userId,
              holdedFieldName: field.holdedFieldName,
            },
          },
          update: {
            value: customField.value,
          },
          create: {
            userId,
            holdedFieldName: field.holdedFieldName,
            es: field.es,
            en: field.en,
            value: customField.value,
            options: field.options || [],
            category: name,
          },
        });
      }
    }
  }
};

const updateUserHoldedDataInDatabase = async (
  userId: string,
  transformedHoldedData: any
) => {
  return prisma.holdedData.update({
    where: { userId },
    data: {
      ...transformedHoldedData,
    },
  });
};

const createUserHoldedDataInDatabase = async (
  userId: string,
  transformedHoldedData: any
) => {
  return prisma.holdedData.create({
    data: {
      ...transformedHoldedData,
      userId,
    },
  });
};

const updateUserLastSync = async (userId: string, holdedId: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      holdedId,
      lastHoldedSyncAt: new Date(),
    },
    include: { holdedData: true },
  });
};

export const updateUserHoldedData = async (
  userId: string,
  holdedId: string
) => {
  const validationError = validateInput(userId, holdedId);
  if (validationError) {
    return validationError;
  }

  try {
    const user = await findUser(userId);
    if (!user) {
      return {
        error: "Usuario no encontrado",
      };
    }

    const holdedContact = await getHoldedContactById(holdedId);
    if (!holdedContact) {
      return {
        error: "Contacto de Holded no encontrado",
      };
    }

    const transformedHoldedData = transformHoldedData(
      holdedContact,
      user.holdedData
    );

    if (user.holdedData) {
      await updateUserHoldedDataInDatabase(userId, transformedHoldedData);
      await updateCustomFields(
        transformedHoldedData.customFields?.create || [],
        user.holdedData.id
      );
      await updateContactPersons(
        transformedHoldedData.contactPersons?.create || [],
        user.holdedData.id
      );
    } else {
      await createUserHoldedDataInDatabase(userId, transformedHoldedData);
    }

    await updateClientFields(
      userId,
      transformedHoldedData.customFields?.create || []
    );

    const updatedUser = await updateUserLastSync(userId, holdedId);

    return {
      success: "Holded ID y datos actualizados exitosamente",
      user: updatedUser,
      lastHoldedSyncAt: updatedUser.lastHoldedSyncAt,
    };
  } catch (error) {
    console.error("Error al actualizar el Holded ID y datos:", error);
    return {
      error:
        "Hubo un error al actualizar el Holded ID y datos. Inténtalo nuevamente más tarde.",
    };
  }
};
