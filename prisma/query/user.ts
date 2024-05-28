"use server";
import prisma from "@/prisma/database";
import { User } from "@prisma/client";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        holdedData: true,
        twoFactorConfirmation: true,
      },
    });
    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        accounts: true,
        holdedData: true,
        twoFactorConfirmation: true,
      },
    });
    return user;
  } catch {
    return null;
  }
};

export const getUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        holdedData: true,
        twoFactorConfirmation: true,
      },
    });
    return users;
  } catch {
    return null;
  }
};

export const updateUserById = async (id: string, data: Partial<User>) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};
