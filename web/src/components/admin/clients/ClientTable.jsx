import { useState, useMemo } from "react";
import { Edit, PowerSettingsNew } from "@mui/icons-material";
import { Skeleton, Chip, Tooltip, IconButton } from "@mui/material";
import { useTheme } from "@/context/ThemeProvider";
import TableFilters from "@/components/common/TableFilters";
import Pagination from "@/components/common/TablePagination";

export default function ClientTable({ clients = [], loading, onEdit, onDelete, onToggleStatus }) {
  const { darkMode } = useTheme();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const fullText = `${c.name} ${c.business_name} ${c.email}`.toLowerCase();
      return fullText.includes(search.toLowerCase());
    });
  }, [clients, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) {
    return (
      <div
        className={`overflow-x-auto rounded-xl border shadow-sm ${darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
          }`}
      >
        <table className="w-full text-sm text-left">
          <thead
            className={`text-xs uppercase font-semibold ${darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-600"
              }`}
          >
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Negocio</th>
              <th className="px-6 py-3">Correo</th>
              <th className="px-6 py-3">Telefono</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {[1, 2, 3, 4, 5].map((j) => (
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

  if (!clients.length)
    return <p className="text-gray-500 text-sm p-3">No hay clientes registrados aún.</p>;

  const actionBtn = darkMode
    ? "rounded-full p-1 text-gray-400 hover:bg-[#333] hover:text-white"
    : "rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800";

  return (
    <div
      className={`overflow-x-auto rounded-xl border shadow-sm ${darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
        }`}
    >
      <TableFilters
        search={search}
        onSearchChange={setSearch}
        rowsPerPage={rowsPerPage}
        onRowsChange={setRowsPerPage}
        placeholder="Buscar cliente..."
      />

      <table className="w-full text-sm text-left">
        <thead
          className={`text-xs uppercase font-semibold ${
            darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-600"
          }`}
        >
          <tr>
            <th className="px-6 py-3">Logo</th>
            <th className="px-6 py-3">Código</th>
            <th className="px-6 py-3">Cliente / Negocio</th>
            <th className="px-6 py-3">Contacto</th>
            <th className="px-6 py-3 text-center">Sucursales</th>
            <th className="px-6 py-3 text-center">Usuarios</th>
            <th className="px-6 py-3">Estado</th>
            <th className="px-6 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody
          className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
        >
          {paginated.map((c) => (
            <tr key={c.id}>
              {/* Logo */}
              <td className="px-6 py-4">
                {c.logo_url ? (
                  <img
                    src={c.logo_url}
                    alt={c.business_name}
                    className="w-10 h-10 object-cover rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    N/A
                  </div>
                )}
              </td>

              {/* Código */}
              <td className="px-6 py-4 font-semibold">{c.code}</td>

              {/* Cliente / Negocio */}
              <td className="px-6 py-4">
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">{c.business_name}</div>
              </td>

              {/* Contacto */}
              <td className="px-6 py-4">
                <div className="text-sm">{c.email}</div>
                <div className="text-xs text-gray-500">{c.phone}</div>
              </td>

              {/* Límites */}
              <td className="px-6 py-4 text-center">{c.max_branches}</td>
              <td className="px-6 py-4 text-center">{c.max_users}</td>

              {/* Estado */}
              <td className="px-6 py-4">
                <Chip
                  label={c.is_active ? "Activo" : "Inactivo"}
                  color={c.is_active ? "success" : "default"}
                  size="small"
                  sx={{
                    color: c.is_active ? "#fff" : "#000", // texto blanco si activo, negro si inactivo
                    fontWeight: 500,
                  }}
                />
              </td>
              {/* Acciones */}
              <td className="px-6 py-4 text-right">
                <Tooltip title={c.is_active ? "Desactivar" : "Activar"}>
                  <IconButton onClick={() => onToggleStatus(c)} className={actionBtn}>
                    <PowerSettingsNew
                      fontSize="small"
                      color={c.is_active ? "error" : "success"}
                    />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Editar">
                  <IconButton onClick={() => onEdit(c)} className={actionBtn}>
                    <Edit fontSize="small" />
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
