// src/api/auth.js
import { apiFetch } from "./client";

export const AuthApi = {
  // 🔐 Login
  login: async (email, password) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("permissions", JSON.stringify(data.user.permissions || []));
    return {  
      user: data.user,
      permissions: data.user.permissions || [],
      token: data.token,
    };
  },



  // 🧾 Registro
  register: async (payload) => {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
  },

  // 👤 Obtener perfil actual
  getProfile: async () => {
    const user = await apiFetch("/auth/me");

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("permissions", JSON.stringify(user.permissions || []));

    return user;
  },



  // 🚪 Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");
  },
};
