import { Router } from "express";
import { allow } from "../../core/middleware/allow.js";
import * as AdjustmentController from "./adjustment.controller.js";

const router = Router();

router.get("/",    allow("read",   "adjustments"), AdjustmentController.list);
router.get("/:id", allow("read",   "adjustments"), AdjustmentController.getById);
router.post("/",   allow("create", "adjustments"), AdjustmentController.createAndPost);

export default router;