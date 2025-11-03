import { useState, useMemo } from "react";
import { Edit, Delete, PowerSettingsNew, RestartAlt } from "@mui/icons-material";
import { Skeleton, IconButton, Tooltip, Chip } from "@mui/material";
import { useTheme } from "@core/context/ThemeProvider";
import TableFilters from "@core/components/common/TableFilters";
import Pagination from "@core/components/common/TablePagination";

function truncate(text = "", max = 80) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function CategoryTable({
  categories = [],
  loading,
  onEdit,
  onDelete,
  onActivate,
  onDesactivate
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
              <th className="px-6 py-3">Estado</th>
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

                {/* Estado con Chip */}
                <td className="px-6 py-4">
                  <Chip
                    label={
                      c.status === "active"
                        ? "Activo"
                        : c.status === "inactive"
                        ? "Inactivo"
                        : "Eliminado"
                    }
                    size="small"
                    sx={{
                      fontWeight: 500,
                      bgcolor:
                        c.status === "active"
                          ? "#22c55e33"
                          : c.status === "inactive"
                          ? "#facc1533"
                          : "#9ca3af33",
                      color:
                        c.status === "active"
                          ? "#22c55e"
                          : c.status === "inactive"
                          ? "#f59e0b"
                          : darkMode
                          ? "#9ca3af"
                          : "#4b5563",
                    }}
                  />
                </td>

                {/* Acciones dinámicas */}
                <td className="px-6 py-4 text-right space-x-1">
                  {c.status !== "deleted" && (
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => onEdit(c)} className={actionBtn}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}

                  {c.status === "active" && (
                    <Tooltip title="Desactivar">
                      <IconButton size="small" onClick={() => onDesactivate(c.id)} className={actionBtn}>
                        <PowerSettingsNew fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}

                  {c.status === "inactive" && (
                    <>
                      <Tooltip title="Activar">
                        <IconButton size="small" onClick={() => onActivate(c.id)} className={actionBtn}>
                          <RestartAlt fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={() => onDelete(c)} className={actionBtn}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
