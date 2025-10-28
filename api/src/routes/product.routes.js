import express from "express";
import * as ProductController from "../controllers/product.controller.js";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(authRequired);

// Solo admins y superadmins gestionan productos
router.get("/", requireRole("superadmin", "admin"), ProductController.getAll);
router.get("/:id", requireRole("superadmin", "admin"), ProductController.getById);
router.post("/", requireRole("superadmin", "admin"), ProductController.create);
router.put("/:id", requireRole("superadmin", "admin"), ProductController.update);
router.put("/:id/desactivate", requireRole("superadmin", "admin"), ProductController.desactivateProduct);
export default router;
