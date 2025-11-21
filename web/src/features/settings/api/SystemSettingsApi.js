// src/features/settings/api/systemSettings.js
import { apiFetch } from "@core/api/client";

export const SystemSettingsApi = {
  get: (clientId) => apiFetch(`/clients/${clientId}`),
  update: (clientId, payload) =>
    apiFetch(`/clients/${clientId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  uploadLogo: (clientId, file) => {
    const form = new FormData();
    form.append("file", file);

    return apiFetch(`/clients/${clientId}/logo`, {
      method: "POST",
      body: form,
      isFormData: true,
    });
  }
};
