import { Router } from "express";
import { allow } from "../../core/middleware/allow.js";
import * as ReportController from "./report.controller.js";

const router = Router();

router.get("/stock",        allow("read", "reports"), ReportController.stock);
router.get("/sales",        allow("read", "reports"), ReportController.sales);
router.get("/purchases",    allow("read", "reports"), ReportController.purchases);
router.get("/top-products", allow("read", "reports"), ReportController.topProducts);
router.get("/dashboard",    allow("read", "reports"), ReportController.dashboard);

export default router;