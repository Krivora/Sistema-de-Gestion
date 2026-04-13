"use client"
import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTablePagination } from "@/components/shared/table/data-table-pagination"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { BranchesTable } from "@/features/branches/components/branches-table"
import { BranchDialog } from "@/features/branches/components/branch-dialog"
import { useBranches } from "@/features/branches/hooks/use-branches"
import type { Branch } from "@/lib/api/branches"

export default function BranchesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Branch | null>(null)

  const {
    branches, loading, activeCount,
    search, setSearch,
    page, setPage, pageSize, setPageSize,
    filtered, paginated, totalPages,
    openConfirm, handleDeactivate,
    reload, confirmDialog, setConfirmDialog,
  } = useBranches()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sucursales</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeCount} sucursal{activeCount !== 1 ? "es" : ""} activa{activeCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => { setSelected(null); setDialogOpen(true) }} size="sm">
          <Plus size={16} className="mr-2" />Nueva sucursal
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por nombre, código o dirección..." value={search}
          onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <BranchesTable
        branches={paginated}
        loading={loading}
        hasActiveFilters={!!search}
        onEdit={(b) => { setSelected(b); setDialogOpen(true) }}
        onConfirm={openConfirm}
      />

      {!loading && filtered.length > 0 && (
        <DataTablePagination
          page={page} totalPages={totalPages} pageSize={pageSize}
          filteredCount={filtered.length} totalCount={branches.length}
          entityLabel="sucursal" onPageChange={setPage} onPageSizeChange={setPageSize}
        />
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((d) => ({ ...d, open }))}
        title="¿Desactivar sucursal?"
        description={`"${confirmDialog.branch?.name}" quedará inactiva hasta que la actives de nuevo.`}
        confirmLabel="Desactivar"
        onConfirm={handleDeactivate}
      />

      <BranchDialog open={dialogOpen} onClose={() => setDialogOpen(false)}
        branch={selected} onSuccess={() => { setDialogOpen(false); reload() }} />
    </div>
  )
}