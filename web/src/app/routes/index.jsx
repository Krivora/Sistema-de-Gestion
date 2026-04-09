import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routesConfig } from "./routesConfig";

import Layout from "@core/components/layout/Layout";
import ProtectedRoute from "@core/components/protected/ProtectedRoute";

import Login from "@app/pages/Login";
import Unauthorized from "@app/pages/error/Unauthorized";
import Dashboard from "@app/pages/Dashboard";

function buildRoutes() {
  const protectedChildren = [
    // Dashboard no requiere permiso — cualquier usuario autenticado puede verlo
    { index: true, element: <Dashboard /> },

    // Rutas con permiso — routesConfig ya tiene el formato "subject.action"
    ...routesConfig
      .filter((r) => r.permission && r.path)
      .map((r) => ({
        path: r.path,
        element: (
          <ProtectedRoute permission={r.permission}>
            {r.element}
          </ProtectedRoute>
        ),
      })),
  ];

  return [
    { path: "/login",        element: <Login /> },
    { path: "/unauthorized", element: <Unauthorized /> },

    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: protectedChildren,
    },
  ];
}

const router = createBrowserRouter(buildRoutes());

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}