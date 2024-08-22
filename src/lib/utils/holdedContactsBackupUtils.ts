"use servver";
import { PrismaClient, Prisma } from "@prisma/client";
import { getListHoldedContacts } from "@/src/lib/actions/vendors/holded/contacts";
import { ObjectId } from "mongodb"; // Import ObjectId if estás usando MongoDB

const prisma = new PrismaClient();

const LIMITS = {
  daily: 31,
  monthly: 12,
};

export async function getCurrentBackup() {
  const backup = await prisma.holdedContactsCurrentBackup.findFirst({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      length: true,
      // Excluye el campo `data`
    },
  });

  if (!backup) {
    // Si no se encuentra un backup, crea uno nuevo
    return createOrUpdateCurrentBackup();
  }

  return backup;
}

export async function createOrUpdateCurrentBackup() {
  const contactsData = await getListHoldedContacts();

  const existingBackup = await prisma.holdedContactsCurrentBackup.findFirst();

  if (existingBackup) {
    return prisma.holdedContactsCurrentBackup.update({
      where: { id: existingBackup.id },
      data: {
        data: contactsData as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        length: true,
        // Excluye el campo `data`
      },
    });
  } else {
    // Genera un ObjectID válido para el nuevo backup
    const newId = new ObjectId().toString();

    return prisma.holdedContactsCurrentBackup.create({
      data: {
        id: newId,
        data: contactsData as Prisma.InputJsonValue,
        length: contactsData.length,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        length: true,
        // Excluye el campo `data`
      },
    });
  }
}

export async function getDailyBackups() {
  return prisma.holdedContactsDailyBackup.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      dayOfMonth: true,
      length: true,
      // Excluye el campo `data`
    },
  });
}

export async function getMonthlyBackups() {
  return prisma.holdedContactsMonthlyBackup.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      month: true,
      year: true,
      length: true,
      // Excluye el campo `data`
    },
  });
}

export async function createOrUpdateDailyBackup() {
  const contactsData = await getListHoldedContacts();
  const today = new Date();
  const dayOfMonth = today.getDate();

  const existingBackup = await prisma.holdedContactsDailyBackup.findUnique({
    where: { dayOfMonth },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      dayOfMonth: true,
      length: true,
      // Excluye el campo `data`
    },
  });

  if (existingBackup) {
    return prisma.holdedContactsDailyBackup.update({
      where: { id: existingBackup.id },
      data: {
        data: contactsData as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        dayOfMonth: true,
        length: true,
        // Excluye el campo `data`
      },
    });
  } else {
    // Si hemos alcanzado el límite, elimina el backup más antiguo
    const count = await prisma.holdedContactsDailyBackup.count();
    if (count >= LIMITS.daily) {
      const oldestBackup = await prisma.holdedContactsDailyBackup.findFirst({
        orderBy: { createdAt: "asc" },
      });
      if (oldestBackup) {
        await prisma.holdedContactsDailyBackup.delete({
          where: { id: oldestBackup.id },
        });
      }
    }

    return prisma.holdedContactsDailyBackup.create({
      data: {
        dayOfMonth,
        data: contactsData as Prisma.InputJsonValue,
        length: contactsData.length,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        dayOfMonth: true,
        length: true,
        // Excluye el campo `data`
      },
    });
  }
}

export async function createOrUpdateMonthlyBackup() {
  const contactsData = await getListHoldedContacts();
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  return prisma.holdedContactsMonthlyBackup.upsert({
    where: {
      month_year: { month, year },
    },
    update: {
      data: contactsData as Prisma.InputJsonValue,
      updatedAt: new Date(),
    },
    create: {
      month,
      year,
      data: contactsData as Prisma.InputJsonValue,
      length: contactsData.length,
    },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      month: true,
      year: true,
      length: true,
      // Excluye el campo `data`
    },
  });
}


export async function getCurrentBackupData(id: string) {
  return prisma.holdedContactsCurrentBackup.findUnique({
    where: { id },
    select: {
      data: true, // Extrae solo el campo `data`
    },
  });
}

export async function getDailyBackupData(id: string) {
  return prisma.holdedContactsDailyBackup.findUnique({
    where: { id },
    select: {
      data: true, // Extrae solo el campo `data`
    },
  });
}

export async function getMonthlyBackupData(id: string) {
  return prisma.holdedContactsMonthlyBackup.findUnique({
    where: { id },
    select: {
      data: true, // Extrae solo el campo `data`
    },
  });
}