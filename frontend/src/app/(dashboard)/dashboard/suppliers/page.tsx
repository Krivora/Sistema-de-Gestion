"use client"
import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTablePagination } from "@/components/shared/table/data-table-pagination"
import { SuppliersTable } from "@/features/suppliers/components/suppliers-table"
import { SupplierDialog } from "@/features/suppliers/components/supplier-dialog"
import { useSuppliers } from "@/features/suppliers/hooks/use-suppliers"
import type { Supplier } from "@/lib/api/suppliers"

export default function SuppliersPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Supplier | null>(null)

  const {
    loading,
    filtered, paginated, activeCount, hasActiveFilters,
    search, setSearch,
    page, setPage, pageSize, setPageSize, totalPages,
    handleDeactivate, reload,
    suppliers,
  } = useSuppliers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Proveedores</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeCount} proveedor{activeCount !== 1 ? "es" : ""} activo{activeCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => { setSelected(null); setDialogOpen(true) }} size="sm">
          <Plus size={16} className="mr-2" />Nuevo proveedor
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <SuppliersTable
        suppliers={paginated}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        onEdit={(s) => { setSelected(s); setDialogOpen(true) }}
        onDeactivate={handleDeactivate}
      />

      {!loading && filtered.length > 0 && (
        <DataTablePagination
          page={page} totalPages={totalPages} pageSize={pageSize}
          filteredCount={filtered.length} totalCount={suppliers.length}
          entityLabel="proveedor" onPageChange={setPage} onPageSizeChange={setPageSize}
        />
      )}

      <SupplierDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        supplier={selected}
        onSuccess={() => { setDialogOpen(false); reload() }}
      />
    </div>
  )
}