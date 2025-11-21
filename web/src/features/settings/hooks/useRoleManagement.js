// src/features/settings/hooks/useRoleManagement.js
import { useEffect, useMemo, useState } from "react";
import { RolesApi } from "../api/roles";
import { PermissionsApi } from "../api/permissions";
import { useToast } from "@core/utils/alerts/toastUtils";

const MODULE_LABELS = {
  branches: "Sucursales",
  branch_products: "Productos por sucursal",
  categories: "Categorías",
  clients: "Clientes del sistema",
  customers: "Clientes del negocio",
  products: "Productos",
  suppliers: "Proveedores",
  purchases: "Compras",
  sales: "Ventas",
  adjustments: "Ajustes de inventario",
  transfers: "Transferencias",
  inventory: "Movimientos de inventario",
  catalogs: "Catálogos",
  users: "Usuarios",
  reports: "Reportes",
  settings: "Configuración",
  audit: "Auditoría",
  permissions: "Permisos",
  roles: "Roles",
};

export function useRoleManagement() {
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const [permissions, setPermissions] = useState([]);
  const [selectedPermissionKeys, setSelectedPermissionKeys] = useState([]);

  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [savingRole, setSavingRole] = useState(false);

  const toast = useToast();

  // 📚 Cargar roles
  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const data = await RolesApi.list();
      setRoles(data || []);

      if (!selectedRoleId && data?.length) {
        setSelectedRoleId(data[0].id);
      }
    } catch {
      toast.error("Error al cargar roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  // 📚 Cargar permisos
  const fetchPermissions = async () => {
    setLoadingPermissions(true);
    try {
      const data = await PermissionsApi.list();
      setPermissions(data || []);
    } catch {
      toast.error("Error al cargar permisos");
    } finally {
      setLoadingPermissions(false);
    }
  };

  // 📘 Cargar rol seleccionado
  const fetchRoleDetails = async (id) => {
    if (!id) return;
    try {
      const data = await RolesApi.getById(id);
      setSelectedRole(data);
      setSelectedPermissionKeys(data.permissions || []); // asumimos array de keys
    } catch {
      toast.error("Error al cargar detalles del rol");
    }
  };

  // ➕ Crear rol
  const createRole = async (payload) => {
    setSavingRole(true);
    try {
      const created = await RolesApi.create(payload);
      setRoles((prev) => [...prev, created]);
      setSelectedRoleId(created.id);
      toast.success("Rol creado correctamente");
      return created;
    } catch (err) {
      toast.error("Error al crear rol");
      throw err;
    } finally {
      setSavingRole(false);
    }
  };

  // ✏️ Actualizar rol
  const updateRole = async (id, payload) => {
    setSavingRole(true);
    try {
      const updated = await RolesApi.update(id, payload);
      setRoles((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setSelectedRole(updated);
      toast.success("Rol actualizado");
      return updated;
    } catch (err) {
      toast.error("Error al actualizar rol");
      throw err;
    } finally {
      setSavingRole(false);
    }
  };

  // ❌ Eliminar rol
  const deleteRole = async (id) => {
    try {
      await RolesApi.remove(id);
      setRoles((prev) => prev.filter((r) => r.id !== id));

      if (selectedRoleId === id) {
        const remaining = roles.filter((r) => r.id !== id);
        setSelectedRoleId(remaining[0]?.id ?? null);
        setSelectedRole(remaining[0] ?? null);
        setSelectedPermissionKeys([]);
      }

      toast.success("Rol eliminado");
    } catch {
      toast.error("Error al eliminar rol");
    }
  };

  // 🛂 Asignar permisos
  const savePermissions = async () => {
    if (!selectedRoleId) return;
    setSavingPermissions(true);
    try {
      await RolesApi.assignPermissions(selectedRoleId, selectedPermissionKeys);
      toast.success("Permisos actualizados");
    } catch {
      toast.error("Error al guardar permisos");
    } finally {
      setSavingPermissions(false);
    }
  };

  // 🧠 Agrupar permisos por módulo / subject
  const groupedPermissions = useMemo(() => {
    if (!permissions?.length) return [];

    const groups = {};

    permissions.forEach((perm) => {
      const [subject, action] = perm.key.split(".");
      if (!subject || !action) return;

      if (!groups[subject]) {
        groups[subject] = {
          subject,
          label: MODULE_LABELS[subject] || subject.replace(/_/g, " "),
          items: [],
        };
      }

      groups[subject].items.push({
        ...perm,
        action,
        assigned: selectedPermissionKeys.includes(perm.key),
      });
    });

    return Object.values(groups).sort((a, b) =>
      a.label.localeCompare(b.label, "es")
    );
  }, [permissions, selectedPermissionKeys]);

  // ✅ Toggle individual de permiso
  const togglePermission = (key) => {
    setSelectedPermissionKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // ✅ Toggle grupo completo
  const toggleGroup = (subject) => {
    const keysOfGroup = permissions
      .filter((p) => p.key.startsWith(subject + "."))
      .map((p) => p.key);

    const allSelected = keysOfGroup.every((k) =>
      selectedPermissionKeys.includes(k)
    );

    setSelectedPermissionKeys((prev) => {
      if (allSelected) {
        // desmarcar todos
        return prev.filter((k) => !keysOfGroup.includes(k));
      } else {
        // marcar todos
        const set = new Set(prev);
        keysOfGroup.forEach((k) => set.add(k));
        return Array.from(set);
      }
    });
  };

  // 🔁 Inicial
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  // 🔁 Cuando cambia el rol seleccionado
  useEffect(() => {
    if (selectedRoleId) {
      fetchRoleDetails(selectedRoleId);
    }
  }, [selectedRoleId]);

  return {
    roles,
    selectedRole,
    selectedRoleId,
    setSelectedRoleId,

    groupedPermissions,
    selectedPermissionKeys,
    togglePermission,
    toggleGroup,

    loadingRoles,
    loadingPermissions,
    savingPermissions,
    savingRole,

    createRole,
    updateRole,
    deleteRole,
    savePermissions,
  };
}
