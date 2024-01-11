import * as fastaService from "./fasta.service";
import * as mlService from "./ml.service";
import prisma from "../db/prisma";
import { isFulfilled } from "../utils/promises";
import { JobStatus, MlJob, MlJobStatus, Models, Prisma } from "@prisma/client";

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
      mlJobs: {
        include: {
          sequence: true,
        },
      },
    },
  });
};

type ResultHit = {
  name: string;
  type: "ACCEPTOR" | "DONOR";
  position: number;
  hit: string;
  score: number;
};

type ResultSequence = {
  name: string;
  content: string;
};

const HIT_WINDOW = 10;

export const getJobResultsViewById = async (
  id: string,
  threshold: number = 0.9,
) => {
  const job = await getJobResultsById(id);

  if (!job) {
    throw new Error(`Job not found`);
  }

  const resultSequences: ResultSequence[] = [];
  let resultHits: ResultHit[] = [];

  for (const mlJob of job.mlJobs) {
    if (!mlJob.result) {
      continue;
    }

    resultSequences.push({
      name: mlJob.sequence.name,
      content: mlJob.sequence.content,
    });

    switch (job.model) {
      case "DS_DSSP":
      case "AS_DSSP":
        resultHits = [
          ...resultHits,
          ...parseAcceptorAndDonorResultsDSSP({
            sequenceName: mlJob.sequence.name,
            sequenceContent: mlJob.sequence.content,
            model: job.model,
            result: mlJob.result,
            threshold,
          }),
        ];
        break;
      case "DeepSplicer":
        resultHits = [
          ...resultHits,
          ...parseAcceptorAndDonorResults({
            sequenceName: mlJob.sequence.name,
            sequenceContent: mlJob.sequence.content,
            result: mlJob.result,
            lineParser: lineParseDeepSplicer,
            threshold,
          }),
        ];
        break;
      case "SpliceAI":
        resultHits = [
          ...resultHits,
          ...parseAcceptorAndDonorResults({
            sequenceName: mlJob.sequence.name,
            sequenceContent: mlJob.sequence.content,
            result: mlJob.result,
            lineParser: lineParseSpliceAI,
            threshold,
          }),
        ];
        break;
    }
  }

  const newStatus = getJobStatusFromMlJobs(job.mlJobs);
  await prisma.job.update({
    where: { id },
    data: { status: newStatus },
  });

  return {
    jobId: job.id,
    model: job.model,
    status: newStatus,
    resultSequences,
    resultHits,
  };
};

const getJobStatusFromMlJobs = (mlJobs: MlJob[]) => {
  const statusProcessing = mlJobs.some(
    (mlJob) => mlJob.status === MlJobStatus.PROCESSING,
  );
  if (statusProcessing) {
    return JobStatus.PROCESSING;
  }

  const statusPartiallyFail = mlJobs.some(
    (mlJob) => mlJob.status === MlJobStatus.FAIL,
  );
  if (statusPartiallyFail) {
    return JobStatus.FAIL;
  }

  const statusFail = mlJobs.every((mlJob) => mlJob.status === MlJobStatus.FAIL);
  if (statusFail) {
    return JobStatus.FAIL;
  }

  const statusSuccess = mlJobs.every(
    (mlJob) => mlJob.status === MlJobStatus.SUCCESS,
  );
  if (statusSuccess) {
    return JobStatus.SUCCESS;
  }
};

type LineParseReturn = {
  other: number;
  acceptor: number;
  donor: number;
};

const lineParseSpliceAI = (predictions: number[]) => {
  return {
    other: predictions[0],
    acceptor: predictions[1],
    donor: predictions[2],
  };
};

const lineParseDeepSplicer = (predictions: number[]) => {
  return {
    donor: predictions[0],
    acceptor: predictions[1],
    other: predictions[2],
  };
};

const parseAcceptorAndDonorResultsDSSP = ({
  sequenceName,
  sequenceContent,
  model,
  result,
  threshold = 0.1,
}: {
  sequenceName: string;
  sequenceContent: string;
  model: Models;
  result: string;
  threshold?: number;
}) => {
  const resultHits: ResultHit[] = [];

  const lines = result
    .slice(1, result.length - 1)
    .replace(/\s/g, "")
    .replace("\n", "")
    .split(",");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const score = parseFloat(line);

    const startIdx = i - HIT_WINDOW / 2;
    const endIdx = i + HIT_WINDOW / 2 + 1;
    let hit = sequenceContent.slice(startIdx >= 0 ? startIdx : 0, endIdx);

    if (startIdx < 0) {
      hit = "N".repeat(Math.abs(startIdx)) + hit;
    }

    if (endIdx > sequenceContent.length) {
      hit = hit + "N".repeat(endIdx - sequenceContent.length);
    }

    if (score >= threshold) {
      resultHits.push({
        name: sequenceName,
        type: model === "DS_DSSP" ? "DONOR" : "ACCEPTOR",
        position: i + 1,
        hit,
        score,
      });
    }
  }

  return resultHits;
};

const parseAcceptorAndDonorResults = ({
  sequenceName,
  sequenceContent,
  lineParser,
  result,
  threshold = 0.1,
}: {
  sequenceName: string;
  sequenceContent: string;
  lineParser: (predictions: number[]) => LineParseReturn;
  result: string;
  threshold?: number;
}) => {
  const resultHits: ResultHit[] = [];

  const lines = result
    .slice(1, result.length - 1)
    .split("\n")
    .map((line) => line.trim().slice(1, 24));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const { acceptor, donor } = lineParser(line.split(",").map(parseFloat));

    const startIdx = i - HIT_WINDOW / 2;
    const endIdx = i + HIT_WINDOW / 2 + 1;
    let hit = sequenceContent.slice(startIdx >= 0 ? startIdx : 0, endIdx);

    if (startIdx < 0) {
      hit = "N".repeat(Math.abs(startIdx)) + hit;
    }

    if (endIdx > sequenceContent.length) {
      hit = hit + "N".repeat(endIdx - sequenceContent.length);
    }

    if (acceptor >= threshold) {
      resultHits.push({
        name: sequenceName,
        type: "ACCEPTOR",
        position: i + 1,
        hit,
        score: acceptor,
      });
    }

    if (donor >= threshold) {
      resultHits.push({
        name: sequenceName,
        type: "DONOR",
        position: i + 1,
        hit,
        score: donor,
      });
    }
  }

  return resultHits;
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
      model: model as Models,
      status: JobStatus.PROCESSING,
      fastaFileId: fastaFile.id,
      userId: user.id,
    },
  });

  await prisma.sequence.createMany({
    data: fastaSequences.map(({ name, content }) => ({
      fastaFileId: fastaFile.id,
      name,
      content,
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
        sequence: sequence.content,
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

  const mlJobsData: Prisma.MlJobCreateManyInput[] = childJobs
    .filter(isFulfilled)
    .map((result) => result.value)
    .filter(haveJobId)
    .map((job) => ({
      id: job.jobId,
      jobId: parentJob.id,
      sequenceId: job.sequenceId,
      status: MlJobStatus.PROCESSING,
    }));

  await prisma.mlJob.createMany({
    data: mlJobsData,
  });

  return {
    id: parentJob.id,
  };
};
