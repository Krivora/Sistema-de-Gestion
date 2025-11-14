import { useTheme } from "@core/context/ThemeProvider";
import DataTable from "@core/components/common/DataTable";
import { fmtDate } from "@core/utils/formatters/formatters";
import { IconButton, Tooltip } from "@mui/material";
import { Delete, Restore } from "@mui/icons-material";

export default function AdjustmentNotesTable({
  items = [],
  loading,
  deleteItem,
  restoreItem,
}) {
  const { darkMode } = useTheme();

  const actionBtn = darkMode
    ? "rounded-full p-1 text-gray-400 hover:bg-[#333333] hover:text-white"
    : "rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800";

  const renderTypeChip = (type) => {
    const isEntrada = type === "ADJUSTMENT_IN";
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
        {isEntrada ? "Entrada" : "Salida"}
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
          data={items}
          loading={loading}
          darkMode={darkMode}
          dense
          placeholder="Buscar motivo..."
          defaultSort={{ key: "created_at", direction: "desc" }}
          columns={[
            { key: "label", label: "Motivo" },
            {
              key: "metadata.type",
              label: "Tipo de movimiento",
              render: (val, row) => renderTypeChip(row.metadata?.type),
            },
            { key: "created_by_name", label: "Creado por" },
            { key: "created_at", label: "Fecha", render: (val) => fmtDate(val) },
            ]}
            renderActions={(p) =>
              p.deleted_at ? (
                <Tooltip title="Restaurar">
                  <IconButton
                    size="small"
                    onClick={() => restoreItem(p.id)}
                    className={actionBtn}
                  >
                    <Restore fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Eliminar">
                  <IconButton
                    size="small"
                    onClick={() => deleteItem(p.id)}
                    className={actionBtn}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              )
            }
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
            Cargando...
          </p>
        ) : items.length > 0 ? (
          items.map((p) => (
            <div
              key={p.id}
              className={`rounded-lg p-3 shadow-sm border ${
                darkMode
                  ? "bg-[#1a1a1a] border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-sm">{p.label}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    p.metadata?.type === "ADJUSTMENT_IN"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {p.metadata?.type === "ADJUSTMENT_IN" ? "Entrada" : "Salida"}
                </span>
              </div>

              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Creado por: <span className="font-medium">{p.created_by_name}</span>
              </p>
              <p
                className={`text-xs mb-0.5 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Fecha: {fmtDate(p.created_at)}
              </p>

              <div className="flex justify-end gap-2 mt-2 flex-wrap">
                {p.deleted_at ? (
                  <Tooltip title="Restaurar">
                    <IconButton
                      size="small"
                      onClick={() => restoreItem(p.id)}
                      className={actionBtn}
                    >
                      <Restore fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Eliminar">
                    <IconButton
                      size="small"
                      onClick={() => deleteItem(p.id)}
                      className={actionBtn}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </div>
          ))
        ) : (
          <p
            className={`text-center py-4 text-sm ${
              darkMode ? "text-gray-500" : "text-gray-600"
            }`}
          >
            No hay motivos registrados.
          </p>
        )}
      </div>
    </div>
  );
}
