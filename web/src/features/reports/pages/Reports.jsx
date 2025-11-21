import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@core/context/ThemeProvider";
import InventoryReport from "../components/InventoryReport";

export default function ReportsPage() {
  const { darkMode } = useTheme();

  const bg = darkMode ? "bg-[#121212]" : "bg-gray-50";
  const text = darkMode ? "text-gray-200" : "text-gray-800";

  return (
    <div className={`min-h-screen p-6 transition-colors ${bg} ${text}`}>
      <h2 className="text-2xl font-bold mb-4">Reporte de Inventario</h2>
      <p className="mb-6 text-sm text-gray-500">
        Filtra la información y exporta el inventario a Excel.
      </p>

      {/* Vista principal del reporte */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <InventoryReport />
      </motion.div>
    </div>
  );
}
