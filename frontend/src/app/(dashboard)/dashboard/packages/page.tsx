"use client"
import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTablePagination } from "@/components/shared/table/data-table-pagination"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { PackageDialog } from "@/features/packages/components/package-dialog"
import { PackagesTable } from "@/features/packages/components/packages-table"
import { usePackages } from "@/features/packages/hooks/use-packages"
import type { Package } from "@/lib/api/packages"

export default function PackagesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Package | null>(null)

  const {
    loading, activeCount,
    search, setSearch,
    page, setPage, pageSize, setPageSize,
    filtered, paginated, totalPages, packages,
    handleActivate, openConfirm, handleConfirm, reload,
    confirmDialog, setConfirmDialog,
  } = usePackages()

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Paquetes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeCount} activo{activeCount !== 1 ? "s" : ""} para venta por mayoreo
          </p>
        </div>
        <Button onClick={() => { setSelected(null); setDialogOpen(true) }} size="sm">
          <Plus size={16} className="sm:mr-2" />
          <span className="hidden sm:inline">Nuevo paquete</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, código o producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <PackagesTable
        packages={paginated}
        loading={loading}
        hasActiveFilters={!!search}
        onEdit={(pkg) => { setSelected(pkg); setDialogOpen(true) }}
        onActivate={handleActivate}
        onConfirm={openConfirm}
      />

      {!loading && filtered.length > 0 && (
        <DataTablePagination
          page={page} totalPages={totalPages}
          pageSize={pageSize} filteredCount={filtered.length}
          totalCount={packages.length} entityLabel="paquete"
          onPageChange={setPage} onPageSizeChange={setPageSize}
        />
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((d) => ({ ...d, open }))}
        title={confirmDialog.type === "delete" ? "¿Eliminar paquete?" : "¿Desactivar paquete?"}
        description={confirmDialog.type === "delete"
          ? `"${confirmDialog.pkg?.name}" dejará de aparecer. Las ventas que ya lo usaron conservan su copia y no cambian.`
          : `"${confirmDialog.pkg?.name}" no podrá venderse hasta que lo actives de nuevo.`}
        confirmLabel={confirmDialog.type === "delete" ? "Eliminar" : "Desactivar"}
        variant={confirmDialog.type === "delete" ? "destructive" : "default"}
        onConfirm={handleConfirm}
      />

      <PackageDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        pkg={selected}
        onSuccess={() => { setDialogOpen(false); reload() }}
      />
    </div>
  )
}
