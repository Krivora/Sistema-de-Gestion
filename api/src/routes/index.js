import { Router } from "express";
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

const router = Router();

router.use("/auth", authRoutes);
router.use("/activities", activityRoutes);
router.use("/adjustments", adjustmentRoutes);
router.use("/branches", branchRoutes);
router.use("/catalogs", catalogRoutes)
router.use("/categories", categoryRoutes);
router.use("/clients", clientRoutes);
router.use("/customers", customerRoutes);
router.use("/products", productRoutes);
router.use("/branch-products", branchProductRoutes);
router.use("/inventory-transactions", inventoryRoutes);
router.use("/purchases", purchaseRoutes);
router.use("/sales", saleRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/transfers", transferRoutes);
router.use("/reports", reportRoutes)
router.use("/users", userRoutes);

export default router;
