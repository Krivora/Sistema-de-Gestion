import express from "express";
import * as BranchController from "../controllers/branch.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { attachPermissions } from "../middleware/permissions.middleware.js";
import { allow } from "../middleware/allow.js";

const router = express.Router();
// Siempre primero autenticación
router.use(authRequired);
router.use(attachPermissions);

router.get("/", allow("read", "branches"), BranchController.getAll);
router.get("/:id", allow("read", "branches"), BranchController.getById);
router.post("/", allow("create", "branches"), BranchController.create);
router.put("/:id",allow("update", "branches"),BranchController.update);
router.put("/:id/desactivate",allow("update", "branches"),BranchController.desactivateBranch);
export default router;
