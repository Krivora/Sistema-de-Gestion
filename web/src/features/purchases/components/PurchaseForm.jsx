import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import { Add, Delete } from "@mui/icons-material";
import { useBranches } from "@features/branches/hooks/useBranches";
import { useProducts } from "@features/products/hooks/useProducts";

export default function PurchaseForm({ open, onClose, onSave }) {
  const { branches } = useBranches();
  const { products } = useProducts();

  const [form, setForm] = useState({
    branch_id: "",
    doc_no: "",
    items: [],
  });

  const [newItem, setNewItem] = useState({
    product_id: "",
    qty: "",
    unit_cost: "",
  });

  // 🔹 texto de búsqueda del Autocomplete
  const [query, setQuery] = useState("");

  // 🔹 Filtrar productos por nombre
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!query) return products.slice(0, 10); // muestra los primeros 15 por defecto
    return products
      .filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 15); // máximo 15 resultados
  }, [query, products]);

  // 🔹 Limpiar al cerrar modal
  useEffect(() => {
    if (!open) {
      setForm({ branch_id: "", doc_no: "", items: [] });
      setNewItem({ product_id: "", qty: "", unit_cost: "" });
      setQuery("");
    }
  }, [open]);

  // ➕ Agregar producto
  const handleAddItem = () => {
    if (!newItem.product_id || !newItem.qty || !newItem.unit_cost) return;
    const product = products.find((p) => p.id === Number(newItem.product_id));
    const item = {
      ...newItem,
      product_name: product?.name || "",
      product_id: Number(newItem.product_id),
      qty: Number(newItem.qty),
      unit_cost: Number(newItem.unit_cost),
    };
    setForm((prev) => ({ ...prev, items: [...prev.items, item] }));
    setNewItem({ product_id: "", qty: "", unit_cost: "" });
    setQuery(""); // limpia búsqueda
  };

  // ❌ Eliminar producto
  const handleRemoveItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // 💰 Total de la compra
  const total = form.items.reduce((acc, i) => acc + i.qty * i.unit_cost, 0);

  // 💾 Guardar compra
  const handleSubmit = () => {
    if (!form.branch_id || form.items.length === 0) return;
    const payload = {
      ...form,
      doc_no: form.doc_no.trim() === "" ? undefined : form.doc_no,
    };
    onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Nueva Compra</DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        {/* 🔹 Datos principales */}
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
            label="Folio (opcional)"
            name="doc_no"
            placeholder="(Se generará automáticamente si se deja vacío)"
            value={form.doc_no}
            onChange={(e) => setForm({ ...form, doc_no: e.target.value })}
            fullWidth
          />
        </div>

        {/* 📦 Agregar productos */}
        <div className="mt-4 border-t pt-3">
          <h4 className="font-medium mb-2">Agregar productos</h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
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
              sx={{ width: "100%" }}
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
              size="small"
              type="number"
              label="Costo Unitario"
              value={newItem.unit_cost}
              onChange={(e) => setNewItem({ ...newItem, unit_cost: e.target.value })}
              fullWidth
            />

            <Button variant="contained" onClick={handleAddItem} sx={{ minWidth: "fit-content" }}>
              <Add fontSize="small" />
            </Button>
          </div>

          {/* 🧾 Tabla de productos */}
          {form.items.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 uppercase border-b">
                  <tr>
                    <th className="text-left py-2">Producto</th>
                    <th className="text-left py-2">Cantidad</th>
                    <th className="text-left py-2">Costo Unitario</th>
                    <th className="text-left py-2">Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((i, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2">{i.product_name}</td>
                      <td>{i.qty}</td>
                      <td>${i.unit_cost.toFixed(2)}</td>
                      <td>${(i.qty * i.unit_cost).toFixed(2)}</td>
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

              <div className="text-right mt-2 font-semibold">
                Total: ${total.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!form.branch_id || form.items.length === 0}>
          Procesar Compra
        </Button>
      </DialogActions>
    </Dialog>
  );
}
