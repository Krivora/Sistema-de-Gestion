import Dashboard from "@app/pages/Dashboard";
import Login from "@app/pages/Login";
import Unauthorized from "@app/pages/error/Unauthorized";

import ProtectedRoute from "@core/components/protected/ProtectedRoute";

// Módulos
import Branches from "@features/branches/pages/Branches";
import BranchProducts from "@features/branchProducts/pages/BranchProducts";
import Categories from "@features/categories/pages/Categories";
import Products from "@features/products/pages/Products";
import Purchases from "@features/purchases/pages/Purchases";
import Sales from "@features/sales/pages/Sales";
import Adjustments from "@features/adjustments/pages/Adjustment";
import Transfers from "@features/transfers/pages/Transfers";
import InventoryTransactions from "@features/inventory/pages/InventoryTransactions";
import Reports from "@features/reports/pages/Reports";
import Users from "@features/users/pages/Users";

// Admin / settings
import Clients from "@features/admin/clients/pages/Clients";
import Config from "@features/settings/pages/index";
import AuditSettings from "@features/settings/pages/audit/audits";
import CatalogsSettings from "@features/settings/pages/catalogs/index";
import AdjustmentNotesCatalog from "@features/settings/pages/catalogs/adjustment-notes/AdjustmentNotesCatalog";
import TransfersNotesCatalog from "@features/settings/pages/catalogs/transfer-reasons/TransfersNoteCatalog";
import RolesSettings from "@features/settings/pages/roles/roles";
import SystemSettings from "@features/settings/pages/system/system";

export const routesConfig = [
  { path: "/login", element: <Login /> },
  { path: "/unauthorized", element: <Unauthorized /> },

  // Dashboard (no requiere permiso)
  { index: true, element: <Dashboard /> },

  // Módulos
  { path: "branches",              element: <Branches />,              permission: "branches.read" },
  { path: "branches-products",     element: <BranchProducts />,        permission: "branch_products.read" },
  { path: "categories",            element: <Categories />,            permission: "categories.read" },
  { path: "products",              element: <Products />,              permission: "products.read" },
  { path: "purchases",             element: <Purchases />,             permission: "purchases.read" },
  { path: "sales",                 element: <Sales />,                 permission: "sales.read" },
  { path: "adjustments",           element: <Adjustments />,           permission: "adjustments.read" },
  { path: "transfers",             element: <Transfers />,             permission: "transfers.read" },
  { path: "inventory-transactions",element: <InventoryTransactions />, permission: "inventory.read" },
  { path: "reports",               element: <Reports />,               permission: "reports.read" },
  { path: "users",                 element: <Users />,                 permission: "users.read" },
  { path: "clients",               element: <Clients />,               permission: "clients.read" },

  // Settings / admin
  { path: "config",                                       element: <Config />,                  permission: "settings.read" },
  { path: "settings/audit",                               element: <AuditSettings />,           permission: "audit.read" },
  { path: "settings/catalogs",                            element: <CatalogsSettings />,        permission: "catalogs.read" },
  { path: "settings/catalogs/adjustment-notes",           element: <AdjustmentNotesCatalog />,  permission: "catalogs.read" },
  { path: "settings/catalogs/transfer-reasons",           element: <TransfersNotesCatalog />,   permission: "catalogs.read" },
  { path: "settings/roles",                               element: <RolesSettings />,           permission: "roles.read" },
  { path: "settings/system",                              element: <SystemSettings />,          permission: "settings.read" },
];
