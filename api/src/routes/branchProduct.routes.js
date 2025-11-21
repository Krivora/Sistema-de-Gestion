import { Router } from "express";
import * as BranchProductController from "../controllers/branchProduct.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { attachPermissions } from "../middleware/permissions.middleware.js";
import { allow } from "../middleware/allow.js";

const router = Router();

// Middlewares globales
router.use(authRequired);
router.use(attachPermissions);

// rutas branchProducts
router.get("/", allow("read", "branch_products"), BranchProductController.getAll);
router.get("/branch/:branchId", allow("read", "branch_products"), BranchProductController.getByBranch);
router.get("/:id", allow("read", "branch_products"), BranchProductController.getOne);

router.post("/", allow("create", "branch_products"), BranchProductController.create);

router.put("/:id", allow("update", "branch_products"), BranchProductController.update);
router.put("/:id/status", allow("update", "branch_products"), BranchProductController.toggleStatus);

router.delete("/:id", allow("delete", "branch_products"), BranchProductController.remove);


export default router;
