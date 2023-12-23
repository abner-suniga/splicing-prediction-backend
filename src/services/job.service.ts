import * as fastaService from "./fasta.service";
import * as mlService from "./ml.service";
import prisma from "../db/prisma";
import { isFulfilled } from "../utils/promises";
import { JobSequenceStatus, Prisma } from "@prisma/client";

type User = {
  id: string;
  email: string;
};

export const createJob = async (
  model: string,
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

  const parentJob = await prisma.job.create({
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

  const createdSequences = await prisma.sequence.findMany({
    where: {
      fastaFileId: fastaFile.id,
    },
  });

  const childJobs = await Promise.allSettled(
    createdSequences.map(async (sequence) => {
      const data = await mlService.requestPrediction({
        model,
        sequenceId: sequence.id,
        sequence: sequence.sequence,
      });

      return {
        jobId: data?.jobId,
        sequenceId: sequence.id,
      };
    }),
  );

  const haveJobId = (result: {
    jobId?: string;
    sequenceId: string;
  }): result is { jobId: string; sequenceId: string } => !!result.jobId;

  const jobSequencesData: Prisma.JobSequenceCreateManyInput[] = childJobs
    .filter(isFulfilled)
    .map((result) => result.value)
    .filter(haveJobId)
    .map((job) => ({
      id: job.jobId,
      jobId: parentJob.id,
      sequenceId: job.sequenceId,
      status: JobSequenceStatus.PROCESSING,
    }));

  await prisma.jobSequence.createMany({
    data: jobSequencesData,
  });

};
