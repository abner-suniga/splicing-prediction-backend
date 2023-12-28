import { jobService, userService } from "../services";
import { parseFastaFile } from "../services/fasta.service";
import { catchAsync } from "../utils/catch-async";

export const getJobResultsById = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send(`id is required`);
  }

  const job = await jobService.getJobResultsViewById(id);

  res.status(200).send(job);
});

export const createJob = catchAsync(async (req, res) => {
  const file = req.file;
  const model = req.body.model;
  const email = req.body.email;

  if (!file || !model || !email) {
    return res.status(400).send("File, model, and email are required.");
  }

  const fastaSequences = parseFastaFile(file.buffer.toString());

  const user = await userService.createUser(email);

  const job = await jobService.createJob(model, fastaSequences, user);

  res.status(200).send({ jobId: job.id });
});
