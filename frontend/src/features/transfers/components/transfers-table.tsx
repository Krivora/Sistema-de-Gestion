import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeftRight, ClipboardList, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Transfer } from "@/lib/api/transfers"

/* ────────────────────────────────────────────────
   Tipos
──────────────────────────────── */
interface TransfersTableProps {
  transfers: Transfer[]
  loading: boolean
  hasActiveFilters: boolean
  onViewDetail: (id: number) => void
}

/* ────────────────────────────────────────────────
   Card móvil
──────────────────────────────── */
function TransferCard({
  transfer,
  onViewDetail,
}: {
  transfer: Transfer
  onViewDetail: (id: number) => void
}) {
  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ArrowLeftRight size={15} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">
              {transfer.doc_no}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {transfer.user_name}
            </p>
          </div>
        </div>

        <Badge variant="secondary">Transferencia</Badge>
      </div>

      {/* Información */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Origen</p>
          <p className="truncate">{transfer.from_branch_name}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Destino</p>
          <p className="truncate">{transfer.to_branch_name}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Fecha</p>
          <p>{formatDate(transfer.created_at)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Nota</p>
          <p className="truncate">{transfer.note || "—"}</p>
        </div>
      </div>

      {/* Acción */}
      <div className="flex items-center justify-end pt-2 border-t">
        <button
          aria-label="Ver detalle"
          onClick={() => onViewDetail(transfer.id)}
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
  onViewDetail: (id: number) => void,
): ColumnDef<Transfer>[] => [
  {
    key: "doc_no",
    header: "Documento",
    width: 120,
    cell: (t) => (
      <span className="font-mono text-xs font-medium">
        {t.doc_no}
      </span>
    ),
  },
  {
    key: "from_branch_name",
    header: "Origen",
    width: "20%",
    cell: (t) => <span>{t.from_branch_name}</span>,
  },
  {
    key: "arrow",
    header: "",
    width: 32,
    cell: () => (
      <ArrowLeftRight
        size={14}
        className="text-muted-foreground"
      />
    ),
  },
  {
    key: "to_branch_name",
    header: "Destino",
    width: "20%",
    cell: (t) => <span>{t.to_branch_name}</span>,
  },
  {
    key: "user_name",
    header: "Usuario",
    width: "15%",
    cell: (t) => (
      <span className="text-muted-foreground">
        {t.user_name}
      </span>
    ),
  },
  {
    key: "note",
    header: "Nota",
    width: "20%",
    cell: (t) => (
      <span className="text-muted-foreground text-xs truncate block max-w-[140px]">
        {t.note || "—"}
      </span>
    ),
  },
  {
    key: "created_at",
    header: "Fecha",
    width: 120,
    cell: (t) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {formatDate(t.created_at)}
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    width: 60,
    cell: (t) => (
      <button
        aria-label="Ver detalle"
        onClick={() => onViewDetail(t.id)}
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
export function TransfersTable({
  transfers,
  loading,
  hasActiveFilters,
  onViewDetail,
}: TransfersTableProps) {
  return (
    <>
      {/* Mobile */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : transfers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <ClipboardList
              size={32}
              className="text-muted-foreground/40"
            />
            <p className="text-sm">
              {hasActiveFilters
                ? "Sin resultados para los filtros aplicados"
                : "No hay transferencias registradas"}
            </p>
          </div>
        ) : (
          transfers.map((transfer) => (
            <TransferCard
              key={transfer.id}
              transfer={transfer}
              onViewDetail={onViewDetail}
            />
          ))
        )}
      </div>

      {/* Desktop */}
      <div className="hidden sm:block">
        <DataTable
          columns={columns(onViewDetail)}
          data={transfers}
          loading={loading}
          rowKey={(t) => t.id}
          emptyIcon={
            <ArrowLeftRight
              size={32}
              className="text-muted-foreground/40"
            />
          }
          emptyText="No hay transferencias registradas"
          emptyFilterText="Sin resultados para los filtros aplicados"
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </>
  )
}