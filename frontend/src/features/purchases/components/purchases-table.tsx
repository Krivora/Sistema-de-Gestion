import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { ShoppingCart, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Purchase } from "@/lib/api/purchases"

/* ────────────────────────────────────────────────
   Configuración de estados
──────────────────────────────── */
const STATUS_LABEL: Record<Purchase["status"], string> = {
  draft: "Borrador",
  posted: "Publicada",
  cancelled: "Cancelada",
}

const STATUS_VARIANT: Record<
  Purchase["status"],
  "default" | "secondary" | "destructive"
> = {
  draft: "secondary",
  posted: "default",
  cancelled: "destructive",
}

interface PurchasesTableProps {
  purchases: Purchase[]
  loading: boolean
  hasActiveFilters: boolean
  onDetail: (id: number) => void
}

/* ────────────────────────────────────────────────
   Card móvil
──────────────────────────────── */
function PurchaseCard({
  purchase,
  onDetail,
}: {
  purchase: Purchase
  onDetail: (id: number) => void
}) {
  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ShoppingCart size={15} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{purchase.doc_no}</p>
            <p className="text-xs text-muted-foreground truncate">
              {purchase.branch_name}
            </p>
          </div>
        </div>

        <Badge variant={STATUS_VARIANT[purchase.status]}>
          {STATUS_LABEL[purchase.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Usuario</p>
          <p className="truncate">{purchase.user_name}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Fecha</p>
          <p>{formatDate(purchase.created_at)}</p>
        </div>
      </div>

      <div className="flex items-center justify-end pt-2 border-t">
        <button
          aria-label="Ver detalle"
          onClick={() => onDetail(purchase.id)}
          className={buttonVariants({
            variant: "ghost",
            size: "icon",
          })}
        >
          <Eye size={16} />
        </button>
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
      <div className="grid grid-cols-2 gap-2">
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
  onDetail: (id: number) => void
): ColumnDef<Purchase>[] => [
  {
    key: "doc_no",
    header: "Folio",
    width: 110,
    cell: (p) => (
      <span className="font-mono font-medium">{p.doc_no}</span>
    ),
  },
  {
    key: "branch",
    header: "Sucursal",
    width: "30%",
    cell: (p) => (
      <span className="text-muted-foreground truncate block">
        {p.branch_name}
      </span>
    ),
  },
  {
    key: "user",
    header: "Usuario",
    width: "25%",
    cell: (p) => (
      <span className="text-muted-foreground truncate block">
        {p.user_name}
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
    header: "Fecha",
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
      <button
        aria-label="Ver detalle"
        onClick={() => onDetail(p.id)}
        className={
          buttonVariants({ variant: "ghost", size: "icon" }) +
          " h-8 w-8"
        }
      >
        <Eye size={15} />
      </button>
    ),
  },
]

/* ────────────────────────────────────────────────
   Componente principal
──────────────────────────────── */
export function PurchasesTable({
  purchases,
  loading,
  hasActiveFilters,
  onDetail,
}: PurchasesTableProps) {
  return (
    <>
      {/* Mobile */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : purchases.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <ShoppingCart
              size={32}
              className="text-muted-foreground/40"
            />
            <p className="text-sm">
              {hasActiveFilters
                ? "Sin resultados para los filtros aplicados"
                : "No hay compras registradas"}
            </p>
          </div>
        ) : (
          purchases.map((purchase) => (
            <PurchaseCard
              key={purchase.id}
              purchase={purchase}
              onDetail={onDetail}
            />
          ))
        )}
      </div>

      {/* Desktop */}
      <div className="hidden sm:block w-full overflow-x-auto">
        <DataTable
          columns={columns(onDetail)}
          data={purchases}
          loading={loading}
          rowKey={(p) => p.id}
          emptyIcon={
            <ShoppingCart
              size={32}
              className="text-muted-foreground/40"
            />
          }
          emptyText="No hay compras registradas"
          emptyFilterText="Sin resultados para los filtros aplicados"
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </>
  )
}