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
} from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import { Add, Delete } from "@mui/icons-material";
import { useBranches } from "@/hooks/useBranches";
import { useProducts } from "@/hooks/useProducts";

export default function AdjustmentForm({ open, onClose, onSave }) {
  const { branches } = useBranches();
  const { products } = useProducts();

  const [form, setForm] = useState({
    branch_id: "",
    note: "",
    items: [],
  });

  const [newItem, setNewItem] = useState({
    product_id: "",
    qty: "",
    type: "ADJUSTMENT_IN",
    note: "",
  });

  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!query) return products.slice(0, 10);
    return products
      .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 15);
  }, [query, products]);

  useEffect(() => {
    if (!open) {
      setForm({ branch_id: "", note: "", items: [] });
      setNewItem({ product_id: "", qty: "", type: "ADJUSTMENT_IN", note: "" });
      setQuery("");
    }
  }, [open]);

  const handleAddItem = () => {
    if (!newItem.product_id || !newItem.qty) return;
    const product = products.find((p) => p.id === Number(newItem.product_id));
    const item = {
      ...newItem,
      product_name: product?.name || "",
      product_id: Number(newItem.product_id),
      qty: Number(newItem.qty),
    };
    setForm((prev) => ({ ...prev, items: [...prev.items, item] }));
    setNewItem({ product_id: "", qty: "", type: "ADJUSTMENT_IN", note: "" });
    setQuery("");
  };

  const handleRemoveItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    if (!form.branch_id || form.items.length === 0) return;
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Nuevo Ajuste de Inventario</DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextField
            select
            label="Sucursal"
            name="branch_id"
            value={form.branch_id}
            onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
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
            label="Nota general"
            name="note"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            fullWidth
          />
        </div>

        {/* Productos */}
       <div className="mt-4 border-t pt-3">
          <h4 className="font-medium mb-2">Agregar productos</h4>

          {/* 🔹 Fila superior: producto + cantidad + tipo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Autocomplete
              options={filteredProducts}
              getOptionLabel={(option) => option.name}
              value={products.find((p) => p.id === newItem.product_id) || null}
              onChange={(_, value) =>
                setNewItem({ ...newItem, product_id: value ? value.id : "" })
              }
              onInputChange={(_, value) => setQuery(value)}
              renderInput={(params) => (
                <TextField {...params} label="Producto" size="small" fullWidth />
              )}
              noOptionsText={query ? "Sin resultados" : "Escribe para buscar..."}
            />

            <TextField
              size="small"
              type="number"
              label="Cantidad"
              value={newItem.qty}
              onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
              fullWidth
            />

            <TextField
              select
              size="small"
              label="Tipo de ajuste"
              value={newItem.type}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
              fullWidth
            >
              <MenuItem value="ADJUSTMENT_IN">Entrada (+)</MenuItem>
              <MenuItem value="ADJUSTMENT_OUT">Salida (−)</MenuItem>
            </TextField>
          </div>

          {/* 🔹 Fila inferior: nota + botón */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mt-2 items-end">
            <TextField
              className="md:col-span-5"
              size="small"
              label="Nota del producto (opcional)"
              value={newItem.note}
              onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
              fullWidth
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleAddItem}
              sx={{ minWidth: "fit-content", height: "40px" }}
            >
              <Add fontSize="small" />
            </Button>
          </div>

          {/* 🔹 Tabla de productos agregados */}
          {form.items.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 uppercase border-b">
                  <tr>
                    <th className="text-left py-2">Producto</th>
                    <th className="text-left py-2">Cantidad</th>
                    <th className="text-left py-2">Tipo</th>
                    <th className="text-left py-2">Nota</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((i, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2">{i.product_name}</td>
                      <td>{i.qty}</td>
                      <td>{i.type === "ADJUSTMENT_IN" ? "Entrada" : "Salida"}</td>
                      <td>{i.note || "—"}</td>
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
          disabled={!form.branch_id || form.items.length === 0}
        >
          Procesar Ajuste
        </Button>
      </DialogActions>
    </Dialog>
  );
}
