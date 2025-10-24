import { useState, useMemo } from "react";
import { Visibility } from "@mui/icons-material";
import { Skeleton, Tooltip, IconButton } from "@mui/material";
import { useTheme } from "@/context/ThemeProvider";
import TableFilters from "@/components/common/TableFilters";
import Pagination from "@/components/common/TablePagination";

export default function PurchaseTable({ purchases = [], loading, onView  }) {
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
    <div
      className={`rounded-xl border shadow-sm transition-all ${
        darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
      }`}
    >

      <TableFilters
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        rowsPerPage={rowsPerPage}
        onRowsChange={(val) => { setRowsPerPage(val); setPage(1); }}
        darkMode={darkMode}
        placeholder="Buscar compra por folio o sucursal..."
      />
      <div className="hidden md:block overflow-x-auto">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* 📱 Mobile card view */}
      <div className="md:hidden p-2 space-y-3 overflow-hidden">
        {paginated.map((p) => (
          <div
            key={p.id}
            className={`rounded-lg p-3 shadow-sm border ${
              darkMode ? "bg-[#1a1a1a] border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold text-sm">{p.doc_no}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  p.status === "open"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {p.status === "open" ? "Abierta" : "Cerrada"}
              </span>
            </div>

            <p className="text-xs text-gray-400 mb-1">{p.branch_name || "—"}</p>
            <p
              className={`text-xs mb-0.5 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Fecha: {new Date(p.created_at).toLocaleString("es-MX")}
            </p>

            <div className="flex justify-end gap-2 mt-2 flex-wrap">
              <Tooltip title="Ver detalles">
                <IconButton size="small" onClick={() => onView(p)} className={actionBtn}>
                  <Visibility fontSize="small" />
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
