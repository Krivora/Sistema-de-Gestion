// src/components/dashboard/InventoryByBranch.jsx
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { useTheme } from "../../providers/ThemeProvider";

export default function InventoryByBranch({ data = [] }) {
  const { darkMode } = useTheme();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#333" : "#e5e7eb"} />
        <XAxis dataKey="branch_name" stroke={darkMode ? "#aaa" : "#555"} fontSize={12} />
        <YAxis stroke={darkMode ? "#aaa" : "#555"} fontSize={12} />
        <Tooltip contentStyle={{ backgroundColor: darkMode ? "#1a1a1a" : "#fff", borderColor: darkMode ? "#333" : "#ddd" }} />
        <Bar dataKey="stock" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
