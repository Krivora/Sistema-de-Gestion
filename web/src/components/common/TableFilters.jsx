import { Search } from "@mui/icons-material";

export default function TableFilters({
  search,
  onSearchChange,
  rowsPerPage,
  onRowsChange,
  darkMode = false,
  placeholder = "Buscar...",
}) {
  return (
    <div className="p-3 flex flex-col sm:flex-row justify-between gap-3">
      {/* 🔍 Buscador */}
      <div className="relative w-full sm:w-64">
        <Search
          fontSize="small"
          className={`absolute left-3 top-1/2 -translate-y-1/2 
            ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`pl-10 pr-3 py-2 rounded-lg text-sm w-full 
            ${darkMode
              ? "bg-[#2a2a2a] text-gray-200 placeholder-gray-500"
              : "bg-gray-100 text-gray-700 placeholder-gray-400"
            }`}
        />
      </div>

      {/* Selector filas */}
      <select
        value={rowsPerPage}
        onChange={(e) => onRowsChange(Number(e.target.value))}
        className={`px-2 py-2 rounded-lg text-sm ${
          darkMode
            ? "bg-[#2a2a2a] text-gray-200"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        <option value={5}>5 por página</option>
        <option value={10}>10 por página</option>
        <option value={20}>20 por página</option>
        <option value={50}>50 por página</option>
      </select>
    </div>
  );
}
