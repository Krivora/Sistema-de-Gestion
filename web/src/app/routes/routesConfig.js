// src/app/routes/routesConfig.js
export const routesConfig = [
  {
    path: "/",
    label: "Dashboard",
    icon: "Dashboard", // puedes mapear luego a un icono MUI
    element: "Dashboard", // opcional, si quieres mapear dinámicamente
    roles: ["user", "admin", "superadmin"],
  },
  {
    path: "/branches",
    label: "Sucursales",
    icon: "AccountTree",
    roles: ["admin", "superadmin"],
  },
  {
    path: "/products",
    label: "Productos",
    icon: "Inventory2",
    roles: ["admin", "superadmin"],
  },
  {
    path: "/sales",
    label: "Ventas",
    icon: "ShoppingCart",
    roles: ["admin", "superadmin"],
  },
  {
    path: "/purchases",
    label: "Compras",
    icon: "ReceiptLong",
    roles: ["admin", "superadmin"],
  },
  {
    path: "/reports",
    label: "Reportes",
    icon: "Assessment",
    roles: ["admin", "superadmin"],
  },
  {
    path: "/users",
    label: "Usuarios",
    icon: "Group",
    roles: ["admin", "superadmin"],
  },
  {
    path: "/clients",
    label: "Clientes",
    icon: "SupervisorAccount",
    roles: ["superadmin"],
  },
  {
    path: "/settings/catalogs",
    label: "Catálogos",
    icon: "Settings",
    roles: ["admin", "superadmin"],
  },
];
