import { createBrowserRouter, RouterProvider } from "react-router-dom";

// 🧩 Layout y componentes base
import Layout from "@core/components/layout/Layout";
import ProtectedRoute from "@core/components/protected/ProtectedRoute";

// 📄 Páginas principales
import Dashboard from "@app/pages/Dashboard";
import Login from "@app/pages/Login";
import Unauthorized from "@app/pages/error/Unauthorized";

// 🏢 Módulos principales (features)
import Branches from "@features/branches/pages/Branches";
import BranchProducts from "@features/branchProducts/pages/BranchProducts";
import Categories from "@features/categories/pages/Categories";
import Products from "@features/products/pages/Products";
import Purchases from "@features/purchases/pages/Purchases";
import Sales from "@features/sales/pages/Sales";
import Adjustments from "@features/adjustments/pages/Adjustment";
import Transfers from "@features/transfers/pages/Transfers";
import InventoryTransactions from "@features/inventory/pages/InventoryTransactions";
import Reports from "@features/reports/pages/Reports";
import Users from "@features/users/pages/Users";

// ⚙️ Administración y configuración
import Clients from "@features/admin/clients/pages/Clients";
import Config from "@features/settings/pages/index";
import Catalogs from "@features/settings/pages/catalogs/index";
import AdjustmentNotesCatalog from "@features/settings/pages/catalogs/adjustment-notes/index";
import TransfersNotesCatalog from "@features/settings/pages/catalogs/transfer-reasons/index";

// 🧭 Configuración de rutas
const router = createBrowserRouter([
  // Rutas públicas
  { path: "/login", element: <Login /> },
  { path: "/unauthorized", element: <Unauthorized /> },

  // Rutas protegidas
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "branches", element: <Branches /> },
      { path: "branches-products", element: <BranchProducts /> },
      { path: "categories", element: <Categories /> },
      { path: "products", element: <Products /> },
      { path: "purchases", element: <Purchases /> },
      { path: "adjustments", element: <Adjustments /> },
      { path: "sales", element: <Sales /> },
      { path: "inventory-transactions", element: <InventoryTransactions /> },
      { path: "transfers", element: <Transfers /> },

      // 🔐 Solo superadmin
      {
        path: "clients",
        element: (
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <Clients />
          </ProtectedRoute>
        ),
      },

      // 🔐 Admin o Superadmin
      {
        path: "users",
        element: (
          <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
            <Users />
          </ProtectedRoute>
        ),
      },

      // ⚙️ Configuración general
      {
        path: "config",
        element: (
          <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
            <Config />
          </ProtectedRoute>
        ),
      },

      // ⚙️ Catálogos dentro de configuración
      {
        path: "settings/catalogs",
        element: (
          <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
            <Catalogs />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings/catalogs/adjustment-notes",
        element: (
          <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
            <AdjustmentNotesCatalog />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings/catalogs/transfer-reasons",
        element: (
          <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
            <TransfersNotesCatalog />
          </ProtectedRoute>
        ),
      },
      // 📊 Reportes
      {
        path: "reports",
        element: (
          <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
            <Reports />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
