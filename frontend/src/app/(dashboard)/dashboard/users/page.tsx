"use client"
import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTablePagination } from "@/components/shared/table/data-table-pagination"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { UsersTable } from "@/features/users/components/users-table"
import { UserDialog } from "@/features/users/components/user-dialog"
import { useUsers } from "@/features/users/hooks/use-users"
import type { User } from "@/lib/api/users"

export default function UsersPage() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selected, setSelected] = useState<User | null>(null)

    const {
        users, loading,
        filtered, paginated, activeCount, hasActiveFilters,
        search, setSearch,
        filterStatus, setFilterStatus,
        page, setPage, pageSize, setPageSize, totalPages,
        handleActivate, openConfirm, handleConfirm,
        reload, confirmDialog, setConfirmDialog,
    } = useUsers()

    const statusLabels = {
        all: "Todos los estados",
        active: "Activos",
        inactive: "Inactivos",
        deleted: "Eliminados",
    } as const

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Usuarios</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {activeCount} usuario{activeCount !== 1 ? "s" : ""} activo{activeCount !== 1 ? "s" : ""}
                    </p>
                </div>
                <Button onClick={() => { setSelected(null); setDialogOpen(true) }} size="sm">
                    <Plus size={16} className="mr-2" />Nuevo usuario
                </Button>
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-50 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, email o rol..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as keyof typeof statusLabels)}>
                    <SelectTrigger className="w-40">
                        <SelectValue>{statusLabels[filterStatus]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{statusLabels.all}</SelectItem>
                        <SelectItem value="active">{statusLabels.active}</SelectItem>
                        <SelectItem value="inactive">{statusLabels.inactive}</SelectItem>
                        <SelectItem value="deleted">{statusLabels.deleted}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <UsersTable
                users={paginated}
                loading={loading}
                hasActiveFilters={hasActiveFilters}
                onEdit={(u) => { setSelected(u); setDialogOpen(true) }}
                onActivate={handleActivate}
                onConfirm={openConfirm}
            />

            {!loading && filtered.length > 0 && (
                <DataTablePagination
                    page={page} totalPages={totalPages} pageSize={pageSize}
                    filteredCount={filtered.length} totalCount={users.length}
                    entityLabel="usuario" onPageChange={setPage} onPageSizeChange={setPageSize}
                />
            )}

            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog((d) => ({ ...d, open }))}
                title={confirmDialog.type === "delete" ? "¿Eliminar usuario?" : "¿Desactivar usuario?"}
                description={confirmDialog.type === "delete"
                    ? `"${confirmDialog.user?.name}" será eliminado permanentemente. Esta acción no se puede deshacer.`
                    : `"${confirmDialog.user?.name}" quedará inactivo hasta que lo actives de nuevo.`}
                confirmLabel={confirmDialog.type === "delete" ? "Eliminar" : "Desactivar"}
                variant="destructive"
                onConfirm={handleConfirm}
            />

            <UserDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                user={selected}
                onSuccess={() => { setDialogOpen(false); reload() }}
            />
        </div>
    )
}