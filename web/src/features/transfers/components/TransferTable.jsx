import { useTheme } from "@core/context/ThemeProvider";
import { Visibility } from "@mui/icons-material";
import { Tooltip, IconButton } from "@mui/material";
import DataTable from "@core/components/common/DataTable";
import { fmtDate } from "@core/utils/formatters/formatters";
export default function TransferTable({ transfers = [], loading, onView}) {
  const { darkMode } = useTheme();
  
  return (
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
        { key: "created_at", label: "Fecha", render: (val) => fmtDate(val)},
        { key: "user_name", label: "Realizo", render: (v) => v || "—" },
      ]}
       renderActions={(p) => (
        <Tooltip title="Ver detalles">
          <IconButton
            size="small"
            onClick={() => onView(p)}
            className={`transition ${
              darkMode ? "hover:bg-[#333]" : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    />
  );
}
