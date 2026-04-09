import { apiFetch, tokenStore } from "./client";

export const AuthApi = {
  login: async (email, password) => {
    // Sin token todavía — apiFetch lo maneja
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    tokenStore.set(data.token);

    return {
      user: data.user,
      permissions: data.user.permissions || [],
      token: data.token,
      ability: data.ability || [],
    };
  },

  register: async (payload) => {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    tokenStore.set(data.token);
    return data.user;
  },

  // /auth/me devuelve { user: { ...campos, permissions: [] } }
  getProfile: async () => {
    const data = await apiFetch("/auth/me");
    return {
      user: data.user,
      permissions: data.user?.permissions || [],
    };
  },

  logout: () => {
    tokenStore.clear();
  },
};