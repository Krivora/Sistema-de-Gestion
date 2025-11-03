import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useTheme } from "@core/context/ThemeProvider";
import { fmtMoney } from "@core/utils/formatters/formatters";

export default function SalesChart({ data = [], mode = "daily" }) {
  const { darkMode } = useTheme();
  const normalizedData = data.map((d) => {
    const dateObj = new Date(d.date);
    const label =
      mode === "weekly"
        ? `Sem ${Math.ceil(dateObj.getDate() / 7)}`
        : dateObj.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
    return {
      label,
      total_sales: Number(d.total_sales || 0),
      sales_count: Number(d.sales_count || 0),
    };
  });

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={normalizedData}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#333" : "#e5e7eb"} />
          <XAxis dataKey="label" stroke={darkMode ? "#aaa" : "#555"} fontSize={12} />
          <YAxis
            stroke={darkMode ? "#aaa" : "#555"}
            fontSize={12}
            tickFormatter={fmtMoney}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? "#1a1a1a" : "#fff",
              borderColor: darkMode ? "#333" : "#ddd",
            }}
            formatter={(v) => [fmtMoney(v), "Ventas"]}
            labelFormatter={(l) =>
              mode === "weekly" ? `Semana ${l}` : l
            }
            labelStyle={{ color: darkMode ? "#e5e7eb" : "#111827" }}
          />
          <Line
            type="monotone"
            dataKey="total_sales"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ r: 5, fill: "#3b82f6" }} // 👈 visible si solo hay un dato
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
