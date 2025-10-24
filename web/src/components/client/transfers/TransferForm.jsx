import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Autocomplete,
  Alert,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { Add, Delete } from "@mui/icons-material";
import { useBranches } from "@/hooks/useBranches";
import { useBranchProducts } from "@/hooks/useBranchProducts";

export default function TransferForm({ open, onClose, onSave }) {
  const { branches } = useBranches();
  const { items: branchProducts, setBranchId } = useBranchProducts();
  console.log("Branch Products:", branchProducts);
  const [form, setForm] = useState({
    from_branch_id: "",
    to_branch_id: "",
    note: "",
    items: [],
  });

  const [newItem, setNewItem] = useState({ product_id: "", qty: "" });
  const [query, setQuery] = useState("");
  const [stockWarning, setStockWarning] = useState(null);

  // 🔹 Filtrar productos según búsqueda
  const filteredProducts = useMemo(() => {
    if (!branchProducts) return [];
    if (!query) return branchProducts.slice(0, 15);
    return branchProducts
      .filter((p) =>
        p.product_name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 15);
  }, [query, branchProducts]);

  // ♻️ Reset al cerrar modal
  useEffect(() => {
    if (!open) {
      setForm({ from_branch_id: "", to_branch_id: "", note: "", items: [] });
      setNewItem({ product_id: "", qty: "" });
      setQuery("");
      setStockWarning(null);
    }
  }, [open]);

  // 🏢 Cuando cambia la sucursal de origen
  const handleOriginChange = (branchId) => {
    setForm((prev) => ({ ...prev, from_branch_id: branchId }));
    setBranchId(branchId);
  };

  // ➕ Agregar producto con validación de stock
  const handleAddItem = () => {
    if (!newItem.product_id || !newItem.qty) return;

    const product = branchProducts.find(
      (p) => p.product_id === Number(newItem.product_id)
    );
    const qty = Number(newItem.qty);
    const stock = Number(product?.stock ?? 0);

    if (!product) {
      setStockWarning("Producto no encontrado en la sucursal de origen.");
      return;
    }

    if (qty > stock) {
      setStockWarning(`Stock insuficiente: solo hay ${stock} unidades disponibles.`);
      return;
    }

    const item = {
      product_id: Number(newItem.product_id),
      product_name: product.product_name,
      qty,
    };

    setForm((prev) => ({ ...prev, items: [...prev.items, item] }));
    setNewItem({ product_id: "", qty: "" });
    setQuery("");
    setStockWarning(null);
  };

  // ❌ Eliminar producto
  const handleRemoveItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // 💾 Enviar al backend
  const handleSubmit = () => {
    if (!form.from_branch_id || !form.to_branch_id || form.items.length === 0) return;

    if (form.from_branch_id === form.to_branch_id) {
      setStockWarning("No puedes transferir entre la misma sucursal.");
      return;
    }

    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Nueva Transferencia</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        {/* 🏢 Sucursales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextField
            select
            label="Sucursal de origen"
            value={form.from_branch_id}
            onChange={(e) => handleOriginChange(e.target.value)}
            fullWidth
            required
          >
            {branches.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Sucursal destino"
            value={form.to_branch_id}
            onChange={(e) => setForm({ ...form, to_branch_id: e.target.value })}
            fullWidth
            required
          >
            {branches.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
              </MenuItem>
            ))}
          </TextField>
        </div>

        {/* 🗒️ Nota */}
        <TextField
          label="Nota (opcional)"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          fullWidth
          multiline
          rows={2}
        />

        {/* ⚠️ Mensaje de advertencia */}
        {stockWarning && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {stockWarning}
          </Alert>
        )}

        {/* 📦 Agregar productos */}
        <div className="mt-4 border-t pt-3">
          <h4 className="font-medium mb-2">Productos a transferir</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Autocomplete
              options={filteredProducts}
              getOptionLabel={(option) =>
                `${option.product_name} — Stock: ${option.stock}`
              }
              value={
                branchProducts.find((p) => p.product_id === newItem.product_id) || null
              }
              onChange={(_, value) =>
                setNewItem({ ...newItem, product_id: value ? value.product_id : "" })
              }
              onInputChange={(_, value) => setQuery(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Producto"
                  size="small"
                  fullWidth
                  disabled={!form.from_branch_id}
                />
              )}
              noOptionsText={
                !form.from_branch_id
                  ? "Selecciona una sucursal"
                  : query
                  ? "Sin resultados"
                  : "Escribe para buscar..."
              }
            />

            <TextField
              size="small"
              type="number"
              label="Cantidad"
              value={newItem.qty}
              onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
              fullWidth
              disabled={!form.from_branch_id}
            />

            <Button
              variant="contained"
              onClick={handleAddItem}
              sx={{ minWidth: "fit-content" }}
              disabled={!form.from_branch_id}
            >
              <Add fontSize="small" />
            </Button>
          </div>

          {/* 🧾 Tabla de items */}
          {form.items.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 uppercase border-b">
                  <tr>
                    <th className="text-left py-2">Producto</th>
                    <th className="text-left py-2">Cantidad</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((i, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2">{i.product_name}</td>
                      <td>{i.qty}</td>
                      <td className="text-right">
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={() => handleRemoveItem(idx)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!form.from_branch_id || !form.to_branch_id || form.items.length === 0}
        >
          Guardar Transferencia
        </Button>
      </DialogActions>
    </Dialog>
  );
}
