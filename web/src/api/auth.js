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
    return data.user;
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
    const data = await apiFetch("/auth/me");
    localStorage.setItem("user", JSON.stringify(data));
    return data;
  },

  // 🚪 Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
