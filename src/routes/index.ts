import express from "express";
import jobRoute from "./job.route";

const router = express.Router();

const routes = [
  {
    path: "/jobs",
    route: jobRoute,
  },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
