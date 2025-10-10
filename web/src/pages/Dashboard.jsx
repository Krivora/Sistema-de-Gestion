import InventoryIcon from "@mui/icons-material/Inventory2";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StoreIcon from "@mui/icons-material/Store";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export default function Dashboard() {
  const cards = [
    { title: "Productos", value: 120, icon: <InventoryIcon className="text-indigo-500" /> },
    { title: "Ventas Hoy", value: 45, icon: <ShoppingCartIcon className="text-green-500" /> },
    { title: "Sucursales", value: 5, icon: <StoreIcon className="text-orange-500" /> },
    { title: "Stock Bajo", value: 8, icon: <WarningAmberIcon className="text-red-500" /> },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800">
              {c.icon}
            </div>
            <div>
              <p className="text-sm opacity-70">{c.title}</p>
              <p className="text-xl font-bold">{c.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
