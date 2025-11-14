import { Edit, Delete, PowerSettingsNew, RestartAlt } from "@mui/icons-material";
import { Chip, IconButton, Tooltip } from "@mui/material";
import { useTheme } from "@core/context/ThemeProvider";
import DataTable from "@core/components/common/DataTable";

// ✂️ Truncar descripciones largas
const truncate = (text = "", max = 80) =>
  text.length > max ? text.slice(0, max) + "…" : text;

export default function CategoryTable({
  categories = [],
  loading,
  onEdit,
  onDelete,
  onActivate,
  onDesactivate,
}) {
  const { darkMode } = useTheme();

  const actionBtn = darkMode
    ? "rounded-full p-1 text-gray-400 hover:bg-[#333333] hover:text-white"
    : "rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800";

  const renderStatusChip = (val) => {
    const map = {
      active: { label: "Activo", color: "#22c55e", bg: "#22c55e33" },
      inactive: { label: "Inactivo", color: "#f59e0b", bg: "#facc1533" },
      deleted: {
        label: "Eliminado",
        color: darkMode ? "#9ca3af" : "#4b5563",
        bg: "#9ca3af33",
      },
    };
    const cfg = map[val] || map.deleted;
    return (
      <Chip
        label={cfg.label}
        size="small"
        sx={{
          fontWeight: 500,
          bgcolor: cfg.bg,
          color: cfg.color,
        }}
      />
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
          data={categories}
          loading={loading}
          darkMode={darkMode}
          dense
          placeholder="Buscar categoría..."
          defaultSort={{ key: "name", direction: "asc" }}
          columns={[
            { key: "name", label: "Nombre" },
            { key: "code", label: "Código", render: (v) => v || "—" },
            {
              key: "description",
              label: "Descripción",
              render: (v) =>
                v ? (
                  truncate(v, 60)
                ) : (
                  <span className="italic text-gray-400">Sin descripción</span>
                ),
            },
            {
              key: "status",
              label: "Estado",
              render: (val) => renderStatusChip(val),
            },
          ]}
          renderActions={(c) => (
            <div className="flex justify-end gap-1.5">
              {c.status !== "deleted" && (
                <Tooltip title="Editar">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(c)}
                    className={actionBtn}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {c.status === "active" && (
                <Tooltip title="Desactivar">
                  <IconButton
                    size="small"
                    onClick={() => onDesactivate(c.id)}
                    className={actionBtn}
                  >
                    <PowerSettingsNew fontSize="small" sx={{ color: "#f59e0b" }} />
                  </IconButton>
                </Tooltip>
              )}

              {c.status === "inactive" && (
                <>
                  <Tooltip title="Activar">
                    <IconButton
                      size="small"
                      onClick={() => onActivate(c.id)}
                      className={actionBtn}
                    >
                      <RestartAlt fontSize="small" sx={{ color: "#22c55e" }} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Eliminar">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(c)}
                      className={actionBtn}
                    >
                      <Delete fontSize="small" sx={{ color: "#ef4444" }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
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
            Cargando categorías...
          </p>
        ) : categories.length > 0 ? (
          categories.map((c) => (
            <div
              key={c.id}
              className={`rounded-lg p-3 shadow-sm border ${
                darkMode
                  ? "bg-[#1a1a1a] border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-sm">{c.name}</h3>
                {renderStatusChip(c.status)}
              </div>

              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Código: <span className="font-medium">{c.code || "—"}</span>
              </p>

              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {c.description
                  ? truncate(c.description, 80)
                  : "Sin descripción"}
              </p>

              <div className="flex justify-end gap-2 mt-2 flex-wrap">
                {c.status !== "deleted" && (
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(c)}
                      className={actionBtn}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                {c.status === "active" && (
                  <Tooltip title="Desactivar">
                    <IconButton
                      size="small"
                      onClick={() => onDesactivate(c.id)}
                      className={actionBtn}
                    >
                      <PowerSettingsNew fontSize="small" sx={{ color: "#f59e0b" }} />
                    </IconButton>
                  </Tooltip>
                )}

                {c.status === "inactive" && (
                  <>
                    <Tooltip title="Activar">
                      <IconButton
                        size="small"
                        onClick={() => onActivate(c.id)}
                        className={actionBtn}
                      >
                        <RestartAlt fontSize="small" sx={{ color: "#22c55e" }} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(c)}
                        className={actionBtn}
                      >
                        <Delete fontSize="small" sx={{ color: "#ef4444" }} />
                      </IconButton>
                    </Tooltip>
                  </>
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
            No hay categorías registradas.
          </p>
        )}
      </div>
    </div>
  );
}
