import { Router } from "express";
import branchRoutes from "./branch.routes.js";
import categoryRoutes from "./category.routes.js";
import productRoutes from "./product.routes.js";
import branchProductRoutes from "./branchProduct.routes.js";
import inventoryTransactionRoutes from "./inventoryTransaction.routes.js";
import purchaseRoutes from "./purchase.routes.js";
import saleRoutes from "./sale.routes.js";
import reportRoutes from "./report.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/branches", branchRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/branch-products", branchProductRoutes);
router.use("/inventory-transactions", inventoryTransactionRoutes);
router.use("/purchases", purchaseRoutes);
router.use("/sales", saleRoutes);
router.use("/reports", reportRoutes)
router.use("/users", userRoutes);

export default router;
