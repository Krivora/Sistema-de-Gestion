import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@core/auth/useAuth"
import { useAbility } from "@core/auth/AbilityContext"
import SessionLoader from "@core/components/ui/SessionLoader";

// permission = "products.read" → action = "read", subject = "products"
function parsePermission(permission) {
  if (!permission || typeof permission !== "string") return null;
  const [subject, action] = permission.split(".");
  if (!subject || !action) return null;
  return { subject, action };
}

export default function ProtectedRoute({ permission, children }) {
  const { user, loading } = useAuth();
  const ability = useAbility();

  if (loading) return <SessionLoader message="Verificando sesión..." />;
  if (!user) return <Navigate to="/login" replace />;

  if (permission) {
    const parsed = parsePermission(permission);
    if (!parsed) {
      console.warn(`ProtectedRoute: formato de permiso inválido → "${permission}". Usa "subject.action"`);
      return <Navigate to="/unauthorized" replace />;
    }
    if (!ability.can(parsed.action, parsed.subject)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children ?? <Outlet />;
}