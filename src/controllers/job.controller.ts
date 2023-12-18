import { jobService } from "../services";
import { parseFastaFile } from "../services/fasta.service";
import { catchAsync } from "../utils/catch-async";

export const createJob = catchAsync(async (req, res) => {
  const file = req.file;
  const model = req.body.model;
  const email = req.body.email;

  if (!file || !model || !email) {
    return res.status(400).send("File, model, and email are required.");
  }

  parseFastaFile(file.buffer.toString());

  await jobService.createJob();
  res.sendStatus(200);
});
