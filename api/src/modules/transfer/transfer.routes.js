import { Router } from "express";
import { allow } from "../../core/middleware/allow.js";
import * as TransferController from "./transfer.controller.js";

const router = Router();

router.get("/",    allow("read",   "transfers"), TransferController.getAll);
router.get("/:id", allow("read",   "transfers"), TransferController.getById);
router.post("/",   allow("create", "transfers"), TransferController.create);

export default router;