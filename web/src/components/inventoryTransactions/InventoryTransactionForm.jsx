import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { useState, useEffect } from "react";

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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => onSave(form);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Nuevo Movimiento</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <TextField select label="Sucursal" name="branch_id" value={form.branch_id} onChange={handleChange} fullWidth>
          {branches.map((b) => (
            <MenuItem key={b.id} value={b.id}>
              {b.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField select label="Producto" name="product_id" value={form.product_id} onChange={handleChange} fullWidth>
          {products.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField select label="Tipo de movimiento" name="type" value={form.type} onChange={handleChange} fullWidth>
          <MenuItem value="PURCHASE">Compra / Entrada</MenuItem>
          <MenuItem value="SALE">Venta / Salida</MenuItem>
          <MenuItem value="ADJUSTMENT_IN">Ajuste +</MenuItem>
          <MenuItem value="ADJUSTMENT_OUT">Ajuste −</MenuItem>
          <MenuItem value="TRANSFER_IN">Transferencia +</MenuItem>
          <MenuItem value="TRANSFER_OUT">Transferencia −</MenuItem>
        </TextField>

        <TextField label="Cantidad" name="qty" type="number" value={form.qty} onChange={handleChange} fullWidth />
        <TextField label="Costo unitario" name="unit_cost" type="number" value={form.unit_cost} onChange={handleChange} fullWidth />
        <TextField label="Nota" name="note" value={form.note} onChange={handleChange} multiline minRows={2} fullWidth />
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
