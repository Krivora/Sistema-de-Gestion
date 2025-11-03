// src/core/components/protected/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@core/context/AuthProvider";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  // ⏳ Cargando sesión (mientras valida token o estado)
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500 dark:text-gray-300">
        Verificando sesión...
      </div>
    );
  }

  // 🚫 No autenticado → redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 Restricciones por rol
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role_name)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Acceso autorizado
  // Si el componente recibe children, los muestra; si no, renderiza <Outlet /> para rutas anidadas
  return children || <Outlet />;
}
