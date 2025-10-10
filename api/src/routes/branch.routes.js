import { Router } from "express";
import * as BranchController from "../controllers/branch.controller.js";

const router = Router();

router.get("/", BranchController.getBranches);
router.get("/:id", BranchController.getBranch);
router.post("/", BranchController.createBranch);
router.put("/:id", BranchController.updateBranch);
router.delete("/:id", BranchController.deleteBranch);
router.put("/:id/status", BranchController.toggleBranchStatus);

export default router;
