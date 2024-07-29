"use server";
import prisma from "@/prisma/database";
import * as z from "zod";
import { getHoldedContactById } from "@/src/lib/actions/vendors/holded/contacts";
import { transformHoldedData } from "@/src/lib/utils/clean-fields";
import { dataBaseTranslation } from "@/db/constants";
import { ObjectId } from "mongodb";

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
  const today = new Date();

  // Eliminar registros antiguos para este holdedDataId
  await prisma.customField.deleteMany({
    where: {
      holdedDataId: holdedDataId,
      createdAt: {
        lt: today,
      },
    },
  });

  // Crear o actualizar los nuevos registros
  for (const field of customFields || []) {
    try {
      // Buscar si existe un registro con el mismo field y holdedDataId
      const existingField = await prisma.customField.findFirst({
        where: {
          field: field.field,
          holdedDataId: holdedDataId,
        },
      });

      if (existingField) {
        // Si existe, actualizar
        await prisma.customField.update({
          where: { id: existingField.id },
          data: {
            value: field.value || "",
            createdAt: new Date(), // Actualizar el timestamp
          },
        });
      } else {
        // Si no existe, crear nuevo
        await prisma.customField.create({
          data: {
            id: new ObjectId().toString(), // Generar un nuevo ObjectId
            field: field.field,
            value: field.value || "",
            holdedDataId: holdedDataId,
            createdAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error(`Error updating/creating custom field: ${error}`);
    }
  }
};

const updateContactPersons = async (
  contactPersons: any[],
  holdedDataId: string
) => {
  const today = new Date();

  // Eliminar registros antiguos para este holdedDataId
  await prisma.contactPerson.deleteMany({
    where: {
      holdedDataId: holdedDataId,
      createdAt: {
        lt: today,
      },
    },
  });

  // Crear o actualizar los nuevos registros
  for (const person of contactPersons || []) {
    try {
      // Buscar si existe un registro con el mismo personId y holdedDataId
      const existingPerson = await prisma.contactPerson.findFirst({
        where: {
          personId: person.personId,
          holdedDataId: holdedDataId,
        },
      });

      if (existingPerson) {
        // Si existe, actualizar
        await prisma.contactPerson.update({
          where: { id: existingPerson.id },
          data: {
            name: person.name || "",
            job: person.job || "",
            phone: person.phone?.toString() || "",
            email: person.email || "",
            sendDocuments: person.sendDocuments ? 1 : 0,
            createdAt: new Date(), // Actualizar el timestamp
          },
        });
      } else {
        // Si no existe, crear nuevo
        await prisma.contactPerson.create({
          data: {
            id: new ObjectId().toString(), // Generar un nuevo ObjectId
            personId: person.personId,
            name: person.name || "",
            job: person.job || "",
            phone: person.phone?.toString() || "",
            email: person.email || "",
            sendDocuments: person.sendDocuments ? 1 : 0,
            holdedDataId: holdedDataId,
            createdAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error(`Error updating/creating contact person: ${error}`);
    }
  }
};

const updateClientFields = async (userId: string, customFields: any[]) => {
  const fieldModels = [
    { name: "Ventas", id: "salesFields", model: prisma.salesField },
    { name: "Cliente", id: "clientsFields", model: prisma.clientField },
    {
      name: "Consultoría y Mentoring",
      id: "consultingAndMentoringFields",
      model: prisma.consultingAndMentoringField,
    },
    { name: "Formación", id: "trainingsFields", model: prisma.trainingField },
    { name: "Marketing", id: "marketingFields", model: prisma.marketingField },
    {
      name: "Creatividad",
      id: "creativitiesFields",
      model: prisma.creativityField,
    },
  ];

  for (const { id, model, name } of fieldModels) {
    const fields =
      dataBaseTranslation
        .find((group) => group.id === id)
        ?.groups.flatMap((g) => g.fields) || [];

    for (const field of fields) {
      const customField = customFields.find(
        (cf: any) => cf.field === field.holdedFieldName
      );

      if (customField) {
        console.log(customField);
        console.log(id);
        console.log(name);

        await (model as any).upsert({
          where: {
            userId_holdedFieldName: {
              userId,
              holdedFieldName: field.holdedFieldName,
            },
          },
          update: {
            holdedFieldName: field.holdedFieldName,
            es: field.es,
            en: field.en,
            value: customField.value,
            options: field.options || [],
            type: field.type,
            categoryId: id,
            categoryName: name,
            subCategoryId: field.subCategoryId,
            subCategoryName: field.subCategoryName,
            updatedAt: new Date(),
          },
          create: {
            userId,
            holdedFieldName: field.holdedFieldName,
            es: field.es,
            en: field.en,
            value: customField.value,
            options: field.options || [],
            type: field.type,
            categoryId: id,
            categoryName: name,
            subCategoryId: field.subCategoryId,
            subCategoryName: field.subCategoryName,
            createdAt: new Date(),
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
