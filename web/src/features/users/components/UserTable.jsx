import { Edit, PowerSettingsNew, Delete } from "@mui/icons-material";
import { Chip, Tooltip, IconButton } from "@mui/material";
import { useTheme } from "@core/context/ThemeProvider";
import DataTable from "@core/components/common/DataTable";
import { fmtDate } from "@core/utils/formatters/formatters";

export default function UserTable({
  users = [],
  loading,
  status,
  onEdit,
  onDesactivate,
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
          data={users}
          loading={loading}
          darkMode={darkMode}
          dense
          placeholder="Buscar usuario por nombre, correo o rol..."
          defaultSort={{ key: "created_at", direction: "desc" }}
          columns={[
            { key: "name", label: "Nombre" },
            { key: "email", label: "Correo" },
            { key: "role_name", label: "Rol" },
            {
              key: "status",
              label: "Estado",
              render: (val) => {
                const active = val === "active";
                return (
                  <Chip
                    label={active ? "Activo" : "Inactivo"}
                    size="small"
                    sx={{
                      fontWeight: 500,
                      bgcolor: active ? "#22c55e33" : "#6b728033",
                      color: active ? "#22c55e" : darkMode ? "#9ca3af" : "#4b5563",
                    }}
                  />
                );
              },
            },
            {
              key: status === "inactive" ? "desactivated_at" : "created_at",
              label: status === "inactive" ? "Fecha de baja" : "Fecha de alta",
              render: (val) => fmtDate(val),
            },
          ]}
          renderActions={(u) =>
            status === "active" && (
              <div className="flex justify-end gap-1.5">
                <Tooltip title="Desactivar usuario">
                  <IconButton
                    size="small"
                    onClick={() => onDesactivate(u)}
                    className={actionBtn}
                  >
                    <PowerSettingsNew fontSize="small" color="error" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Editar usuario">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(u)}
                    className={actionBtn}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Eliminar usuario">
                  <IconButton
                    size="small"
                    onClick={() => onDelete(u)}
                    className={actionBtn}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
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
            Cargando usuarios...
          </p>
        ) : users.length > 0 ? (
          users.map((u) => (
            <div
              key={u.id}
              className={`rounded-lg p-3 shadow-sm border ${
                darkMode
                  ? "bg-[#1a1a1a] border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-sm">{u.name}</h3>
                <Chip
                  label={u.status === "active" ? "Activo" : "Inactivo"}
                  size="small"
                  sx={{
                    fontWeight: 500,
                    bgcolor:
                      u.status === "active" ? "#22c55e33" : "#6b728033",
                    color:
                      u.status === "active"
                        ? "#22c55e"
                        : darkMode
                        ? "#9ca3af"
                        : "#4b5563",
                  }}
                />
              </div>

              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Correo: <span className="font-medium">{u.email}</span>
              </p>
              <p
                className={`text-xs mb-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Rol: <span className="font-medium">{u.role_name || "—"}</span>
              </p>
              <p
                className={`text-xs mb-0.5 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {status === "inactive" ? "Fecha de baja: " : "Fecha de alta: "}
                {fmtDate(
                  status === "inactive" ? u.desactivated_at : u.created_at
                )}
              </p>

              {status === "active" && (
                <div className="flex justify-end gap-2 mt-2 flex-wrap">
                  <Tooltip title="Desactivar usuario">
                    <IconButton
                      size="small"
                      onClick={() => onDesactivate(u)}
                      className={actionBtn}
                    >
                      <PowerSettingsNew fontSize="small" color="error" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Editar usuario">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(u)}
                      className={actionBtn}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Eliminar usuario">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(u)}
                      className={actionBtn}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </div>
              )}
            </div>
          ))
        ) : (
          <p
            className={`text-center py-4 text-sm ${
              darkMode ? "text-gray-500" : "text-gray-600"
            }`}
          >
            No hay usuarios registrados.
          </p>
        )}
      </div>
    </div>
  );
}
