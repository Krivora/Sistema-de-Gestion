import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertTriangle, MoreHorizontal, Package } from "lucide-react"
import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { toNumber } from "@/lib/utils"
import type { BranchProduct } from "@/lib/api/branch-products"
import type { ConfirmType } from "../hooks/use-branch-products"

/* ────────────────────────────────────────────────
   Utilidades
──────────────────────────────── */
function formatCurrency(value: number, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(value)
}

/* ────────────────────────────────────────────────
   Tipos
──────────────────────────────── */
interface BranchProductsTableProps {
  products: BranchProduct[]
  loading: boolean
  hasActiveFilters: boolean
  onEdit: (p: BranchProduct) => void
  onConfirm: (type: ConfirmType, p: BranchProduct) => void
}

/* ────────────────────────────────────────────────
   Card móvil
──────────────────────────────── */
function BranchProductCard({
  item,
  onEdit,
  onConfirm,
}: {
  item: BranchProduct
  onEdit: (p: BranchProduct) => void
  onConfirm: (t: ConfirmType, p: BranchProduct) => void
}) {
  const profit = toNumber(item.price) - toNumber(item.cost)
  // Postgres entrega los numeric como texto: sin toNumber esto compara cadenas
  // y "17.0000" <= "5.0000" resulta verdadero.
  const isLowStock =
    item.is_active && toNumber(item.current_stock) <= toNumber(item.min_stock)

  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Package size={15} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">
              {item.product_name}
            </p>
            <p className="text-xs font-mono text-muted-foreground">
              {item.sku}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {item.branch_name}
            </p>
          </div>
        </div>

        <Badge variant={item.is_active ? "default" : "secondary"}>
          {item.is_active ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      {/* Precios */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Costo</p>
          <p className="font-medium">
            {formatCurrency(item.cost, item.currency)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Precio</p>
          <p className="font-medium">
            {formatCurrency(item.price, item.currency)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Utilidad</p>
          <p
            className={`font-semibold ${
              profit > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-500"
            }`}
          >
            {formatCurrency(profit, item.currency)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t">
        <span
          className={`flex items-center gap-1 text-xs font-semibold ${
            isLowStock
              ? "text-amber-600 dark:text-amber-400"
              : "text-muted-foreground"
          }`}
        >
          {isLowStock && <AlertTriangle size={12} />}
          Stock: {Math.floor(item.current_stock)} /{" "}
          {Math.floor(item.min_stock)} mín.
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={
              buttonVariants({ variant: "ghost", size: "icon" }) +
              " h-8 w-8"
            }
          >
            <MoreHorizontal size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(item)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onConfirm("toggle", item)}
            >
              {item.is_active ? "Desactivar" : "Activar"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onConfirm("delete", item)}
              variant="destructive"
            >
              Eliminar asignación
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────
   Skeleton móvil
──────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-card border rounded-xl p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-muted shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="h-8 bg-muted rounded" />
        <div className="h-8 bg-muted rounded" />
        <div className="h-8 bg-muted rounded" />
      </div>
      <div className="flex justify-between pt-2 border-t">
        <div className="h-3 bg-muted rounded w-24" />
        <div className="h-8 w-8 bg-muted rounded" />
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────
   Columnas de la tabla
──────────────────────────────── */
const columns = (
  onEdit: (p: BranchProduct) => void,
  onConfirm: (type: ConfirmType, p: BranchProduct) => void
): ColumnDef<BranchProduct>[] => [
  {
    key: "product",
    header: "Producto",
    width: "28%",
    cell: (i) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Package size={14} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate">{i.product_name}</p>
          <p className="text-xs text-muted-foreground font-mono">
            {i.sku}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "branch",
    header: "Sucursal",
    width: "18%",
    cell: (i) => (
      <span className="text-muted-foreground truncate block">
        {i.branch_name}
      </span>
    ),
  },
  {
    key: "cost",
    header: "Costo",
    width: 110,
    cell: (i) => (
      <span className="text-muted-foreground">
        {formatCurrency(i.cost, i.currency)}
      </span>
    ),
  },
  {
    key: "price",
    header: "Precio",
    width: 110,
    cell: (i) => (
      <span className="font-medium">
        {formatCurrency(i.price, i.currency)}
      </span>
    ),
  },
  {
    key: "profit",
    header: "Utilidad",
    width: 110,
    cell: (i) => {
      const profit = toNumber(i.price) - toNumber(i.cost)
      return (
        <span
          className={`font-medium ${
            profit > 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-500"
          }`}
        >
          {formatCurrency(profit, i.currency)}
        </span>
      )
    },
  },
  {
    key: "stock",
    header: "Stock",
    width: 90,
    cell: (i) => {
      const isLow =
        i.is_active && toNumber(i.current_stock) <= toNumber(i.min_stock)
      return (
        <span
          className={`flex items-center gap-1.5 font-semibold ${
            isLow
              ? "text-amber-600 dark:text-amber-400"
              : "text-muted-foreground"
          }`}
        >
          {isLow && <AlertTriangle size={13} />}
          {Math.floor(i.current_stock)}
        </span>
      )
    },
  },
  {
    key: "min_stock",
    header: "Mín.",
    width: 70,
    cell: (i) => (
      <span className="text-muted-foreground">
        {Math.floor(i.min_stock)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Estado",
    width: 90,
    cell: (i) => (
      <Badge variant={i.is_active ? "default" : "secondary"}>
        {i.is_active ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
  {
    key: "actions",
    header: "",
    width: 48,
    cell: (i) => (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={
            buttonVariants({ variant: "ghost", size: "icon" }) +
            " h-8 w-8"
          }
        >
          <MoreHorizontal size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(i)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onConfirm("toggle", i)}
          >
            {i.is_active ? "Desactivar" : "Activar"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onConfirm("delete", i)}
            variant="destructive"
          >
            Eliminar asignación
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

/* ────────────────────────────────────────────────
   Componente principal
──────────────────────────────── */
export function BranchProductsTable({
  products,
  loading,
  hasActiveFilters,
  onEdit,
  onConfirm,
}: BranchProductsTableProps) {
  return (
    <>
      {/* Vista móvil */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <Package
              size={32}
              className="text-muted-foreground/40"
            />
            <p className="text-sm">
              {hasActiveFilters
                ? "Sin resultados para los filtros aplicados"
                : "No hay productos asignados a sucursales"}
            </p>
          </div>
        ) : (
          products.map((p) => (
            <BranchProductCard
              key={p.id}
              item={p}
              onEdit={onEdit}
              onConfirm={onConfirm}
            />
          ))
        )}
      </div>

      {/* Vista escritorio */}
      <div className="hidden sm:block">
        <DataTable
          columns={columns(onEdit, onConfirm)}
          data={products}
          loading={loading}
          rowKey={(i) => i.id}
          emptyIcon={
            <Package
              size={32}
              className="text-muted-foreground/40"
            />
          }
          emptyText="No hay productos asignados a sucursales"
          emptyFilterText="Sin resultados para los filtros aplicados"
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </>
  )
}