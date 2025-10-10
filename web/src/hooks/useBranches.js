import { useEffect, useState } from "react";
import { BranchesApi } from "../api";

export function useBranches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Obtener todas las sucursales
  const fetchBranches = async () => {
    try {
      setLoading(true);
      const data = await BranchesApi.list();
      setBranches(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Crear nueva sucursal
  const addBranch = async (payload) => {
    const newBranch = await BranchesApi.create(payload);
    setBranches((prev) => [...prev, newBranch]);
  };

  // 🔹 Editar sucursal
  const updateBranch = async (id, payload) => {
    const updated = await BranchesApi.update(id, payload);
    setBranches((prev) => prev.map((b) => (b.id === id ? updated : b)));
  };

  // 🔹 Eliminar
  const deleteBranch = async (id) => {
    await BranchesApi.remove(id);
    setBranches((prev) => prev.filter((b) => b.id !== id));
  };

  // 🔹 Activar / Desactivar
  const toggleBranchStatus = async (id, newStatus) => {
    const updated = await BranchesApi.toggleStatus(id, newStatus);
    setBranches((prev) => prev.map((b) => (b.id === id ? updated : b)));
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  return {
    branches,
    loading,
    error,
    fetchBranches,
    addBranch,
    updateBranch,
    deleteBranch,
    toggleBranchStatus,
  };
}
