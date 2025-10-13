// src/routes/sale.routes.js
import { Router } from "express";
import * as SaleController from "../controllers/sale.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router = Router();

// 📦 Obtener todas las ventas
router.get("/", authRequired, SaleController.getSales);

// 🔍 Obtener una venta por ID
router.get("/:id", authRequired, SaleController.getSale);

// 🧾 Crear una nueva venta
router.post("/", authRequired, SaleController.createSale);

// ❌ Eliminar una venta
router.delete("/:id", authRequired, SaleController.deleteSale);

export default router;
