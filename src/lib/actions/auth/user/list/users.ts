// src/lib/actions/auth/user/list/users.ts
"use server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getPaginatedUsers = async (page: number, pageSize: number) => {
  const users = await prisma.user.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      salesFields: true,
      clientsFields: true,
      consultingAndMentoringFields: true,
      trainingsFields: true,
      marketingFields: true,
      creativitiesFields: true,
    },
  });

  const total = await prisma.user.count();

  return {
    data: users,
    page,
    pageSize,
    total,
  };
};
