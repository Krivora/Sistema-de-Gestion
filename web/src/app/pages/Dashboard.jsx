import { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  Inventory2,
  Store,
  WarningAmber,
} from "@mui/icons-material";
import { useTheme } from "@core/context/ThemeProvider";
import { useReports } from "@features/reports/hooks/useReports";
import { useProducts } from "@features/products/hooks/useProducts";
import { useBranches } from "@features/branches/hooks/useBranches";
import { useBranchProducts } from "@features/branchProducts/hooks/useBranchProducts";

import DashboardLayout from "@features/dashboard/components/DashboardLayout";
import DateRangeControls from "@features/dashboard/components/DateRangeControls";
import KpiCard from "@features/dashboard/components/KpiCard";
import ChartCard from "@features/dashboard/components/ChartCard";
import SalesChart from "@features/dashboard/components/SalesChart";
import TopProductsChart from "@features/dashboard/components/TopProductsChart";
import LowStockList from "@features/dashboard/components/LowStockList";
import { fmtMoney } from "@core/utils/formatters/formatters";

export default function Dashboard() {
  const { darkMode } = useTheme();
  const { data, loading, fetchSales, fetchTopProducts } = useReports();
  const { products } = useProducts();
  const { branches } = useBranches();
  const { items: branchProducts, loading: bpLoading } = useBranchProducts();

  const [range, setRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return { start: start.toISOString(), end: end.toISOString() };
  });

  const [mode, setMode] = useState("weekly"); // "daily" | "weekly"

  // 🔄 Cargar datos
  const refresh = () => {
    fetchSales({ startDate: range.start, endDate: range.end });
    fetchTopProducts(5);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.start, range.end]);

  // 📊 KPIs
  const totalSales = useMemo(
    () => (data.sales || []).reduce((sum, d) => sum + Number(d.total_sales || 0), 0),
    [data.sales]
  );

  const previousSales = useMemo(() => {
    // Calculamos el total de los primeros 15 días como referencia
    const midIndex = Math.floor((data.sales?.length || 0) / 2);
    return (data.sales || [])
      .slice(0, midIndex)
      .reduce((sum, d) => sum + Number(d.total_sales || 0), 0);
  }, [data.sales]);

  const trendSales = useMemo(() => {
    if (!previousSales) return 0;
    const diff = ((totalSales - previousSales) / previousSales) * 100;
    return Number.isFinite(diff) ? diff.toFixed(1) : 0;
  }, [totalSales, previousSales]);

  const lowStock = useMemo(
    () => (branchProducts || []).filter((p) => Number(p.stock) <= 3),
    [branchProducts]
  );

  return (
    <DashboardLayout
      title="Dashboard general"
      right={
        <div className="flex items-center gap-3">
          <select
            className={`text-sm rounded-lg border px-2 py-1 ${
              darkMode
                ? "bg-[#1a1a1a] border-gray-700 text-gray-200"
                : "bg-white border-gray-300 text-gray-700"
            }`}
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
          </select>
          <DateRangeControls
            start={range.start}
            end={range.end}
            onChange={setRange}
            onRefresh={refresh}
          />
        </div>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={<ShoppingCart fontSize="large" />}
          label="Ventas del periodo"
          value={fmtMoney(totalSales)}
          trend={Number(trendSales)}
          accent="blue"
        />
        <KpiCard
          icon={<Inventory2 fontSize="large" />}
          label="Productos registrados"
          value={products?.length || 0}
          accent="green"
        />
        <KpiCard
          icon={<Store fontSize="large" />}
          label="Sucursales activas"
          value={branches?.length || 0}
          accent="orange"
        />
        <KpiCard
          icon={<WarningAmber fontSize="large" />}
          label="Bajo stock"
          value={lowStock.length}
          accent="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartCard title={`Ventas ${mode === "weekly" ? "semanales" : "diarias"}`} loading={loading}>
            <SalesChart data={data.sales || []} mode={mode} />
          </ChartCard>
        </div>
        <div>
          <ChartCard title="Top productos por ventas" loading={loading}>
            <TopProductsChart data={data.topProducts || []} />
          </ChartCard>
        </div>
      </div>

    </DashboardLayout>
  );
}

/* // 🔹 Utilidad para sumar stock por sucursal
function resumeByBranch(items = []) {
  const map = new Map();
  items.forEach((i) => {
    const key = i.branch_name || "—";
    map.set(key, (map.get(key) || 0) + Number(i.stock || 0));
  });
  return Array.from(map, ([branch_name, stock]) => ({ branch_name, stock }));
}

// (Si aún no tienes InventoryByBranch, solo comenta el bloque que lo usa)
function InventoryByBranch({ data = [] }) {
  const { darkMode } = useTheme();
  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {data.map((b, i) => (
        <li
          key={i}
          className={`flex justify-between py-2 text-sm ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <span>{b.branch_name}</span>
          <span className="font-semibold">{b.stock}</span>
        </li>
      ))}
    </ul>
  );
} */
