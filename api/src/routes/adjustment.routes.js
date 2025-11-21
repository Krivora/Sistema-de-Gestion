import express from "express";
import * as AdjustmentController from "../controllers/adjustment.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { attachPermissions } from "../middleware/permissions.middleware.js";
import { allow } from "../middleware/allow.js";

const router = express.Router();

// Middleware global
router.use(authRequired);
router.use(attachPermissions);

// 🧩 Rutas CASL en una sola línea
router.post("/", allow("create", "adjustments"), AdjustmentController.createAndPost);
router.get("/", allow("read", "adjustments"), AdjustmentController.list);
router.get("/:id", allow("read", "adjustments"), AdjustmentController.getById);

export default router;
