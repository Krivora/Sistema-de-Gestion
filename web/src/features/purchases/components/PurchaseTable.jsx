import { Visibility } from "@mui/icons-material";
import { Tooltip, IconButton } from "@mui/material";
import { useTheme } from "@core/context/ThemeProvider";
import DataTable from "@core/components/common/DataTable";
import { fmtDate } from "@core/utils/formatters/formatters";
export default function PurchaseTable({ purchases = [], loading, onView }) {
  const { darkMode } = useTheme();

  return (
    <DataTable
      data={purchases}
      loading={loading}
      darkMode={darkMode}
      dense
      placeholder="Buscar compra por folio, proveedor o sucursal..."
      defaultSort={{ key: "created_at", direction: "desc" }}
      columns={[
        { key: "doc_no", label: "Folio" },
        { key: "branch_name", label: "Sucursal", render: (v) => v || "—" },
        {
          key: "status",
          label: "Estado",
          render: (val) => (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium tracking-wide ${
                val === "open"
                  ? darkMode
                    ? "bg-[rgba(34,197,94,0.15)] text-emerald-400"
                    : "bg-emerald-100 text-emerald-700"
                  : darkMode
                  ? "bg-[rgba(156,163,175,0.1)] text-gray-400"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {val === "open" ? "Abierta" : "Cerrada"}
            </span>
          ),
        },
        { key: "created_at", label: "Fecha", render: (val) => fmtDate(val),},
        { key: "user_name", label: "Responsable", render: (v) => v || "—" },
      ]}
      renderActions={(p) => (
        <Tooltip title="Ver detalles">
          <IconButton
            size="small"
            onClick={() => onView(p)}
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
