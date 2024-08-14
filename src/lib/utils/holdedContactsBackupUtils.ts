// src/lib/utils/holdedContactsBackupUtils.ts
"use servver";
import { PrismaClient, Prisma } from "@prisma/client";
import { getListHoldedContacts } from "@/src/lib/actions/vendors/holded/contacts";
import { ObjectId } from "mongodb"; // Import ObjectId if you're using MongoDB

const prisma = new PrismaClient();

const LIMITS = {
  daily: 31,
  monthly: 12,
};

export async function getCurrentBackup() {
  const backup = await prisma.holdedContactsCurrentBackup.findFirst();

  if (!backup) {
    // If no backup is found, create a new one
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
    });
  } else {
    // Generate a valid ObjectID for the new backup
    const newId = new ObjectId().toString();

    return prisma.holdedContactsCurrentBackup.create({
      data: { id: newId, data: contactsData as Prisma.InputJsonValue },
    });
  }
}

export async function getDailyBackups() {
  return prisma.holdedContactsDailyBackup.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getMonthlyBackups() {
  return prisma.holdedContactsMonthlyBackup.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
}

export async function createOrUpdateDailyBackup() {
  const contactsData = await getListHoldedContacts();
  const today = new Date();
  const dayOfMonth = today.getDate();

  const existingBackup = await prisma.holdedContactsDailyBackup.findUnique({
    where: { dayOfMonth },
  });

  if (existingBackup) {
    return prisma.holdedContactsDailyBackup.update({
      where: { id: existingBackup.id },
      data: {
        data: contactsData as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    });
  } else {
    // If we've reached the limit, delete the oldest backup
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
      data: { dayOfMonth, data: contactsData as Prisma.InputJsonValue },
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
    create: { month, year, data: contactsData as Prisma.InputJsonValue },
  });
}
