// src/api/reports.routes.js
import { Router } from "express";
import { ReportsController } from "../controllers/report.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router = Router();

// 📦 Inventario
router.get("/stock", authRequired, ReportsController.stock);

// 💰 Ventas
router.get("/sales", authRequired, ReportsController.sales);

// 🧾 Compras
router.get("/purchases", authRequired, ReportsController.purchases);

// 🛍️ Top productos
router.get("/top-products", authRequired, ReportsController.topProducts);

// 📊 Dashboard general
router.get("/dashboard", authRequired, ReportsController.dashboard);

export default router;
