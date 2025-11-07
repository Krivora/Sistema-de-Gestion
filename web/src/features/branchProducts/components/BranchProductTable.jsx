import { Edit, Delete, PowerSettingsNew } from "@mui/icons-material";
import { Chip, IconButton, Tooltip } from "@mui/material";
import { useTheme } from "@core/context/ThemeProvider";
import DataTable from "@core/components/common/DataTable";

// 💰 Helper para formato de moneda
const money = (v, currency = "MXN") => {
  if (v === null || v === undefined || v === "") return "—";
  const num = Number(v);
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(num);
};

export default function BranchProductTable({
  items = [],
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const { darkMode } = useTheme();

  return (
    <DataTable
      data={items}
      loading={loading}
      darkMode={darkMode}
      placeholder="Buscar por SKU, producto o sucursal..."
      defaultSort={{ key: "product_name", direction: "asc" }}
      dense
      columns={[
        { key: "product_name", label: "Producto" },
        { key: "sku", label: "SKU", render: (v) => v || "—" },
        { key: "branch_name", label: "Sucursal", render: (v) => v || "—" },
        {
          key: "cost",
          label: "Costo",
          render: (_, row) => money(row.cost, row.currency),
        },
        {
          key: "price",
          label: "Precio",
          render: (_, row) => money(row.price, row.currency),
        },
        {
          key: "min_stock",
          label: "Min. Stock",
          render: (v) =>
            Number(v ?? 0).toLocaleString("es-MX", { maximumFractionDigits: 2 }),
        },
        {
          key: "reorder_point",
          label: "Reorden",
          render: (v) =>
            Number(v ?? 0).toLocaleString("es-MX", { maximumFractionDigits: 2 }),
        },
        { key: "currency", label: "Moneda" },
        {
          key: "current_stock",
          label: "Stock actual",
          render: (v) =>
            Number(v ?? 0).toLocaleString("es-MX", { maximumFractionDigits: 2 }),
        },
        {
          key: "is_active",
          label: "Estado",
          render: (val) => (
            <Chip
              label={val ? "Activo" : "Inactivo"}
              size="small"
              sx={{
                fontWeight: 500,
                borderRadius: "6px",
                px: 0.5,
                bgcolor: val
                  ? "rgba(34,197,94,0.15)"
                  : darkMode
                  ? "rgba(156,163,175,0.1)"
                  : "rgba(107,114,128,0.1)",
                color: val
                  ? "#22c55e"
                  : darkMode
                  ? "#9ca3af"
                  : "#4b5563",
              }}
            />
          ),
        },
      ]}
      renderActions={(r) => (
        <div className="flex justify-end gap-1.5">
          <Tooltip title={r.is_active ? "Inhabilitar" : "Habilitar"}>
            <IconButton
              size="small"
              onClick={() => onToggleStatus(r)}
              className={`transition ${
                darkMode ? "hover:bg-[#333]" : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <PowerSettingsNew
                fontSize="small"
                color={r.is_active ? "error" : "success"}
              />
            </IconButton>
          </Tooltip>

          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => onEdit(r)}
              className={`transition ${
                darkMode ? "hover:bg-[#333]" : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              onClick={() => onDelete(r.id)}
              className={`transition ${
                darkMode ? "hover:bg-[#333]" : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      )}
    />
  );
}
