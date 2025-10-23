import express from "express";
import * as ClientController from "../controllers/client.controller.js";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authRequired);

// Solo el superadmin puede manejar clientes
router.get("/", requireRole("superadmin"), ClientController.getAll);
router.get("/:id", requireRole("superadmin"), ClientController.getById);
router.post("/", requireRole("superadmin"), ClientController.create);
router.put("/:id", requireRole("superadmin"), ClientController.update);
router.patch("/:id/deactivate", requireRole("superadmin"), ClientController.deactivate);

export default router;
