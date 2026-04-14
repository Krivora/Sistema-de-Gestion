import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { Badge } from "@/components/ui/badge"
import { ArrowDownCircle, ArrowUpCircle, ClipboardList, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Adjustment } from "@/lib/api/adjustments"
import { buttonVariants } from "@/components/ui/button"

interface AdjustmentsTableProps {
  adjustments: Adjustment[]
  loading: boolean
  hasActiveFilters: boolean
  onDetail: (id: number) => void
}

const columns = (onDetail: (id: number) => void): ColumnDef<Adjustment>[] => [
  {
    key: "doc_no", header: "Documento", width: 130,
    cell: (a) => <span className="font-mono font-medium">{a.doc_no}</span>,
  },
  {
    key: "type", header: "Tipo", width: 100,
    cell: (a) => (
      <Badge variant={a.type === "ADJUSTMENT_IN" ? "default" : "secondary"}>
        <span className="flex items-center gap-1">
          {a.type === "ADJUSTMENT_IN" ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
          {a.type === "ADJUSTMENT_IN" ? "Entrada" : "Salida"}
        </span>
      </Badge>
    ),
  },
  {
    key: "branch", header: "Sucursal", width: "25%",
    cell: (a) => <span className="text-muted-foreground truncate block">{a.branch_name}</span>,
  },
  {
    key: "user", header: "Usuario", width: "20%",
    cell: (a) => <span className="text-muted-foreground truncate block">{a.user_name}</span>,
  },
  {
    key: "created_at", header: "Fecha", width: 120,
    cell: (a) => <span className="text-muted-foreground whitespace-nowrap">{formatDate(a.created_at)}</span>,
  },
  {
    key: "actions", header: "", width: 48,
    cell: (a) => (
      <button onClick={() => onDetail(a.id)}
        className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}>
        <Eye size={15} />
      </button>
    ),
  },
]
export function AdjustmentsTable({ adjustments, loading, hasActiveFilters, onDetail }: AdjustmentsTableProps) {
  return (
    <DataTable
      columns={columns(onDetail)}
      data={adjustments}
      loading={loading}
      rowKey={(a) => a.id}
      emptyIcon={<ClipboardList size={32} className="text-muted-foreground/40" />}
      emptyText="No hay ajustes registrados"
      emptyFilterText="Sin resultados para los filtros aplicados"
      hasActiveFilters={hasActiveFilters}
    />
  )
}