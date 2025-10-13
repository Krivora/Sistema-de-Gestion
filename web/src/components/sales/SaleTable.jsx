import { useState, useMemo } from "react";
import { Delete, Visibility, Print } from "@mui/icons-material";
import { Skeleton, Tooltip, IconButton } from "@mui/material";
import { useTheme } from "../../providers/ThemeProvider";
import TableFilters from "../common/TableFilters";
import Pagination from "../common/TablePagination";

export default function SaleTable({ sales = [], loading, onDelete, onView, onPrint }) {
  const { darkMode } = useTheme();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const filtered = useMemo(() => {
    return sales.filter((s) => {
      const text = `${s.doc_no} ${s.branch_name ?? ""}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [sales, search]);

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
              <th className="px-6 py-3">Folio</th>
              <th className="px-6 py-3">Sucursal</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 5 }).map((__, j) => (
                  <td key={j} className="px-6 py-4">
                    <Skeleton variant="text" width={120} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <div className={`p-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        No hay ventas registradas.
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
        placeholder="Buscar venta..."
      />
      <table className="w-full text-sm text-left">
        <thead
          className={`text-xs font-semibold uppercase ${
            darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
          }`}
        >
          <tr>
            <th className="px-6 py-3">Folio</th>
            <th className="px-6 py-3">Sucursal</th>
            <th className="px-6 py-3">Estado</th>
            <th className="px-6 py-3">Fecha</th>
            <th className="px-6 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody
          className={`divide-y ${
            darkMode ? "divide-gray-700 bg-[#1a1a1a]" : "divide-gray-200 bg-white"
          }`}
        >
          {paginated.map((s) => (
            <tr key={s.id} className={`hover:${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"}`}>
              <td className="px-6 py-4 font-medium">{s.doc_no}</td>
              <td className="px-6 py-4">{s.branch_name ?? "—"}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    s.status === "open"
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
              <td className="px-6 py-4 text-right">
                <Tooltip title="Ver detalles">
                  <IconButton size="small" onClick={() => onView(s)}>
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Imprimir recibo">
                  <IconButton size="small" onClick={() => onPrint(s)} className={actionBtn}>
                    <Print fontSize="small" />
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
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
