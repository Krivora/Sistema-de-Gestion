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

  return (
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
                className={`transition ${
                  darkMode ? "hover:bg-[#333]" : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <PowerSettingsNew fontSize="small" color="error" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Editar usuario">
              <IconButton
                size="small"
                onClick={() => onEdit(u)}
                className={`transition ${
                  darkMode ? "hover:bg-[#333]" : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Eliminar usuario">
              <IconButton
                size="small"
                onClick={() => onDelete(u)}
                className={`transition ${
                  darkMode ? "hover:bg-[#333]" : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        )
      }
    />
  );
}
