import express from "express";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";
import * as CustomerController from "../controllers/customer.controller.js";

const router = express.Router();
router.use(authRequired);

router.get("/", requireRole("superadmin", "admin"), CustomerController.list);
router.get("/:id", requireRole("superadmin", "admin"), CustomerController.getById);
router.post("/", requireRole("superadmin", "admin"), CustomerController.create);
router.put("/:id", requireRole("superadmin", "admin"), CustomerController.update);
router.patch("/:id/deactivate", requireRole("superadmin", "admin"), CustomerController.deactivate);

export default router;
