import { Edit, Delete } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { useTheme } from "@core/context/ThemeProvider";
import DataTable from "@core/components/common/DataTable";

export default function BranchTable({
  branches = [],
  loading,
  onEdit,
  onDelete,
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
          data={branches}
          loading={loading}
          darkMode={darkMode}
          placeholder="Buscar sucursal..."
          defaultSort={{ key: "name", direction: "asc" }}
          columns={[
            { key: "code", label: "Código", render: (v) => v || "—" },
            { key: "name", label: "Nombre" },
            { key: "address", label: "Dirección", render: (v) => v || "—" },
            { key: "phone", label: "Teléfono", render: (v) => v || "—" },
          ]}
          renderActions={(branch) => (
            <div className="flex justify-end gap-1.5">
              <Tooltip title="Editar">
                <IconButton
                  size="small"
                  onClick={() => onEdit(branch)}
                  className={actionBtn}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Eliminar">
                <IconButton
                  size="small"
                  onClick={() => onDelete(branch.id)}
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
            Cargando sucursales...
          </p>
        ) : branches.length > 0 ? (
          branches.map((b) => (
            <div
              key={b.id}
              className={`rounded-lg p-3 shadow-sm border ${
                darkMode
                  ? "bg-[#1a1a1a] border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-sm">{b.name}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    darkMode
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {b.code || "—"}
                </span>
              </div>

              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Dirección:{" "}
                <span className="font-medium">{b.address || "—"}</span>
              </p>

              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Teléfono: <span className="font-medium">{b.phone || "—"}</span>
              </p>

              <div className="flex justify-end gap-2 mt-2 flex-wrap">
                <Tooltip title="Editar">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(b)}
                    className={actionBtn}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Eliminar">
                  <IconButton
                    size="small"
                    onClick={() => onDelete(b.id)}
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
            No hay sucursales registradas.
          </p>
        )}
      </div>
    </div>
  );
}
