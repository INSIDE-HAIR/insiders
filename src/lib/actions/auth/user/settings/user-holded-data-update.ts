"use server"; // Indica que este código se ejecutará en el servidor, no en el cliente.

import prisma from "@/prisma/database"; // Importa el cliente de Prisma para interactuar con la base de datos.
import * as z from "zod"; // Importa Zod, una librería de validación y parsing de esquemas.
import { getHoldedContactById } from "@/src/lib/actions/vendors/holded/contacts"; // Importa una función para obtener un contacto de Holded por su ID.
import { transformHoldedData } from "@/src/lib/utils/clean-fields"; // Importa una función para transformar los datos de Holded en un formato utilizable.
import { dataBaseTranslation } from "@/db/constants"; // Importa constantes relacionadas con las traducciones de la base de datos.
import { ObjectId } from "mongodb"; // Importa ObjectId de MongoDB para la generación de IDs únicos.

const UpdateHoldedIdSchema = z.object({
  // Define un esquema de validación para el Holded ID y el User ID usando Zod.
  userId: z.string().min(24, "El ID del usuario es requerido"), // Valida que el User ID sea un string de al menos 24 caracteres.
  holdedId: z
    .string()
    .min(1, "El Holded ID es requerido")
    .length(24, "El Holded ID debe tener 24 caracteres"), // Valida que el Holded ID sea un string de exactamente 24 caracteres.
});

const validateInput = (userId: string, holdedId: string) => {
  // Función para validar el User ID y Holded ID usando el esquema definido anteriormente.
  const validatedFields = UpdateHoldedIdSchema.safeParse({ userId, holdedId });
  if (!validatedFields.success) {
    return {
      error: "Parámetros inválidos",
      issues: validatedFields.error.issues,
    }; // Si la validación falla, se devuelve un objeto de error con detalles.
  }
  return null; // Si la validación es exitosa, se devuelve `null`.
};

const findUser = async (userId: string) => {
  // Función para encontrar un usuario en la base de datos por su ID.
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
        }, // Incluye varias relaciones asociadas al usuario para obtener todos sus datos relevantes.
      },
    },
  });
};

const updateCustomFields = async (
  customFields: any[],
  holdedDataId: string
) => {
  // Función para actualizar o crear campos personalizados relacionados con los datos de Holded.
  const today = new Date();

  // Elimina registros de campos personalizados antiguos para el `holdedDataId` dado.
  await prisma.customField.deleteMany({
    where: {
      holdedDataId: holdedDataId,
      createdAt: {
        lt: today,
      },
    },
  });

  // Itera sobre los campos personalizados para crearlos o actualizarlos en la base de datos.
  for (const field of customFields || []) {
    try {
      const existingField = await prisma.customField.findFirst({
        where: {
          field: field.field,
          holdedDataId: holdedDataId,
        },
      });

      if (existingField) {
        // Si el campo personalizado ya existe, lo actualiza.
        await prisma.customField.update({
          where: { id: existingField.id },
          data: {
            value: field.value || "",
            createdAt: new Date(),
          },
        });
      } else {
        // Si no existe, crea un nuevo campo personalizado.
        await prisma.customField.create({
          data: {
            id: new ObjectId().toString(), // Genera un nuevo ID único.
            field: field.field,
            value: field.value || "",
            holdedDataId: holdedDataId,
            createdAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error(`Error updating/creating custom field: ${error}`); // Manejo de errores con un log en consola.
    }
  }
};

const updateContactPersons = async (
  contactPersons: any[],
  holdedDataId: string
) => {
  // Función similar a `updateCustomFields`, pero para actualizar o crear personas de contacto relacionadas con los datos de Holded.
  const today = new Date();

  await prisma.contactPerson.deleteMany({
    where: {
      holdedDataId: holdedDataId,
      createdAt: {
        lt: today,
      },
    },
  });

  for (const person of contactPersons || []) {
    try {
      const existingPerson = await prisma.contactPerson.findFirst({
        where: {
          personId: person.personId,
          holdedDataId: holdedDataId,
        },
      });

      if (existingPerson) {
        await prisma.contactPerson.update({
          where: { id: existingPerson.id },
          data: {
            name: person.name || "",
            job: person.job || "",
            phone: person.phone?.toString() || "",
            email: person.email || "",
            sendDocuments: person.sendDocuments ? 1 : 0,
            createdAt: new Date(),
          },
        });
      } else {
        await prisma.contactPerson.create({
          data: {
            id: new ObjectId().toString(), // Genera un nuevo ID único.
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
      console.error(`Error updating/creating contact person: ${error}`); // Manejo de errores con un log en consola.
    }
  }
};
const updateClientFields = async (userId: string, customFields: any[]) => {
  const fieldModels = [
    { id: "salesFields", model: prisma.salesField },
    { id: "clientsFields", model: prisma.clientField },
    {
      id: "consultingAndMentoringFields",
      model: prisma.consultingAndMentoringField,
    },
    { id: "trainingsFields", model: prisma.trainingField },
    { id: "marketingFields", model: prisma.marketingField },

  ];

  for (const { id, model } of fieldModels) {
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

        await (model as any).upsert({
          where: {
            userId_holdedFieldName: {
              userId,
              holdedFieldName: field.holdedFieldName,
            },
          },
          update: {
            holdedFieldName: field.holdedFieldName,
            value: customField.value,
            type: field.type,
            categoryId: id,
            subCategoryId: field.subCategoryId,
            updatedAt: new Date(),
          },
          create: {
            userId,
            holdedFieldName: field.holdedFieldName,
            value: customField.value,
            type: field.type,
            categoryId: id,
            subCategoryId: field.subCategoryId,
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
  // Función para actualizar los datos de Holded en la base de datos.
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
  // Función para crear los datos de Holded en la base de datos si no existen.
  return prisma.holdedData.create({
    data: {
      ...transformedHoldedData,
      userId,
    },
  });
};

const updateUserLastSync = async (userId: string, holdedId: string) => {
  // Función para actualizar la fecha de la última sincronización y el Holded ID del usuario.
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
  // Función principal para manejar la actualización de datos de Holded y su sincronización con la base de datos.

  // Valida los inputs proporcionados.
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
      // Actualiza los datos si ya existen en la base de datos.
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
      // Crea nuevos datos si no existen en la base de datos.
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
