import * as fastaService from "./fasta.service";
import prisma from "../db/prisma";

type User = {
  id: string;
  email: string;
};

export const createJob = async (
  fastaSequences: fastaService.FastaSequenceParsed[],
  user: User,
) => {
  const fastaFile = await prisma.fastaFile.create({
    data: {
      fileUrl: "https://fakestoragetest.com",
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  await prisma.job.create({
    data: {
      fastaFileId: fastaFile.id,
    },
  });

  await prisma.sequence.createMany({
    data: fastaSequences.map(({ sequenceName, sequence }) => ({
      fastaFileId: fastaFile.id,
      sequenceName,
      sequence,
    })),
  });

  // TODO: call ml endpoint
};
