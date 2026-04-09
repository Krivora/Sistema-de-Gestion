// src/hooks/useUsers.js
import { useEffect, useState } from "react";
import { UsersApi } from "../api/users";
import { useAuth } from "@core/auth/useAuth"

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("active"); // 👈 filtro actual
  const { user: currentUser } = useAuth();

  // 🔹 Obtener todos según el filtro
  async function fetchUsers(selectedStatus = status) {
    setLoading(true);
    try {
      const data = await UsersApi.list(selectedStatus);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createUser(payload) {
    try {
      const role_id = payload.role === "admin" ? 2 : 3;
      await UsersApi.create({
        ...payload,
        role_id,
        branch_id: payload.branch_id ?? null,
        client_id: currentUser?.client_id ?? null,
      });
      await fetchUsers(); // 👈 refresca vista
    } catch (err) {
      throw err;
    }
  }

  async function updateUser(id, updated) {
    await UsersApi.update(id, updated);
    await fetchUsers();
  }

  async function desactiveUser(id) {
    await UsersApi.desactive(id);
    await fetchUsers();
  }

  async function deleteUser(id) {
    await UsersApi.remove(id);
    await fetchUsers();
  }

  useEffect(() => {
    fetchUsers(status);
  }, [status]);

  return {
    users,
    loading,
    error,
    status,
    setStatus, // 👈 control del filtro (tabs)
    createUser,
    updateUser,
    deleteUser,
    desactiveUser,
    fetchUsers,
  };
}
