// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // ⏳ Esperar mientras valida token
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Verificando sesión...
      </div>
    );
  }

  // 🚫 Si no hay sesión, ir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Si hay usuario, renderiza el contenido
  return children;
}
