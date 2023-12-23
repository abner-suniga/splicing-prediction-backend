import prisma from "../db/prisma";

export const createUser = (email: string) => {
  return prisma.user.upsert({
    where: {
      email,
    },
    create: {
      email,
    },
    update: {
      email,
    },
  });
};
