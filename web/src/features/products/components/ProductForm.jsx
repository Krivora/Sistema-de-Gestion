import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useCategories } from "@features/categories/hooks/useCategories";

const EMPTY = {
  sku: "",
  name: "",
  description: "",
  category_id: "",
};

export default function ProductForm({
  open,
  onClose,
  onSave,
  product,
  saving = false,
}) {
  const [form, setForm] = useState(EMPTY);
  const [nameError, setNameError] = useState("");
  const { categories } = useCategories();

  const activeCategories = useMemo(
    () => categories?.filter((c) => c.status === "active") ?? [],
    [categories]
  );

  useEffect(() => {
    if (!open) {
      setForm(EMPTY);
      setNameError("");
      return;
    }

    setForm(
      product
        ? {
            sku: product.sku || "",
            name: product.name || "",
            description: product.description || "",
            category_id: product.category_id || "",
          }
        : EMPTY
    );

    setNameError("");
  }, [open, product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "name" && value.trim()) {
      setNameError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setNameError("El nombre es requerido");
      return;
    }

    onSave({
      ...form,
      category_id: form.category_id
        ? Number(form.category_id)
        : null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {product ? "Editar Producto" : "Nuevo Producto"}
        </DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            name="name"
            label="Nombre *"
            value={form.name}
            onChange={handleChange}
            error={Boolean(nameError)}
            helperText={nameError}
            fullWidth
            autoFocus
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
                {c.name}
                {c.code ? ` (${c.code})` : ""}
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

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
          >
            {product ? "Guardar cambios" : "Crear producto"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}