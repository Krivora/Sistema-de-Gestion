import { Edit, Delete, PowerSettingsNew } from "@mui/icons-material";
import { Chip, IconButton, Tooltip } from "@mui/material";
import { useTheme } from "@core/context/ThemeProvider";
import DataTable from "@core/components/common/DataTable";

// 💰 Helper para formato de moneda
const money = (v, currency = "MXN") => {
  if (v === null || v === undefined || v === "") return "—";
  const num = Number(v);
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(num);
};

export default function BranchProductTable({
  items = [],
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const { darkMode } = useTheme();

  const actionBtn = darkMode
    ? "rounded-full p-1 text-gray-400 hover:bg-[#333333] hover:text-white"
    : "rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800";

  return (
    <div
      className={`rounded-xl border shadow-sm ${
        darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
      }`}
    >
      {/* 🖥️ Vista Desktop (DataTable) */}
      <div className="hidden md:block">
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
                Number(v ?? 0).toLocaleString("es-MX", {
                  maximumFractionDigits: 2,
                }),
            },
            {
              key: "reorder_point",
              label: "Reorden",
              render: (v) =>
                Number(v ?? 0).toLocaleString("es-MX", {
                  maximumFractionDigits: 2,
                }),
            },
            { key: "currency", label: "Moneda" },
            {
              key: "current_stock",
              label: "Stock actual",
              render: (v) =>
                Number(v ?? 0).toLocaleString("es-MX", {
                  maximumFractionDigits: 2,
                }),
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
                  className={actionBtn}
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
                  className={actionBtn}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Eliminar">
                <IconButton
                  size="small"
                  onClick={() => onDelete(r.id)}
                  className={actionBtn}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          )}
        />
      </div>

      {/* 📱 Vista móvil tipo card */}
      <div className="md:hidden p-2 space-y-3 overflow-hidden">
        {loading ? (
          <p
            className={`text-center py-4 text-sm ${
              darkMode ? "text-gray-500" : "text-gray-600"
            }`}
          >
            Cargando productos...
          </p>
        ) : items.length > 0 ? (
          items.map((r) => (
            <div
              key={r.id}
              className={`rounded-lg p-3 shadow-sm border ${
                darkMode
                  ? "bg-[#1a1a1a] border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-sm">{r.product_name}</h3>
                <Chip
                  label={r.is_active ? "Activo" : "Inactivo"}
                  size="small"
                  sx={{
                    fontWeight: 500,
                    bgcolor: r.is_active
                      ? "rgba(34,197,94,0.15)"
                      : darkMode
                      ? "rgba(156,163,175,0.1)"
                      : "rgba(107,114,128,0.1)",
                    color: r.is_active
                      ? "#22c55e"
                      : darkMode
                      ? "#9ca3af"
                      : "#4b5563",
                  }}
                />
              </div>

              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                SKU: <span className="font-medium">{r.sku || "—"}</span>
              </p>
              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Sucursal:{" "}
                <span className="font-medium">{r.branch_name || "—"}</span>
              </p>
              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Costo: <span className="font-medium">{money(r.cost, r.currency)}</span>
              </p>
              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Precio:{" "}
                <span className="font-medium">{money(r.price, r.currency)}</span>
              </p>
              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Stock:{" "}
                <span className="font-medium">
                  {Number(r.current_stock ?? 0).toLocaleString("es-MX", {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </p>

              <div className="flex justify-end gap-2 mt-2 flex-wrap">
                <Tooltip title={r.is_active ? "Inhabilitar" : "Habilitar"}>
                  <IconButton
                    size="small"
                    onClick={() => onToggleStatus(r)}
                    className={actionBtn}
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
                    className={actionBtn}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Eliminar">
                  <IconButton
                    size="small"
                    onClick={() => onDelete(r.id)}
                    className={actionBtn}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          ))
        ) : (
          <p
            className={`text-center py-4 text-sm ${
              darkMode ? "text-gray-500" : "text-gray-600"
            }`}
          >
            No hay productos registrados.
          </p>
        )}
      </div>
    </div>
  );
}
