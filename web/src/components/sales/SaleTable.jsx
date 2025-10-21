import { useState, useMemo } from "react";
import { Delete, Visibility,Download } from "@mui/icons-material";
import { Skeleton, Tooltip, IconButton } from "@mui/material";
import { useTheme } from "../../providers/ThemeProvider";
import TableFilters from "../common/TableFilters";
import Pagination from "../common/TablePagination";

export default function SaleTable({ sales = [], loading, onDelete, onView, onDownload }) {
  const { darkMode } = useTheme();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const filtered = useMemo(() => {
    return sales.filter((s) => {
      const text = `${s.doc_no} ${s.customer_name}${s.branch_name ?? ""}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [sales, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const actionBtn = darkMode
    ? "rounded-full p-1 text-gray-400 hover:bg-[#333333] hover:text-white"
    : "rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800";

  // 🧩 Loading state
  if (loading) {
    return (
      <div
        className={`rounded-xl border shadow-sm w-full ${darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
          }`}
      >
        <table className="w-full text-sm text-left">
          <thead
            className={`text-xs font-semibold uppercase ${darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
              }`}
          >
            <tr>
              {["Folio", "Sucursal", "Estado", "Fecha", "Acciones"].map((h) => (
                <th key={h} className="px-6 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 5 }).map((__, j) => (
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

  // 🧩 Empty state
  if (!sales || sales.length === 0) {
    return (
      <div
        className={`p-4 text-sm rounded-lg text-center ${darkMode ? "text-gray-400 bg-[#1a1a1a]" : "text-gray-600 bg-gray-50"
          }`}
      >
        No hay ventas registradas.
      </div>
    );
  }

  // 🧩 Responsive layout
  return (
    <div
      className={`rounded-xl border shadow-sm transition-all ${darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
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
        placeholder="Buscar venta..."
      />

      {/* 🖥️ Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead
            className={`text-xs font-semibold uppercase ${darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
              }`}
          >
            <tr>
              <th className="px-6 py-3">Folio</th>
              <th className="px-6 py-3">Cliente</th>
              <th className="px-6 py-3">Sucursal</th>
              <th className="px-6 py-3">Metodo</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${darkMode ? "divide-gray-700 bg-[#1a1a1a]" : "divide-gray-200 bg-white"
              }`}
          >
            {paginated.map((s) => (
              <tr
                key={s.id}
                className={`transition-colors hover:${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"
                  }`}
              >
                <td className="px-6 py-4 font-medium">{s.doc_no}</td>
                <td className="px-6 py-4 font-medium">{s.customer_name}</td>
                <td className="px-6 py-4">{s.payment_method}</td>
                <td className="px-6 py-4">{s.branch_name ?? "—"}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${s.status === "open"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    {s.status === "open" ? "Abierta" : "Cerrada"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {new Date(
                    new Date(s.created_at).getTime() - 7 * 60 * 60 * 1000
                  ).toLocaleString("es-MX")}
                </td>
                <td className="px-6 py-4 text-right space-x-1">
                  <Tooltip title="Ver detalles">
                    <IconButton size="small" onClick={() => onView(s)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Descargar PDF">
                    <IconButton size="small" onClick={() => onDownload(s)} className={actionBtn}>
                      <Download fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton size="small" onClick={() => onDelete(s.id)} className={actionBtn}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📱 Mobile card view */}
      <div className="md:hidden p-2 space-y-3">
        {paginated.map((s) => (
          <div
            key={s.id}
            className={`rounded-lg p-3 shadow-sm border ${darkMode
                ? "bg-[#1a1a1a] border-gray-700"
                : "bg-white border-gray-200"
              }`}
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold text-sm">{s.doc_no}</h3>
              <span
                className={`text-xs px-2 py-1 rounded-full ${s.status === "open"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-200 text-gray-600"
                  }`}
              >
                {s.status === "open" ? "Abierta" : "Cerrada"}
              </span>
            </div>

            <p className="text-xs text-gray-400">
              {s.branch_name ?? "—"} ·{" "}
              {new Date(
                new Date(s.created_at).getTime() - 7 * 60 * 60 * 1000
              ).toLocaleString("es-MX")}
            </p>

            {/* 🧍 Cliente y Método */}
            <p
              className={`text-xs mb-0.5 ${darkMode ? "text-gray-400" : "text-gray-600"
                }`}
            >
              Cliente: <span className="font-medium">{s.customer_name ?? "—"}</span>
            </p>

            <p
              className={`text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"
                }`}
            >
              Método: <span className="font-medium">{s.payment_method ?? "—"}</span>
            </p>

            <div className="flex justify-end gap-2 mt-2">
              <Tooltip title="Ver detalles">
                <IconButton size="small" onClick={() => onView(s)}>
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Descargar PDF">
                <IconButton size="small" onClick={() => onDownload(s)} className={actionBtn}>
                  <Download fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton size="small" onClick={() => onDelete(s.id)} className={actionBtn}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>


      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
