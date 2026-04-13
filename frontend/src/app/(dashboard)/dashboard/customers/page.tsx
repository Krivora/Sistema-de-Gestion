"use client"
import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTablePagination } from "@/components/shared/table/data-table-pagination"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { CustomersTable } from "@/features/customers/components/customers-table"
import { CustomerDialog } from "@/features/customers/components/customer-dialog"
import { useCustomers } from "@/features/customers/hooks/use-customers"
import type { Customer } from "@/lib/api/customers"

export default function CustomersPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Customer | null>(null)

  const {
    customers, loading, activeCount,
    search, setSearch,
    page, setPage, pageSize, setPageSize,
    filtered, paginated, totalPages,
    openConfirm, handleDeactivate,
    reload, confirmDialog, setConfirmDialog,
  } = useCustomers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeCount} cliente{activeCount !== 1 ? "s" : ""} activo{activeCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => { setSelected(null); setDialogOpen(true) }} size="sm">
          <Plus size={16} className="mr-2" />Nuevo cliente
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por nombre, email o teléfono..." value={search}
          onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <CustomersTable
        customers={paginated}
        loading={loading}
        hasActiveFilters={!!search}
        onEdit={(c) => { setSelected(c); setDialogOpen(true) }}
        onConfirm={openConfirm}
      />

      {!loading && filtered.length > 0 && (
        <DataTablePagination
          page={page} totalPages={totalPages} pageSize={pageSize}
          filteredCount={filtered.length} totalCount={customers.length}
          entityLabel="cliente" onPageChange={setPage} onPageSizeChange={setPageSize}
        />
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((d) => ({ ...d, open }))}
        title="¿Desactivar cliente?"
        description={`"${confirmDialog.customer?.name}" quedará inactivo hasta que lo actives de nuevo.`}
        confirmLabel="Desactivar"
        onConfirm={handleDeactivate}
      />

      <CustomerDialog open={dialogOpen} onClose={() => setDialogOpen(false)}
        customer={selected} onSuccess={() => { setDialogOpen(false); reload() }} />
    </div>
  )
}