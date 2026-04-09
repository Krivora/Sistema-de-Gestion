import { Router } from "express";
import { allow } from "../../core/middleware/allow.js";
import * as BranchProductController from "./branchProduct.controller.js";

const router = Router();

router.get("/",                  allow("read",   "branch_products"), BranchProductController.getAll);
router.get("/branch/:branchId",  allow("read",   "branch_products"), BranchProductController.getByBranch);
router.get("/:id",               allow("read",   "branch_products"), BranchProductController.getOne);
router.post("/",                 allow("create", "branch_products"), BranchProductController.create);
router.put("/:id",               allow("update", "branch_products"), BranchProductController.update);
router.patch("/:id/status",      allow("update", "branch_products"), BranchProductController.toggleStatus);
router.delete("/:id",            allow("delete", "branch_products"), BranchProductController.remove);

export default router;