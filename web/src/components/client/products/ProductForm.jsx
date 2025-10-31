import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useCategories } from "@/hooks/useCategories";

export default function ProductForm({ open, onClose, onSave, product }) {
  const [form, setForm] = useState({
    sku: "",
    name: "",
    description: "",
    category_id: "",
    status: "active",
  });

  // 🔽 Cargar categorías para el select
  const { categories } = useCategories();
  console.log(categories);
  const activeCategories = useMemo(
    () => categories?.filter((c) => c.status === "active") ?? [],
    [categories]
  );

  useEffect(() => {
    if (product) {
      setForm({
        sku: product.sku || "",
        name: product.name || "",
        description: product.description || "",
        category_id: product.category_id || "",
        status: product.status || "active",
      });
    } else {
      setForm({
        sku: "",
        name: "",
        description: "",
        category_id: "",
        status: "active",
      });
    }
  }, [product]);

  useEffect(() => {
    if (!open) {
      setForm({
        sku: "",
        name: "",
        description: "",
        category_id: "",
        is_active: true,
      });
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Validación básica
    if (!form.name) return;
    onSave({
      ...form,
      category_id: form.category_id ? Number(form.category_id) : null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{product ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <TextField
          name="name"
          label="Nombre"
          value={form.name}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          select
          name="category_id"
          label="Categoría"
          value={form.category_id}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="">— Sin categoría —</MenuItem>
          {activeCategories.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name} {c.code ? `(${c.code})` : ""}
            </MenuItem>
          ))}
        </TextField>

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
