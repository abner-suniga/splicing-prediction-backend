import prisma from "../db/prisma";

export const createUser = (email: string) => {
  return prisma.user.create({
    data: {
      email,
    },
  });
};
