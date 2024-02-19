import { dbMongo } from "@/prisma";

export const getUserByEmail = async (email:string) => {
  try {
    const user = await dbMongo.user.findUnique({
      where: {email}
    });
    return user
  } catch  {
    return null
  }
};

export const getUserById = async (id:string) => {
  try {
    const user = await dbMongo.user.findUnique({
      where: {id}
    });
    return user
  } catch  {
    return null
  }
};