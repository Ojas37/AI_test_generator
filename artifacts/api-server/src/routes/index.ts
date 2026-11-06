import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import sourcesRouter from "./sources";
import generateRouter from "./generate";
import testSuitesRouter from "./testsuites";
import requirementsRouter from "./requirements";
import statsRouter from "./stats";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(sourcesRouter);
router.use(generateRouter);
router.use(testSuitesRouter);
router.use(requirementsRouter);
router.use(statsRouter);
router.use(chatRouter);

export default router;
