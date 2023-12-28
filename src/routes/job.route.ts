import express from "express";
import { jobController } from "../controllers";
import { multer } from "../middlewares";

const router = express.Router();

router.route("/").post(multer.upload.single("file"), jobController.createJob);
router.route("/:id").get(jobController.getJobResultsById);

export default router;
