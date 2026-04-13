"use client"
import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTablePagination } from "@/components/shared/table/data-table-pagination"
import { AdjustmentsTable } from "@/features/adjustments/components/adjustments-table"
import { AdjustmentDialog } from "@/features/adjustments/components/adjustment-dialog"
import { AdjustmentDetailDialog } from "@/features/adjustments/components/adjustment-detail-dialog"
import { useAdjustments } from "@/features/adjustments/hooks/use-adjustments"

export default function AdjustmentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailId, setDetailId] = useState<number | null>(null)

  const {
    adjustments, loading,
    search, setSearch,
    filterType, setFilterType,
    hasActiveFilters, clearFilters,
    page, setPage, pageSize, setPageSize,
    filtered, paginated, totalPages,
    reload,
  } = useAdjustments()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ajustes de inventario</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {adjustments.length} ajuste{adjustments.length !== 1 ? "s" : ""} registrado{adjustments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus size={16} className="mr-2" />Nuevo ajuste
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-50 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por doc, sucursal o usuario..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="ADJUSTMENT_IN">Entrada</SelectItem>
            <SelectItem value="ADJUSTMENT_OUT">Salida</SelectItem>
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            Limpiar filtros
          </Button>
        )}
      </div>

      <AdjustmentsTable
        adjustments={paginated}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        onDetail={setDetailId}
      />

      {!loading && filtered.length > 0 && (
        <DataTablePagination
          page={page} totalPages={totalPages} pageSize={pageSize}
          filteredCount={filtered.length} totalCount={adjustments.length}
          entityLabel="ajuste" onPageChange={setPage} onPageSizeChange={setPageSize}
        />
      )}

      <AdjustmentDialog open={dialogOpen} onClose={() => setDialogOpen(false)}
        onSuccess={() => { setDialogOpen(false); reload() }} />
      <AdjustmentDetailDialog open={!!detailId} onClose={() => setDetailId(null)} adjustmentId={detailId} />
    </div>
  )
}