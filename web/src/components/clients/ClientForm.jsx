import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import { useState, useEffect } from "react";

export default function ClientForm({ open, onClose, onSave, client }) {
  const [form, setForm] = useState({
    name: "",
    business_name: "",
    email: "",
    phone: "",
    max_branches: 1,
    max_users: 5,
    admin_name: "",
    admin_email: "",
    admin_password: "",
  });

  useEffect(() => {
    if (client) {
      setForm({
        ...client,
        admin_name: "",
        admin_email: "",
        admin_password: "",
      });
    } else {
      setForm({
        name: "",
        business_name: "",
        email: "",
        phone: "",
        max_branches: 1,
        max_users: 5,
        admin_name: "",
        admin_email: "",
        admin_password: "",
      });
    }
  }, [client]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{client ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
      <DialogContent dividers>
        {/* 🧩 Grid principal */}
        <Grid container spacing={4}>
          {/* 🧭 Columna izquierda — Datos del cliente */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}
            >
              Datos del Cliente
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12}}>
                <TextField
                  name="name"
                  label="Nombre"
                  value={form.name}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12}}>
                <TextField
                  name="business_name"
                  label="Negocio"
                  value={form.business_name}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12}}>
                <TextField
                  name="email"
                  label="Correo"
                  value={form.email}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12}}>
                <TextField
                  name="phone"
                  label="Teléfono"
                  value={form.phone}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12}}>
                <TextField
                  name="max_branches"
                  label="Máx. Sucursales"
                  type="number"
                  value={form.max_branches}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12}}>
                <TextField
                  name="max_users"
                  label="Máx. Usuarios"
                  type="number"
                  value={form.max_users}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Grid>


          {/* 👤 Columna derecha — Admin principal */}
          <Grid  size={{ xs: 12, md: 6 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 1, color: "text.secondary" }}
            >
              Usuario Administrador Principal
            </Typography>
            <Grid container spacing={2}>
              <Grid  size={{ xs: 12}}>
                <TextField
                  name="admin_name"
                  label="Nombre del Admin"
                  value={form.admin_name}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid  size={{ xs: 12}}>
                <TextField
                  name="admin_email"
                  label="Correo del Admin"
                  value={form.admin_email}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              {!client && (
                <Grid size={{ xs: 12}}>
                  <TextField
                    name="admin_password"
                    label="Contraseña del Admin"
                    type="password"
                    value={form.admin_password}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
