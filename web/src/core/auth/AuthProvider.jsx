import {
  createContext, useState, useEffect, useMemo, useCallback,
} from "react";
import { AuthApi }                    from "@core/api/auth";
import { tokenStore }                 from "@core/api/client";
import { ability }                    from "./ability";
import { buildRulesFromPermissions }  from "./buildRules";
import { AbilityContext }             from "./AbilityContext";

export const AuthContext = createContext(null);
const hasToken = tokenStore.hasToken();
// Solo guardamos datos de display — nunca permisos ni token
const USER_KEY = "app_user_display";

function saveUserDisplay(user) {
  try {
    // Solo campos de UI — nunca role_id, permissions, etc.
    const safe = {
      id:            user.id,
      name:          user.name,
      email:         user.email,
      role_name:     user.role_name,
      business_name: user.business_name,
      logo_url:      user.logo_url,
      dark_mode:     user.dark_mode,
    };
    sessionStorage.setItem(USER_KEY, JSON.stringify(safe));
  } catch { /* quota / private mode */ }
}

function loadUserDisplay() {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function clearUserDisplay() {
  sessionStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading,     setLoading]     = useState(true);

  const applyPermissions = useCallback((perms) => {
    setPermissions(perms);
    ability.update(buildRulesFromPermissions(perms));
  }, []);

  // Restaurar sesión — permisos SIEMPRE vienen del backend, nunca del storage
  useEffect(() => {
    tokenStore.restore();
    const hasFlag    = tokenStore.hasFlag();
    const cachedUser = loadUserDisplay();

    if (!hasFlag) {
      clearUserDisplay();
      setLoading(false);
      return;
    }

    // Mostrar datos de display optimistamente (nombre, avatar)
    // pero los permisos están vacíos hasta que llegue la respuesta real
    if (cachedUser) setUser(cachedUser);

    AuthApi.getProfile()
      .then(({ user: freshUser, permissions: freshPerms }) => {
        setUser(freshUser);
        applyPermissions(freshPerms);
        saveUserDisplay(freshUser);
      })
      .catch(() => {
        tokenStore.clear();
        clearUserDisplay();
        setUser(null);
        applyPermissions([]);
      })
      .finally(() => setLoading(false));
  }, [applyPermissions]);

  const login = useCallback(async (email, password) => {
    const { user: loggedUser, permissions: perms, token } =
      await AuthApi.login(email, password);

    // Token ya fue seteado en tokenStore por AuthApi.login
    // Solo guardamos display data en storage
    setUser(loggedUser);
    applyPermissions(perms);
    saveUserDisplay(loggedUser);

    return loggedUser;
  }, [applyPermissions]);

  const logout = useCallback(() => {
    AuthApi.logout();
    clearUserDisplay();
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

  return (
    <AuthContext.Provider value={authValue}>
      <AbilityContext.Provider value={ability}>
        {children}
      </AbilityContext.Provider>
    </AuthContext.Provider>
  );
}