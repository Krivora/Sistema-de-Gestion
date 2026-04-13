"use client"
import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTablePagination } from "@/components/shared/table/data-table-pagination"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { CategoryDialog } from "@/features/categories/components/category-dialog"
import { CategoriesTable } from "@/features/categories/components/categories-table"
import { useCategories } from "@/features/categories/hooks/use-categories"
import type { Category } from "@/lib/api/categories"

export default function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Category | null>(null)

  const {
    loading, activeCount,
    search, setSearch,
    page, setPage, pageSize, setPageSize,
    filtered, paginated, totalPages, categories,
    handleActivate, openConfirm, handleConfirm, load,
    confirmDialog, setConfirmDialog,
  } = useCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categorías</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeCount} activa{activeCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => { setSelected(null); setDialogOpen(true) }} size="sm">
          <Plus size={16} className="mr-2" />Nueva categoría
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por nombre o código..." value={search}
          onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <CategoriesTable
        categories={paginated}
        loading={loading}
        hasActiveFilters={!!search}
        onEdit={(cat) => { setSelected(cat); setDialogOpen(true) }}
        onActivate={handleActivate}
        onConfirm={openConfirm}
      />

      {!loading && filtered.length > 0 && (
        <DataTablePagination
          page={page} totalPages={totalPages}
          pageSize={pageSize} filteredCount={filtered.length}
          totalCount={categories.length} entityLabel="categoría"
          onPageChange={setPage} onPageSizeChange={setPageSize}
        />
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((d) => ({ ...d, open }))}
        title={confirmDialog.type === "delete" ? "¿Eliminar categoría?" : "¿Desactivar categoría?"}
        description={confirmDialog.type === "delete"
          ? `"${confirmDialog.category?.name}" será eliminada permanentemente.`
          : `"${confirmDialog.category?.name}" quedará inactiva hasta que la actives de nuevo.`}
        confirmLabel={confirmDialog.type === "delete" ? "Eliminar" : "Desactivar"}
        variant={confirmDialog.type === "delete" ? "destructive" : "default"}
        onConfirm={handleConfirm}
      />

      <CategoryDialog open={dialogOpen} onClose={() => setDialogOpen(false)}
        category={selected} onSuccess={() => { setDialogOpen(false); load() }} />
    </div>
  )
}