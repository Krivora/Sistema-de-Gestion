import express from "express";
import * as controller from "../controllers/inventoryTransaction.controller.js";

const router = express.Router();

router.get("/", controller.list);
router.get("/stock", controller.getStock);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.delete("/:id", controller.remove);

export default router;
