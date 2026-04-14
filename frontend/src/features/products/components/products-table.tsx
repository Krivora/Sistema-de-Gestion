import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Package, MoreHorizontal } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Product } from "@/lib/api/products"
import type { ConfirmType } from "@/features/products/hooks/use-products"

/* ────────────────────────────────────────────────
   Configuración de estados
──────────────────────────────── */
const STATUS_LABEL: Record<Product["status"], string> = {
  active: "Activo",
  inactive: "Inactivo",
  deleted: "Eliminado",
}

const STATUS_VARIANT: Record<
  Product["status"],
  "default" | "secondary" | "destructive"
> = {
  active: "default",
  inactive: "secondary",
  deleted: "destructive",
}

/* ────────────────────────────────────────────────
   Tipos
──────────────────────────────── */
interface ProductsTableProps {
  products: Product[]
  loading: boolean
  hasActiveFilters: boolean
  onEdit: (p: Product) => void
  onActivate: (p: Product) => void
  onConfirm: (type: ConfirmType, p: Product) => void
}

/* ────────────────────────────────────────────────
   Card móvil
──────────────────────────────── */
function ProductCard({
  product,
  onEdit,
  onActivate,
  onConfirm,
}: {
  product: Product
  onEdit: (p: Product) => void
  onActivate: (p: Product) => void
  onConfirm: (type: ConfirmType, p: Product) => void
}) {
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
              {product.name}
            </p>
            {product.description && (
              <p className="text-xs text-muted-foreground truncate">
                {product.description}
              </p>
            )}
          </div>
        </div>

        <Badge variant={STATUS_VARIANT[product.status]}>
          {STATUS_LABEL[product.status]}
        </Badge>
      </div>

      {/* Información */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">SKU</p>
          <p className="font-mono">{product.sku}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Categoría</p>
          <p className="truncate">{product.category_name}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Creado</p>
          <p>{formatDate(product.created_at)}</p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end pt-2 border-t">
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
            <DropdownMenuItem onClick={() => onEdit(product)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {product.status === "active" && (
              <DropdownMenuItem
                onClick={() => onConfirm("deactivate", product)}
                variant="destructive"
              >
                Desactivar
              </DropdownMenuItem>
            )}
            {product.status === "inactive" && (
              <>
                <DropdownMenuItem onClick={() => onActivate(product)}>
                  Activar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onConfirm("delete", product)}
                  variant="destructive"
                >
                  Eliminar
                </DropdownMenuItem>
              </>
            )}
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
        <div className="h-9 w-9 rounded-lg bg-muted" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="h-3 bg-muted rounded" />
        <div className="h-3 bg-muted rounded" />
        <div className="h-3 bg-muted rounded" />
      </div>

      <div className="flex justify-end pt-2 border-t">
        <div className="h-8 w-8 bg-muted rounded" />
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────
   Columnas de la tabla
──────────────────────────────── */
const columns = (
  onEdit: (p: Product) => void,
  onActivate: (p: Product) => void,
  onConfirm: (type: ConfirmType, p: Product) => void,
): ColumnDef<Product>[] => [
  {
    key: "name",
    header: "Producto",
    width: "30%",
    cell: (p) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Package size={14} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate">{p.name}</p>
          {p.description && (
            <p className="text-xs text-muted-foreground truncate">
              {p.description}
            </p>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "sku",
    header: "SKU",
    width: 130,
    cell: (p) => (
      <span className="font-mono text-xs text-muted-foreground">
        {p.sku}
      </span>
    ),
  },
  {
    key: "category",
    header: "Categoría",
    width: "20%",
    cell: (p) => (
      <span className="text-muted-foreground truncate block">
        {p.category_name}
      </span>
    ),
  },
  {
    key: "status",
    header: "Estado",
    width: 100,
    cell: (p) => (
      <Badge variant={STATUS_VARIANT[p.status]}>
        {STATUS_LABEL[p.status]}
      </Badge>
    ),
  },
  {
    key: "created_at",
    header: "Creado",
    width: 120,
    cell: (p) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {formatDate(p.created_at)}
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    width: 48,
    cell: (p) => (
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
          <DropdownMenuItem onClick={() => onEdit(p)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {p.status === "active" && (
            <DropdownMenuItem
              onClick={() => onConfirm("deactivate", p)}
              variant="destructive"
            >
              Desactivar
            </DropdownMenuItem>
          )}
          {p.status === "inactive" && (
            <>
              <DropdownMenuItem onClick={() => onActivate(p)}>
                Activar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onConfirm("delete", p)}
                variant="destructive"
              >
                Eliminar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

/* ────────────────────────────────────────────────
   Componente principal
──────────────────────────────── */
export function ProductsTable({
  products,
  loading,
  hasActiveFilters,
  onEdit,
  onActivate,
  onConfirm,
}: ProductsTableProps) {
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
                : "No hay productos registrados"}
            </p>
          </div>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={onEdit}
              onActivate={onActivate}
              onConfirm={onConfirm}
            />
          ))
        )}
      </div>

      {/* Vista escritorio */}
      <div className="hidden sm:block">
        <DataTable
          columns={columns(onEdit, onActivate, onConfirm)}
          data={products}
          loading={loading}
          rowKey={(p) => p.id}
          emptyIcon={
            <Package
              size={32}
              className="text-muted-foreground/40"
            />
          }
          emptyText="No hay productos registrados"
          emptyFilterText="Sin resultados para los filtros aplicados"
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </>
  )
}