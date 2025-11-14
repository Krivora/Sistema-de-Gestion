import { Visibility, Download } from "@mui/icons-material";
import { Tooltip, IconButton } from "@mui/material";
import { useTheme } from "@core/context/ThemeProvider";
import DataTable from "@core/components/common/DataTable";
import { fmtDate } from "@core/utils/formatters/formatters";

export default function SaleTable({ sales = [], loading, onView, onDownload }) {
  const { darkMode } = useTheme();

  const actionBtn = darkMode
    ? "rounded-full p-1 text-gray-400 hover:bg-[#333333] hover:text-white"
    : "rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800";

  const renderStatus = (val) => (
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
  );

  return (
    <div
      className={`rounded-xl border shadow-sm ${
        darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
      }`}
    >
      {/* 🖥️ Vista Desktop (DataTable) */}
      <div className="hidden md:block">
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
              render: (val) => renderStatus(val),
            },
            { key: "created_at", label: "Fecha", render: (val) => fmtDate(val) },
            { key: "user_name", label: "Responsable", render: (v) => v || "—" },
          ]}
          renderActions={(s) => (
            <div className="flex justify-end gap-1.5">
              <Tooltip title="Ver detalles">
                <IconButton
                  size="small"
                  onClick={() => onView(s)}
                  className={actionBtn}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Descargar PDF">
                <IconButton
                  size="small"
                  onClick={() => onDownload(s)}
                  className={actionBtn}
                >
                  <Download fontSize="small" />
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
            Cargando ventas...
          </p>
        ) : sales.length > 0 ? (
          sales.map((s) => (
            <div
              key={s.id}
              className={`rounded-lg p-3 shadow-sm border ${
                darkMode
                  ? "bg-[#1a1a1a] border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-sm">{s.doc_no}</h3>
                {renderStatus(s.status)}
              </div>

              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Cliente: <span className="font-medium">{s.customer_name || "—"}</span>
              </p>

              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Sucursal: <span className="font-medium">{s.branch_name || "—"}</span>
              </p>

              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Método: <span className="font-medium">{s.payment_method || "—"}</span>
              </p>

              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Responsable: <span className="font-medium">{s.user_name || "—"}</span>
              </p>

              <p
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Fecha: {fmtDate(s.created_at)}
              </p>

              <div className="flex justify-end gap-2 mt-2 flex-wrap">
                <Tooltip title="Ver detalles">
                  <IconButton
                    size="small"
                    onClick={() => onView(s)}
                    className={actionBtn}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Descargar PDF">
                  <IconButton
                    size="small"
                    onClick={() => onDownload(s)}
                    className={actionBtn}
                  >
                    <Download fontSize="small" />
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
            No hay ventas registradas.
          </p>
        )}
      </div>
    </div>
  );
}
