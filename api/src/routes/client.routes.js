import express from "express";
import * as ClientController from "../controllers/client.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { attachPermissions } from "../middleware/permissions.middleware.js";
import { allow } from "../middleware/allow.js";
import { uploadLogo } from "../middleware/uploadLogo.middleware.js";

const router = express.Router();

router.use(authRequired);
router.use(attachPermissions);

// 📘 Listar clientes (superadmin/lo que permita CASL)
router.get("/", allow("read", "clients"), ClientController.getAll);

// 📘 Obtener cliente específico
router.get("/:id", allow("read", "clients"), ClientController.getById);

// ➕ Crear cliente
router.post("/", allow("create", "clients"), ClientController.create);

// ✏️ Actualizar cliente
router.put("/:id", allow("update", "clients"), ClientController.update);

// 🛑 Desactivar cliente
router.patch("/:id/deactivate", allow("delete", "clients"), ClientController.deactivate);

// 🖼 Subir logo
router.post("/:id/logo", allow("update", "clients"), uploadLogo, ClientController.uploadLogo);

export default router;
