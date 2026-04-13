"use client"
import { useState } from "react"
import { Plus, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTablePagination } from "@/components/shared/table/data-table-pagination"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { BranchProductDialog } from "@/features/branch-products/components/branch-product-dialog"
import { BranchProductsFilters } from "@/features/branch-products/components/branch-products-filters"
import { BranchProductsTable } from "@/features/branch-products/components/branch-products-table"
import { useBranchProducts } from "@/features/branch-products/hooks/use-branch-products"
import type { BranchProduct } from "@/lib/api/branch-products"

export default function BranchProductsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<BranchProduct | null>(null)

  const {
    items, branches, loading, lowStockCount, hasActiveFilters,
    search, setSearch,
    filterBranch, setFilterBranch,
    filterStatus, setFilterStatus,
    filterStock, setFilterStock,
    clearFilters,
    page, setPage, pageSize, setPageSize,
    filtered, paginated, totalPages,
    user, openConfirm, handleConfirm,
    reload, confirmDialog, setConfirmDialog,
  } = useBranchProducts()

  function openEdit(p: BranchProduct) { setSelected(p); setDialogOpen(true) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Stock por Sucursal</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-muted-foreground">
              {items.length} asignación{items.length !== 1 ? "es" : ""}
            </p>
            {lowStockCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <AlertTriangle size={12} />{lowStockCount} con stock bajo
              </span>
            )}
          </div>
        </div>
        <Button onClick={() => { setSelected(null); setDialogOpen(true) }} size="sm">
          <Plus size={16} className="mr-2" />Asignar producto
        </Button>
      </div>

      <BranchProductsFilters
        search={search} onSearchChange={setSearch}
        filterBranch={filterBranch} onBranchChange={setFilterBranch}
        filterStatus={filterStatus} onStatusChange={setFilterStatus}
        filterStock={filterStock} onStockChange={setFilterStock}
        branches={branches}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
        showBranchFilter={!user?.branch_id}
      />

      <BranchProductsTable
        products={paginated}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        onEdit={openEdit}
        onConfirm={openConfirm}
      />

      {!loading && filtered.length > 0 && (
        <DataTablePagination
          page={page} totalPages={totalPages} pageSize={pageSize}
          filteredCount={filtered.length} totalCount={items.length}
          entityLabel="asignación"
          onPageChange={setPage} onPageSizeChange={setPageSize}
        />
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((d) => ({ ...d, open }))}
        title={confirmDialog.type === "delete" ? "¿Eliminar asignación?" : confirmDialog.item?.is_active ? "¿Desactivar producto?" : "¿Activar producto?"}
        description={
          confirmDialog.type === "delete"
            ? `"${confirmDialog.item?.product_name}" será eliminado de ${confirmDialog.item?.branch_name}.`
            : confirmDialog.item?.is_active
              ? `"${confirmDialog.item?.product_name}" quedará inactivo en ${confirmDialog.item?.branch_name}.`
              : `"${confirmDialog.item?.product_name}" volverá a estar activo en ${confirmDialog.item?.branch_name}.`
        }
        confirmLabel={confirmDialog.type === "delete" ? "Eliminar" : confirmDialog.item?.is_active ? "Desactivar" : "Activar"}
        variant={confirmDialog.type === "delete" ? "destructive" : "default"}
        onConfirm={handleConfirm}
      />

      <BranchProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        branchProduct={selected}
        onSuccess={() => { setDialogOpen(false); reload() }}
      />
    </div>
  )
}