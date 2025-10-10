import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useBranches } from "../../hooks/useBranches";
import { useProducts } from "../../hooks/useProducts";

export default function BranchProductForm({ open, onClose, onSave, row, defaultBranchId }) {
  const [form, setForm] = useState({
    branch_id: "",
    product_id: "",
    price: "",
    cost: "",
    min_stock: "",
    reorder_point: "",
    tax_rate: 16,
    currency: "MXN",
    is_active: true,
  });

  // Cargar catálogo de sucursales y productos (solo activos)
  const { branches } = useBranches();
  const { products } = useProducts();

  const activeBranches = useMemo(
    () => (branches || []).filter((b) => b.is_active),
    [branches]
  );
  const activeProducts = useMemo(
    () => (products || []).filter((p) => p.is_active),
    [products]
  );

  useEffect(() => {
    if (row) {
      setForm({
        branch_id: row.branch_id || defaultBranchId || "",
        product_id: row.product_id || "",
        price: row.price ?? "",
        cost: row.cost ?? "",
        min_stock: row.min_stock ?? "",
        reorder_point: row.reorder_point ?? "",
        tax_rate: row.tax_rate ?? 16,
        currency: row.currency ?? "MXN",
        is_active: row.is_active ?? true,
      });
    } else {
      setForm({
        branch_id: defaultBranchId || "",
        product_id: "",
        price: "",
        cost: "",
        min_stock: "",
        reorder_point: "",
        tax_rate: 16,
        currency: "MXN",
        is_active: true,
      });
    }
  }, [row, defaultBranchId]);

  useEffect(() => {
    if (!open) {
      setForm({
        branch_id: defaultBranchId || "",
        product_id: "",
        price: "",
        cost: "",
        min_stock: "",
        reorder_point: "",
        tax_rate: 16,
        currency: "MXN",
        is_active: true,
      });
    }
  }, [open, defaultBranchId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convertir numéricos cuando aplique
    const numeric = ["price", "cost", "min_stock", "reorder_point", "tax_rate"];
    setForm((prev) => ({
      ...prev,
      [name]: numeric.includes(name) && value !== "" ? Number(value) : value,
    }));
  };

  const handleSubmit = () => {
    if (!form.branch_id || !form.product_id) return; // validación básica
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{row ? "Editar asignación" : "Asignar producto a sucursal"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>

        <TextField
          select
          name="branch_id"
          label="Sucursal"
          value={form.branch_id}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="">— Seleccionar —</MenuItem>
          {activeBranches.map((b) => (
            <MenuItem key={b.id} value={b.id}>
              {b.name} {b.code ? `(${b.code})` : ""}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          name="product_id"
          label="Producto"
          value={form.product_id}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="">— Seleccionar —</MenuItem>
          {activeProducts.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name} {p.sku ? `(${p.sku})` : ""}
            </MenuItem>
          ))}
        </TextField>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <TextField name="cost" label="Costo" type="number" value={form.cost} onChange={handleChange} fullWidth />
          <TextField name="price" label="Precio" type="number" value={form.price} onChange={handleChange} fullWidth />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <TextField name="min_stock" label="Stock mínimo" type="number" value={form.min_stock} onChange={handleChange} fullWidth />
          <TextField name="reorder_point" label="Punto de reorden" type="number" value={form.reorder_point} onChange={handleChange} fullWidth />
        </div>

        <TextField
          select
          name="currency"
          label="Moneda"
          value={form.currency}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="MXN">MXN</MenuItem>
          <MenuItem value="USD">USD</MenuItem>
        </TextField>
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
