import express from "express";
import * as TransferController from "../controllers/transfer.controller.js";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(authRequired);

// Solo admins y superadmins pueden hacer transferencias
router.get("/", requireRole("superadmin", "admin"), TransferController.getAll);
router.get("/:id", requireRole("superadmin", "admin"), TransferController.getById);
router.post("/", requireRole("superadmin", "admin"), TransferController.create);

export default router;
