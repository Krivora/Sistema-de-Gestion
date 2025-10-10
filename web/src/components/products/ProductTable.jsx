import { useMemo, useState } from "react";
import { Edit, Delete, PowerSettingsNew } from "@mui/icons-material";
import { Chip, IconButton, Skeleton, Tooltip } from "@mui/material";
import { useTheme } from "../../providers/ThemeProvider";
import TableFilters from "../common/TableFilters";
import Pagination from "../common/TablePagination";

function truncate(text = "", max = 80) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function ProductTable({
  products = [],
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const { darkMode } = useTheme();
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  // 🔎 Filtro
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const full = `${p.sku ?? ""} ${p.name ?? ""} ${p.category_name ?? ""} ${p.description ?? ""}`.toLowerCase();
      return full.includes(search.toLowerCase());
    });
  }, [products, search]);

  // 📄 Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  // 🎞️ Loading
  if (loading) {
    return (
      <div
        className={`overflow-x-auto rounded-xl border shadow-sm ${
          darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
        }`}
      >
        <table className="w-full text-sm text-left border-collapse">
          <thead
            className={`text-xs font-semibold uppercase ${
              darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
            }`}
          >
            <tr>
              <th className="px-6 py-3">SKU</th>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Categoría</th>
              <th className="px-6 py-3">Descripción</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <td key={j} className="px-6 py-4">
                    <Skeleton variant="text" width={120} animation="wave" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 🧍‍♂️ Sin datos
  if (!products || products.length === 0) {
    return (
      <div className={`p-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        No hay productos registrados aún.
      </div>
    );
  }

  const actionBtn = darkMode
    ? "rounded-full p-1 text-gray-400 hover:bg-[#333333] hover:text-white"
    : "rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800";

  return (
    <div
      className={`overflow-x-auto rounded-xl border shadow-sm ${
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

      {/* 🧾 Tabla */}
      <table className="w-full text-sm text-left border-collapse">
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
            <th className="px-6 py-3">Estado</th>
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
              className={`transition hover:${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"}`}
            >
              <td className={`px-6 py-4 font-medium ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                {p.name}
              </td>

              <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-800"}`}>
                {p.sku || <span className="text-gray-400 italic">—</span>}
              </td>

              <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-800"}`}>
                {p.category_name || <span className="text-gray-400 italic">Sin categoría</span>}
              </td>

              <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {p.description ? truncate(p.description, 80) : (
                  <span className="italic text-gray-400">Sin descripción</span>
                )}
              </td>

              <td className="px-6 py-4">
                <Chip
                  label={p.is_active ? "Activo" : "Inactivo"}
                  color={p.is_active ? "success" : "default"}
                  size="small"
                  sx={{
                    fontWeight: 500,
                    bgcolor: p.is_active ? "#22c55e33" : "#6b728033",
                    color: p.is_active ? "#22c55e" : darkMode ? "#9ca3af" : "#4b5563",
                  }}
                />
              </td>

              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                    <Tooltip title={p.is_active ? "Inhabilitar" : "Habilitar"}>
                        <IconButton size="small" onClick={() => onToggleStatus(p)} className={actionBtn}>
                            <PowerSettingsNew fontSize="small" color={p.is_active ? "error" : "success"} />
                        </IconButton>
                    </Tooltip>
                  <button onClick={() => onEdit(p)} className={actionBtn}>
                    <Edit fontSize="small" />
                  </button>
                  <button onClick={() => onDelete(p.id)} className={actionBtn}>
                    <Delete fontSize="small" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 📄 Paginación */}
      <Pagination page={page} totalPages={totalPages} onChange={(newPage) => setPage(newPage)} />
    </div>
  );
}
