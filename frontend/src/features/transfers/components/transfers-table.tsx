import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { buttonVariants } from "@/components/ui/button"
import { ArrowLeftRight, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Transfer } from "@/lib/api/transfers"

interface TransfersTableProps {
  transfers: Transfer[]
  loading: boolean
  hasActiveFilters: boolean
  onViewDetail: (id: number) => void
}

const columns = (
  onViewDetail: (id: number) => void,
): ColumnDef<Transfer>[] => [
  {
    key: "doc_no", header: "Documento", width: 120,
    cell: (t) => <span className="font-mono text-xs font-medium">{t.doc_no}</span>,
  },
  {
    key: "from_branch_name", header: "Origen", width: "20%",
    cell: (t) => <span>{t.from_branch_name}</span>,
  },
  {
    key: "arrow", header: "", width: 32,
    cell: () => <ArrowLeftRight size={14} className="text-muted-foreground" />,
  },
  {
    key: "to_branch_name", header: "Destino", width: "20%",
    cell: (t) => <span>{t.to_branch_name}</span>,
  },
  {
    key: "user_name", header: "Usuario", width: "15%",
    cell: (t) => <span className="text-muted-foreground">{t.user_name}</span>,
  },
  {
    key: "note", header: "Nota", width: "20%",
    cell: (t) => (
      <span className="text-muted-foreground text-xs truncate block max-w-[140px]">
        {t.note || "—"}
      </span>
    ),
  },
  {
    key: "created_at", header: "Fecha", width: 120,
    cell: (t) => (
      <span className="text-muted-foreground whitespace-nowrap">{formatDate(t.created_at)}</span>
    ),
  },
  {
    key: "actions", header: "", width: 60,
    cell: (t) => (
      <button onClick={() => onViewDetail(t.id)}
        className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}>
        <Eye size={15} />
      </button>
    ),
  },
]

export function TransfersTable({ transfers, loading, hasActiveFilters, onViewDetail }: TransfersTableProps) {
  return (
    <DataTable
      columns={columns(onViewDetail)}
      data={transfers}
      loading={loading}
      rowKey={(t) => t.id}
      emptyIcon={<ArrowLeftRight size={32} className="text-muted-foreground/40" />}
      emptyText="No hay transferencias registradas"
      emptyFilterText="Sin resultados para los filtros aplicados"
      hasActiveFilters={hasActiveFilters}
    />
  )
}