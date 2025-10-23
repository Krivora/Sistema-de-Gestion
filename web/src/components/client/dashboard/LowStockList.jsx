// src/components/dashboard/LowStockList.jsx
import { useTheme } from "@/context/ThemeProvider";

export default function LowStockList({ items = [], loading }) {
  const { darkMode } = useTheme();
  if (loading)
    return <p className={darkMode ? "text-gray-400" : "text-gray-600"}>Cargando...</p>;
  if (!items.length)
    return <p className={darkMode ? "text-gray-400" : "text-gray-600"}>Sin alertas de stock bajo.</p>;

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {items.slice(0, 8).map((p, i) => (
        <li
          key={i}
          className={`flex justify-between py-2 text-sm items-center ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <div className="truncate w-2/3">
            <span className="font-medium">{p.product_name}</span>
            {p.branch_name && (
              <span className="ml-2 text-xs text-gray-400">({p.branch_name})</span>
            )}
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              p.stock <= 1
                ? "bg-red-500/20 text-red-500"
                : "bg-amber-500/20 text-amber-600"
            }`}
          >
            {p.stock}
          </span>
        </li>
      ))}
    </ul>
  );
}
