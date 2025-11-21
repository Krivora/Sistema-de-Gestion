import express from "express";
import * as TransferController from "../controllers/transfer.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { attachPermissions } from "../middleware/permissions.middleware.js";
import { allow } from "../middleware/allow.js";

const router = express.Router();

router.use(authRequired);
router.use(attachPermissions);

// 🔄 Listar transferencias
router.get("/", allow("read", "transfers"), TransferController.getAll);

// 🔄 Obtener transferencia por ID
router.get("/:id", allow("read", "transfers"), TransferController.getById);

// 🔄 Crear transferencia
router.post("/", allow("create", "transfers"), TransferController.create);

export default router;
