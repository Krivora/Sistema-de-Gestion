// features/products/components/products-table.tsx
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Package, MoreHorizontal } from "lucide-react"
import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { formatDate } from "@/lib/utils"
import type { Product } from "@/lib/api/products"

// ── tipos ────────────────────────────────────────────────
interface ProductsTableProps {
  products: Product[]
  loading: boolean
  hasActiveFilters: boolean
  onEdit: (p: Product) => void
  onConfirm: (type: "delete" | "deactivate", p: Product) => void
}

// ── card móvil ───────────────────────────────────────────
function ProductCard({ product, onEdit, onConfirm }: {
  product: Product
  onEdit: (p: Product) => void
  onConfirm: (t: "delete" | "deactivate", p: Product) => void
}) {
  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Package size={15} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate text-sm">{product.name}</p>
            <p className="text-xs font-mono text-muted-foreground">{product.sku}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8 shrink-0"}>
            <MoreHorizontal size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(product)}>Editar</DropdownMenuItem>
            <DropdownMenuSeparator />
            {product.status === "active" && (
              <DropdownMenuItem onClick={() => onConfirm("deactivate", product)} variant="destructive">
                Desactivar
              </DropdownMenuItem>
            )}
            {product.status === "inactive" && (
              <DropdownMenuItem onClick={() => onConfirm("delete", product)} variant="destructive">
                Eliminar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {product.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
      )}

      <div className="flex items-center justify-between pt-1 border-t">
        <Badge variant={product.status === "active" ? "default" : "secondary"}>
          {product.status === "active" ? "Activo" : "Inactivo"}
        </Badge>
        <span className="text-xs text-muted-foreground">{formatDate(product.created_at)}</span>
      </div>
    </div>
  )
}

// ── skeleton card ────────────────────────────────────────
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
      <div className="h-3 bg-muted rounded w-full" />
      <div className="flex justify-between pt-1 border-t">
        <div className="h-5 bg-muted rounded w-16" />
        <div className="h-3 bg-muted rounded w-20" />
      </div>
    </div>
  )
}

// ── tabla + cards ─────────────────────────────────────────
export function ProductsTable({ products, loading, hasActiveFilters, onEdit, onConfirm }: ProductsTableProps) {
  const columns: ColumnDef<Product>[] = [
    {
      key: "name", header: "Producto", width: "30%",
      cell: (p) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <Package size={14} className="text-primary" />
          </div>
          <span className="font-medium truncate">{p.name}</span>
        </div>
      ),
    },
    {
      key: "sku", header: "SKU", width: 120,
      cell: (p) => <span className="font-mono text-xs text-muted-foreground">{p.sku}</span>,
    },
    {
      key: "description", header: "Descripción", width: "35%",
      className: "px-4 py-3 text-muted-foreground overflow-hidden",
      cell: (p) => <span className="truncate block">{p.description ?? "—"}</span>,
    },
    {
      key: "status", header: "Estado", width: 100,
      cell: (p) => (
        <Badge variant={p.status === "active" ? "default" : "secondary"}>
          {p.status === "active" ? "Activo" : "Inactivo"}
        </Badge>
      ),
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
              <DropdownMenuItem onClick={() => onConfirm("delete", p)} variant="destructive">Eliminar</DropdownMenuItem>
            )}
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
                  {hasActiveFilters ? "Sin resultados para tu búsqueda" : "No hay productos registrados"}
                </p>
              </div>
            )
            : products.map((p) => (
              <ProductCard key={p.id} product={p} onEdit={onEdit} onConfirm={onConfirm} />
            ))
        }
      </div>

      {/* desktop */}
      <div className="hidden sm:block">
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          rowKey={(p) => p.id}
          emptyIcon={<Package size={32} className="text-muted-foreground/40" />}
          emptyText="No hay productos registrados"
          emptyFilterText="Sin resultados para tu búsqueda"
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </>
  )
}