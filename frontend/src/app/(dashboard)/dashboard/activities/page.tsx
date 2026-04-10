"use client"
import { useEffect, useState, useMemo } from "react"
import { sileo } from "sileo"
import { activitiesApi, type Activity } from "@/lib/api/activities"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Activity as ActivityIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDate } from "@/lib/utils"

const ACTION_LABELS: Record<string, string> = {
    create: "Crear", update: "Actualizar", delete: "Eliminar", login: "Login", logout: "Logout",
}

export default function ActivitiesPage() {
    const [items, setItems] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filterAction, setFilterAction] = useState("all")
    const [page, setPage] = useState(1)
    const PAGE_SIZE = 50

    async function load() {
        try {
            setItems(await activitiesApi.list())
        } catch {
            sileo.error({ title: "Error al cargar actividad" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])
    useEffect(() => { setPage(1) }, [search, filterAction])

    const filtered = useMemo(() => items.filter((a) => {
        const matchSearch =
            a.description.toLowerCase().includes(search.toLowerCase()) ||
            a.user_name.toLowerCase().includes(search.toLowerCase()) ||
            a.action.toLowerCase().includes(search.toLowerCase())
        const matchAction = filterAction === "all" || a.action.toLowerCase().includes(filterAction)
        return matchSearch && matchAction
    }), [items, search, filterAction])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Actividad</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Registro de auditoría — últimos {items.length} eventos</p>
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Buscar por descripción o usuario..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Acción" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las acciones</SelectItem>
                        {Object.entries(ACTION_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            {["Acción", "Descripción", "Usuario", "Fecha"].map((h) => (
                                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Cargando...</td></tr>}
                        {!loading && paginated.length === 0 && (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                <div className="flex flex-col items-center gap-2"><ActivityIcon size={32} className="text-muted-foreground/40" />No hay actividad registrada</div>
                            </td></tr>
                        )}
                        {paginated.map((a) => (
                            <tr key={a.id} className="border-t hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3">
                                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{a.action}</code>
                                </td>
                                <td className="px-4 py-3 max-w-xs truncate">{a.description}</td>
                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{a.user_name}</td>
                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(a.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!loading && filtered.length > PAGE_SIZE && (
                <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">{filtered.length} eventos</span>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Página {page} de {totalPages}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></Button>
                    </div>
                </div>
            )}
        </div>
    )
}