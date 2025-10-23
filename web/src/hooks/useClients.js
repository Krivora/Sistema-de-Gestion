import { useEffect, useState } from "react";
import { ClientsApi } from "../api/clients";
import { useToast } from "../utils/toastUtils";

export function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setLoading(true);
    try {
      const data = await ClientsApi.list();
      setClients(data);
    } catch {
      toast.error("Error al cargar los clientes");
    } finally {
      setLoading(false);
    }
  }

  async function createClient(payload) {
    try {
      const newClient = await ClientsApi.create(payload);
      setClients((prev) => [...prev, newClient]);
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function updateClient(id, payload) {
    try {
      // 🧼 Limpiar datos antes de enviarlos
      const {
        created_at,
        updated_at,
        admin_name,
        admin_email,
        admin_password,
        admin_role_id,
        ...cleanPayload
      } = payload;

      const updated = await ClientsApi.update(id, cleanPayload);
      setClients((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      toast.error(err.message || "Error al actualizar el cliente");
    }
  }

  async function toggleClientStatus(id, is_active) {
    try {
      await ClientsApi.toggleStatus(id, is_active);
      setClients((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active } : c))
      );
    } catch (err) {
      toast.error("Error al cambiar estado del cliente");
    }
  }

  async function deleteClient(id) {
    try {
      await ClientsApi.remove(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      toast.error("Error al eliminar cliente");
    }
  }

  return {
    clients,
    loading,
    createClient,
    updateClient,
    toggleClientStatus,
    deleteClient,
    reload: loadClients,
  };
}
