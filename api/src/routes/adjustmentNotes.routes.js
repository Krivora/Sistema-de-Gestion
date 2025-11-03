import express from "express";
import * as AdjustmentNotesController from "../controllers/adjustmentNotes.controller.js";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(authRequired);

router.get("/",requireRole("superadmin", "admin"), AdjustmentNotesController.list);
router.post("/",requireRole("superadmin", "admin"),AdjustmentNotesController.create);
router.delete("/:id",requireRole("superadmin", "admin"), AdjustmentNotesController.remove);
router.patch("/:id/restore",requireRole("superadmin", "admin"), AdjustmentNotesController.restore);

export default router;
