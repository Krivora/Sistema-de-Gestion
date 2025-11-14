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
import { useBranches } from "@features/branches/hooks/useBranches";
import { useBranchProducts } from "@features/branchProducts/hooks/useBranchProducts";
import { useCatalog } from "@features/settings/hooks/useCatalogs"; // 👈 nuevo import

export default function TransferForm({ open, onClose, onSave }) {
  const { branches } = useBranches();
  const { items: originProducts, setBranchId: setOriginBranchId } = useBranchProducts();
  const { items: destProducts, setBranchId: setDestBranchId } = useBranchProducts();

  // 👇 Catálogo de motivos
  const { items: transferReasons } = useCatalog("transfer_reasons");

  const [form, setForm] = useState({
    from_branch_id: "",
    to_branch_id: "",
    note: "",
    reason: "", // 👈 motivo seleccionado
    items: [],
  });

  const [newItem, setNewItem] = useState({ product_id: "", qty: "" });
  const [query, setQuery] = useState("");
  const [stockWarning, setStockWarning] = useState(null);
  const [serverError, setServerError] = useState(null);

  // 🔹 Filtrar productos
  const filteredProducts = useMemo(() => {
    if (!originProducts) return [];
    if (!query) return originProducts.slice(0, 15);
    return originProducts
      .filter((p) => p.product_name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 15);
  }, [query, originProducts]);

  // 🔹 Filtrar motivos activos (puedes agregar más lógica si tienes metadata.type)
  const filteredReasons = useMemo(() => {
    return transferReasons.filter((r) => !r.deleted_at);
  }, [transferReasons]);

  // ♻️ Reset al cerrar modal
  useEffect(() => {
    if (!open) {
      setForm({
        from_branch_id: "",
        to_branch_id: "",
        note: "",
        reason: "",
        items: [],
      });
      setNewItem({ product_id: "", qty: "" });
      setQuery("");
      setStockWarning(null);
      setServerError(null);
    }
  }, [open]);

  const handleOriginChange = (branchId) => {
    setForm((prev) => ({ ...prev, from_branch_id: branchId }));
    setOriginBranchId(branchId);
    setServerError(null);
  };

  const handleDestChange = (branchId) => {
    setForm((prev) => ({ ...prev, to_branch_id: branchId }));
    setDestBranchId(branchId);
    setServerError(null);
  };

  const handleAddItem = () => {
    if (!newItem.product_id || !newItem.qty) return;
    const product = originProducts.find(
      (p) => p.product_id === Number(newItem.product_id)
    );
    const qty = Number(newItem.qty);
    const stock = Number(product?.stock ?? 0);
    const existsInDest = destProducts?.some(
      (p) => p.product_id === Number(newItem.product_id)
    );

    if (!existsInDest) {
      setStockWarning(
        `El producto "${product.product_name}" no está asignado a la sucursal destino.`
      );
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
    setServerError(null);
  };

  const handleRemoveItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setStockWarning(null);
    setServerError(null);

    if (form.from_branch_id === form.to_branch_id) {
      setStockWarning("No puedes transferir entre la misma sucursal.");
      return;
    }
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setServerError(err.message || "Ocurrió un error al guardar la transferencia.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Nueva Transferencia</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        {serverError && <Alert severity="error">{serverError}</Alert>}
        {stockWarning && <Alert severity="warning">{stockWarning}</Alert>}

        {/* 🏢 Sucursales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
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
            onChange={(e) => handleDestChange(e.target.value)}
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
            label="Motivo de transferencia"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            fullWidth
          >
            {filteredReasons.map((r) => (
              <MenuItem key={r.id} value={r.label}>
                {r.label}
              </MenuItem>
            ))}
          </TextField>
        </div>
        {/* 🗒️ Nota adicional */}
        <TextField
          label="Comentario (opcional)"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          fullWidth
          multiline
          rows={2}
        />

        {/* 📦 Productos */}
        <div className="mt-4 border-t pt-3">
          <h4 className="font-medium mb-2">Productos a transferir</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Autocomplete
              options={filteredProducts}
              getOptionLabel={(option) =>
                `${option.product_name} — Stock: ${option.stock}`
              }
              value={
                originProducts.find((p) => p.product_id === newItem.product_id) ||
                null
              }
              onChange={(_, value) =>
                setNewItem({
                  ...newItem,
                  product_id: value ? value.product_id : "",
                })
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
              disabled={!form.from_branch_id || !form.to_branch_id}
            >
              <Add fontSize="small" />
            </Button>
          </div>

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
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveItem(idx)}
                          >
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
          disabled={
            !form.from_branch_id || !form.to_branch_id || form.items.length === 0
          }
        >
          Guardar Transferencia
        </Button>
      </DialogActions>
    </Dialog>
  );
}
