import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { ShoppingBag, Eye, FileDown } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { PAYMENT_METHODS, type Sale } from "@/lib/api/sales"

const STATUS_LABEL: Record<Sale["status"], string> = {
  open: "Abierta", posted: "Publicada", cancelled: "Cancelada",
}
const STATUS_VARIANT: Record<Sale["status"], "default" | "secondary" | "destructive"> = {
  open: "secondary", posted: "default", cancelled: "destructive",
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n)
}

interface SalesTableProps {
  sales: Sale[]
  loading: boolean
  hasActiveFilters: boolean
  onDetail: (id: number) => void
  onDownloadPdf: (sale: Sale) => void
}

const columns = (
  onDetail: (id: number) => void,
  onDownloadPdf: (sale: Sale) => void,
): ColumnDef<Sale>[] => [
    {
      key: "doc_no", header: "Folio", width: 110,
      cell: (s) => <span className="font-mono font-medium">{s.doc_no}</span>,
    },
    {
      key: "customer", header: "Cliente", width: "22%",
      cell: (s) => s.customer_name
        ? <span className="text-muted-foreground truncate block">{s.customer_name}</span>
        : <span className="italic opacity-50 text-muted-foreground">Sin cliente</span>,
    },
    {
      key: "branch", header: "Sucursal", width: "18%",
      cell: (s) => <span className="text-muted-foreground truncate block">{s.branch_name}</span>,
    },
    {
      key: "payment", header: "Pago", width: 130,
      cell: (s) => (
        <span className="text-muted-foreground">
          {PAYMENT_METHODS.find((m) => m.value === s.payment_method)?.label ?? s.payment_method}
        </span>
      ),
    },
    {
      key: "total", header: "Total", width: 110,
      cell: (s) => <span className="font-semibold">{formatCurrency(s.total)}</span>,
    },
    {
      key: "status", header: "Estado", width: 100,
      cell: (s) => <Badge variant={STATUS_VARIANT[s.status]}>{STATUS_LABEL[s.status]}</Badge>,
    },
    {
      key: "created_at", header: "Fecha", width: 120,
      cell: (s) => <span className="text-muted-foreground whitespace-nowrap">{formatDate(s.created_at)}</span>,
    },
    {
      key: "actions", header: "", width: 72,
      cell: (s) => (
        <div className="flex items-center gap-1">
          <button onClick={() => onDetail(s.id)}
            className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}>
            <Eye size={15} />
          </button>
          <button onClick={() => onDownloadPdf(s)}
            className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}>
            <FileDown size={15} />
          </button>
        </div>
      ),
    },
  ]

export function SalesTable({ sales, loading, hasActiveFilters, onDetail, onDownloadPdf }: SalesTableProps) {
  return (
    <DataTable
      columns={columns(onDetail, onDownloadPdf)}
      data={sales}
      loading={loading}
      rowKey={(s) => s.id}
      emptyIcon={<ShoppingBag size={32} className="text-muted-foreground/40" />}
      emptyText="No hay ventas registradas"
      emptyFilterText="Sin resultados para los filtros aplicados"
      hasActiveFilters={hasActiveFilters}
    />
  )
}