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
import { useBranchProducts } from "@/hooks/useBranchProducts";

export default function SaleForm({ open, onClose, onSave }) {
  const { branches } = useBranches();

  const [form, setForm] = useState({
    branch_id: "",
    doc_no: "",
    customer_name: "",
    customer_phone: "",
    payment_method: "EFECTIVO",
    items: [],
  });

  // 🧩 Hook dinámico: carga productos según la sucursal
  const { items: branchProducts, setBranchId } = useBranchProducts();

  const [newItem, setNewItem] = useState({ product_id: "", qty: "", unit_price: "" });
  const [query, setQuery] = useState("");

  // 🔹 Filtramos productos dinámicamente
  const filteredProducts = useMemo(() => {
    if (!branchProducts) return [];
    if (!query) return branchProducts.slice(0, 15); // 👈 solo los primeros 15
    return branchProducts
      .filter((p) =>
        p.product_name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 15);
  }, [query, branchProducts]);

  // 🧠 Cuando cambia el producto seleccionado → poner el precio automático según sucursal
  useEffect(() => {
    if (newItem.product_id) {
      const bp = branchProducts.find(
        (p) => p.product_id === Number(newItem.product_id)
      );
      if (bp) {
        setNewItem((prev) => ({
          ...prev,
          unit_price: bp.price || 0,
        }));
      }
    }
  }, [newItem.product_id, branchProducts]);

  // 🔹 Reset al cerrar modal
  useEffect(() => {
    if (!open) {
      setForm({
        branch_id: "",
        doc_no: "",
        customer_name: "",
        customer_phone: "",
        payment_method: "EFECTIVO",
        items: [],
      });
      setNewItem({ product_id: "", qty: "", unit_price: "" });
      setQuery("");
    }
  }, [open]);

  // ➕ Agregar producto
  const handleAddItem = () => {
    if (!newItem.product_id || !newItem.qty || !newItem.unit_price) return;

    const product = branchProducts.find(
      (p) => p.product_id === Number(newItem.product_id)
    );

    const item = {
      ...newItem,
      product_name: product?.product_name || "",
      product_id: Number(newItem.product_id),
      qty: Number(newItem.qty),
      unit_price: Number(newItem.unit_price),
    };

    setForm({ ...form, items: [...form.items, item] });
    setNewItem({ product_id: "", qty: "", unit_price: "" });
    setQuery("");
  };

  const handleRemoveItem = (index) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const total = form.items.reduce((acc, i) => acc + i.qty * i.unit_price, 0);

  const handleSubmit = () => {
    if (!form.branch_id || form.items.length === 0) return;
    const payload = {
      ...form,
      subtotal: total,
      total,
      doc_no: form.doc_no.trim() === "" ? undefined : form.doc_no,
    };
    onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Nueva Venta</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        {/* Datos generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <TextField
            select
            label="Sucursal"
            name="branch_id"
            value={form.branch_id}
            onChange={(e) => {
              const val = e.target.value;
              setForm({ ...form, branch_id: val });
              setBranchId(val); // carga productos de la sucursal
            }}
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
            placeholder="(Se genera automático si se deja vacío)"
            value={form.doc_no}
            onChange={(e) => setForm({ ...form, doc_no: e.target.value })}
            fullWidth
          />
        </div>

        {/* Cliente y pago */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <TextField
            label="Cliente"
            name="customer_name"
            value={form.customer_name}
            onChange={(e) =>
              setForm({ ...form, customer_name: e.target.value })
            }
            fullWidth
          />
          <TextField
            label="Teléfono"
            name="customer_phone"
            value={form.customer_phone}
            onChange={(e) =>
              setForm({ ...form, customer_phone: e.target.value })
            }
            fullWidth
          />
          <TextField
            select
            label="Método de Pago"
            name="payment_method"
            value={form.payment_method}
            onChange={(e) =>
              setForm({ ...form, payment_method: e.target.value })
            }
            fullWidth
          >
            <MenuItem value="EFECTIVO">Efectivo</MenuItem>
            <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
            <MenuItem value="TARJETA">Tarjeta</MenuItem>
          </TextField>
        </div>

        {/* Productos */}
        <div className="mt-4 border-t pt-3">
          <h4 className="font-medium mb-2">Agregar productos</h4>

          {!form.branch_id && (
            <p className="text-sm text-gray-500 italic mb-2">
              Selecciona una sucursal para cargar los productos disponibles.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Autocomplete
              options={filteredProducts}
              getOptionLabel={(option) => option.product_name}
              value={
                branchProducts.find(
                  (p) => p.product_id === Number(newItem.product_id)
                ) || null
              }
              onChange={(_, value) =>
                setNewItem({
                  ...newItem,
                  product_id: value ? value.product_id : "",
                  unit_price: value ? value.price || 0 : "",
                })
              }
              onInputChange={(_, value) => setQuery(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Producto"
                  size="small"
                  fullWidth
                  disabled={!form.branch_id}
                />
              )}
              noOptionsText={
                !form.branch_id
                  ? "Selecciona una sucursal"
                  : query
                  ? "Sin resultados"
                  : "Escribe para buscar..."
              }
              sx={{ width: "100%" }}
            />

            <TextField
              size="small"
              type="number"
              label="Cantidad"
              value={newItem.qty}
              onChange={(e) =>
                setNewItem({ ...newItem, qty: e.target.value })
              }
              fullWidth
              disabled={!form.branch_id}
            />

            <TextField
              size="small"
              type="number"
              label="Precio Unitario"
              value={newItem.unit_price}
              onChange={(e) =>
                setNewItem({ ...newItem, unit_price: e.target.value })
              }
              fullWidth
              disabled={!form.branch_id}
            />

            <Button
              variant="contained"
              onClick={handleAddItem}
              sx={{ minWidth: "fit-content" }}
              disabled={!form.branch_id}
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
