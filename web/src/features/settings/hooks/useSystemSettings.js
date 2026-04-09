// src/features/settings/hooks/useSystemSettings.js
import { useEffect, useState } from "react";
import { SystemSettingsApi } from "../api/SystemSettingsApi";
import { useToast } from "@core/utils/alerts/toastUtils";
import { useAuth } from "@core/auth/useAuth"

export function useSystemSettings() {
  const { user } = useAuth();
  const clientId = user?.client_id;

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await SystemSettingsApi.get(clientId);
      setSettings(data);
    } catch {
      toast.error("Error al cargar configuración del sistema");
    } finally {
      setLoading(false);
    }
  };

  const update = async (payload) => {
    if (!clientId) return;

    try {
      const updated = await SystemSettingsApi.update(clientId, payload);
      setSettings(updated);
      toast.success("Configuración actualizada");
    } catch (err) {
      toast.error("Error al guardar cambios");
    }
  };

  const uploadLogo = async (file) => {
    const res = await SystemSettingsApi.uploadLogo(clientId, file);
    return res.url;
  };


  useEffect(() => {
    load();
  }, [clientId]);

  return { settings, loading, update, uploadLogo, reload: load };
}
