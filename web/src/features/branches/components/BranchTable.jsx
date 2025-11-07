import { Edit, Delete } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { useTheme } from "@core/context/ThemeProvider";
import DataTable from "@core/components/common/DataTable";

export default function BranchTable({ branches = [], loading, onEdit, onDelete }) {
  const { darkMode } = useTheme();

  return (
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
              className={`transition ${
                darkMode ? "hover:bg-[#333]" : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              onClick={() => onDelete(branch.id)}
              className={`transition ${
                darkMode ? "hover:bg-[#333]" : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      )}
    />
  );
}
