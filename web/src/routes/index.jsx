import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/protected/ProtectedRoute";

import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Branches from "@/pages/Branches";
import BranchProducts from "@/pages/BranchProducts";
import Categories from "@/pages/Categories";
import Clients from "@/pages/admin/Clients";
import Products from "@/pages/Products";
import Purchases from "@/pages/Purchases";
import Sales from "@/pages/Sales";
import Transfers from "@/pages/user/Transfers";
import Adjustments from "@/pages/user/Adjustment";
import Users from "@/pages/Users";
import Reports from "@/pages/Reports";
import InventoryTransactions from "@/pages/InventoryTransactions";
import Config from "@/pages/user/settings";
import Catalogs from "@/pages/user/settings/catalogs"; 
import AdjustmentNotesCatalog from "@/pages/user/settings/catalogs/adjustment-notes";
import Unauthorized from "@/pages/error/Unauthorized";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/unauthorized", element: <Unauthorized /> },

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

      // ⚙️ Catálogos dentro de Configuración
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

export default function Routes() {
  return <RouterProvider router={router} />;
}
