"use client"
import { useEffect, useState, useMemo } from "react"
import { sileo } from "sileo"
import { adjustmentsApi, type Adjustment } from "@/lib/api/adjustments"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Plus, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate } from "@/lib/utils"
import { AdjustmentDialog } from "@/features/adjustments/adjustment-dialog"
import { AdjustmentDetailDialog } from "@/features/adjustments/adjustment-detail-dialog"

export default function AdjustmentsPage() {
    const [items, setItems] = useState<Adjustment[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [detailId, setDetailId] = useState<number | null>(null)
    const [search, setSearch] = useState("")
    const [filterType, setFilterType] = useState<"all" | "ADJUSTMENT_IN" | "ADJUSTMENT_OUT">("all")
    const [page, setPage] = useState(1)
    const PAGE_SIZE = 25

    async function load() {
        try {
            console.log(await adjustmentsApi.list())
            setItems(await adjustmentsApi.list())
        } catch {
            sileo.error({ title: "Error al cargar ajustes" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])
    useEffect(() => { setPage(1) }, [search, filterType])

    const filtered = useMemo(() => {
        if (!Array.isArray(items)) return []

        return items.filter((a) => {
            const matchSearch =
                a.doc_no.toLowerCase().includes(search.toLowerCase()) ||
                a.branch_name.toLowerCase().includes(search.toLowerCase()) ||
                a.user_name.toLowerCase().includes(search.toLowerCase())

            const matchType = filterType === "all" || a.type === filterType

            return matchSearch && matchType
        })
    }, [items, search, filterType])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Ajustes de inventario</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{items.length} ajuste{items.length !== 1 ? "s" : ""} registrado{items.length !== 1 ? "s" : ""}</p>
                </div>
                <Button onClick={() => setDialogOpen(true)} size="sm">
                    <Plus size={16} className="mr-2" /> Nuevo ajuste
                </Button>
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-50 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Buscar por doc, sucursal o usuario..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los tipos</SelectItem>
                        <SelectItem value="ADJUSTMENT_IN">Entrada</SelectItem>
                        <SelectItem value="ADJUSTMENT_OUT">Salida</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            {["Documento", "Tipo", "Sucursal", "Usuario", "Nota", "Fecha", ""].map((h) => (
                                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Cargando...</td></tr>}
                        {!loading && paginated.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                <div className="flex flex-col items-center gap-2"><SlidersHorizontal size={32} className="text-muted-foreground/40" />No hay ajustes registrados</div>
                            </td></tr>
                        )}
                        {paginated.map((a) => (
                            <tr key={a.id} className="border-t hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs font-medium">{a.doc_no}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={a.type === "ADJUSTMENT_IN" ? "success" : "destructive"}>
                                        {a.type === "ADJUSTMENT_IN" ? "Entrada" : "Salida"}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">{a.branch_name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{a.user_name}</td>
                                <td className="px-4 py-3 text-muted-foreground text-xs max-w-40 truncate">{a.note || "—"}</td>
                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(a.created_at)}</td>
                                <td className="px-4 py-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}>
                                            <MoreHorizontal size={16} />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setDetailId(a.id)}>Ver detalle</DropdownMenuItem>
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

            <AdjustmentDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSuccess={() => { setDialogOpen(false); load() }} />
            <AdjustmentDetailDialog open={!!detailId} onClose={() => setDetailId(null)} adjustmentId={detailId} />
        </div>
    )
}