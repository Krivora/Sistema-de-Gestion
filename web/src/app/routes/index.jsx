// routes/index.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routesConfig } from "./routesConfig";

import Layout from "@core/components/layout/Layout";
import ProtectedRoute from "@core/components/protected/ProtectedRoute";

// 🔥 Deben importarse manualmente aquí
import Login from "@app/pages/Login";
import Unauthorized from "@app/pages/error/Unauthorized";
import Dashboard from "@app/pages/Dashboard";

function buildRoutes() {
  return [
    // Rutas públicas sin layout
    { path: "/login", element: <Login /> },
    { path: "/unauthorized", element: <Unauthorized /> },

    // Rutas privadas con Layout
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Dashboard /> },

        ...routesConfig
          .filter((r) => r.permission && !r.index)
          .map((r) => {
            const [subject, action] = r.permission.split(".");
            return {
              path: r.path,
              element: (
                <ProtectedRoute action={action} subject={subject}>
                  {r.element}
                </ProtectedRoute>
              ),
            };
          }),
      ],
    },
  ];
}

export default function AppRoutes() {
  return <RouterProvider router={createBrowserRouter(buildRoutes())} />;
}
