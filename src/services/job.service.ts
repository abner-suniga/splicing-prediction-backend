import * as fastaService from "./fasta.service";
import * as mlService from "./ml.service";
import prisma from "../db/prisma";
import { isFulfilled } from "../utils/promises";
import { JobSequenceStatus, Prisma } from "@prisma/client";

type User = {
  id: string;
  email: string;
};

export const getJobResultsById = async (id: string) => {
  return prisma.job.findUnique({
    where: {
      id,
    },
    include: {
      jobSequence: {
        include: {
          sequence: true,
        },
      },
    },
  });
};

type ResultTable = {
  name: string;
  position: number;
  hit: string;
  score: number;
};

type ResultSequence = {
  name: string;
  content: string;
  indexes: number[];
};

type ResultsView = {
  resultsTable: Array<ResultTable>;
  resultsSequence: Array<ResultSequence>;
};

const HIT_WINDOW = 10;

export const getJobResultsViewById = async (
  id: string,
  threshold: number = 0.9,
): Promise<ResultsView> => {
  const job = await getJobResultsById(id);

  if (!job) {
    throw new Error(`Job not found`);
  }

  const resultsTable = [];
  const resultsSequence = [];

  for (const jobSequence of job.jobSequence) {
    if (jobSequence.result) {
      const sequence: ResultSequence = {
        name: jobSequence.sequence.sequenceName,
        content: jobSequence.sequence.sequence,
        indexes: [],
      };

      const results = jobSequence.result
        .slice(1, -1)
        .replace(/\r?\n|\r/g, "")
        .replace(/\s/g, "")
        .split(",");

      for (let i = 0; i < results.length; i++) {
        const score = parseFloat(results[i]);
        if (score > threshold) {
          resultsTable.push({
            name: jobSequence.sequence.sequenceName,
            position: i + 1,
            hit: jobSequence.sequence.sequence.slice(
              i - HIT_WINDOW / 2 < 0 ? 0 : i - HIT_WINDOW / 2,
              i + HIT_WINDOW / 2 > jobSequence.sequence.sequence.length
                ? jobSequence.sequence.sequence.length
                : i + HIT_WINDOW / 2,
            ),
            score,
          });
          sequence.indexes.push(i);
        }
      }

      resultsSequence.push(sequence);
    }
  }

  return {
    resultsTable,
    resultsSequence,
  };
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

  return {
    id: parentJob.id,
  };
};
