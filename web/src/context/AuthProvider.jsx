import { createContext, useContext, useState, useEffect } from "react";
import { AuthApi } from "@/api";

// 1️⃣ Creamos el contexto global
const AuthContext = createContext();

// 2️⃣ Proveedor principal
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // Datos del usuario logueado
  const [loading, setLoading] = useState(true); // Para mostrar loaders mientras valida sesión
  const [error, setError] = useState(null); // Por si falla algo al autenticar

  // 🧠 Verificar sesión al montar la app
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    if (!token) return setLoading(false);

    AuthApi.getProfile()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);


  // 🔐 Login
  const login = async (email, password) => {
    setError(null);
    try {
      const u = await AuthApi.login(email, password);
      setUser(u);
      return u;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 🧾 Registro
  const register = async (payload) => {
    setError(null);
    try {
      const u = await AuthApi.register(payload);
      setUser(u);
      return u;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 🚪 Logout
  const logout = () => {
    AuthApi.logout();
    setUser(null);
  };

  // 🧩 Datos que estarán disponibles globalmente
  const value = {
    user,             // { id, name, email, role, client_id, branch_id }
    loading,          // booleano: si está validando token
    error,            // último error de login o register
    login,
    register,
    logout,
    isAdmin: user?.role === "admin" || user?.role === "superadmin",
    isSuperadmin: user?.role === "superadmin",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 3️⃣ Hook personalizado (azúcar sintáctica)
export function useAuth() {
  return useContext(AuthContext);
}
