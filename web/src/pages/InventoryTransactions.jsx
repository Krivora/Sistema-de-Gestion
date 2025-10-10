import { useState } from "react";
import { Button, MenuItem, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useInventoryTransactions } from "../hooks/useInventoryTransactions";
import { useBranches } from "../hooks/useBranches";
import { useProducts } from "../hooks/useProducts";
import InventoryTransactionTable from "../components/inventoryTransactions/InventoryTransactionTable";
import InventoryTransactionForm from "../components/inventoryTransactions/InventoryTransactionForm";
import { useToast } from "../utils/toastUtils";
import { useAlert } from "../utils/alertUtils";
import { useNotify } from "../utils/notifyUtils";

export default function InventoryTransactions() {
  const { transactions, loading, createTransaction, deleteTransaction, fetchTransactions } =
    useInventoryTransactions();
  const { branches } = useBranches();
  const { products } = useProducts();

  const [open, setOpen] = useState(false);
  const toast = useToast();
  const alert = useAlert();
  const notify = useNotify();

  const [filters, setFilters] = useState({ branch_id: "", product_id: "" });

  const handleSave = async (data) => {
    try {
      await createTransaction(data);
      notify.success("Movimiento creado", "El inventario fue actualizado correctamente");
      setOpen(false);
    } catch {
      toast.error("Error al registrar el movimiento");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await alert.confirm({
      title: "¿Eliminar movimiento?",
      text: "Esta acción no se puede deshacer.",
    });
    if (!confirmed) return;
    try {
      await deleteTransaction(id);
      notify.warning("Movimiento eliminado", "El registro fue eliminado del sistema");
    } catch {
      toast.error("Error al eliminar el movimiento");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Movimientos de Inventario</h2>
        <div className="flex gap-3">
          <TextField
            select
            size="small"
            label="Sucursal"
            value={filters.branch_id}
            onChange={(e) => {
              const newFilters = { ...filters, branch_id: e.target.value };
              setFilters(newFilters);
              fetchTransactions(newFilters);
            }}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">Todas</MenuItem>
            {branches.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Producto"
            value={filters.product_id}
            onChange={(e) => {
              const newFilters = { ...filters, product_id: e.target.value };
              setFilters(newFilters);
              fetchTransactions(newFilters);
            }}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {products.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            Nuevo Movimiento
          </Button>
        </div>
      </div>

      <InventoryTransactionTable
        transactions={transactions}
        loading={loading}
        onDelete={handleDelete}
      />

      <InventoryTransactionForm
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        branches={branches}
        products={products}
      />
    </div>
  );
}
