import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { Badge } from "@/components/ui/badge"
import { ArrowDownCircle, ArrowUpCircle, ClipboardList, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Adjustment } from "@/lib/api/adjustments"
import { buttonVariants } from "@/components/ui/button"

/* ────────────────────────────────────────────────
   Tipos y configuraciones
──────────────────────────────── */
interface AdjustmentsTableProps {
  adjustments: Adjustment[]
  loading: boolean
  hasActiveFilters: boolean
  onDetail: (id: number) => void
}

const STATUS_CONFIG = {
  ADJUSTMENT_IN: {
    label: "Entrada",
    variant: "default" as const,
    icon: ArrowUpCircle,
  },
  ADJUSTMENT_OUT: {
    label: "Salida",
    variant: "secondary" as const,
    icon: ArrowDownCircle,
  },
}

/* ────────────────────────────────────────────────
   Card móvil
──────────────────────────────── */
function AdjustmentCard({
  adjustment,
  onDetail,
}: {
  adjustment: Adjustment
  onDetail: (id: number) => void
}) {
  const config = STATUS_CONFIG[adjustment.type]
  const Icon = config.icon

  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ClipboardList size={15} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">
              {adjustment.doc_no}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {adjustment.branch_name}
            </p>
          </div>
        </div>

        <Badge variant={config.variant}>
          <span className="flex items-center gap-1">
            <Icon size={12} />
            {config.label}
          </span>
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Usuario</p>
          <p className="truncate">{adjustment.user_name}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Fecha</p>
          <p>{formatDate(adjustment.created_at)}</p>
        </div>
      </div>

      <div className="flex items-center justify-end pt-2 border-t">
        <button
          aria-label="Ver detalle"
          onClick={() => onDetail(adjustment.id)}
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
): ColumnDef<Adjustment>[] => [
  {
    key: "doc_no",
    header: "Documento",
    width: 130,
    cell: (a) => (
      <span className="font-mono font-medium">{a.doc_no}</span>
    ),
  },
  {
    key: "type",
    header: "Tipo",
    width: 100,
    cell: (a) => {
      const config = STATUS_CONFIG[a.type]
      const Icon = config.icon
      return (
        <Badge variant={config.variant}>
          <span className="flex items-center gap-1">
            <Icon size={12} />
            {config.label}
          </span>
        </Badge>
      )
    },
  },
  {
    key: "branch",
    header: "Sucursal",
    width: "25%",
    cell: (a) => (
      <span className="text-muted-foreground truncate block">
        {a.branch_name}
      </span>
    ),
  },
  {
    key: "user",
    header: "Usuario",
    width: "20%",
    cell: (a) => (
      <span className="text-muted-foreground truncate block">
        {a.user_name}
      </span>
    ),
  },
  {
    key: "created_at",
    header: "Fecha",
    width: 120,
    cell: (a) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {formatDate(a.created_at)}
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    width: 48,
    cell: (a) => (
      <button
        aria-label="Ver detalle"
        onClick={() => onDetail(a.id)}
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
export function AdjustmentsTable({
  adjustments,
  loading,
  hasActiveFilters,
  onDetail,
}: AdjustmentsTableProps) {
  return (
    <>
      {/* Mobile */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : adjustments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <ClipboardList
              size={32}
              className="text-muted-foreground/40"
            />
            <p className="text-sm">
              {hasActiveFilters
                ? "Sin resultados para los filtros aplicados"
                : "No hay ajustes registrados"}
            </p>
          </div>
        ) : (
          adjustments.map((adjustment) => (
            <AdjustmentCard
              key={adjustment.id}
              adjustment={adjustment}
              onDetail={onDetail}
            />
          ))
        )}
      </div>

      {/* Desktop */}
      <div className="hidden sm:block">
        <DataTable
          columns={columns(onDetail)}
          data={adjustments}
          loading={loading}
          rowKey={(a) => a.id}
          emptyIcon={
            <ClipboardList
              size={32}
              className="text-muted-foreground/40"
            />
          }
          emptyText="No hay ajustes registrados"
          emptyFilterText="Sin resultados para los filtros aplicados"
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </>
  )
}