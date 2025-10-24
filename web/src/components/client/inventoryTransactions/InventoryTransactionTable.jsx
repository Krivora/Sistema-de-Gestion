import { useState, useMemo } from "react";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import { Skeleton, IconButton, Tooltip } from "@mui/material";
import { useTheme } from "@/context/ThemeProvider";
import TableFilters from "@/components/common/TableFilters";
import Pagination from "@/components/common/TablePagination";

export default function InventoryTransactionTable({ transactions = [], loading }) {
  const { darkMode } = useTheme();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 🔎 Filtro de búsqueda
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const text = `${t.product_name} ${t.branch_name} ${t.type} ${t.note}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [transactions, search]);

  // 📄 Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const actionBtn = darkMode
    ? "rounded-full p-1 text-gray-400 hover:bg-[#333333] hover:text-white"
    : "rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800";

  // 🕓 Loading
  if (loading) {
    return (
      <div
        className={`rounded-xl border shadow-sm w-full ${
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
              {["Fecha", "Sucursal", "Producto", "Tipo", "Cantidad", "Nota", "Acciones"].map((h) => (
                <th key={h} className="px-6 py-3">{h}</th>
              ))}
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

  // 🚫 Sin registros
  if (!transactions || transactions.length === 0) {
    return (
      <div
        className={`p-4 text-sm rounded-lg text-center ${
          darkMode ? "text-gray-400 bg-[#1a1a1a]" : "text-gray-600 bg-gray-50"
        }`}
      >
        No hay movimientos registrados aún.
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border shadow-sm transition-all ${
        darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
      }`}
    >
      {/* 🔍 Filtros */}
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

      {/* 🖥️ Desktop table */}
      <div className="hidden md:block overflow-x-auto">
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
                  ? { backgroundColor: "#22c55e33", color: "#16a34a" }
                  : { backgroundColor: "#ef444433", color: "#dc2626" }),
              };

              const Icon = isEntrada ? ArrowDownward : ArrowUpward;

              return (
                <tr key={t.id} className={`transition hover:${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"}`}>
                  <td className="px-6 py-4">
                    {new Date(new Date(t.created_at).getTime() - 7 * 60 * 60 * 1000).toLocaleString("es-MX")}
                  </td>
                  <td className="px-6 py-4">{t.branch_name}</td>
                  <td className="px-6 py-4">{t.product_name}</td>
                  <td className="px-6 py-4 font-medium">
                    <span style={chipStyle}>
                      <Icon fontSize="small" />
                      {typeLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {Number(t.qty).toLocaleString("es-MX", { maximumFractionDigits: 2 })}
                  </td>

                  <td className="px-6 py-4">{t.note || "—"}</td>
                  <td className="px-6 py-4 text-right">
      
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 📱 Mobile card view */}
      <div className="md:hidden p-2 space-y-3 overflow-hidden">
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

          const Icon = isEntrada ? ArrowDownward : ArrowUpward;
          const iconColor = isEntrada ? "text-green-600" : "text-red-600";

          return (
            <div
              key={t.id}
              className={`rounded-lg p-3 shadow-sm border break-words overflow-hidden ${
                darkMode ? "bg-[#1a1a1a] border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-sm break-words">{t.product_name}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                    isEntrada
                      ? "bg-green-200 text-green-700"
                      : "bg-red-200 text-red-700"
                  }`}
                >
                  <Icon fontSize="small" className={iconColor} />
                  {typeLabel}
                </span>
              </div>

              <p className="text-xs text-gray-400 mb-0.5">
                {t.branch_name} ·{" "}
                {new Date(new Date(t.created_at).getTime() - 7 * 60 * 60 * 1000).toLocaleString("es-MX")}
              </p>
              <p className={`text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Cantidad: <span className="font-semibold">{t.qty}</span>
              </p>
              {t.note && (
                <p className={`text-xs italic ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                  “{t.note}”
                </p>
              )}

              <div className="flex justify-end gap-2 mt-2 flex-wrap">
                
              </div>
            </div>
          );
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
