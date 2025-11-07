import { Visibility, Download } from "@mui/icons-material";
import { Tooltip, IconButton } from "@mui/material";
import { useTheme } from "@core/context/ThemeProvider";
import DataTable from "@core/components/common/DataTable";
import { fmtDate } from "@core/utils/formatters/formatters";
export default function SaleTable({ sales = [], loading, onView, onDownload }) {
  const { darkMode } = useTheme();

  const formatDate = (d) =>
    new Date(new Date(d).getTime() - 7 * 60 * 60 * 1000).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <DataTable
      data={sales}
      loading={loading}
      darkMode={darkMode}
      dense
      placeholder="Buscar venta por folio, cliente o sucursal..."
      defaultSort={{ key: "created_at", direction: "desc" }}
      columns={[
        { key: "doc_no", label: "Folio" },
        { key: "customer_name", label: "Cliente", render: (v) => v || "—" },
        { key: "branch_name", label: "Sucursal", render: (v) => v || "—" },
        { key: "payment_method", label: "Método", render: (v) => v || "—" },
        {
          key: "status",
          label: "Estado",
          render: (val) => (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium tracking-wide ${
                val === "open"
                  ? darkMode
                    ? "bg-[rgba(59,130,246,0.15)] text-blue-400"
                    : "bg-blue-100 text-blue-700"
                  : darkMode
                  ? "bg-[rgba(156,163,175,0.1)] text-gray-400"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {val === "open" ? "Abierta" : "Cerrada"}
            </span>
          ),
        },
        { key: "created_at", label: "Fecha", render: (val) => fmtDate(val)},
        { key: "user_name", label: "Responsable", render: (v) => v || "—" },
      ]}
      renderActions={(s) => (
        <div className="flex justify-end gap-1.5">
          <Tooltip title="Ver detalles">
            <IconButton
              size="small"
              onClick={() => onView(s)}
              className={`transition ${
                darkMode ? "hover:bg-[#333]" : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Descargar PDF">
            <IconButton
              size="small"
              onClick={() => onDownload(s)}
              className={`transition ${
                darkMode
                  ? "hover:bg-[#333] text-gray-400"
                  : "hover:bg-gray-100 text-gray-500"
              }`}
            >
              <Download fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      )}
    />
  );
}
