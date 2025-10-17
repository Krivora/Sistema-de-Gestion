import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";

export default function InventoryTransactionForm({ open, onClose, onSave, branches, products }) {
  const [form, setForm] = useState({
    branch_id: "",
    product_id: "",
    type: "PURCHASE",
    qty: 0,
    unit_cost: 0,
    note: "",
  });

  useEffect(() => {
    if (!open) {
      setForm({
        branch_id: "",
        product_id: "",
        type: "PURCHASE",
        qty: 0,
        unit_cost: 0,
        note: "",
      });
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numeric = ["qty", "unit_cost"];
    setForm((prev) => ({
      ...prev,
      [name]: numeric.includes(name) && value !== "" ? Number(value) : value,
    }));
  };

  const handleSubmit = () => onSave(form);

  // 👉 estado para texto del Autocomplete
  const [inputValue, setInputValue] = useState("");

  // 👉 productos activos
  const activeProducts = useMemo(
    () => (products || []).filter((p) => p.is_active ?? true),
    [products]
  );

  // 👉 lógica de filtrado en tiempo real
  const filteredProducts = useMemo(() => {
    const normalized = inputValue.toLowerCase();
    if (!normalized) return activeProducts.slice(0, 10);
    return activeProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(normalized) ||
        (p.sku && p.sku.toLowerCase().includes(normalized))
    );
  }, [activeProducts, inputValue]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Nuevo Movimiento</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        {/* Sucursal */}
        <TextField
          select
          label="Sucursal"
          name="branch_id"
          value={form.branch_id}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="">— Seleccionar —</MenuItem>
          {branches.map((b) => (
            <MenuItem key={b.id} value={b.id}>
              {b.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Autocomplete de productos */}
        <Autocomplete
          options={filteredProducts}
          getOptionLabel={(p) => `${p.name}${p.sku ? ` (${p.sku})` : ""}`}
          value={activeProducts.find((p) => p.id === form.product_id) || null}
          onChange={(_, newValue) => {
            setForm((prev) => ({
              ...prev,
              product_id: newValue ? newValue.id : "",
            }));
          }}
          inputValue={inputValue}
          onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Producto"
              placeholder="Buscar producto..."
              fullWidth
            />
          )}
          fullWidth
          clearOnEscape
          filterSelectedOptions
        />

        {/* Tipo de movimiento */}
        <TextField
          select
          label="Tipo de movimiento"
          name="type"
          value={form.type}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="PURCHASE">Compra / Entrada</MenuItem>
          <MenuItem value="SALE">Venta / Salida</MenuItem>
          <MenuItem value="ADJUSTMENT_IN">Ajuste +</MenuItem>
          <MenuItem value="ADJUSTMENT_OUT">Ajuste −</MenuItem>
          <MenuItem value="TRANSFER_IN">Transferencia +</MenuItem>
          <MenuItem value="TRANSFER_OUT">Transferencia −</MenuItem>
        </TextField>

        {/* Cantidad y costo */}
        <TextField
          label="Cantidad"
          name="qty"
          type="number"
          value={form.qty}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Costo unitario"
          name="unit_cost"
          type="number"
          value={form.unit_cost}
          onChange={handleChange}
          fullWidth
        />

        {/* Nota */}
        <TextField
          label="Nota"
          name="note"
          value={form.note}
          onChange={handleChange}
          multiline
          minRows={2}
          fullWidth
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
