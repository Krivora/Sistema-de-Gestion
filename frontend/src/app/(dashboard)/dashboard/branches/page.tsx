"use client"
import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    branches, loading, activeCount, hasActiveFilters,
    filtered, paginated,
    search, setSearch,
    filterStatus, setFilterStatus,
    clearFilters,
    page, setPage, pageSize, setPageSize, totalPages,
    handleActivate, openConfirm, handleConfirm,
    reload, confirmDialog, setConfirmDialog,
  } = useBranches()
  const statusLabels = {
    all: "Todos los estados",
    active: "Activas",
    inactive: "Inactivas",
  } as const;

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

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-50 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, código o dirección..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Select
          value={filterStatus}
          onValueChange={(v) => setFilterStatus(v as keyof typeof statusLabels)}
        >
          <SelectTrigger className="w-40">
            <SelectValue>
              {statusLabels[filterStatus]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{statusLabels.all}</SelectItem>
            <SelectItem value="active">{statusLabels.active}</SelectItem>
            <SelectItem value="inactive">{statusLabels.inactive}</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            Limpiar filtros
          </Button>
        )}
      </div>

      <BranchesTable
        branches={paginated}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        onEdit={(b) => { setSelected(b); setDialogOpen(true) }}
        onActivate={handleActivate}
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
        title={confirmDialog.type === "delete" ? "¿Eliminar sucursal?" : "¿Desactivar sucursal?"}
        description={confirmDialog.type === "delete"
          ? `"${confirmDialog.branch?.name}" será eliminada permanentemente. Esta acción no se puede deshacer.`
          : `"${confirmDialog.branch?.name}" quedará inactiva hasta que la actives de nuevo.`}
        confirmLabel={confirmDialog.type === "delete" ? "Eliminar" : "Desactivar"}
        variant="destructive"
        onConfirm={handleConfirm}
      />

      <BranchDialog open={dialogOpen} onClose={() => setDialogOpen(false)}
        branch={selected} onSuccess={() => { setDialogOpen(false); reload() }} />
    </div>
  )
}