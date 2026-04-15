import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { ShoppingBag, Eye, FileDown, CheckCircle, MoreHorizontal } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { PAYMENT_METHODS, type Sale } from "@/lib/api/sales"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
const STATUS_LABEL: Record<Sale["status"], string> = {
  open: "Abierta",
  posted: "Publicada",
  cancelled: "Cancelada",
}

const STATUS_VARIANT: Record<
  Sale["status"],
  "default" | "secondary" | "destructive"
> = {
  open: "secondary",
  posted: "default",
  cancelled: "destructive",
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(n)
}

interface SalesTableProps {
  sales: Sale[]
  loading: boolean
  hasActiveFilters: boolean
  onDetail: (id: number) => void
  onDownloadPdf: (sale: Sale) => void
  onPost: (id: number) => void          // <-- agrega
}

/* ────────────────────────────────
   Card móvil
──────────────────────────────── */
function SaleCard({ sale, onDetail, onDownloadPdf, onPost }: {
  sale: Sale
  onDetail: (id: number) => void
  onDownloadPdf: (sale: Sale) => void
  onPost: (id: number) => void
}) {
  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ShoppingBag size={15} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{sale.doc_no}</p>
            <p className="text-xs text-muted-foreground truncate">
              {sale.customer_name || "Sin cliente"}
            </p>
          </div>
        </div>
        <Badge variant={STATUS_VARIANT[sale.status]}>
          {STATUS_LABEL[sale.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Sucursal</p>
          <p className="truncate">{sale.branch_name}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Pago</p>
          <p>
            {
              PAYMENT_METHODS.find(
                (m) => m.value === sale.payment_method
              )?.label
            }
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <div>
          <p className="text-xs text-muted-foreground">
            {formatDate(sale.created_at)}
          </p>
          <p className="font-semibold">{formatCurrency(sale.total)}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <MoreHorizontal size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDetail(sale.id)}>
              Ver detalle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownloadPdf(sale)}>
              Descargar PDF
            </DropdownMenuItem>
            {sale.status === "open" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onPost(sale.id)}>
                  Publicar venta
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

/* ────────────────────────────────
   Skeleton móvil
──────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-card border rounded-xl p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 bg-muted rounded-lg" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-muted rounded w-full" />
      <div className="flex justify-between pt-2 border-t">
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="h-4 bg-muted rounded w-1/4" />
      </div>
    </div>
  )
}

/* ────────────────────────────────
   Columnas de la tabla
──────────────────────────────── */
const columns = (
  onDetail: (id: number) => void,
  onDownloadPdf: (sale: Sale) => void,
  onPost: (id: number) => void,         // <-- agrega
): ColumnDef<Sale>[] => [
    {
      key: "doc_no",
      header: "Folio",
      width: 110,
      cell: (s) => (
        <span className="font-mono font-medium">{s.doc_no}</span>
      ),
    },
    {
      key: "customer",
      header: "Cliente",
      width: "22%",
      cell: (s) =>
        s.customer_name ? (
          <span className="text-muted-foreground truncate block">
            {s.customer_name}
          </span>
        ) : (
          <span className="italic opacity-50 text-muted-foreground">
            Sin cliente
          </span>
        ),
    },
    {
      key: "branch",
      header: "Sucursal",
      width: "18%",
      cell: (s) => (
        <span className="text-muted-foreground truncate block">
          {s.branch_name}
        </span>
      ),
    },
    {
      key: "payment",
      header: "Pago",
      width: 130,
      cell: (s) => (
        <span className="text-muted-foreground">
          {
            PAYMENT_METHODS.find(
              (m) => m.value === s.payment_method
            )?.label
          }
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      width: 110,
      cell: (s) => (
        <span className="font-semibold">
          {formatCurrency(s.total)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      width: 100,
      cell: (s) => (
        <Badge variant={STATUS_VARIANT[s.status]}>
          {STATUS_LABEL[s.status]}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Fecha",
      width: 120,
      cell: (s) => (
        <span className="text-muted-foreground whitespace-nowrap">
          {formatDate(s.created_at)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: 48,
      cell: (s) => (
        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}>
            <MoreHorizontal size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDetail(s.id)}>
              Ver detalle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownloadPdf(s)}>
              Descargar PDF
            </DropdownMenuItem>
            {s.status === "open" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onPost(s.id)}>
                  Publicar venta
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

/* ────────────────────────────────
   Componente principal
──────────────────────────────── */
export function SalesTable({ sales, loading, hasActiveFilters, onDetail, onDownloadPdf, onPost }: SalesTableProps) {
  return (
    <>
      {/* Mobile */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : sales.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <ShoppingBag
              size={32}
              className="text-muted-foreground/40"
            />
            <p className="text-sm">
              {hasActiveFilters
                ? "Sin resultados para los filtros aplicados"
                : "No hay ventas registradas"}
            </p>
          </div>
        ) : (
          sales.map((sale) => (
            <SaleCard key={sale.id} sale={sale} onDetail={onDetail} onDownloadPdf={onDownloadPdf} onPost={onPost} />
          ))
        )}
      </div>

      {/* Desktop */}
      <div className="hidden sm:block w-full overflow-x-auto">
        <DataTable
          columns={columns(onDetail, onDownloadPdf, onPost)}
          data={sales}
          loading={loading}
          rowKey={(s) => s.id}
          emptyIcon={
            <ShoppingBag
              size={32}
              className="text-muted-foreground/40"
            />
          }
          emptyText="No hay ventas registradas"
          emptyFilterText="Sin resultados para los filtros aplicados"
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </>
  )
}