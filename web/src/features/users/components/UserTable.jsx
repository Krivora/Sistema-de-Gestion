import { useState, useMemo } from "react";
import { Edit, PowerSettingsNew, Delete  } from "@mui/icons-material";
import { Skeleton, Chip, Tooltip, IconButton } from "@mui/material";
import { useTheme } from "@core/context/ThemeProvider";
import TableFilters from "@core/components/common/TableFilters";
import Pagination from "@core/components/common/TablePagination";
import { fmtDate } from "@core/utils/formatters/formatters"; // ajusta la ruta según tu estructura

export default function UserTable({
  users = [],
  loading,
  status,
  onEdit,
  onDesactivate,
  onDelete,
}) {
  const { darkMode } = useTheme();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // 🔍 Filtrar usuarios
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const fullText = `${u.name} ${u.email} ${u.role}`.toLowerCase();
      return fullText.includes(search.toLowerCase());
    });
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // 🎞️ Skeleton mientras carga
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
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Correo</th>
              <th className="px-6 py-3">Rol</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Fecha Alta</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t">
                {[1, 2, 3, 4, 5].map((j) => (
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

  // 🧍‍♂️ Sin usuarios
  if (!users || users.length === 0) {
    return (
      <div className={`p-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        No hay usuarios registrados aún.
      </div>
    );
  }

  // 🎨 Estilo de botones
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
        placeholder="Buscar usuario..."
      />

      {/* 🧾 Tabla */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead
            className={`text-xs font-semibold uppercase ${
              darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
            }`}
          >
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Correo</th>
              <th className="px-6 py-3">Rol</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">
                {status === "inactive" ? "Fecha de baja" : "Fecha de alta"}
              </th>
              {status === "active" && <th className="px-13 py-3 text-right">Acciones</th>}
            </tr>
          </thead>

          <tbody
            className={`divide-y ${
              darkMode ? "divide-gray-700 bg-[#1a1a1a]" : "divide-gray-200 bg-white"
            }`}
          >
            {paginatedUsers.map((u) => (
              <tr
                key={u.id}
                className={`transition hover:${
                  darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"
                }`}
              >
                <td className={`px-6 py-4 font-medium ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                  {u.name}
                </td>
                <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {u.email}
                </td>
                <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {u.role_name}
                </td>

                {/* 🟢 Estado */}
                <td className="px-6 py-4">
                  <Chip
                    label={u.status === "active" ? "Activo" : "Inactivo"}
                    color={u.status === "active" ? "success" : "default"}
                    size="small"
                    sx={{
                      fontWeight: 500,
                      bgcolor: u.status === "active" ? "#22c55e33" : "#6b728033",
                      color: u.status === "active" ? "#22c55e" : darkMode ? "#9ca3af" : "#4b5563",
                    }}
                  />
                </td>
                <td className="px-6 py-4">
                  {status === "inactive"
                    ? fmtDate(u.desactivated_at)
                    : fmtDate(u.created_at)}
                </td>
                {/* ⚙️ Acciones */}
                {status === "active" && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {u.status === "active" && (
                        <>
                          {/* 🔹 Desactivar */}
                          <Tooltip title="Desactivar usuario">
                            <IconButton
                              size="small"
                              onClick={() => onDesactivate(u)}
                              className={actionBtn}
                            >
                              <PowerSettingsNew fontSize="small" color="error" />
                            </IconButton>
                          </Tooltip>

                          {/* ✏️ Editar */}
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(u)}
                              className={actionBtn}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {/* 🗑️ Eliminar */}
                          <Tooltip title="Eliminar usuario">
                            <IconButton
                              size="small"
                              onClick={() => onDelete(u)}
                              className={actionBtn}
                            >
                              <Delete fontSize="small" color="action" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* 📱 Mobile card view */}
      <div className="md:hidden p-2 space-y-3 overflow-hidden">
        {paginatedUsers.map((u) => (
          <div
            key={u.id}
            className={`rounded-lg p-3 shadow-sm border break-words overflow-hidden ${
              darkMode
                ? "bg-[#1a1a1a] border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold text-sm break-words">{u.name}</h3>
             <span
              className={`text-xs px-2 py-1 rounded-full ${
                u.status === "active"
                  ? "bg-green-200 text-green-700"
                  : "bg-red-200 text-red-700"
              }`}
            >
              {u.status === "active" ? "Activo" : "Inactivo"}
            </span>
            </div>
            <p className="text-xs text-gray-400 break-all">
              {u.email}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Rol: {u.role_name}
            </p>
            <div className="flex justify-end gap-2 mt-2 flex-wrap">
              {u.status === "active" && (
                <>
                  <Tooltip title="Desactivar usuario">
                    <IconButton
                      size="small"
                      onClick={() => onDesactivate(u)}
                      className={actionBtn}
                    >
                      <PowerSettingsNew fontSize="small" color="error" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => onEdit(u)} className={actionBtn}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Eliminar usuario">
                    <IconButton size="small" onClick={() => onDelete(u)} className={actionBtn}>
                      <Delete fontSize="small" color="action" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* 📄 Paginación */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
