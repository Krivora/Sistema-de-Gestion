import express from "express";
import * as AdjustmentController from "../controllers/adjustment.controller.js";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// Todas requieren autenticación
router.use(authRequired);

/**
 * 🧩 Ajustes de inventario
 */
router.post("/",requireRole("superadmin", "admin"), AdjustmentController.createAndPost); // Crear ajuste
router.get("/", requireRole("superadmin", "admin"),AdjustmentController.list);           // Listar ajustes
router.get("/:id",requireRole("superadmin", "admin"), AdjustmentController.getById);     // Obtener un ajuste con items

export default router;
