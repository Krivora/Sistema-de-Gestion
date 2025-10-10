import { useEffect, useState } from "react";
import { UsersApi } from "../api";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  async function createUser(user) {
    const newUser = await UsersApi.create(user);
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
