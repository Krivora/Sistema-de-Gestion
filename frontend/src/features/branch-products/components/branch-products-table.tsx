import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertTriangle, MoreHorizontal, Package } from "lucide-react"
import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import type { BranchProduct } from "@/lib/api/branch-products"
import type { ConfirmType } from "../hooks/use-branch-products"

function formatCurrency(value: number, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(value)
}

interface BranchProductsTableProps {
  products: BranchProduct[]
  loading: boolean
  hasActiveFilters: boolean
  onEdit: (p: BranchProduct) => void
  onConfirm: (type: ConfirmType, p: BranchProduct) => void
}

function BranchProductCard({ item, onEdit, onConfirm }: {
  item: BranchProduct
  onEdit: (p: BranchProduct) => void
  onConfirm: (t: ConfirmType, p: BranchProduct) => void
}) {
  const profit = item.price - item.cost
  const isLow = item.is_active && item.current_stock <= item.min_stock

  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      {/* top */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Package size={15} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate text-sm">{item.product_name}</p>
            <p className="text-xs font-mono text-muted-foreground">{item.sku}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8 shrink-0"}>
            <MoreHorizontal size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(item)}>Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onConfirm("toggle", item)}>
              {item.is_active ? "Desactivar" : "Activar"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onConfirm("delete", item)} variant="destructive">
              Eliminar asignación
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* sucursal */}
      <p className="text-xs text-muted-foreground">{item.branch_name}</p>

      {/* precios */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground mb-0.5">Costo</p>
          <p className="font-medium">{formatCurrency(item.cost, item.currency)}</p>
        </div>
        <div>
          <p className="text-muted-foreground mb-0.5">Precio</p>
          <p className="font-medium">{formatCurrency(item.price, item.currency)}</p>
        </div>
        <div>
          <p className="text-muted-foreground mb-0.5">Utilidad</p>
          <p className={`font-semibold ${profit > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
            {formatCurrency(profit, item.currency)}
          </p>
        </div>
      </div>

      {/* footer */}
      <div className="flex items-center justify-between pt-1 border-t">
        <Badge variant={item.is_active ? "default" : "secondary"}>
          {item.is_active ? "Activo" : "Inactivo"}
        </Badge>
        <span className={`flex items-center gap-1 text-xs font-semibold ${isLow ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
          {isLow && <AlertTriangle size={12} />}
          Stock: {Math.floor(item.current_stock)} / {Math.floor(item.min_stock)} mín.
        </span>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-card border rounded-xl p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-muted shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-muted rounded w-1/2" />
      <div className="grid grid-cols-3 gap-2">
        <div className="h-8 bg-muted rounded" />
        <div className="h-8 bg-muted rounded" />
        <div className="h-8 bg-muted rounded" />
      </div>
      <div className="flex justify-between pt-1 border-t">
        <div className="h-5 bg-muted rounded w-16" />
        <div className="h-3 bg-muted rounded w-24" />
      </div>
    </div>
  )
}

export function BranchProductsTable({ products, loading, hasActiveFilters, onEdit, onConfirm }: BranchProductsTableProps) {
  const columns: ColumnDef<BranchProduct>[] = [
    {
      key: "product", header: "Producto", width: "28%",
      cell: (i) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <Package size={14} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{i.product_name}</p>
            <p className="text-xs text-muted-foreground font-mono">{i.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: "branch", header: "Sucursal", width: "18%",
      cell: (i) => <span className="text-muted-foreground truncate block">{i.branch_name}</span>,
    },
    {
      key: "cost", header: "Costo", width: 110,
      cell: (i) => <span className="text-muted-foreground">{formatCurrency(i.cost, i.currency)}</span>,
    },
    {
      key: "price", header: "Precio", width: 110,
      cell: (i) => <span className="font-medium">{formatCurrency(i.price, i.currency)}</span>,
    },
    {
      key: "profit", header: "Utilidad", width: 110,
      cell: (i) => (
        <span className={i.price - i.cost > 0 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-red-500 font-medium"}>
          {formatCurrency(i.price - i.cost, i.currency)}
        </span>
      ),
    },
    {
      key: "stock", header: "Stock", width: 90,
      cell: (i) => {
        const isLow = i.is_active && i.current_stock <= i.min_stock
        return (
          <span className={`flex items-center gap-1.5 font-semibold ${isLow ? "text-amber-600 dark:text-amber-400" : ""}`}>
            {isLow && <AlertTriangle size={13} />}
            {Math.floor(i.current_stock)}
          </span>
        )
      },
    },
    {
      key: "min_stock", header: "Mín.", width: 70,
      cell: (i) => <span className="text-muted-foreground">{Math.floor(i.min_stock)}</span>,
    },
    {
      key: "status", header: "Estado", width: 90,
      cell: (i) => (
        <Badge variant={i.is_active ? "default" : "secondary"}>
          {i.is_active ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "actions", header: "", width: 48,
      cell: (i) => (
        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}>
            <MoreHorizontal size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(i)}>Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onConfirm("toggle", i)}>
              {i.is_active ? "Desactivar" : "Activar"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onConfirm("delete", i)} variant="destructive">
              Eliminar asignación
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      {/* mobile */}
      <div className="sm:hidden space-y-3">
        {loading
          ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          : products.length === 0
            ? (
              <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                <Package size={32} className="text-muted-foreground/40" />
                <p className="text-sm">
                  {hasActiveFilters ? "Sin resultados para los filtros aplicados" : "No hay productos asignados a sucursales"}
                </p>
              </div>
            )
            : products.map((p) => (
              <BranchProductCard key={p.id} item={p} onEdit={onEdit} onConfirm={onConfirm} />
            ))
        }
      </div>

      {/* desktop */}
      <div className="hidden sm:block">
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          rowKey={(i) => i.id}
          emptyIcon={<Package size={32} className="text-muted-foreground/40" />}
          emptyText="No hay productos asignados a sucursales"
          emptyFilterText="Sin resultados para los filtros aplicados"
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </>
  )
}