import { Router } from "express";
import { allow } from "../../core/middleware/allow.js";
import * as SaleController from "./sale.controller.js";

const router = Router();

router.get("/",              allow("read",   "sales"), SaleController.list);
router.get("/:id",           allow("read",   "sales"), SaleController.getById);
router.post("/",             allow("create", "sales"), SaleController.create);
router.patch("/:id/post",    allow("update", "sales"), SaleController.post);
router.patch("/:id/reopen",  allow("update", "sales"), SaleController.reopen);

export default router;