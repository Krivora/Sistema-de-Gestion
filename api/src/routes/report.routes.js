// src/api/reports.routes.js
import { Router } from "express";
import { ReportsController } from "../controllers/report.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { attachPermissions } from "../middleware/permissions.middleware.js";
import { allow } from "../middleware/allow.js";

const router = Router();

router.use(authRequired);
router.use(attachPermissions);

// 📦 Inventario
router.get("/stock", allow("read", "reports"), ReportsController.stock);

// 💰 Ventas
router.get("/sales", allow("read", "reports"), ReportsController.sales);

// 🧾 Compras
router.get("/purchases", allow("read", "reports"), ReportsController.purchases);

// 🛍️ Top productos
router.get("/top-products", allow("read", "reports"), ReportsController.topProducts);

// 📊 Dashboard general
router.get("/dashboard", allow("read", "reports"), ReportsController.dashboard);

export default router;
