import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MenuItem, TextField , Breadcrumbs,  Link as MuiLink,Typography } from "@mui/material";
import { useTheme } from "@core/context/ThemeProvider";
import { useInventoryTransactions } from "../hooks/useInventoryTransactions";
import { useBranches } from "@features/branches/hooks/useBranches";
import { useProducts } from "@features/products/hooks/useProducts";
import InventoryTransactionTable from "../components/InventoryTransactionTable";
import PageHeader from "@core/components/common/PageHeader";

export default function InventoryTransactions() {
  const { transactions, loading, fetchTransactions } =
    useInventoryTransactions();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const { branches } = useBranches();
  const { products } = useProducts();
  const [filters, setFilters] = useState({ branch_id: "", product_id: "" });
  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-full overflow-x-hidden">
      <PageHeader
        title="Inventario"
        description=" Supervisa y controla las existencias de tus productos en cada sucursal, revisa movimientos, ajustes y niveles de stock en tiempo real."
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
