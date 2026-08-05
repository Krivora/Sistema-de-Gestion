import { Router } from "express";
import { authRequired } from "../core/middleware/auth.middleware.js";
import { attachPermissions } from "../core/middleware/permissions.middleware.js";
import { blockSuspendedClient } from "../core/middleware/billing.middleware.js";

import activityRoutes from "../modules/activity/activity.routes.js";
import adjustmentRoutes from "../modules/adjustment/adjustment.routes.js";
import branchRoutes from "../modules/branch/branch.routes.js";
import catalogRoutes from "../modules/catalog/catalog.routes.js"; 
import categoryRoutes from "../modules/category/category.routes.js";
import clientRoutes from "../modules/client/client.routes.js";
import customerRoutes from "../modules/customer/customer.routes.js";
import productRoutes from "../modules/product/product.routes.js";
import branchProductRoutes from "../modules/branchProduct/branchProduct.routes.js";
import inventoryRoutes from "../modules/inventory/inventory.routes.js";
import purchaseRoutes from "../modules/purchase/purchase.routes.js";
import saleRoutes from "../modules/sale/sale.routes.js";
import supplierRoutes from "../modules/supplier/supplier.routes.js";
import reportRoutes from "../modules/report/report.routes.js";
import transferRoutes from "../modules/transfer/transfer.routes.js";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import roleRoutes from "../modules/role/role.routes.js";
import permissionRoutes from "../modules/permission/permission.routes.js";

const router = Router();
const guard = [authRequired, attachPermissions, blockSuspendedClient];


router.use("/auth", authRoutes);
router.use("/activities", ...guard, activityRoutes);
router.use("/adjustments", ...guard, adjustmentRoutes);
router.use("/branches", ...guard, branchRoutes);
router.use("/catalogs", ...guard, catalogRoutes);
router.use("/categories", ...guard, categoryRoutes);
router.use("/clients", ...guard, clientRoutes);
router.use("/customers", ...guard, customerRoutes);
router.use("/products", ...guard, productRoutes);
router.use("/branch-products", ...guard, branchProductRoutes);
router.use("/inventory-transactions", ...guard, inventoryRoutes);
router.use("/purchases", ...guard, purchaseRoutes);
router.use("/sales", ...guard, saleRoutes);
router.use("/suppliers", ...guard, supplierRoutes);
router.use("/transfers", ...guard, transferRoutes);
router.use("/reports", ...guard, reportRoutes);
router.use("/users", ...guard, userRoutes);
router.use("/roles", ...guard, roleRoutes);
router.use("/permissions", ...guard, permissionRoutes);

export default router;