import { Router } from "express";
import { allow } from "../../core/middleware/allow.js";
import * as PurchaseController from "./purchase.controller.js";

const router = Router();

router.get("/",    allow("read",   "purchases"), PurchaseController.list);
router.get("/:id", allow("read",   "purchases"), PurchaseController.getById);
router.post("/",   allow("create", "purchases"), PurchaseController.createAndPost);

export default router;