import DataTable from "@core/components/common/DataTable";
import { Visibility, ArrowDownward, ArrowUpward } from "@mui/icons-material";
import { Tooltip, IconButton } from "@mui/material";
import { useTheme } from "@core/context/ThemeProvider";
import { fmtDate } from "@core/utils/formatters/formatters";

export default function AdjustmentTable({ adjustments = [], loading, onView }) {
  const { darkMode } = useTheme();

  const typeLabelMap = {
    ADJUSTMENT_IN: "Entrada +",
    ADJUSTMENT_OUT: "Salida -",
  };
  const renderTypeChip = (type) => {
    const isEntrada = ["ADJUSTMENT_IN"].includes(type);
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
      data={adjustments}
      loading={loading}
      darkMode={darkMode}
      dense
      placeholder="Buscar ajuste por nota o sucursal..."
      defaultSort={{ key: "created_at", direction: "desc" }}
      columns={[
        { key: "doc_no", label: "Identificador" },
        { key: "branch_name", label: "Sucursal" },
         {
          key: "type",
          label: "Tipo",
          render: (val) => renderTypeChip(val),
        },
        { key: "note", label: "Nota", render: (v) => v || "—" },
        { key: "created_at", label: "Fecha", render: (val) => fmtDate(val),},
        { key: "user_name", label: "Responsable", render: (v) => v || "—" },
      ]}
      renderActions={(a) => (
        <Tooltip title="Ver detalles">
          <IconButton
            size="small"
            onClick={() => onView(a)}
            className={`transition ${
              darkMode ? "hover:bg-[#333]" : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    />
  );
}
