import { useState, useMemo } from "react";
import { IconButton, Tooltip, Skeleton } from "@mui/material";
import { Delete, Restore } from "@mui/icons-material";
import TableFilters from "@core/components/common/TableFilters";
import Pagination from "@core/components/common/TablePagination";

export default function TransfersNoteTable({
  items,
  loading,
  darkMode,
  deleteItem,
  restoreItem,
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // 🔍 Filtrado
  const filtered = useMemo(() => {
    return items.filter((i) =>
      i.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  // 📄 Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // 🎨 Estilo botones de acción
  const actionBtn = darkMode
    ? "rounded-full p-1 text-gray-400 hover:bg-[#333333] hover:text-white"
    : "rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800";

  // ⏳ Skeleton loader
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
              <th className="px-6 py-3">Motivo</th>
              <th className="px-6 py-3">Tipo de movimiento</th>
              <th className="px-6 py-3">Creado Por:</th>
              <th className="px-6 py-3">Fecha de Creacion:</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t">
                <td className="px-6 py-4">
                  <Skeleton variant="text" width={180} />
                </td>
                <td className="px-6 py-4">
                  <Skeleton variant="text" width={100} />
                </td>
                <td className="px-6 py-4 text-right">
                  <Skeleton variant="circular" width={24} height={24} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 📋 Tabla principal
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
        placeholder="Buscar motivo..."
      />

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead
            className={`text-xs font-semibold uppercase ${
              darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
            }`}
          >
            <tr>
              <th className="px-6 py-3">Motivo</th>
              <th className="px-6 py-3">Tipo de movimiento</th>
              <th className="px-6 py-3">Creado Por:</th>
              <th className="px-6 py-3">Fecha de Creacion:</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              darkMode ? "divide-gray-700 bg-[#1a1a1a]" : "divide-gray-200 bg-white"
            }`}
          >
            {paginated.map((i) => (
              <tr
                key={i.id}
                className={`transition hover:${
                  darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"
                }`}
              >
                <td className="px-6 py-4 font-medium">{i.label}</td>
                <td className="px-6 py-4">
                    {i.metadata?.type === "TRANSFER_IN" ? (
                        <span className="text-green-600 font-semibold">Entrada</span>
                    ) : (
                        <span className="text-red-600 font-semibold">Salida</span>
                    )}
                </td>
                <td className="px-6 py-4 font-medium">{i.created_by_name}</td>
                <td className="px-6 py-4 font-medium">{i.created_at}</td>
                <td className="px-6 py-4 text-right">
                  {i.deleted_at ? (
                    <Tooltip title="Restaurar">
                      <IconButton
                        size="small"
                        onClick={() => restoreItem(i)}
                        className={actionBtn}
                      >
                        <Restore fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={() => deleteItem(i)}
                        className={actionBtn}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  className={`text-center py-6 text-sm ${
                    darkMode ? "text-gray-500" : "text-gray-600"
                  }`}
                >
                  No hay motivos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
