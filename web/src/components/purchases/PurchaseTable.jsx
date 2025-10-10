import { useState, useMemo } from "react";
import { Delete, Visibility } from "@mui/icons-material";
import { Skeleton, Tooltip, IconButton } from "@mui/material";
import { useTheme } from "../../providers/ThemeProvider";
import TableFilters from "../common/TableFilters";
import Pagination from "../common/TablePagination";

export default function PurchaseTable({ purchases = [], loading, onDelete, onView  }) {
  const { darkMode } = useTheme();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      const text = `${p.doc_no} ${p.supplier_name ?? ""} ${p.branch_name ?? ""}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [purchases, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const actionBtn = darkMode
    ? "rounded-full p-1 text-gray-400 hover:bg-[#333333] hover:text-white"
    : "rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800";

  if (loading) {
    return (
      <div className={`overflow-x-auto rounded-xl border shadow-sm ${
        darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
      }`}>
        <table className="w-full text-sm text-left">
          <thead className={`text-xs font-semibold uppercase ${
            darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
          }`}>
            <tr>
              <th className="px-6 py-3">Folio</th>
              <th className="px-6 py-3">Proveedor</th>
              <th className="px-6 py-3">Sucursal</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 6 }).map((__, j) => (
                  <td key={j} className="px-6 py-4"><Skeleton variant="text" width={120} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!purchases || purchases.length === 0) {
    return <div className={`p-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>No hay compras registradas.</div>;
  }

  return (
    <div className={`overflow-x-auto rounded-xl border shadow-sm ${
      darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
    }`}>
      <TableFilters
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        rowsPerPage={rowsPerPage}
        onRowsChange={(val) => { setRowsPerPage(val); setPage(1); }}
        darkMode={darkMode}
        placeholder="Buscar compra por folio o sucursal..."
      />
      <table className="w-full text-sm text-left">
        <thead className={`text-xs font-semibold uppercase ${
          darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
        }`}>
          <tr>
            <th className="px-6 py-3">Folio</th>
            <th className="px-6 py-3">Sucursal</th>
            <th className="px-6 py-3">Estado</th>
            <th className="px-6 py-3">Fecha</th>
            <th className="px-6 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${
          darkMode ? "divide-gray-700 bg-[#1a1a1a]" : "divide-gray-200 bg-white"
        }`}>
          {paginated.map((p) => (
            <tr key={p.id} className={`hover:${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"}`}>
              <td className="px-6 py-4 font-medium">{p.doc_no}</td>
              <td className="px-6 py-4">{p.branch_name ?? "—"}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  p.status === "open"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {p.status === "open" ? "Abierta" : "Cerrada"}
                </span>
              </td>
              <td className="px-6 py-4">{new Date(p.created_at).toLocaleString()}</td>
              <td className="px-6 py-4 text-right">
                <Tooltip title="Ver detalles">
                  <IconButton size="small" onClick={() => onView(p)}>
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton size="small" onClick={() => onDelete(p.id)} className={actionBtn}>
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
