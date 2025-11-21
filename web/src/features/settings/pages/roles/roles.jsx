import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Grid,
} from "@mui/material";
import PageHeader from "@core/components/common/PageHeader";
import { useRoleManagement } from "../../hooks/useRoleManagement";
import { useAbility } from "@core/casl/AbilityContext";

export default function RolesPage() {
  const {
    roles,
    selectedRole,
    selectedRoleId,
    setSelectedRoleId,
    groupedPermissions,
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
  } = useRoleManagement();

  const ability = useAbility();

  const [searchRole, setSearchRole] = useState("");
  const [searchPerm, setSearchPerm] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const canManageRoles = ability.can("update", "roles") || ability.can("create", "roles");
  const canDeleteRoles = ability.can("delete", "roles");
  const canEditPermissions = ability.can("assignPermissions", "roles");

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(searchRole.toLowerCase())
  );

  const filteredGroups = groupedPermissions
    .map((group) => ({
      ...group,
      items: group.items.filter((p) =>
        (p.description || p.key).toLowerCase().includes(searchPerm.toLowerCase())
      ),
    }))
    .filter((g) => g.items.length > 0);

  const openCreate = () => {
    setEditingRole(null);
    setForm({ name: "", description: "" });
    setModalOpen(true);
  };

  const openEdit = () => {
    if (!selectedRole) return;
    setEditingRole(selectedRole);
    setForm({
      name: selectedRole.name,
      description: selectedRole.description || "",
    });
    setModalOpen(true);
  };

  const saveRoleModal = async () => {
    if (!form.name.trim()) return;

    if (editingRole) {
      await updateRole(editingRole.id, form);
    } else {
      await createRole(form);
    }
    setModalOpen(false);
  };

  return (
    <Box p={4}>

      {/* HEADER */}
      <PageHeader
        title="Roles del Sistema"
        description="Administra roles y permisos de forma centralizada."
        breadcrumbs={[
          { label: "Configuración", to: "/config" },
          { label: "Roles" },
        ]}
      />

      <Paper elevation={3} sx={{ mt: 4, display: "flex", height: "75vh" }}>

        {/* ========== LISTA DE ROLES ========== */}
        <Box width={280} borderRight="1px solid #ddd" display="flex" flexDirection="column">
          <Box p={2} display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              Roles
            </Typography>

            {ability.can("create", "roles") && (
              <Button size="small" variant="contained" onClick={openCreate}>
                Nuevo
              </Button>
            )}
          </Box>

          <Box p={2}>
            <TextField
              fullWidth
              label="Buscar rol"
              size="small"
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
            />
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {loadingRoles ? (
              <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <List dense>
                {filteredRoles.map((role) => (
                  <ListItemButton
                    key={role.id}
                    selected={role.id === selectedRoleId}
                    onClick={() => setSelectedRoleId(role.id)}
                  >
                    <ListItemText primary={role.name} />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
        </Box>

        {/* ========== DETALLE DEL ROL ========== */}
        <Box flex={1} p={3} display="flex" flexDirection="column" overflow="hidden">
          {!selectedRole ? (
            <Box flex={1} display="flex" justifyContent="center" alignItems="center">
              <Typography color="text.secondary">Selecciona un rol</Typography>
            </Box>
          ) : (
            <>

              {/* HEADER DEL DETALLE */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedRole.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRole.description}
                  </Typography>
                </Box>

                <Box display="flex" gap={2}>
                  {canManageRoles && (
                    <Button variant="outlined" onClick={openEdit}>
                      Editar
                    </Button>
                  )}
                  {canDeleteRoles && (
                    <Button color="error" variant="contained" onClick={() => deleteRole(selectedRole.id)}>
                      Eliminar
                    </Button>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* BUSCADOR PERMISOS Y BOTÓN GUARDAR */}
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <TextField
                  label="Buscar permisos"
                  size="small"
                  sx={{ maxWidth: 300 }}
                  value={searchPerm}
                  onChange={(e) => setSearchPerm(e.target.value)}
                />

                {canEditPermissions && (
                  <Button
                    variant="contained"
                    disabled={savingPermissions}
                    onClick={savePermissions}
                  >
                    {savingPermissions ? "Guardando..." : "Guardar permisos"}
                  </Button>
                )}
              </Box>

              {/* PERMISOS AGRUPADOS */}
              <Box flex={1} overflow="auto">
                {loadingPermissions ? (
                  <Box mt={4} display="flex" justifyContent="center">
                    <CircularProgress size={32} />
                  </Box>
                ) : (
                  filteredGroups.map((group) => {
                    const allSelected = group.items.every((p) => p.assigned);

                    return (
                      <Paper key={group.subject} sx={{ p: 2, mb: 2 }}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {group.label}
                          </Typography>

                          {canEditPermissions && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Checkbox
                                checked={allSelected}
                                onChange={() => toggleGroup(group.subject)}
                              />
                              <Typography variant="caption">Todos</Typography>
                            </Box>
                          )}
                        </Box>

                        <Grid container spacing={1}>
                          {group.items.map((perm) => (
                            <Grid item xs={12} sm={6} key={perm.key}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Checkbox
                                  checked={perm.assigned}
                                  disabled={!canEditPermissions}
                                  onChange={() => togglePermission(perm.key)}
                                />
                                <Typography>{perm.description || perm.key}</Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Paper>
                    );
                  })
                )}
              </Box>
            </>
          )}
        </Box>
      </Paper>

      {/* ========== MODAL CREAR / EDITAR ROL ========== */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingRole ? "Editar Rol" : "Crear Nuevo Rol"}</DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Nombre del rol"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Descripción"
            multiline
            minRows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            fullWidth
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={saveRoleModal}
            disabled={savingRole || !form.name.trim()}
          >
            {savingRole ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
