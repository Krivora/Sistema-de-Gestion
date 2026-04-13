"use client"
import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTablePagination } from "@/components/shared/table/data-table-pagination"
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
        handleDeactivate, handleDelete, reload,
    } = useUsers()

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
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, email o rol..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Estado" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="active">Activos</SelectItem>
                        <SelectItem value="inactive">Inactivos</SelectItem>
                        <SelectItem value="deleted">Eliminados</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <UsersTable
                users={paginated}
                loading={loading}
                hasActiveFilters={hasActiveFilters}
                onEdit={(u) => { setSelected(u); setDialogOpen(true) }}
                onDeactivate={handleDeactivate}
                onDelete={handleDelete}
            />

            {!loading && filtered.length > 0 && (
                <DataTablePagination
                    page={page} totalPages={totalPages} pageSize={pageSize}
                    filteredCount={filtered.length} totalCount={users.length}
                    entityLabel="usuario" onPageChange={setPage} onPageSizeChange={setPageSize}
                />
            )}

            <UserDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                user={selected}
                onSuccess={() => { setDialogOpen(false); reload() }}
            />
        </div>
    )
}