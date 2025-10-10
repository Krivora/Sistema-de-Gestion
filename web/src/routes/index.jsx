import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ProtectedRoute from "../components/ProtectedRoute"; // 👈 asegúrate de tenerlo
import Branches from "../pages/Branches";
import BranchProducts from "../pages/BranchProducts";
import Categories from "../pages/Categories";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Products from "../pages/Products";
import Purchases from "../pages/Purchases";
import Sales from "../pages/Sales";
import Users from "../pages/Users";
import InventoryTransactions from "../pages/InventoryTransactions";
const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
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
      { path: "inventory-transactions", element: <InventoryTransactions /> },
      { path: "products", element: <Products /> },
      { path: "purchases", element: <Purchases /> },
      { path: "sales", element: <Sales /> },
      { path: "categories", element: <Categories /> },
      { path: "users", element: <Users /> },
    ],
  },
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}
