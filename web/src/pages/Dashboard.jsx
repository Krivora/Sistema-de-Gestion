// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Inventory2, Store, WarningAmber } from "@mui/icons-material";
import { useTheme } from "../providers/ThemeProvider";
import { useReports } from "../hooks/useReports";
import { useProducts } from "../hooks/useProducts";
import { useBranches } from "../hooks/useBranches";
import { useBranchProducts } from "../hooks/useBranchProducts";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import DateRangeControls from "../components/dashboard/DateRangeControls";
import KpiCard from "../components/dashboard/KpiCard";
import ChartCard from "../components/dashboard/ChartCard";
import SalesChart from "../components/dashboard/SalesChart";
import TopProductsChart from "../components/dashboard/TopProductsChart";
import LowStockList from "../components/dashboard/LowStockList";
// import InventoryByBranch from "../components/dashboard/InventoryByBranch"; // opcional
import { fmtMoney } from "../utils/formatters";

export default function Dashboard() {
  const { darkMode } = useTheme();
  const { data, fetchSales, fetchTopProducts } = useReports();
  const { products } = useProducts();
  const { branches } = useBranches();
  const { items: branchProducts, loading: bpLoading } = useBranchProducts();

  const [range, setRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return { start: start.toISOString(), end: end.toISOString() };
  });

  // cargar datos
  const refresh = () => {
    fetchSales({ startDate: range.start, endDate: range.end });
    fetchTopProducts(5);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // KPIs
  const totalSales = useMemo(
    () => (data.sales || []).reduce((sum, d) => sum + Number(d.total_sales || 0), 0),
    [data.sales]
  );

  console.log(data.sales);
  const lowStock = useMemo(() => (branchProducts || []).filter((p) => Number(p.stock) <= 3), [branchProducts]);

  return (
    <DashboardLayout
      title="Dashboard general"
      right={
        <DateRangeControls
          start={range.start}
          end={range.end}
          onChange={setRange}
          onRefresh={refresh}
        />
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard icon={<ShoppingCart fontSize="large" />} label="Ventas del periodo" value={fmtMoney(totalSales)} accent="blue" />
        <KpiCard icon={<Inventory2 fontSize="large" />} label="Productos registrados" value={products?.length || 0} accent="green" />
        <KpiCard icon={<Store fontSize="large" />} label="Sucursales activas" value={branches?.length || 0} accent="orange" />
        <KpiCard icon={<WarningAmber fontSize="large" />} label="Bajo stock" value={lowStock.length} accent="red" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <ChartCard title="Ventas diarias">
            <SalesChart data={data.sales || []} />
          </ChartCard>
        </div>
        <div className="xl:col-span-1">
          <ChartCard title="Top productos por ventas">
            <TopProductsChart data={data.topProducts || []} />
          </ChartCard>
        </div>
      </div>

      {/* Listas / alertas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Productos con bajo stock">
          <LowStockList items={lowStock} loading={bpLoading} />
        </ChartCard>

        {/* (Opcional) inventario por sucursal si tu API/Hook lo permite resumido */}
        {/* <ChartCard title="Inventario total por sucursal">
          <InventoryByBranch data={resumeByBranch(branchProducts)} />
        </ChartCard> */}
      </div>
    </DashboardLayout>
  );
}

// (opcional) util para agregados por sucursal
function resumeByBranch(items = []) {
  const map = new Map();
  items.forEach((i) => {
    const key = i.branch_name || "—";
    map.set(key, (map.get(key) || 0) + Number(i.stock || 0));
  });
  return Array.from(map, ([branch_name, stock]) => ({ branch_name, stock }));
}
