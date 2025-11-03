import { useCatalog } from "@features/settings/hooks/useCatalogs";
import { useState, useMemo } from "react";
import {
  Breadcrumbs,
  Typography,
  Link as MuiLink,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Skeleton,
} from "@mui/material";
import { Add, Delete, Restore } from "@mui/icons-material";
import { useTheme } from "@core/context/ThemeProvider";
import { useNavigate } from "react-router-dom";
import TableFilters from "@core/components/common/TableFilters";
import Pagination from "@core/components/common/TablePagination";

export default function AdjustmentNotesCatalog() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { items, loading, createItem, deleteItem, restoreItem } = useCatalog("adjustment_notes");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [newLabel, setNewLabel] = useState("");

  // 🔍 Filtrar resultados
  const filtered = useMemo(() => {
    return items.filter((i) =>
      i.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // ➕ Crear nuevo motivo
  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    await createItem({ label: newLabel, metadata: { type: "ADJUSTMENT_IN" } });
    setNewLabel("");
  };

  // 🎨 Estilos comunes
  const actionBtn = darkMode
    ? "rounded-full p-1 text-gray-400 hover:bg-[#333333] hover:text-white"
    : "rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800";

  // 🧱 Skeleton loader
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
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t">
                <td className="px-6 py-4">
                  <Skeleton variant="text" width={180} />
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

  return (
    <div className="p-6 space-y-6">
      {/* 🔹 Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" className="text-sm">
        <MuiLink
          underline="hover"
          color={darkMode ? "gray.300" : "inherit"}
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        >
          Inicio
        </MuiLink>
        <MuiLink
          underline="hover"
          color={darkMode ? "gray.300" : "inherit"}
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/config")}
        >
          Configuración
        </MuiLink>
        <MuiLink
          underline="hover"
          color={darkMode ? "gray.300" : "inherit"}
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/settings/catalogs")}
        >
          Catálogos
        </MuiLink>
        <Typography color="text.primary">Motivos de Ajuste</Typography>
      </Breadcrumbs>

      {/* 🔹 Encabezado */}
      <div>
        <Typography variant="h5" fontWeight={600}>
          Motivos de Ajuste
        </Typography>
        <Typography variant="body2" color={darkMode ? "gray.400" : "text.secondary"}>
          Define los motivos utilizados para registrar ajustes en el inventario.
        </Typography>
      </div>

      {/* 🔹 Nuevo motivo */}
      <div className="flex gap-2 items-center flex-wrap">
        <TextField
          label="Nuevo motivo"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          size="small"
          sx={{ minWidth: 300 }}
        />
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
          Agregar
        </Button>
      </div>

      {/* 🧾 Tabla */}
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
                  <td className="px-6 py-4 text-right">
                    {i.deleted_at ? (
                      <Tooltip title="Restaurar">
                        <IconButton
                          size="small"
                          onClick={() => restoreItem(i.id)}
                          className={actionBtn}
                        >
                          <Restore fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => deleteItem(i.id)}
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
                    colSpan="2"
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
    </div>
  );
}
