import { useState } from "react";
import { Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { Download, Warehouse, Package, Tag, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { useReports } from "../hooks/useReports";
import { useTheme } from "../providers/ThemeProvider";
import InventoryReport from "../components/reports/InventoryReport";
import ProductsReport from "../components/reports/ProductsReport";

export default function ReportsPage() {
  const { darkMode } = useTheme();
  const { fetchStock } = useReports();
  const [type, setType] = useState("inventory");
  const [loading, setLoading] = useState(false);

  const bg = darkMode ? "bg-[#121212]" : "bg-gray-50";
  const text = darkMode ? "text-gray-200" : "text-gray-800";

  const reports = [
    { id: "inventory", label: "Inventario general", icon: <Warehouse size={18} /> },
    { id: "products", label: "Listado de productos", icon: <Package size={18} /> },
  ];

  return (
    <div className={`min-h-screen p-6 transition-colors ${bg} ${text}`}>
      <h2 className="text-2xl font-bold mb-4">Reportes detallados</h2>
      <p className="mb-6 text-sm text-gray-500">
        Genera reportes filtrables y exporta la información a Excel.
      </p>

      {/* Selector de tipo de reporte */}
      <div
        className={`flex flex-wrap items-center gap-3 p-4 rounded-xl border shadow-sm mb-6 ${
          darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
        }`}
      >
        <FormControl
          size="small"
          sx={{
            minWidth: 250,
            "& .MuiInputLabel-root": { color: darkMode ? "#bbb" : "#555" },
            "& .MuiOutlinedInput-root": {
              color: darkMode ? "#ddd" : "#222",
              "& fieldset": {
                borderColor: darkMode ? "#555" : "#ccc",
              },
            },
          }}
        >
          <InputLabel>Tipo de reporte</InputLabel>
          <Select
            value={type}
            label="Tipo de reporte"
            onChange={(e) => setType(e.target.value)}
          >
            {reports.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                <div className="flex items-center gap-2">
                  {r.icon}
                  {r.label}
                </div>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Contenido dinámico del reporte */}
      <motion.div
        key={type}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {type === "inventory" && <InventoryReport />}
        {type === "products" && <ProductsReport />}
      </motion.div>
    </div>
  );
}
