import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Package, MoreHorizontal } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Product } from "@/lib/api/products"
import type { ConfirmType } from "@/features/products/hooks/use-products"

const STATUS_LABEL: Record<Product["status"], string> = {
  active: "Activo", inactive: "Inactivo", deleted: "Eliminado",
}
const STATUS_VARIANT: Record<Product["status"], "default" | "secondary" | "destructive"> = {
  active: "default", inactive: "secondary", deleted: "destructive",
}

interface ProductsTableProps {
  products: Product[]
  loading: boolean
  hasActiveFilters: boolean
  onEdit: (p: Product) => void
  onActivate: (p: Product) => void
  onConfirm: (type: ConfirmType, p: Product) => void
}

const columns = (
  onEdit: (p: Product) => void,
  onActivate: (p: Product) => void,
  onConfirm: (type: ConfirmType, p: Product) => void,
): ColumnDef<Product>[] => [
  {
    key: "name", header: "Producto", width: "30%",
    cell: (p) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Package size={14} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate">{p.name}</p>
          {p.description && <p className="text-xs text-muted-foreground truncate">{p.description}</p>}
        </div>
      </div>
    ),
  },
  {
    key: "sku", header: "SKU", width: 130,
    cell: (p) => <span className="font-mono text-xs text-muted-foreground">{p.sku}</span>,
  },
  {
    key: "category", header: "Categoría", width: "20%",
    cell: (p) => <span className="text-muted-foreground truncate block">{p.category_name}</span>,
  },
  {
    key: "status", header: "Estado", width: 100,
    cell: (p) => <Badge variant={STATUS_VARIANT[p.status]}>{STATUS_LABEL[p.status]}</Badge>,
  },
  {
    key: "created_at", header: "Creado", width: 120,
    cell: (p) => <span className="text-muted-foreground whitespace-nowrap">{formatDate(p.created_at)}</span>,
  },
  {
    key: "actions", header: "", width: 48,
    cell: (p) => (
      <DropdownMenu>
        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}>
          <MoreHorizontal size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(p)}>Editar</DropdownMenuItem>
          <DropdownMenuSeparator />
          {p.status === "active" && (
              <DropdownMenuItem onClick={() => onConfirm("deactivate", p)} variant="destructive">Desactivar</DropdownMenuItem>
            )}
          {p.status === "inactive" && (
            <>
              <DropdownMenuItem onClick={() => onActivate(p)}>Activar</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onConfirm("delete", p)} variant="destructive">Eliminar</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function ProductsTable({ products, loading, hasActiveFilters, onEdit, onActivate, onConfirm }: ProductsTableProps) {
  return (
    <DataTable
      columns={columns(onEdit, onActivate, onConfirm)}
      data={products}
      loading={loading}
      rowKey={(p) => p.id}
      emptyIcon={<Package size={32} className="text-muted-foreground/40" />}
      emptyText="No hay productos registrados"
      emptyFilterText="Sin resultados para los filtros aplicados"
      hasActiveFilters={hasActiveFilters}
    />
  )
}