import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import { attachPermissions } from "../middleware/permissions.middleware.js";

import activityRoutes from "./activity.routes.js";
import adjustmentRoutes from "./adjustment.routes.js";
import branchRoutes from "./branch.routes.js";
import catalogRoutes from "./catalog.routes.js";
import categoryRoutes from "./category.routes.js";
import clientRoutes from "./client.routes.js";
import customerRoutes from "./customers.routes.js";
import productRoutes from "./product.routes.js";
import branchProductRoutes from "./branchProduct.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import purchaseRoutes from "./purchase.routes.js";
import saleRoutes from "./sale.routes.js";
import supplierRoutes from "./suppliers.routes.js";
import reportRoutes from "./report.routes.js";
import transferRoutes from "./transfer.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import roleRoutes from "./role.routes.js";
import permissionRoutes from "./permission.routes.js";

const router = Router();

router.use("/auth", authRoutes);

// 🔐 TODAS LAS RUTAS PROTEGIDAS:
router.use("/activities", authRequired, attachPermissions, activityRoutes);
router.use("/adjustments", authRequired, attachPermissions, adjustmentRoutes);
router.use("/branches", authRequired, attachPermissions, branchRoutes);
router.use("/catalogs", authRequired, attachPermissions, catalogRoutes);
router.use("/categories", authRequired, attachPermissions, categoryRoutes);
router.use("/clients", authRequired, attachPermissions, clientRoutes);
router.use("/customers", authRequired, attachPermissions, customerRoutes);
router.use("/products", authRequired, attachPermissions, productRoutes);
router.use("/branch-products", authRequired, attachPermissions, branchProductRoutes);
router.use("/inventory-transactions", authRequired, attachPermissions, inventoryRoutes);
router.use("/purchases", authRequired, attachPermissions, purchaseRoutes);
router.use("/sales", authRequired, attachPermissions, saleRoutes);
router.use("/suppliers", authRequired, attachPermissions, supplierRoutes);
router.use("/transfers", authRequired, attachPermissions, transferRoutes);
router.use("/reports", authRequired, attachPermissions, reportRoutes);
router.use("/users", authRequired, attachPermissions, userRoutes);
router.use("/roles", authRequired, attachPermissions, roleRoutes);
router.use("/permissions", authRequired, attachPermissions, permissionRoutes);

export default router;
