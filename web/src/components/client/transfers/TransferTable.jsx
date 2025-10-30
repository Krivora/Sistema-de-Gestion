import { useState, useMemo } from "react";
import { Skeleton } from "@mui/material";
import { useTheme } from "@/context/ThemeProvider";
import TableFilters from "@/components/common/TableFilters";
import Pagination from "@/components/common/TablePagination";

export default function TransferTable({ transfers = [], loading }) {
  const { darkMode } = useTheme();
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // 🔍 Filtro
  const filtered = useMemo(() => {
    return transfers.filter((t) => {
      const full = `${t.id ?? ""} ${t.from_branch ?? ""} ${t.to_branch ?? ""} ${t.user_name ?? ""}`.toLowerCase();
      return full.includes(search.toLowerCase());
    });
  }, [transfers, search]);

  // 📄 Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) {
    return (
      <div
        className={`overflow-x-auto rounded-xl border shadow-sm ${
          darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
        }`}
      >
        <table className="w-full text-sm text-left border-collapse">
          <thead
            className={`text-xs font-semibold uppercase ${
              darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
            }`}
          >
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Desde</th>
              <th className="px-6 py-3">Hacia</th>
              <th className="px-6 py-3">Usuario</th>
              <th className="px-6 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {[1, 2, 3, 4, 5].map((j) => (
                  <td key={j} className="px-6 py-4">
                    <Skeleton variant="text" width={100} animation="wave" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!transfers || transfers.length === 0) {
    return (
      <div className={`p-4 text-sm text-center rounded-lg ${darkMode ? "text-gray-400 bg-[#1a1a1a]" : "text-gray-600 bg-gray-50"}`}>
        No hay transferencias registradas aún.
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
        placeholder="Buscar transferencia..."
      />

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead
            className={`text-xs font-semibold uppercase ${
              darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
            }`}
          >
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Desde</th>
              <th className="px-6 py-3">Hacia</th>
              <th className="px-6 py-3">Usuario</th>
              <th className="px-6 py-3">Fecha</th>
            </tr>
          </thead>

          <tbody
            className={`divide-y ${
              darkMode ? "divide-gray-700 bg-[#1a1a1a]" : "divide-gray-200 bg-white"
            }`}
          >
            {paginated.map((t) => (
              <tr
                key={t.id}
                className={`transition hover:${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"}`}
              >
                <td className="px-6 py-4 font-medium">{t.id}</td>
                <td className="px-6 py-4">{t.from_branch}</td>
                <td className="px-6 py-4">{t.to_branch}</td>
                <td className="px-6 py-4">{t.created_by_name}</td>
                <td className="px-6 py-4">
                  {new Date(t.created_at).toLocaleString("es-MX")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📱 Mobile card view */}
      <div className="md:hidden p-2 space-y-3 overflow-hidden">
        {paginated.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg p-3 shadow-sm border ${
              darkMode ? "bg-[#1a1a1a] border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold text-sm">Transferencia #{t.id}</h3>
              <span className="text-xs text-gray-400">
                {new Date(t.created_at).toLocaleDateString("es-MX")}
              </span>
            </div>
            <p className="text-xs mb-1">
              <strong>Desde:</strong> {t.from_branch}
            </p>
            <p className="text-xs mb-1">
              <strong>Hacia:</strong> {t.to_branch}
            </p>
            <p className="text-xs mb-0">
              <strong>Usuario:</strong> {t.created_by_name}
            </p>
          </div>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={(newPage) => setPage(newPage)} />
    </div>
  );
}
