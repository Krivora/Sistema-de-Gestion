import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { useTheme } from "@core/context/ThemeProvider";
import { fmtMoney } from "@core/utils/formatters/formatters";

export default function TopProductsChart({ data = [] }) {
  const { darkMode } = useTheme();
  const parsedData = data.map(item => ({
    ...item,
    total_sales: Number(item.total_sales),
    total_qty: Number(item.total_qty),
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={parsedData} layout="vertical" margin={{ left: -40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#333" : "#e5e7eb"} />
          <XAxis type="number" stroke={darkMode ? "#aaa" : "#555"} fontSize={12} tickFormatter={fmtMoney} />
          <YAxis type="category" dataKey="product_name" stroke={darkMode ? "#aaa" : "#555"} fontSize={12} width={150} />
          <Tooltip
            contentStyle={{ backgroundColor: darkMode ? "#1a1a1a" : "#fff", borderColor: darkMode ? "#333" : "#ddd" }}
            formatter={(v) => [fmtMoney(v), "Ventas"]}
            labelStyle={{ color: darkMode ? "#e5e7eb" : "#111827" }}
          />
          <defs>
            <linearGradient id="colorTop" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <Bar dataKey="total_sales" fill="url(#colorTop)" radius={[0, 6, 6, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
