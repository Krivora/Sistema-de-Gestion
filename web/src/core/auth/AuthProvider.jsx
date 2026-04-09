import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { AuthApi } from "@core/api/auth";
import { tokenStore } from "@core/api/client";
import { ability } from "./ability";
import { buildRulesFromPermissions } from "./buildRules";
import { AbilityContext } from "./AbilityContext";

export const AuthContext = createContext(null);

const SESSION_KEY = "app_session";

function saveSession(user, permissions) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user, permissions }));
  } catch { /* quota exceeded o modo privado */ }
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem("_t");
}

export function AuthProvider({ children }) {
  const [user, setUser]             = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading]       = useState(true);

  // Centraliza la actualización de permisos en memoria y en CASL
  const applyPermissions = useCallback((perms) => {
    setPermissions(perms);
    ability.update(buildRulesFromPermissions(perms));
  }, []);

  // Restaurar sesión al recargar página
  useEffect(() => {
    const session     = loadSession();
    const storedToken = sessionStorage.getItem("_t");

    if (!storedToken) {
      clearSession();
      setLoading(false);
      return;
    }

    // Mostrar datos cacheados optimistamente mientras validamos con el backend
    if (session?.user) {
      setUser(session.user);
      applyPermissions(session.permissions ?? []);
    }

    tokenStore.set(storedToken);

    AuthApi.getProfile()
      .then(({ user: freshUser, permissions: freshPerms }) => {
        setUser(freshUser);
        applyPermissions(freshPerms);
        saveSession(freshUser, freshPerms);
      })
      .catch(() => {
        tokenStore.clear();
        clearSession();
        setUser(null);
        applyPermissions([]);
      })
      .finally(() => setLoading(false));
  }, [applyPermissions]);

  const login = useCallback(async (email, password) => {
    const { user: loggedUser, permissions: perms, token } =
      await AuthApi.login(email, password);

    sessionStorage.setItem("_t", token);
    setUser(loggedUser);
    applyPermissions(perms);
    saveSession(loggedUser, perms);

    return loggedUser;
  }, [applyPermissions]);

  const logout = useCallback(() => {
    AuthApi.logout();
    clearSession();
    setUser(null);
    applyPermissions([]);
  }, [applyPermissions]);

  const authValue = useMemo(() => ({
    user,
    permissions,
    loading,
    login,
    logout,
    isAuthenticated: Boolean(user),
  }), [user, permissions, loading, login, logout]);

  // AuthProvider envuelve AbilityContext — un solo árbol, sin CaslWrapper externo
  return (
    <AuthContext.Provider value={authValue}>
      <AbilityContext.Provider value={ability}>
        {children}
      </AbilityContext.Provider>
    </AuthContext.Provider>
  );
}