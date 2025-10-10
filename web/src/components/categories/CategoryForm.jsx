import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";

export default function CategoryForm({ open, onClose, onSave, category }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    code: "",
    status: true,
  });

  useEffect(() => {
    if (category)
      setForm({
        name: category.name || "",
        description: category.description || "",
        code: category.code || "",
        status: category.status ?? true,
      });
    else
      setForm({
        name: "",
        description: "",
        code: "",
        status: true,
      });
  }, [category]);

  useEffect(() => {
    if (!open)
      setForm({
        name: "",
        description: "",
        code: "",
        status: true,
      });
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{category ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <TextField
          name="name"
          label="Nombre de la categoría"
          value={form.name}
          onChange={handleChange}
          fullWidth
        />

        <TextField
            name="code"
            label="Código interno"
            value={form.code}
            onChange={handleChange}
            fullWidth
            disabled
            helperText="Se genera automáticamente al guardar"
        />


        <TextField
          name="description"
          label="Descripción"
          value={form.description}
          onChange={handleChange}
          fullWidth
          multiline
          minRows={3}
        />
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
