// src/routes/inventoryTransaction.routes.js
import express from "express";
import * as controller from "../controllers/inventoryTransaction.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authRequired, controller.list);
router.get("/stock", authRequired, controller.getStock);
router.get("/:id", authRequired, controller.getById);
router.post("/", authRequired, controller.create);
router.delete("/:id", authRequired, controller.remove);

export default router;
