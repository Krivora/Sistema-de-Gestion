import { Edit, Delete, PowerSettingsNew, RestartAlt } from "@mui/icons-material";
import { IconButton, Tooltip, Chip } from "@mui/material";
import { useTheme } from "@core/context/ThemeProvider";
import DataTable from "@core/components/common/DataTable";

// ✂️ Truncar descripción
const truncate = (text = "", max = 80) =>
  text.length > max ? text.slice(0, max) + "…" : text;

export default function ProductTable({
  products = [],
  loading,
  onEdit,
  onDelete,
  onActivate,
  onDesactivate,
}) {
  const { darkMode } = useTheme();

  return (
    <DataTable
      data={products}
      loading={loading}
      darkMode={darkMode}
      dense
      placeholder="Buscar producto..."
      defaultSort={{ key: "name", direction: "asc" }}
      columns={[
        { key: "name", label: "Nombre" },
        { key: "sku", label: "SKU", render: (v) => v || "—" },
        { key: "category_name", label: "Categoría", render: (v) => v || "Sin categoría" },
        {
          key: "description",
          label: "Descripción",
          render: (v) =>
            v ? truncate(v, 60) : (
              <span className="italic text-gray-400">Sin descripción</span>
            ),
        },
        {
          key: "status",
          label: "Estado",
          render: (val) => {
            const map = {
              active: { label: "Activo", color: "#22c55e", bg: "#22c55e33" },
              inactive: { label: "Inactivo", color: "#f59e0b", bg: "#facc1533" },
              deleted: {
                label: "Eliminado",
                color: darkMode ? "#9ca3af" : "#4b5563",
                bg: "#9ca3af33",
              },
            };
            const cfg = map[val] || map.deleted;
            return (
              <Chip
                label={cfg.label}
                size="small"
                sx={{
                  fontWeight: 500,
                  bgcolor: cfg.bg,
                  color: cfg.color,
                }}
              />
            );
          },
        },
      ]}
      renderActions={(p) => (
        <div className="flex justify-end gap-1.5">
          {p.status !== "deleted" && (
            <Tooltip title="Editar">
              <IconButton
                size="small"
                onClick={() => onEdit(p)}
                className={`transition ${
                  darkMode ? "hover:bg-[#333]" : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {p.status === "active" && (
            <Tooltip title="Desactivar">
              <IconButton
                size="small"
                onClick={() => onDesactivate(p.id)}
                className={`transition ${
                  darkMode ? "hover:bg-[#333]" : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <PowerSettingsNew fontSize="small" sx={{ color: "#f59e0b" }} />
              </IconButton>
            </Tooltip>
          )}

          {p.status === "inactive" && (
            <>
              <Tooltip title="Activar">
                <IconButton
                  size="small"
                  onClick={() => onActivate(p.id)}
                  className={`transition ${
                    darkMode ? "hover:bg-[#333]" : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <RestartAlt fontSize="small" sx={{ color: "#22c55e" }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Eliminar">
                <IconButton
                  size="small"
                  onClick={() => onDelete(p)}
                  className={`transition ${
                    darkMode ? "hover:bg-[#333]" : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <Delete fontSize="small" sx={{ color: "#ef4444" }} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </div>
      )}
    />
  );
}
