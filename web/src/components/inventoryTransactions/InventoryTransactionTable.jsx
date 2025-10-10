import { useState, useMemo } from "react";
import { ArrowDownward, ArrowUpward, Delete } from "@mui/icons-material";
import { Skeleton, IconButton, Tooltip } from "@mui/material";
import { useTheme } from "../../providers/ThemeProvider";
import TableFilters from "../common/TableFilters";
import Pagination from "../common/TablePagination";

export default function InventoryTransactionTable({ transactions = [], loading, onDelete }) {
  const { darkMode } = useTheme();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const text = `${t.product_name} ${t.branch_name} ${t.type} ${t.note}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [transactions, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const actionBtn = darkMode
    ? "rounded-full p-1 text-gray-400 hover:bg-[#333333] hover:text-white"
    : "rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800";

  if (loading) {
    return (
      <div
        className={`overflow-x-auto rounded-xl border shadow-sm ${
          darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
        }`}
      >
        <table className="w-full text-sm text-left">
          <thead
            className={`text-xs font-semibold uppercase ${
              darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
            }`}
          >
            <tr>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Sucursal</th>
              <th className="px-6 py-3">Producto</th>
              <th className="px-6 py-3">Tipo</th>
              <th className="px-6 py-3">Cantidad</th>
              <th className="px-6 py-3">Nota</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 7 }).map((__, j) => (
                  <td key={j} className="px-6 py-4">
                    <Skeleton variant="text" width={100} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className={`p-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        No hay movimientos registrados aún.
      </div>
    );
  }

  return (
    <div
      className={`overflow-x-auto rounded-xl border shadow-sm ${
        darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
      }`}
    >
      <TableFilters
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        rowsPerPage={rowsPerPage}
        onRowsChange={(val) => {
          setRowsPerPage(val);
          setPage(1);
        }}
        darkMode={darkMode}
        placeholder="Buscar movimiento..."
      />

      <table className="w-full text-sm text-left">
        <thead
          className={`text-xs font-semibold uppercase ${
            darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
          }`}
        >
          <tr>
            <th className="px-6 py-3">Fecha</th>
            <th className="px-6 py-3">Sucursal</th>
            <th className="px-6 py-3">Producto</th>
            <th className="px-6 py-3">Tipo</th>
            <th className="px-6 py-3">Cantidad</th>
            <th className="px-6 py-3">Nota</th>
            <th className="px-6 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody
          className={`divide-y ${
            darkMode ? "divide-gray-700 bg-[#1a1a1a]" : "divide-gray-200 bg-white"
          }`}
        >
          {paginated.map((t) => {
            const isEntrada = ["PURCHASE", "ADJUSTMENT_IN", "TRANSFER_IN"].includes(t.type);
            const typeLabel = {
              PURCHASE: "Compra",
              SALE: "Venta",
              ADJUSTMENT_IN: "Ajuste +",
              ADJUSTMENT_OUT: "Ajuste -",
              TRANSFER_IN: "Entrada sucursal",
              TRANSFER_OUT: "Salida sucursal",
            }[t.type] || t.type;

            const chipStyle = {
              fontWeight: 500,
              borderRadius: "6px",
              padding: "4px 8px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.75rem",
              ...(isEntrada
                ? {
                    backgroundColor: "#22c55e33",
                    color: "#16a34a",
                  }
                : {
                    backgroundColor: "#ef444433",
                    color: "#dc2626",
                  }),
            };

            const Icon = isEntrada ? ArrowDownward : ArrowUpward;

            return (
              <tr key={t.id} className={`hover:${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"}`}>
                <td className="px-6 py-4">{new Date(t.created_at).toLocaleString()}</td>
                <td className="px-6 py-4">{t.branch_name}</td>
                <td className="px-6 py-4">{t.product_name}</td>

                {/* 🟩 Tipo con badge */}
                <td className="px-6 py-4 font-medium">
                  <span style={chipStyle}>
                    <Icon fontSize="small" />
                    {typeLabel}
                  </span>
                </td>

                <td className="px-6 py-4">{t.qty}</td>
                <td className="px-6 py-4">{t.note || "—"}</td>
                <td className="px-6 py-4 text-right">
                  <Tooltip title="Eliminar">
                    <IconButton size="small" onClick={() => onDelete(t.id)} className={actionBtn}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Pagination page={page} totalPages={totalPages} onChange={(newPage) => setPage(newPage)} />
    </div>
  );
}
