import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import enterprisesRouter from "./enterprises";
import employeesRouter from "./employees";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(enterprisesRouter);
router.use(employeesRouter);

export default router;
