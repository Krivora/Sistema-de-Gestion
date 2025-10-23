import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/Protected/ProtectedRoute";

import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Branches from "@/pages/Branches";
import BranchProducts from "@/pages/BranchProducts";
import Categories from "@/pages/Categories";
import Clients from "@/pages/admin/Clients";
import Products from "@/pages/Products";
import Purchases from "@/pages/Purchases";
import Sales from "@/pages/Sales";
import Users from "@/pages/Users";
import Reports from "@/pages/Reports";
import InventoryTransactions from "@/pages/InventoryTransactions";
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
      { path: "sales", element: <Sales /> },
      { path: "inventory-transactions", element: <InventoryTransactions /> },

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

      // 🔐 Solo admin o superadmin
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
