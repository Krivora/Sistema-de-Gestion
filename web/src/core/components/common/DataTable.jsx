import { useState, useMemo } from "react";
import { Skeleton } from "@mui/material";
import { ArrowDropDown, ArrowDropUp, UnfoldMore } from "@mui/icons-material";
import TableFilters from "./TableFilters";
import Pagination from "./TablePagination";
import CommonTable from "./CommonTable";

export default function DataTable({
  data = [],
  columns = [],
  renderActions = null,
  darkMode = false,
  loading = false,
  placeholder = "Buscar...",
  dense = false,
  defaultSort = null, // ejemplo: { key: "created_at", direction: "desc" }
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState(defaultSort);

  // 🔍 Filtrado por texto
  const filtered = useMemo(() => {
    if (!data || data.length === 0) return [];
    const searchText = search.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some(
        (val) => typeof val === "string" && val.toLowerCase().includes(searchText)
      )
    );
  }, [data, search]);

  // ↕️ Ordenamiento
  const sorted = useMemo(() => {
    if (!sortConfig) return filtered;
    const { key, direction } = sortConfig;

    return [...filtered].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      // Comparar numérico o texto
      if (typeof aVal === "number" && typeof bVal === "number") {
        return direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      return direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filtered, sortConfig]);

  // 📄 Paginación
  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const paginated = sorted.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // 🔁 Cambiar orden al hacer clic
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        const nextDir = prev.direction === "asc" ? "desc" : "asc";
        return { key, direction: nextDir };
      }
      return { key, direction: "asc" };
    });
  };

  // ⏳ Skeleton loading
  if (loading) {
    return (
      <div
        className={`overflow-x-auto rounded-xl border shadow-sm ${
          darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
        }`}
      >
        <table className="w-full text-sm">
          <thead
            className={`text-xs font-semibold uppercase ${
              darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
            }`}
          >
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-6 py-3">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((_, j) => (
                  <td key={j} className="px-6 py-3">
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

  // 🚫 Sin registros
  if (!data || data.length === 0) {
    return (
      <div
        className={`p-4 text-sm text-center rounded-lg ${
          darkMode ? "text-gray-400 bg-[#1a1a1a]" : "text-gray-600 bg-gray-50"
        }`}
      >
        No hay registros para mostrar.
      </div>
    );
  }

  // 🧾 Tabla con filtros + orden + paginación
  return (
    <div
      className={`rounded-xl border shadow-sm transition-all ${
        darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
      }`}
    >
      {/* 🔍 Filtros */}
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
        placeholder={placeholder}
      />

      {/* 📋 Tabla */}
      <CommonTable
        darkMode={darkMode}
        dense={dense}
        rows={paginated}
        columns={columns.map((c) => {
          const isActive = sortConfig?.key === c.key;
          const icon =
            isActive && sortConfig.direction === "asc" ? (
              <ArrowDropUp fontSize="small" />
            ) : isActive && sortConfig.direction === "desc" ? (
              <ArrowDropDown fontSize="small" />
            ) : (
              <UnfoldMore fontSize="small" sx={{ opacity: 0.4 }} />
            );

          return {
            ...c,
            label: (
              <div
                onClick={() => handleSort(c.key)}
                className={`flex items-center gap-1 cursor-pointer select-none group ${
                  darkMode ? "hover:text-gray-100" : "hover:text-gray-800"
                }`}
              >
                <span>{c.label}</span>
                <span
                  className={`transition-opacity ${
                    isActive ? "opacity-100" : "opacity-40 group-hover:opacity-70"
                  }`}
                >
                  {icon}
                </span>
              </div>
            ),
          };
        })}
        renderActions={renderActions}
      />

      {/* 📑 Paginación */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        darkMode={darkMode}
      />
    </div>
  );
}
