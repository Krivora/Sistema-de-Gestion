// src/components/dashboard/SalesChart.jsx
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useTheme } from "../../providers/ThemeProvider";
import { fmtMoney } from "../../utils/formatters";

export default function SalesChart({ data = [] }) {
  const { darkMode } = useTheme();

  // 🔹 Normalizamos los datos crudos del backend
  const normalizedData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
    }),

    
    total_sales: Number(d.total_sales || 0),
    sales_count: Number(d.sales_count || 0),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={normalizedData}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={darkMode ? "#333" : "#e5e7eb"}
        />
        <XAxis
          dataKey="date"
          stroke={darkMode ? "#aaa" : "#555"}
          fontSize={12}
        />
        <YAxis
          stroke={darkMode ? "#aaa" : "#555"}
          fontSize={12}
          tickFormatter={(v) => fmtMoney(v)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: darkMode ? "#1a1a1a" : "#fff",
            borderColor: darkMode ? "#333" : "#ddd",
          }}
          formatter={(v) => [fmtMoney(v), "Ventas"]}
          labelStyle={{ color: darkMode ? "#e5e7eb" : "#111827" }}
        />
        <Line
          type="monotone"
          dataKey="total_sales"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
