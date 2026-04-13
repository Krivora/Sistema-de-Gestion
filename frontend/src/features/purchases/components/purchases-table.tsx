import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { ShoppingCart, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Purchase } from "@/lib/api/purchases"

const STATUS_LABEL: Record<Purchase["status"], string> = {
  draft: "Borrador", posted: "Publicada", cancelled: "Cancelada",
}
const STATUS_VARIANT: Record<Purchase["status"], "default" | "secondary" | "destructive"> = {
  draft: "secondary", posted: "default", cancelled: "destructive",
}

interface PurchasesTableProps {
  purchases: Purchase[]
  loading: boolean
  hasActiveFilters: boolean
  onDetail: (id: number) => void
}

const columns = (onDetail: (id: number) => void): ColumnDef<Purchase>[] => [
  {
    key: "doc_no", header: "Folio", width: 110,
    cell: (p) => <span className="font-mono font-medium">{p.doc_no}</span>,
  },
  {
    key: "branch", header: "Sucursal", width: "30%",
    cell: (p) => <span className="text-muted-foreground truncate block">{p.branch_name}</span>,
  },
  {
    key: "user", header: "Usuario", width: "25%",
    cell: (p) => <span className="text-muted-foreground truncate block">{p.user_name}</span>,
  },
  {
    key: "status", header: "Estado", width: 100,
    cell: (p) => <Badge variant={STATUS_VARIANT[p.status]}>{STATUS_LABEL[p.status]}</Badge>,
  },
  {
    key: "created_at", header: "Fecha", width: 120,
    cell: (p) => <span className="text-muted-foreground whitespace-nowrap">{formatDate(p.created_at)}</span>,
  },
  {
    key: "actions", header: "", width: 48,
    cell: (p) => (
      <button onClick={() => onDetail(p.id)}
        className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}>
        <Eye size={15} />
      </button>
    ),
  },
]
export function PurchasesTable({ purchases, loading, hasActiveFilters, onDetail }: PurchasesTableProps) {
  return (
    <DataTable
      columns={columns(onDetail)}
      data={purchases}
      loading={loading}
      rowKey={(p) => p.id}
      emptyIcon={<ShoppingCart size={32} className="text-muted-foreground/40" />}
      emptyText="No hay compras registradas"
      emptyFilterText="Sin resultados para los filtros aplicados"
      hasActiveFilters={hasActiveFilters}
    />
  )
}