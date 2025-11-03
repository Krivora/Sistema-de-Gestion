import { useEffect, useState } from "react";
import { BranchesApi } from "../api/branches";
import { useAuth } from "@core/context/AuthProvider";

export function useBranches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth();
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
    try {
      const newBranch = await BranchesApi.create({
        ...payload,
        client_id: currentUser?.client_id ?? null,
      });
      setBranches((prev) => [...prev, newBranch]);
      return newBranch; // 👈 importante
    } catch (err) {
      // 👇 devuelve el error al componente
      throw err;
    }
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
  };
}
