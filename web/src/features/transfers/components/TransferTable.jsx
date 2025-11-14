import { useTheme } from "@core/context/ThemeProvider";
import { Visibility } from "@mui/icons-material";
import { Tooltip, IconButton } from "@mui/material";
import DataTable from "@core/components/common/DataTable";
import { fmtDate } from "@core/utils/formatters/formatters";

export default function TransferTable({ transfers = [], loading, onView }) {
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
          data={transfers}
          loading={loading}
          darkMode={darkMode}
          dense
          placeholder="Buscar transferencia por sucursal o usuario..."
          defaultSort={{ key: "created_at", direction: "desc" }}
          columns={[
            { key: "doc_no", label: "Folio" },
            { key: "from_branch_name", label: "Desde", render: (v) => v || "—" },
            { key: "to_branch_name", label: "Hacia", render: (v) => v || "—" },
            { key: "created_at", label: "Fecha", render: (val) => fmtDate(val) },
            { key: "user_name", label: "Realizó", render: (v) => v || "—" },
          ]}
          renderActions={(p) => (
            <Tooltip title="Ver detalles">
              <IconButton
                size="small"
                onClick={() => onView(p)}
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
            Cargando transferencias...
          </p>
        ) : transfers.length > 0 ? (
          transfers.map((t) => (
            <div
              key={t.id}
              className={`rounded-lg p-3 shadow-sm border ${
                darkMode
                  ? "bg-[#1a1a1a] border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-sm">{t.doc_no}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    darkMode
                      ? "bg-blue-900/40 text-blue-300"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  Transferencia
                </span>
              </div>

              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Desde:{" "}
                <span className="font-medium">{t.from_branch_name || "—"}</span>
              </p>

              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Hacia:{" "}
                <span className="font-medium">{t.to_branch_name || "—"}</span>
              </p>

              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Realizó:{" "}
                <span className="font-medium">{t.user_name || "—"}</span>
              </p>

              <p
                className={`text-xs mb-0.5 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Fecha: {fmtDate(t.created_at)}
              </p>

              <div className="flex justify-end gap-2 mt-2 flex-wrap">
                <Tooltip title="Ver detalles">
                  <IconButton
                    size="small"
                    onClick={() => onView(t)}
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
            No hay transferencias registradas.
          </p>
        )}
      </div>
    </div>
  );
}
