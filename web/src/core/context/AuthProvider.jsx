// core/context/AuthProvider.jsx
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { AuthApi } from "@core/api/auth";
import { ability } from "@core/casl/ability";
import { buildRulesFromPermissions } from "@core/casl/defineAbilities";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================
  // Restaurar sesión
  // ============================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedPerms = localStorage.getItem("permissions");
    const token = localStorage.getItem("token");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedPerms) {
      const perms = JSON.parse(storedPerms);
      setPermissions(perms);

      const rules = buildRulesFromPermissions(perms);
      ability.update(rules);
    }

    if (!token) {
      setLoading(false);
      return;
    }

    // Consultar perfil real en backend
    AuthApi.getProfile()
      .then((profile) => {
        // Tu backend devuelve:
        //  { id, name, email, permissions }
        setUser(profile.user);
        setPermissions(profile.permissions);

        const rules = buildRulesFromPermissions(profile.permissions);
        ability.update(rules);
      })
      .catch(() => {
        localStorage.clear();
        setUser(null);
        setPermissions([]);
        ability.update([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ============================
  // LOGIN
  // ============================
  const login = async (email, password) => {
    const { user, permissions, token } = await AuthApi.login(email, password);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("permissions", JSON.stringify(permissions));

    setUser(user);
    setPermissions(permissions);

    const rules = buildRulesFromPermissions(permissions);
    ability.update(rules);

    return user;
  };

  // ============================
  // LOGOUT
  // ============================
  const logout = () => {
    AuthApi.logout();
    localStorage.clear();

    setUser(null);
    setPermissions([]);
    ability.update([]);
  };

  // ============================
  // CONTEXT VALUES
  // ============================
  const value = useMemo(
    () => ({
      user,
      permissions,
      loading,
      login,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, permissions, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
