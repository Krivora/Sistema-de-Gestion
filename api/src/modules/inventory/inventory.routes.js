import { Router } from "express";
import { allow } from "../../core/middleware/allow.js";
import * as InventoryController from "./inventory.controller.js";

const router = Router();

router.get("/", allow("read", "inventory"), InventoryController.getAll);

export default router;