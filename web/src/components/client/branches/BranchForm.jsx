import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
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
        <TextField
            label="Teléfono"
            value={form.phone}
            onChange={(e) => {
              const input = e.target.value.replace(/\D/g, ""); // eliminar todo lo que no sea número
              let formatted = input;

              if (input.length > 0) {
                // (###)
                formatted = "(" + input.substring(0, 3);
              }
              if (input.length >= 4) {
                // (###)-###
                formatted += ")-" + input.substring(3, 6);
              }
              if (input.length >= 7) {
                // (###)-###-####
                formatted += "-" + input.substring(6, 10);
              }

              setForm({ ...form, phone: formatted });
            }}
            fullWidth
            inputProps={{ maxLength: 14 }} // opcional: limita la longitud
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
