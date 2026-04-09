import { apiFetch, tokenStore } from "./client";

export const AuthApi = {
  login: async (email, password) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    tokenStore.set(data.token);
    return {
      user:        data.user,
      permissions: data.user?.permissions ?? [],
      token:       data.token,
      ability:     data.ability ?? [],
    };
  },

  register: async (payload) => {
    // Register no hace auto-login — el admin decide
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data.user;
  },

  getProfile: async () => {
    const data = await apiFetch("/auth/me");
    return {
      user:        data.user,
      permissions: data.user?.permissions ?? [],
    };
  },

  logout: () => tokenStore.clear(),
};