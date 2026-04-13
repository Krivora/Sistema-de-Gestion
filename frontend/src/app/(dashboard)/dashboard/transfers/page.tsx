"use client"
import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTablePagination } from "@/components/shared/table/data-table-pagination"
import { TransfersTable } from "@/features/transfers/components/transfers-table"
import { TransferDialog } from "@/features/transfers/components/transfer-dialog"
import { TransferDetailDialog } from "@/features/transfers/components/transfer-detail-dialog"
import { useTransfers } from "@/features/transfers/hooks/use-transfers"

export default function TransfersPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailId, setDetailId] = useState<number | null>(null)

  const {
    transfers, loading,
    filtered, paginated, hasActiveFilters,
    search, setSearch,
    page, setPage, pageSize, setPageSize, totalPages,
    reload,
  } = useTransfers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Transferencias</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {transfers.length} transferencia{transfers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus size={16} className="mr-2" />Nueva transferencia
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por doc, sucursal o usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <TransfersTable
        transfers={paginated}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        onViewDetail={(id) => setDetailId(id)}
      />

      {!loading && filtered.length > 0 && (
        <DataTablePagination
          page={page} totalPages={totalPages} pageSize={pageSize}
          filteredCount={filtered.length} totalCount={transfers.length}
          entityLabel="transferencia" onPageChange={setPage} onPageSizeChange={setPageSize}
        />
      )}

      <TransferDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => { setDialogOpen(false); reload() }}
      />

      <TransferDetailDialog
        open={!!detailId}
        onClose={() => setDetailId(null)}
        transferId={detailId}
      />
    </div>
  )
}