import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";

export default function BranchForm({ open, onClose, onSave, branch }) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    address: "",
    phone: "",
    is_active: true,
  });

  useEffect(() => {
    if (branch) {
      setForm(branch);
    } else {
      setForm({
        code: "",
        name: "",
        address: "",
        phone: "",
        is_active: true,
      });
    }
  }, [branch]);

  useEffect(() => {
    if (!open) {
      setForm({
        code: "",
        name: "",
        address: "",
        phone: "",
        is_active: true,
      });
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.name) return;
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{branch ? "Editar Sucursal" : "Nueva Sucursal"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <TextField name="name" label="Nombre" value={form.name} onChange={handleChange} fullWidth />
        <TextField
          name="address"
          label="Dirección"
          value={form.address}
          onChange={handleChange}
          fullWidth
          multiline
          minRows={2}
        />
        <TextField name="phone" label="Teléfono" value={form.phone} onChange={handleChange} fullWidth />
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
