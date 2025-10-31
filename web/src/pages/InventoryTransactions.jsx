import { useState } from "react";
import { Button, MenuItem, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useInventoryTransactions } from "@/hooks/useInventoryTransactions";
import { useBranches } from "@/hooks/useBranches";
import { useProducts } from "@/hooks/useProducts";
import InventoryTransactionTable from "@/components/client/inventoryTransactions/InventoryTransactionTable";
import InventoryTransactionForm from "@/components/client/inventoryTransactions/InventoryTransactionForm";
import { useToast } from "@/utils/toastUtils";
import { useAlert } from "@/utils/alertUtils";
import { useNotify } from "@/utils/notifyUtils";

export default function InventoryTransactions() {
  const { transactions, loading, fetchTransactions } =
    useInventoryTransactions();
  const { branches } = useBranches();
  const { products } = useProducts();
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const alert = useAlert();
  const notify = useNotify();
  const [filters, setFilters] = useState({ branch_id: "", product_id: "" });
  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-full overflow-x-hidden">
      {/* 🧭 Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold">Movimientos de Inventario</h2>
        {/* 🧩 Filtros y botón */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
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
            sx={{
              minWidth: { xs: "100%", sm: 180, md: 220 },
            }}
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
            sx={{
              minWidth: { xs: "100%", sm: 180, md: 220 },
            }}
          >
            <MenuItem value="">Todos</MenuItem>
            {products.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>
        </div>
      </div>

      {/* 📋 Tabla */}
      <InventoryTransactionTable
        transactions={transactions}
        loading={loading}
      />
    </div>
  );
}
