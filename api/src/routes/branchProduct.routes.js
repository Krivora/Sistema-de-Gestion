import { Router } from "express";
import * as BranchProductController from "../controllers/branchProduct.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authRequired, BranchProductController.getAll);
router.get("/branch/:branchId", authRequired, BranchProductController.getByBranch);
router.get("/:id", authRequired, BranchProductController.getOne);
router.post("/", authRequired, BranchProductController.create);
router.put("/:id", authRequired, BranchProductController.update);
router.put("/:id/status", authRequired, BranchProductController.toggleStatus);
router.delete("/:id", authRequired, BranchProductController.remove);

export default router;
