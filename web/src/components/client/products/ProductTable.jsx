import { useMemo, useState } from "react";
import { Edit, Delete } from "@mui/icons-material";
import { IconButton, Skeleton, Tooltip } from "@mui/material";
import { useTheme } from "@/context/ThemeProvider";
import TableFilters from "@/components/common/TableFilters";
import Pagination from "@/components/common/TablePagination";

export default function ProductTable({products = [],loading,onEdit,onDelete}) {
  const { darkMode } = useTheme();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // 🔎 Filtro
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const text = `${p.sku ?? ""} ${p.name ?? ""} ${p.category_name ?? ""} ${p.description ?? ""}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [products, search]);

  // 📄 Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const actionBtn = darkMode
    ? "rounded-full p-1 text-gray-400 hover:bg-[#333333] hover:text-white"
    : "rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800";

  // ⏳ Loading
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
              {["Nombre", "SKU", "Categoría", "Descripción", "Acciones"].map((h) => (
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

  // 🧍 Sin datos
  if (!products || products.length === 0) {
    return (
      <div
        className={`p-4 text-sm rounded-lg text-center ${
          darkMode ? "text-gray-400 bg-[#1a1a1a]" : "text-gray-600 bg-gray-50"
        }`}
      >
        No hay productos registrados aún.
      </div>
    );
  }

  // 🧩 Layout completo
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
        placeholder="Buscar producto..."
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
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">SKU</th>
              <th className="px-6 py-3">Categoría</th>
              <th className="px-6 py-3">Descripción</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              darkMode ? "divide-gray-700 bg-[#1a1a1a]" : "divide-gray-200 bg-white"
            }`}
          >
            {paginated.map((p) => (
              <tr
                key={p.id}
                className={`transition-colors hover:${
                  darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"
                }`}
              >
                <td className="px-6 py-4 font-medium">{p.name}</td>
                <td className="px-6 py-4">{p.sku || "—"}</td>
                <td className="px-6 py-4">{p.category_name || "Sin categoría"}</td>
                <td className="px-6 py-4">
                  {p.description ? p.description :
                    <span className="italic text-gray-400">Sin descripción</span>
                  }
                </td>
                <td className="px-6 py-4 text-right space-x-1">
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => onEdit(p)} className={actionBtn}>
                      <Edit fontSize="small" />
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
      </div>

      {/* 📱 Mobile card view */}
      <div className="md:hidden p-2 space-y-3 overflow-hidden">
        {paginated.map((p) => (
          <div
            key={p.id}
            className={`rounded-lg p-3 shadow-sm border break-words overflow-hidden ${
              darkMode
                ? "bg-[#1a1a1a] border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold text-sm break-words">{p.name}</h3>
            </div>

            <p className="text-xs text-gray-400 break-all">
              SKU: <span className="font-mono">{p.sku || "—"}</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5 break-words">
              {p.category_name || "Sin categoría"}
            </p>

            {p.description && (
              <p
                className={`text-xs mb-3 break-words ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {p.description}
              </p>
            )}

            <div className="flex justify-end gap-2 mt-2 flex-wrap">
              <Tooltip title="Editar">
                <IconButton size="small" onClick={() => onEdit(p)} className={actionBtn}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Eliminar">
                <IconButton size="small" onClick={() => onDelete(p.id)} className={actionBtn}>
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
