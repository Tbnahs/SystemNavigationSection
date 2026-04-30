import { Router, type IRouter } from "express";
import healthRouter from "./health";
import enterprisesRouter from "./enterprises";
import employeesRouter from "./employees";

const router: IRouter = Router();

router.use(healthRouter);
router.use(enterprisesRouter);
router.use(employeesRouter);

export default router;
