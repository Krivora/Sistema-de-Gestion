import { useState, useMemo } from "react";
import { Edit, Delete, PowerSettingsNew } from "@mui/icons-material";
import { Chip, IconButton, Skeleton, Tooltip } from "@mui/material";
import { useTheme } from "../../providers/ThemeProvider";
import TableFilters from "../common/TableFilters";
import Pagination from "../common/TablePagination";

export default function BranchTable({ branches = [], loading, onEdit, onDelete, onToggleStatus }) {
  const { darkMode } = useTheme();
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // 🔎 Filtro
  const filtered = useMemo(() => {
    return branches.filter((b) => {
      const full = `${b.code ?? ""} ${b.name ?? ""} ${b.address ?? ""} ${b.phone ?? ""}`.toLowerCase();
      return full.includes(search.toLowerCase());
    });
  }, [branches, search]);

  // 📄 Paginación
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
        <table className="w-full text-sm text-left border-collapse">
          <thead
            className={`text-xs font-semibold uppercase ${
              darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
            }`}
          >
            <tr>
              <th className="px-6 py-3">Código</th>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Dirección</th>
              <th className="px-6 py-3">Teléfono</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <td key={j} className="px-6 py-4">
                    <Skeleton variant="text" width={100} animation="wave" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!branches || branches.length === 0) {
    return (
      <div className={`p-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        No hay sucursales registradas aún.
      </div>
    );
  }

  return (
    <div
      className={`overflow-x-auto rounded-xl border shadow-sm ${
        darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
      }`}
    >
      {/* Filtros */}
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
        placeholder="Buscar sucursal..."
      />

      <table className="w-full text-sm text-left border-collapse">
        <thead
          className={`text-xs font-semibold uppercase ${
            darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
          }`}
        >
          <tr>
            <th className="px-6 py-3">Código</th>
            <th className="px-6 py-3">Nombre</th>
            <th className="px-6 py-3">Dirección</th>
            <th className="px-6 py-3">Teléfono</th>
            <th className="px-6 py-3">Estado</th>
            <th className="px-6 py-3 text-right">Acciones</th>
          </tr>
        </thead>

        <tbody
          className={`divide-y ${
            darkMode ? "divide-gray-700 bg-[#1a1a1a]" : "divide-gray-200 bg-white"
          }`}
        >
          {paginated.map((b) => (
            <tr
              key={b.id}
              className={`transition hover:${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"}`}
            >
              <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-800"}`}>{b.code}</td>
              <td className={`px-6 py-4 font-medium ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                {b.name}
              </td>
              <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{b.address}</td>
              <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{b.phone}</td>
              <td className="px-6 py-4">
                <Chip
                  label={b.is_active ? "Activa" : "Inactiva"}
                  size="small"
                  sx={{
                    fontWeight: 500,
                    bgcolor: b.is_active ? "#22c55e33" : "#6b728033",
                    color: b.is_active ? "#22c55e" : darkMode ? "#9ca3af" : "#4b5563",
                  }}
                />
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                    <Tooltip title={b.is_active ? "Inhabilitar" : "Habilitar"}>
                        <IconButton size="small" onClick={() => onToggleStatus(b)} className={actionBtn}>
                        <PowerSettingsNew
                            fontSize="small"
                            color={b.is_active ? "error" : "success"}
                        />
                        </IconButton>
                    </Tooltip>
                  <button onClick={() => onEdit(b)} className={actionBtn}>
                    <Edit fontSize="small" />
                  </button>
                 
                  <button onClick={() => onDelete(b.id)} className={actionBtn}>
                    <Delete fontSize="small" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination page={page} totalPages={totalPages} onChange={(newPage) => setPage(newPage)} />
    </div>
  );
}
