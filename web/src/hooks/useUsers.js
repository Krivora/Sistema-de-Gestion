import { useEffect, useState } from "react";
import { UsersApi } from "../api";
import { useAuth } from "@/context/AuthProvider";
export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth();
  // 🔹 Obtener todos
  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await UsersApi.list();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Crear
  async function createUser(newData) {
    // Mapeo de roles (2 = admin, 3 = user)
    const role_id = newData.role === "admin" ? 2 : 3;
    // 🚀 Enviar con client_id del usuario logueado
    const newUser = await UsersApi.create({
      ...newData,
      role_id,
      branch_id: newData.branch_id ?? null,
      client_id: currentUser?.client_id ?? null, // 👈 automático desde el contexto
    });
    setUsers((prev) => [...prev, newUser]);
  }


  // 🔹 Actualizar
  async function updateUser(id, updated) {
    const res = await UsersApi.update(id, updated);
    setUsers((prev) => prev.map((u) => (u.id === id ? res : u)));
  }

  // 🔹 Eliminar (duro)
  async function deleteUser(id) {
    await UsersApi.remove(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  // 🔹 Activar / Inhabilitar usuario
  async function toggleUserStatus(id, newStatus) {
    const updated = await UsersApi.toggleStatus(id, newStatus);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
  }

  // 🔹 Montar
  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Retorno
  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    fetchUsers,
    toggleUserStatus, // 👈 ahora está disponible
  };
}
