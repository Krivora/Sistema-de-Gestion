import { Tooltip, IconButton } from "@mui/material";

export default function CommonTable({
  columns = [],
  rows = [],
  renderActions = null,
  dense = false,
  darkMode = false,
}) {
  return (
    <div className="overflow-x-auto">
      <table
        className={`w-full text-sm overflow-hidden ${
          darkMode ? "border-gray-700 bg-[#161616]" : "border-gray-200 bg-white"
        }`}
      >
        {/* 🔹 Encabezado */}
        <thead
          className={`text-xs font-semibold uppercase tracking-wide ${
            darkMode
              ? "bg-gradient-to-r from-[#1f1f1f] to-[#2a2a2a] text-gray-300 border-b border-gray-700"
              : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border-b border-gray-200"
          }`}
        >
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`px-6 py-3 text-left`}>
                {col.label}
              </th>
            ))}
            {renderActions && (
              <th className="px-6 py-3 text-right">Acciones</th>
            )}
          </tr>
        </thead>

        {/* 🔸 Filas */}
        <tbody
          className={`divide-y ${
            darkMode ? "divide-gray-800 bg-[#1c1c1c]" : "divide-gray-100 bg-white"
          }`}
        >
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (renderActions ? 1 : 0)}
                className="text-center py-6 text-gray-400"
              >
                Sin registros
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={row.id || i}
                className={`transition-colors duration-200 ${
                  darkMode
                    ? "hover:bg-[#242424]"
                    : i % 2 === 0
                    ? "hover:bg-gray-50"
                    : "hover:bg-gray-100"
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-6 ${
                      dense ? "py-1" : "py-3"
                    } ${darkMode ? "text-gray-100" : "text-gray-800"}`}
                  >
                    {typeof col.render === "function"
                      ? col.render(row[col.key], row)
                      : row[col.key] ?? "—"}
                  </td>
                ))}

                {renderActions && (
                  <td className={`px-6 ${dense ? "py-1" : "py-3"} text-right`}>
                    {renderActions(row)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
