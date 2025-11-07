import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import { useTheme } from "@core/context/ThemeProvider";
import DataTable from "@core/components/common/DataTable";
import { fmtDate } from "@core/utils/formatters/formatters";

export default function InventoryTransactionTable({ transactions = [], loading }) {
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
    <DataTable
      data={transactions}
      loading={loading}
      darkMode={darkMode}
      dense
      placeholder="Buscar movimiento por producto o sucursal..."
      defaultSort={{ key: "created_at", direction: "desc" }}
      columns={[
        { key: "created_at", label: "Fecha", render: (val) => fmtDate(val),},
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
            Number(val).toLocaleString("es-MX", { maximumFractionDigits: 2 }),
        },
        { key: "note", label: "Nota", render: (v) => v || "—" },
      ]}
    />
  );
}
