import { Router } from "express";
import * as ReportController from "../controllers/report.controller.js";

const router = Router();

router.get("/stock", ReportController.getStockByBranch);
router.get("/sales-period", ReportController.getSalesByPeriod);
router.get("/purchases-suppliers", ReportController.getPurchasesBySupplier);
router.get("/top-products", ReportController.getTopSellingProducts);

export default router;
