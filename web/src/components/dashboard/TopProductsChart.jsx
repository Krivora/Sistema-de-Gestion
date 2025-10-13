// src/components/dashboard/TopProductsChart.jsx
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { useTheme } from "../../providers/ThemeProvider";
import { fmtMoney } from "../../utils/formatters";

export default function TopProductsChart({ data = [] }) {
  const { darkMode } = useTheme();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#333" : "#e5e7eb"} />
        <XAxis dataKey="product_name" stroke={darkMode ? "#aaa" : "#555"} fontSize={12} interval={0} angle={-20} textAnchor="end" />
        <YAxis stroke={darkMode ? "#aaa" : "#555"} fontSize={12} tickFormatter={(v) => fmtMoney(v)} />
        <Tooltip
          contentStyle={{ backgroundColor: darkMode ? "#1a1a1a" : "#fff", borderColor: darkMode ? "#333" : "#ddd" }}
          formatter={(v) => [fmtMoney(v), "Ventas"]}
          labelStyle={{ color: darkMode ? "#e5e7eb" : "#111827" }}
        />
        <Bar dataKey="total_sales" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
