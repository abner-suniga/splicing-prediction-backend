import express from "express";
import { jobController } from "../controllers";
import { upload } from "../middlewares/multer";

const router = express.Router();

router.route("/").post(upload.single("file"), jobController.createJob);

export default router;
