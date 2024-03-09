import { userInfo } from "node:os";
import { jobService, userService } from "../services";
import { parseFastaFile } from "../services/fasta.service";
import { catchAsync } from "../utils/catch-async";
import clerkClient from "@clerk/clerk-sdk-node";

export const getJobResultsById = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send(`id is required`);
  }

  const job = await jobService.getJobResultsViewById(id);

  res.status(200).send(job);
});

export const getJobs = catchAsync(async (req, res) => {
  const user = await userService.getUserByClerkId((req as any).auth.userId);

  if (!user) {
    return [];
  }

  const jobs = await jobService.getJobs(user?.id);

  res.status(200).send(jobs);
});

export const createJob = catchAsync(async (req, res) => {
  const file = req.file;
  const model = req.body.model;

  if (!file || !model) {
    return res.status(400).send("File and model are required.");
  }

  const fastaSequences = parseFastaFile(file.buffer.toString());

  const userAuth = await clerkClient.users.getUser((req as any).auth.userId);
  const email = userAuth.emailAddresses[0].emailAddress;

  const user = await userService.createUser(email, (req as any).auth.userId);

  const job = await jobService.createJob(model, fastaSequences, user);

  res.status(200).send({ jobId: job.id });
});
