import { useState, useMemo } from "react";
import { useTheme } from "../../providers/ThemeProvider";
import { useProducts } from "../../hooks/useProducts";
import TableFilters from "../common/TableFilters";
import Pagination from "../common/TablePagination";
import { ArrowDownward, ArrowUpward, Download } from "@mui/icons-material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ProductsReport() {
  const { darkMode } = useTheme();
  const { products, loading } = useProducts();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState("product_name");
  const [sortOrder, setSortOrder] = useState("asc");

  // 🔍 Filtrado + Ordenamiento
  const filteredData = useMemo(() => {
    if (!products) return [];
    let result = products.filter((r) => {
      const text = `${r.name} ${r.sku} ${r.category_name ?? ""}`.toLowerCase();
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
  }, [products, search, sortField, sortOrder]);

  // 🔢 Paginación
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const paginated = filteredData.slice(
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

  // 📤 Exportar Excel
  const handleExportExcel = () => {
    const exportData = filteredData.map((r) => ({
      Producto: r.name,
      SKU: r.sku,
      Categoría: r.category_name ?? "—",
      Costo: `$${r.cost ? parseFloat(r.cost).toFixed(2) : "0.00"}`,
      Estado: r.is_active ? "Activo" : "Inactivo",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productos");

    const fecha = new Date().toLocaleDateString("es-MX").replace(/\//g, "-");
    const nombreArchivo = `Listado_Productos_${fecha}.xlsx`;

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, nombreArchivo);
  };

  // 🎨 Estilos base
  const thStyle = `px-6 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none whitespace-nowrap 
    ${
      darkMode
        ? "bg-[#2a2a2a] text-gray-300 hover:bg-[#333]"
        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
    }`;

  const tdStyle = `px-6 py-3 text-sm whitespace-nowrap`;

  return (
    <div
      className={`rounded-xl border shadow-sm overflow-x-auto ${
        darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center p-4 border-b border-gray-600/30">
        <h3
          className={`font-semibold text-lg ${
            darkMode ? "text-gray-100" : "text-gray-800"
          }`}
        >
          Listado de productos
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

      {/* Filtros */}
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
        placeholder="Buscar producto o categoría..."
      />

      {/* Tabla */}
      <table className="w-full text-sm border-collapse min-w-[850px]">
        <thead>
          <tr>
            {[
              { key: "name", label: "Producto" },
              { key: "sku", label: "SKU" },
              { key: "category_name", label: "Categoría" },
              { key: "is_active", label: "Estado", align: "center" },
            ].map((col) => (
              <th
                key={col.key}
                className={`${thStyle} ${
                  col.align === "right"
                    ? "text-right pr-6"
                    : col.align === "center"
                    ? "text-center"
                    : "text-left"
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
          ) : paginated.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className={`text-center py-6 ${
                  darkMode ? "text-gray-500" : "text-gray-600"
                }`}
              >
                No hay productos registrados
              </td>
            </tr>
          ) : (
            paginated.map((p, idx) => (
              <tr
                key={idx}
                className={`transition ${
                  darkMode ? "hover:bg-[#2a2a2a]" : "hover:bg-gray-50"
                }`}
              >
                <td className={tdStyle}>{p.name}</td>
                <td className={tdStyle}>{p.sku}</td>
                <td className={tdStyle}>{p.category_name ?? "—"}</td>
                <td
                  className={`${tdStyle} text-center font-medium ${
                    p.is_active
                      ? darkMode
                        ? "text-green-400"
                        : "text-green-600"
                      : darkMode
                      ? "text-red-400"
                      : "text-red-600"
                  }`}
                >
                  {p.is_active ? "Activo" : "Inactivo"}
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
