import { useMemo, useState } from "react";
import { Edit, Delete, PowerSettingsNew } from "@mui/icons-material";
import { Chip, IconButton, Skeleton, Tooltip } from "@mui/material";
import { useTheme } from "@/context/ThemeProvider";
import TableFilters from "@/components/common/TableFilters";
import Pagination from "@/components/common/TablePagination";

const money = (v, currency = "MXN") => {
  if (v === null || v === undefined || v === "") return "—";
  const num = Number(v);
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(num);
};

export default function BranchProductTable({
  items = [],
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const { darkMode } = useTheme();
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      const full = `${r.sku ?? ""} ${r.product_name ?? ""} ${r.branch_name ?? ""} ${r.currency ?? ""}`.toLowerCase();
      return full.includes(search.toLowerCase());
    });
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const actionBtn = darkMode
    ? "rounded-full p-1 text-gray-400 hover:bg-[#333333] hover:text-white"
    : "rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800";

  if (loading) {
    return (
      <div
        className={`rounded-xl border shadow-sm w-full ${
          darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
        }`}
      >
        <table className="w-full text-sm text-left">
          <thead
            className={`text-xs font-semibold uppercase ${
              darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
            }`}
          >
            <tr>
              {["Producto", "SKU", "Sucursal", "Costo", "Precio", "Stock", "Moneda", "Estado"].map((h) => (
                <th key={h} className="px-6 py-3">{h}</th>
              ))}
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 9 }).map((__, j) => (
                  <td key={j} className="px-6 py-4">
                    <Skeleton variant="text" width={100} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className={`p-4 text-sm text-center rounded-lg ${darkMode ? "text-gray-400 bg-[#1a1a1a]" : "text-gray-600 bg-gray-50"}`}>
        No hay asignaciones de productos a sucursales aún.
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border shadow-sm transition-all ${
        darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
      }`}
    >
      <TableFilters
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        rowsPerPage={rowsPerPage}
        onRowsChange={(val) => {
          setRowsPerPage(val);
          setPage(1);
        }}
        darkMode={darkMode}
        placeholder="Buscar por SKU, producto o sucursal..."
      />

      {/* 🖥️ Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead
            className={`text-xs font-semibold uppercase ${
              darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
            }`}
          >
            <tr>
              <th className="px-6 py-3">Producto</th>
              <th className="px-6 py-3">SKU</th>
              <th className="px-6 py-3">Sucursal</th>
              <th className="px-6 py-3">Costo</th>
              <th className="px-6 py-3">Precio</th>
              <th className="px-6 py-3">Min. Stock</th>
              <th className="px-6 py-3">Reorden</th>
              <th className="px-6 py-3">Moneda</th>
              <th className="px-6 py-3">Stock actual</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${darkMode ? "divide-gray-700 bg-[#1a1a1a]" : "divide-gray-200 bg-white"}`}
          >
            {paginated.map((r) => (
              <tr key={r.id} className={`transition hover:${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"}`}>
                <td className={`px-6 py-4 font-medium ${darkMode ? "text-gray-100" : "text-gray-900"}`}>{r.product_name}</td>
                <td className="px-6 py-4">{r.sku}</td>
                <td className="px-6 py-4">{r.branch_name ?? "—"}</td>
                <td className="px-6 py-4">{money(r.cost, r.currency)}</td>
                <td className="px-6 py-4">{money(r.price, r.currency)}</td>
                <td className="px-6 py-4">{r.min_stock ?? "—"}</td>
                <td className="px-6 py-4">{r.reorder_point ?? "—"}</td>
                <td className="px-6 py-4">{r.currency}</td>
                <td className="px-6 py-4">{r.current_stock ?? 0}</td>
                <td className="px-6 py-4">
                  <Chip
                    label={r.is_active ? "Activo" : "Inactivo"}
                    size="small"
                    sx={{
                      fontWeight: 500,
                      bgcolor: r.is_active ? "#22c55e33" : "#6b728033",
                      color: r.is_active ? "#22c55e" : darkMode ? "#9ca3af" : "#4b5563",
                    }}
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Tooltip title={r.is_active ? "Inhabilitar" : "Habilitar"}>
                      <IconButton size="small" onClick={() => onToggleStatus(r)} className={actionBtn}>
                        <PowerSettingsNew fontSize="small" color={r.is_active ? "error" : "success"} />
                      </IconButton>
                    </Tooltip>
                    <button className={actionBtn} onClick={() => onEdit(r)}>
                      <Edit fontSize="small" />
                    </button>
                    <button className={actionBtn} onClick={() => onDelete(r.id)}>
                      <Delete fontSize="small" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📱 Mobile card view */}
      <div className="md:hidden p-2 space-y-3 overflow-hidden">
        {paginated.map((r) => (
          <div
            key={r.id}
            className={`rounded-lg p-3 shadow-sm border break-words overflow-hidden ${
              darkMode ? "bg-[#1a1a1a] border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold text-sm">{r.product_name}</h3>
              <Chip
                label={r.is_active ? "Activo" : "Inactivo"}
                size="small"
                sx={{
                  fontWeight: 500,
                  bgcolor: r.is_active ? "#22c55e33" : "#6b728033",
                  color: r.is_active ? "#22c55e" : darkMode ? "#9ca3af" : "#4b5563",
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mb-1">{r.branch_name}</p>
            <p className="text-xs mb-0.5">SKU: {r.sku || "—"}</p>
            <p className="text-xs mb-0.5">Costo: {money(r.cost, r.currency)}</p>
            <p className="text-xs mb-0.5">Precio: {money(r.price, r.currency)}</p>
            <p className="text-xs mb-0.5">Stock actual: {r.current_stock ?? 0}</p>

            <div className="flex justify-end gap-2 mt-2 flex-wrap">
              <Tooltip title={r.is_active ? "Inhabilitar" : "Habilitar"}>
                <IconButton size="small" onClick={() => onToggleStatus(r)} className={actionBtn}>
                  <PowerSettingsNew fontSize="small" color={r.is_active ? "error" : "success"} />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={() => onEdit(r)} className={actionBtn}>
                <Edit fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => onDelete(r.id)} className={actionBtn}>
                <Delete fontSize="small" />
              </IconButton>
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
