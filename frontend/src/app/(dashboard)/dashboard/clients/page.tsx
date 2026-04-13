"use client"
import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Can } from "@/components/shared/can"
import { DataTablePagination } from "@/components/shared/table/data-table-pagination"
import { ClientsTable, ClientDialog, LogoDialog } from "@/features/clients/components"
import { useClients } from "@/features/clients/hooks/use-clients"
import type { Client } from "@/lib/api/clients"

export default function ClientsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [logoDialogOpen, setLogoDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Client | null>(null)

  const {
    clients, loading,
    search, setSearch,
    page, setPage, pageSize, setPageSize,
    filtered, paginated, totalPages,
    handleToggle, reload,
  } = useClients()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {clients.length} cliente{clients.length !== 1 ? "s" : ""} registrado{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Can role="superadmin">
          <Button onClick={() => { setSelected(null); setDialogOpen(true) }} size="sm">
            <Plus size={16} className="mr-2" />Nuevo cliente
          </Button>
        </Can>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar por nombre, código o email..." value={search}
          onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <ClientsTable
        clients={paginated}
        loading={loading}
        hasActiveFilters={!!search}
        onEdit={(c) => { setSelected(c); setDialogOpen(true) }}
        onLogo={(c) => { setSelected(c); setLogoDialogOpen(true) }}
        onToggle={handleToggle}
      />

      {!loading && filtered.length > 0 && (
        <DataTablePagination
          page={page} totalPages={totalPages} pageSize={pageSize}
          filteredCount={filtered.length} totalCount={clients.length}
          entityLabel="cliente" onPageChange={setPage} onPageSizeChange={setPageSize}
        />
      )}

      <ClientDialog open={dialogOpen} onClose={() => setDialogOpen(false)}
        client={selected} onSuccess={() => { setDialogOpen(false); reload() }} />
      <LogoDialog open={logoDialogOpen} onClose={() => setLogoDialogOpen(false)}
        client={selected} onSuccess={() => { setLogoDialogOpen(false); reload() }} />
    </div>
  )
}