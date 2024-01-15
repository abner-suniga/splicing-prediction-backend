import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./routes";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use("/v1", ClerkExpressRequireAuth(), routes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
