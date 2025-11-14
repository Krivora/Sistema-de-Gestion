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
    const isEntrada = type === "ADJUSTMENT_IN";
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
            { key: "created_at", label: "Fecha", render: (val) => fmtDate(val) },
            {
              key: "user_name",
              label: "Responsable",
              render: (v) => v || "—",
            },
          ]}
          renderActions={(a) => (
            <Tooltip title="Ver detalles">
              <IconButton
                size="small"
                onClick={() => onView(a)}
                className={actionBtn}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
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
            Cargando ajustes...
          </p>
        ) : adjustments.length > 0 ? (
          adjustments.map((a) => (
            <div
              key={a.id}
              className={`rounded-lg p-3 shadow-sm border ${
                darkMode
                  ? "bg-[#1a1a1a] border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-sm">{a.doc_no}</h3>
                {renderTypeChip(a.type)}
              </div>

              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Sucursal:{" "}
                <span className="font-medium">{a.branch_name || "—"}</span>
              </p>

              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Responsable:{" "}
                <span className="font-medium">{a.user_name || "—"}</span>
              </p>

              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Fecha: {fmtDate(a.created_at)}
              </p>

              {a.note && (
                <p
                  className={`text-xs italic ${
                    darkMode ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  “{a.note}”
                </p>
              )}

              <div className="flex justify-end gap-2 mt-2 flex-wrap">
                <Tooltip title="Ver detalles">
                  <IconButton
                    size="small"
                    onClick={() => onView(a)}
                    className={actionBtn}
                  >
                    <Visibility fontSize="small" />
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
            No hay ajustes registrados.
          </p>
        )}
      </div>
    </div>
  );
}
