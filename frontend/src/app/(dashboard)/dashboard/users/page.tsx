"use client"
import { useEffect, useState, useMemo } from "react"
import { sileo } from "sileo"
import { usersApi, type User } from "@/lib/api/users"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Plus, Search, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate } from "@/lib/utils"
import { getApiError } from "@/lib/input-helpers"
import { UserDialog } from "@/features/users/user-dialog"

const STATUS_VARIANT: Record<User["status"], "default" | "secondary" | "destructive"> = {
    active: "default", inactive: "secondary", deleted: "destructive",
}
const STATUS_LABEL: Record<User["status"], string> = {
    active: "Activo", inactive: "Inactivo", deleted: "Eliminado",
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selected, setSelected] = useState<User | null>(null)
    const [search, setSearch] = useState("")
    const [filterStatus, setFilterStatus] = useState<"all" | User["status"]>("all")
    const [page, setPage] = useState(1)
    const PAGE_SIZE = 25

    async function load() {
        try {
            setUsers(await usersApi.list())
        } catch {
            sileo.error({ title: "Error al cargar usuarios" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])
    useEffect(() => { setPage(1) }, [search, filterStatus])

    function openCreate() { setSelected(null); setDialogOpen(true) }
    function openEdit(u: User) { setSelected(u); setDialogOpen(true) }

    async function handleDeactivate(u: User) {
        try {
            await usersApi.deactivate(u.id)
            sileo.success({ title: `"${u.name}" desactivado` })
            load()
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al desactivar usuario") })
        }
    }

    async function handleDelete(u: User) {
        try {
            await usersApi.delete(u.id)
            sileo.success({ title: `"${u.name}" eliminado` })
            load()
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al eliminar usuario") })
        }
    }

    const filtered = useMemo(() => users.filter((u) => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.role_name.toLowerCase().includes(search.toLowerCase())
        const matchStatus = filterStatus === "all" || u.status === filterStatus
        return matchSearch && matchStatus
    }), [users, search, filterStatus])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    const activeCount = users.filter((u) => u.status === "active").length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Usuarios</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{activeCount} usuario{activeCount !== 1 ? "s" : ""} activo{activeCount !== 1 ? "s" : ""}</p>
                </div>
                <Button onClick={openCreate} size="sm"><Plus size={16} className="mr-2" /> Nuevo usuario</Button>
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Buscar por nombre, email o rol..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            {["Usuario", "Email", "Rol", "Estado", "Creado", ""].map((h) => (
                                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Cargando...</td></tr>}
                        {!loading && paginated.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                <div className="flex flex-col items-center gap-2"><Users size={32} className="text-muted-foreground/40" />No hay usuarios registrados</div>
                            </td></tr>
                        )}
                        {paginated.map((u) => (
                            <tr key={u.id} className="border-t hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3 font-medium">{u.name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                                <td className="px-4 py-3 text-muted-foreground">{u.role_name}</td>
                                <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[u.status]}>{STATUS_LABEL[u.status]}</Badge></td>
                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(u.created_at)}</td>
                                <td className="px-4 py-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}><MoreHorizontal size={16} /></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEdit(u)}>Editar</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {u.status === "active" && <DropdownMenuItem onClick={() => handleDeactivate(u)}>Desactivar</DropdownMenuItem>}
                                            {u.status === "inactive" && <DropdownMenuItem onClick={() => handleDelete(u)} variant="destructive">Eliminar</DropdownMenuItem>}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!loading && filtered.length > PAGE_SIZE && (
                <div className="flex items-center justify-end gap-2 text-sm">
                    <span className="text-muted-foreground">Página {page} de {totalPages}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></Button>
                </div>
            )}

            <UserDialog open={dialogOpen} onClose={() => setDialogOpen(false)} user={selected} onSuccess={() => { setDialogOpen(false); load() }} />
        </div>
    )
}