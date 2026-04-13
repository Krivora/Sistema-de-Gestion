"use client"
import { useState, useMemo } from "react"
import { Plus, Search } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTablePagination } from "@/components/shared/table/data-table-pagination"
import { PurchasesTable } from "@/features/purchases/components/purchases-table"
import { PurchaseDetailDialog } from "@/features/purchases/components/purchase-detail-dialog"
import { usePurchases } from "@/features/purchases/hooks/use-purchases"
import Link from "next/link"

export default function PurchasesPage() {
  const [detailId, setDetailId] = useState<number | null>(null)

  const {
    purchases, branches, loading, postedCount, hasActiveFilters,
    search, setSearch,
    filterStatus, setFilterStatus,
    filterBranch, setFilterBranch,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    clearFilters,
    page, setPage, pageSize, setPageSize,
    filtered, paginated, totalPages,
  } = usePurchases()
  const selectedBranch = useMemo(
    () => branches.find((b) => String(b.id) === filterBranch),
    [branches, filterBranch]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Compras</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {postedCount} compra{postedCount !== 1 ? "s" : ""} registrada{postedCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dashboard/purchases/new" className={buttonVariants({ size: "sm" })}>
          <Plus size={16} className="mr-2" />Nueva compra
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-50 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por folio, sucursal o usuario..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Select value={filterStatus} onValueChange={(v) => setFilterStatus((v ?? "all") as typeof filterStatus)}>
          <SelectTrigger className="w-37.5">
            <SelectValue placeholder="Estado">
              {filterStatus === "all"
                ? "Todos los estados"
                : filterStatus === "posted"
                  ? "Publicadas"
                  : filterStatus === "draft"
                    ? "Borradores"
                    : "Canceladas"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="posted">Publicadas</SelectItem>
            <SelectItem value="draft">Borradores</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterBranch}
          onValueChange={(v) => setFilterBranch(v ?? "all")}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Sucursal">
              {filterBranch === "all" || !filterBranch
                ? "Todas las sucursales"
                : selectedBranch?.name ?? "Sucursal"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las sucursales</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b.id} value={String(b.id)}>
                <span className="truncate block">{b.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36 text-sm" />
          <span className="text-muted-foreground text-sm">—</span>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36 text-sm" />
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            Limpiar filtros
          </Button>
        )}
      </div>

      <PurchasesTable
        purchases={paginated}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        onDetail={setDetailId}
      />

      {!loading && filtered.length > 0 && (
        <DataTablePagination
          page={page} totalPages={totalPages} pageSize={pageSize}
          filteredCount={filtered.length} totalCount={purchases.length}
          entityLabel="compra" onPageChange={setPage} onPageSizeChange={setPageSize}
        />
      )}

      <PurchaseDetailDialog purchaseId={detailId} onClose={() => setDetailId(null)} />
    </div>
  )
}