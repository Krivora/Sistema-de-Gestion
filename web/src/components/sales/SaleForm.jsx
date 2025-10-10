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
} from "@mui/material";
import { useEffect, useState } from "react";
import { Add, Delete } from "@mui/icons-material";
import { useBranches } from "../../hooks/useBranches";
import { useProducts } from "../../hooks/useProducts";

export default function SaleForm({ open, onClose, onSave }) {
  const { branches } = useBranches();
  const { products } = useProducts();

  const [form, setForm] = useState({
    branch_id: "",
    doc_no: "",
    items: [],
  });

  const [newItem, setNewItem] = useState({ product_id: "", qty: "", unit_price: "" });

  useEffect(() => {
    if (!open) {
      setForm({ branch_id: "", doc_no: "", items: [] });
      setNewItem({ product_id: "", qty: "", unit_price: "" });
    }
  }, [open]);

  const handleAddItem = () => {
    if (!newItem.product_id || !newItem.qty || !newItem.unit_price) return;
    const product = products.find((p) => p.id === Number(newItem.product_id));
    const item = {
      ...newItem,
      product_name: product?.name || "",
      product_id: Number(newItem.product_id),
      qty: Number(newItem.qty),
      unit_price: Number(newItem.unit_price),
    };
    setForm({ ...form, items: [...form.items, item] });
    setNewItem({ product_id: "", qty: "", unit_price: "" });
  };

  const handleRemoveItem = (index) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const total = form.items.reduce((acc, i) => acc + i.qty * i.unit_price, 0);

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
      <DialogTitle>Nueva Venta</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextField
            select
            label="Sucursal"
            name="branch_id"
            value={form.branch_id}
            onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
            fullWidth
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

        <div className="mt-4 border-t pt-3">
          <h4 className="font-medium mb-2">Agregar productos</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <TextField
              select
              size="small"
              label="Producto"
              value={newItem.product_id}
              onChange={(e) => setNewItem({ ...newItem, product_id: e.target.value })}
              fullWidth
            >
              {products.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
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
              label="Precio Unitario"
              value={newItem.unit_price}
              onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })}
              fullWidth
            />
            <Button variant="contained" onClick={handleAddItem} sx={{ minWidth: "fit-content" }}>
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
                    <th className="text-left py-2">Precio Unitario</th>
                    <th className="text-left py-2">Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((i, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2">{i.product_name}</td>
                      <td>{i.qty}</td>
                      <td>${i.unit_price.toFixed(2)}</td>
                      <td>${(i.qty * i.unit_price).toFixed(2)}</td>
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
        <Button variant="contained" onClick={handleSubmit}>
          Guardar Venta
        </Button>
      </DialogActions>
    </Dialog>
  );
}
