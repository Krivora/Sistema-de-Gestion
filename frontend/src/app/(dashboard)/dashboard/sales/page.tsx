"use client"
import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTablePagination } from "@/components/shared/table/data-table-pagination"
import { SalesTable } from "@/features/sales/components/sales-table"
import { SaleDetailDialog } from "@/features/sales/components/sale-detail-dialog"
import { useSales } from "@/features/sales/hooks/use-sales"
import { PAYMENT_METHODS } from "@/lib/api/sales"
import Link from "next/link"

export default function SalesPage() {
  const [detailId, setDetailId] = useState<number | null>(null)

  const {
    sales, branches, loading, postedCount, hasActiveFilters,
    search, setSearch,
    filterStatus, setFilterStatus,
    filterBranch, setFilterBranch,
    filterPayment, setFilterPayment,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    clearFilters,
    page, setPage, pageSize, setPageSize,
    filtered, paginated, totalPages,
    handleDownloadPdf,
  } = useSales()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ventas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {postedCount} venta{postedCount !== 1 ? "s" : ""} registrada{postedCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dashboard/sales/new" className={buttonVariants({ size: "sm" })}>
          <Plus size={16} className="mr-2" />Nueva venta
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-50 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por folio, cliente, sucursal..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Select value={filterStatus} onValueChange={(v) => setFilterStatus((v ?? "all") as typeof filterStatus)}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="posted">Publicadas</SelectItem>
            <SelectItem value="open">Abiertas</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterBranch} onValueChange={(v) => setFilterBranch(v ?? "all")}>
          <SelectTrigger className="w-45"><SelectValue placeholder="Sucursal" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las sucursales</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterPayment} onValueChange={(v) => setFilterPayment(v ?? "all")}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Método de pago" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los métodos</SelectItem>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36 text-sm" />
          <span className="text-muted-foreground text-sm">—</span>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36 text-sm" />
        </div>

        {hasActiveFilters && (
          <button onClick={clearFilters} className={buttonVariants({ variant: "ghost", size: "sm" }) + " text-muted-foreground"}>
            Limpiar filtros
          </button>
        )}
      </div>

      <SalesTable
        sales={paginated}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        onDetail={setDetailId}
        onDownloadPdf={handleDownloadPdf}
      />

      {!loading && filtered.length > 0 && (
        <DataTablePagination
          page={page} totalPages={totalPages} pageSize={pageSize}
          filteredCount={filtered.length} totalCount={sales.length}
          entityLabel="venta" onPageChange={setPage} onPageSizeChange={setPageSize}
        />
      )}

      <SaleDetailDialog saleId={detailId} onClose={() => setDetailId(null)} />
    </div>
  )
}