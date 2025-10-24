import express from "express";
import * as AdjustmentController from "../controllers/adjustment.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";

const router = express.Router();

// Todas las rutas protegidas
router.use(authRequired);

// Crear un ajuste manual
router.post("/", AdjustmentController.create);

// Listar ajustes (entrada/salida)
router.get("/", AdjustmentController.list);

export default router;
