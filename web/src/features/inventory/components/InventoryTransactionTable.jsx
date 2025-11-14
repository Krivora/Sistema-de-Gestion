import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { useTheme } from "@core/context/ThemeProvider";
import DataTable from "@core/components/common/DataTable";
import { fmtDate } from "@core/utils/formatters/formatters";

export default function InventoryTransactionTable({
  transactions = [],
  loading,
}) {
  const { darkMode } = useTheme();

  const typeLabelMap = {
    PURCHASE: "Compra",
    SALE: "Venta",
    ADJUSTMENT_IN: "Ajuste +",
    ADJUSTMENT_OUT: "Ajuste -",
    TRANSFER_IN: "Entrada sucursal",
    TRANSFER_OUT: "Salida sucursal",
  };

  const renderTypeChip = (type) => {
    const isEntrada = ["PURCHASE", "ADJUSTMENT_IN", "TRANSFER_IN"].includes(type);
    const Icon = isEntrada ? ArrowDownward : ArrowUpward;
    const label = typeLabelMap[type] || type;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg ${
          isEntrada
            ? darkMode
              ? "bg-[rgba(34,197,94,0.15)] text-emerald-400"
              : "bg-emerald-100 text-emerald-700"
            : darkMode
            ? "bg-[rgba(239,68,68,0.15)] text-red-400"
            : "bg-red-100 text-red-700"
        }`}
      >
        <Icon fontSize="small" />
        {label}
      </span>
    );
  };

  return (
    <div
      className={`rounded-xl border shadow-sm ${
        darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
      }`}
    >
      {/* 🖥️ Vista Desktop (DataTable) */}
      <div className="hidden md:block">
        <DataTable
          data={transactions}
          loading={loading}
          darkMode={darkMode}
          dense
          placeholder="Buscar movimiento por producto o sucursal..."
          defaultSort={{ key: "created_at", direction: "desc" }}
          columns={[
            { key: "created_at", label: "Fecha", render: (val) => fmtDate(val) },
            { key: "branch_name", label: "Sucursal", render: (v) => v || "—" },
            { key: "product_name", label: "Producto", render: (v) => v || "—" },
            {
              key: "type",
              label: "Tipo",
              render: (val) => renderTypeChip(val),
            },
            {
              key: "qty",
              label: "Cantidad",
              render: (val) =>
                Number(val).toLocaleString("es-MX", {
                  maximumFractionDigits: 2,
                }),
            },
            { key: "note", label: "Nota", render: (v) => v || "—" },
          ]}
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
            Cargando movimientos...
          </p>
        ) : transactions.length > 0 ? (
          transactions.map((t) => (
            <div
              key={t.id}
              className={`rounded-lg p-3 shadow-sm border ${
                darkMode
                  ? "bg-[#1a1a1a] border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-sm">{t.product_name || "—"}</h3>
                {renderTypeChip(t.type)}
              </div>

              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Sucursal:{" "}
                <span className="font-medium">{t.branch_name || "—"}</span>
              </p>

              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Fecha: {fmtDate(t.created_at)}
              </p>

              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Cantidad:{" "}
                <span className="font-medium">
                  {Number(t.qty).toLocaleString("es-MX", {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </p>

              {t.note && (
                <p
                  className={`text-xs italic ${
                    darkMode ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  “{t.note}”
                </p>
              )}
            </div>
          ))
        ) : (
          <p
            className={`text-center py-4 text-sm ${
              darkMode ? "text-gray-500" : "text-gray-600"
            }`}
          >
            No hay movimientos registrados.
          </p>
        )}
      </div>
    </div>
  );
}
