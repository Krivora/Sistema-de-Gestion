// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  // ⏳ Esperando validación de sesión
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Verificando sesión...
      </div>
    );
  }

  // 🚫 No hay usuario → redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 Si la ruta tiene restricción de roles y el usuario no cumple
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role_name)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Usuario autenticado y con permisos
  return children;
}
