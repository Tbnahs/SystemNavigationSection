import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import enterprisesRouter from "./enterprises";
import employeesRouter from "./employees";
import unitsRouter from "./units";
import facilitiesRouter from "./facilities";
import productsRouter from "./products";
import gradesRouter from "./grades";
import purchaseOrdersRouter from "./purchase_orders";
import adminRouter from "./admin";
import teaVarietiesRouter from "./tea_varieties";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(enterprisesRouter);
router.use(employeesRouter);
router.use(unitsRouter);
router.use(facilitiesRouter);
router.use(productsRouter);
router.use(gradesRouter);
router.use(purchaseOrdersRouter);
router.use(teaVarietiesRouter);
router.use(adminRouter);

export default router;
