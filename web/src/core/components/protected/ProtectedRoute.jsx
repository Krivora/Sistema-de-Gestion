// core/components/protected/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@core/context/AuthProvider";
import { useAbility } from "@core/casl/AbilityContext";
import SessionLoader from "@core/components/ui/SessionLoader";
export default function ProtectedRoute({ action, subject, children }) {
  const { user, loading } = useAuth();
  const ability = useAbility();

  if (loading) return <SessionLoader message="Verificando sesión..." />;
  // Si no hay usuario → login
  if (!user) return <Navigate to="/login" replace />;

  // Si la ruta requiere permisos y no los tiene → 403
  if (action && subject && !ability.can(action, subject)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Si la ruta contiene outlet o children
  return children || <Outlet />;
}
