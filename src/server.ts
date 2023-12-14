import express, { Request, Response } from "express";
import multer from "multer";
import bodyParser from "body-parser";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { exec } from "child_process";
import fs from "fs/promises";
import { parseFastaFile } from "./fasta";
import { ParsedOutput, parseOutput } from "./model";

const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

function asyncExec(command: string) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`Stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
}

app.post(
  "/submit",
  upload.single("file"),
  async (req: Request, res: Response) => {
    const file = req.file;
    const model = req.body.model;
    const email = req.body.email;

    if (!file || !model || !email) {
      return res.status(400).send("File, model, and email are required.");
    }

    const seqs = parseFastaFile(file.buffer.toString());
    let outputs: ParsedOutput[] = [];

    for (const seq of seqs) {
      const output = (await asyncExec(
        `docker run ss_predict_dssp python ss_predict.py as ${seq.sequence}`,
      )) as string;
      const parsedOutput = parseOutput(seq.sequenceName, seq.sequence, output);
      console.log(parsedOutput);
      outputs = outputs.concat(parsedOutput);
    }

    console.log({ outputs });

    const jobId = uuidv4();

    res.send({
      jobId,
      outputs,
    });
  },
);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
