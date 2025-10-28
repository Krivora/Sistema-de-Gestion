import { useState, useMemo } from "react";
import { Edit, Delete } from "@mui/icons-material";
import { Skeleton, IconButton, Tooltip } from "@mui/material";
import { useTheme } from "@/context/ThemeProvider";
import TableFilters from "@/components/common/TableFilters";
import Pagination from "@/components/common/TablePagination";

function truncate(text = "", max = 80) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function CategoryTable({
  categories = [],
  loading,
  onEdit,
  onDelete,
}) {
  const { darkMode } = useTheme();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 🔎 Filtro
  const filtered = useMemo(() => {
    return categories.filter((c) => {
      const fullText = `${c.name ?? ""} ${c.description ?? ""} ${c.code ?? ""}`.toLowerCase();
      return fullText.includes(search.toLowerCase());
    });
  }, [categories, search]);

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
              {["Nombre", "Código", "Descripción", "Estado", "Acciones"].map((h) => (
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
  if (!categories || categories.length === 0) {
    return (
      <div
        className={`p-4 text-sm rounded-lg text-center ${
          darkMode ? "text-gray-400 bg-[#1a1a1a]" : "text-gray-600 bg-gray-50"
        }`}
      >
        No hay categorías registradas aún.
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
        placeholder="Buscar categoría..."
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
              <th className="px-6 py-3">Código</th>
              <th className="px-6 py-3">Descripción</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody
            className={`divide-y ${
              darkMode ? "divide-gray-700 bg-[#1a1a1a]" : "divide-gray-200 bg-white"
            }`}
          >
            {paginated.map((c) => (
              <tr
                key={c.id}
                className={`transition-colors hover:${
                  darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"
                }`}
              >
                <td className="px-6 py-4 font-medium">{c.name}</td>
                <td className="px-6 py-4">{c.code || "—"}</td>
                <td className="px-6 py-4">
                  {c.description ? truncate(c.description, 60) : (
                    <span className="italic text-gray-400">Sin descripción</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-1">
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => onEdit(c)} className={actionBtn}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Eliminar">
                    <IconButton size="small" onClick={() => onDelete(c.id)} className={actionBtn}>
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
        {paginated.map((c) => (
          <div
            key={c.id}
            className={`rounded-lg p-3 shadow-sm border break-words overflow-hidden ${
              darkMode
                ? "bg-[#1a1a1a] border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold text-sm break-words">{truncate(c.name, 60)}</h3>
            </div>
            {c.code && (
              <p className="text-xs text-gray-400 break-all mb-1">
                Código: <span className="font-mono">{truncate(c.code, 20)}</span>
              </p>
            )}
            {c.description && (
              <p
                className={`text-xs mb-3 break-words ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {truncate(c.description, 70)}
              </p>
            )}

            <div className="flex justify-end gap-2 mt-2 flex-wrap">
              <Tooltip title="Editar">
                <IconButton size="small" onClick={() => onEdit(c)} className={actionBtn}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Eliminar">
                <IconButton size="small" onClick={() => onDelete(c.id)} className={actionBtn}>
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
