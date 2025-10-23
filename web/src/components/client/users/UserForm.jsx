import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";

export default function UserForm({ open, onClose, onSave, user }) {
  const [form, setForm] = useState({ name: "", email: "", role: "user", password: "" });

  useEffect(() => {
    if (user) setForm(user);
    else setForm({ name: "", email: "", role: "user", password: "" });
  }, [user]);

  useEffect(() => {
  if (!open) {
      setForm({ name: "", email: "", role: "user", password: "" });
    }
  }, [open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{user ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <TextField name="name" label="Nombre" value={form.name} onChange={handleChange} fullWidth />
        <TextField name="email" label="Correo" value={form.email} onChange={handleChange} fullWidth />
        <TextField
          select
          name="role"
          label="Rol"
          value={form.role}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="admin">Administrador</MenuItem>
          <MenuItem value="user">Usuario</MenuItem>
        </TextField>
        {!user && (
          <TextField
            name="password"
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
