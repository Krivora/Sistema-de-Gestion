// src/components/dashboard/LowStockList.jsx
import { useTheme } from "../../providers/ThemeProvider";

export default function LowStockList({ items = [], loading }) {
  const { darkMode } = useTheme();
  if (loading) return <p className={darkMode ? "text-gray-400" : "text-gray-600"}>Cargando...</p>;
  if (!items.length) return <p className={darkMode ? "text-gray-400" : "text-gray-600"}>Sin alertas de stock bajo.</p>;

  return (
    <ul className="divide-y">
      {items.slice(0, 8).map((p, i) => (
        <li key={i} className={`flex justify-between py-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
          <span className="truncate w-2/3">{p.product_name}</span>
          <span className="text-red-500 font-medium">{p.stock}</span>
        </li>
      ))}
    </ul>
  );
}
