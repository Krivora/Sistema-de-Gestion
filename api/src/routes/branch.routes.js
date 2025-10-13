// src/routes/branch.routes.js
import { Router } from "express";
import * as BranchController from "../controllers/branch.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authRequired, BranchController.getBranches);
router.get("/:id", authRequired, BranchController.getBranch);
router.post("/", authRequired, BranchController.createBranch);
router.put("/:id", authRequired, BranchController.updateBranch);
router.delete("/:id", authRequired, BranchController.deleteBranch);
router.put("/:id/status", authRequired, BranchController.toggleBranchStatus);

export default router;
