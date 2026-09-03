import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ordersRouter from "./orders";
import productsRouter from "./products";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ordersRouter);
router.use(productsRouter);

export default router;
