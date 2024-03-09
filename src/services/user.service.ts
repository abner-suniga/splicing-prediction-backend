import prisma from "../db/prisma";

export const getUserByClerkId = (id: string) => {
  return prisma.user.findUnique({
    where: {
      clerkId: id,
    },
  });
};

export const createUser = (email: string, clerkId: string) => {
  return prisma.user.upsert({
    where: {
      email,
    },
    create: {
      email,
      clerkId,
    },
    update: {
      email,
    },
  });
};
