import { jobService, userService } from "../services";
import { parseFastaFile } from "../services/fasta.service";
import { catchAsync } from "../utils/catch-async";

export const createJob = catchAsync(async (req, res) => {
  const file = req.file;
  const model = req.body.model;
  const email = req.body.email;

  if (!file || !model || !email) {
    return res.status(400).send("File, model, and email are required.");
  }

  const fastaSequences = parseFastaFile(file.buffer.toString());

  const user = await userService.createUser(email);

  await jobService.createJob(fastaSequences, user);

  res.sendStatus(200);
});
