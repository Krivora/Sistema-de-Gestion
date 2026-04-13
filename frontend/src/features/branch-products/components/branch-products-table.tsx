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

export function BranchProductsTable({
  products, loading, hasActiveFilters, onEdit, onConfirm,
}: BranchProductsTableProps) {
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
  )
}