import { useEffect, useMemo, useState } from "react";
import { useReports } from "../hooks/useReports";
import { useTheme } from "@core/context/ThemeProvider";
import TableFilters from "@core/components/common/TableFilters";
import Pagination from "@core/components/common/TablePagination";
import { ArrowDownward, ArrowUpward, Download } from "@mui/icons-material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function InventoryReport() {
  const { darkMode } = useTheme();
  const { data, fetchStock, loading } = useReports();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState("product_name");
  const [sortOrder, setSortOrder] = useState("asc");
  useEffect(() => {
    fetchStock();
  }, []);

  // 🔹 Filtrado + ordenamiento
  const filteredData = useMemo(() => {
    if (!data.stock) return [];
    let result = data.stock.filter((r) => {
      const text = `${r.branch_name} ${r.product_name} ${r.category_name || ""} ${
        r.sku
      }`.toLowerCase();
      return text.includes(search.toLowerCase());
    });

    result.sort((a, b) => {
      let x = a[sortField];
      let y = b[sortField];
      const isNumeric = !isNaN(parseFloat(x)) && !isNaN(parseFloat(y));
      if (isNumeric) {
        x = parseFloat(x);
        y = parseFloat(y);
      } else {
        if (typeof x === "string") x = x.toLowerCase();
        if (typeof y === "string") y = y.toLowerCase();
      }

      if (x < y) return sortOrder === "asc" ? -1 : 1;
      if (x > y) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [data.stock, search, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // 🟩 EXPORTAR A EXCEL
  const handleExportExcel = () => {
    const exportData = filteredData.map((r) => ({
      Sucursal: r.branch_name,
      Producto: r.product_name,
      Categoría: r.category_name || "—",
      Precio: r.price ? `$${parseFloat(r.price).toFixed(2)}` : "$0.00",
      Stock: Number(r.stock).toFixed(2),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");

    const fecha = new Date().toLocaleDateString("es-MX").replace(/\//g, "-");
    const nombreArchivo = `Reporte_Inventario_${fecha}.xlsx`;

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, nombreArchivo);
  };

  const tableContainer = `rounded-xl border shadow-sm overflow-x-auto ${
    darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
  }`;

  const thStyle = `px-6 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none whitespace-nowrap 
    ${
      darkMode
        ? "bg-[#2a2a2a] text-gray-300 hover:bg-[#333]"
        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
    }`;

  const tdStyle = `px-6 py-3 text-sm whitespace-nowrap`;

  return (
    <div className={tableContainer}>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center p-4 border-b border-gray-600/30">
        <h3
          className={`font-semibold text-lg ${
            darkMode ? "text-gray-100" : "text-gray-800"
          }`}
        >
          Inventario general
        </h3>

        <button
          onClick={handleExportExcel}
          className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md shadow-sm transition-all 
            ${
              darkMode
                ? "bg-[#272727] hover:bg-[#333] text-gray-200"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
        >
          <Download fontSize="small" />
          Exportar a Excel
        </button>
      </div>

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
        placeholder="Buscar producto, categoría o sucursal..."
      />

      <table className="w-full text-sm border-collapse min-w-[850px]">
        <thead>
          <tr>
            {[
              { key: "branch_name", label: "Sucursal" },
              { key: "product_name", label: "Producto" },
              { key: "category_name", label: "Categoría" },
              { key: "price", label: "Precio", align: "right" },
              { key: "stock", label: "Stock", align: "right" },
            ].map((col) => (
              <th
                key={col.key}
                className={`${thStyle} ${
                  col.align === "right" ? "text-right pr-6" : "text-left"
                }`}
                onClick={() => handleSort(col.key)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{col.label}</span>
                  {sortField === col.key &&
                    (sortOrder === "asc" ? (
                      <ArrowUpward fontSize="inherit" className="opacity-70" />
                    ) : (
                      <ArrowDownward fontSize="inherit" className="opacity-70" />
                    ))}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody
          className={`divide-y ${
            darkMode ? "divide-gray-700 bg-[#1a1a1a]" : "divide-gray-200 bg-white"
          }`}
        >
          {loading ? (
            <tr>
              <td colSpan={5} className="text-center py-6 text-gray-500">
                Cargando datos...
              </td>
            </tr>
          ) : paginatedData.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className={`text-center py-6 ${
                  darkMode ? "text-gray-500" : "text-gray-600"
                }`}
              >
                No hay registros disponibles
              </td>
            </tr>
          ) : (
            paginatedData.map((r, idx) => (
              <tr
                key={idx}
                className={`transition-colors ${
                  darkMode ? "hover:bg-[#2a2a2a]" : "hover:bg-gray-50"
                }`}
              >
                <td className={`${tdStyle}`}>{r.branch_name}</td>
                <td className={`${tdStyle}`}>{r.product_name}</td>
                <td className={`${tdStyle}`}>{r.category_name || "—"}</td>
                <td
                  className={`${tdStyle} text-start ${
                    darkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  ${r.price ? parseFloat(r.price).toFixed(2) : "0.00"}
                </td>
                <td
                  className={`${tdStyle} text-start font-medium ${
                    r.stock <= 3
                      ? "text-red-500"
                      : darkMode
                      ? "text-gray-100"
                      : "text-gray-800"
                  }`}
                >
                  {Number(r.stock).toFixed(2)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Pagination page={page} totalPages={totalPages} onChange={(p) => setPage(p)} />
    </div>
  );
}
