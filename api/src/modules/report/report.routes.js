import { Router } from "express";
import { allow } from "../../core/middleware/allow.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
import * as ReportController from "./report.controller.js";

const router = Router();

router.get("/stock",        allow("read", "reports"), ReportController.stock);
router.get("/sales",        allow("read", "reports"), ReportController.sales);
router.get("/purchases",    allow("read", "reports"), ReportController.purchases);
router.get("/top-products", allow("read", "reports"), ReportController.topProducts);
router.get("/dashboard",    allow("read", "reports"), ReportController.dashboard);
router.get("/superadmin",   requireRole("superadmin"), allow("read", "reports"), ReportController.superadmin);

// Cobranza de clientes — exclusivo de superadmin
router.get("/clients/:id/payments",                requireRole("superadmin"), ReportController.clientPayments);
router.post("/clients/:id/payments",               requireRole("superadmin"), ReportController.registerPayment);
router.delete("/clients/:id/payments/:paymentId",  requireRole("superadmin"), ReportController.deletePayment);
router.post("/clients/:id/grace",                  requireRole("superadmin"), ReportController.grantGrace);
router.delete("/clients/:id/grace",                requireRole("superadmin"), ReportController.revokeGrace);

export default router;