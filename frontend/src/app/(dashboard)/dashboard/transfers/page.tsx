"use client"
import { useEffect, useState, useMemo } from "react"
import { sileo } from "sileo"
import { transfersApi, type Transfer } from "@/lib/api/transfers"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Plus, Search, ArrowLeftRight, ChevronLeft, ChevronRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"
import { TransferDialog } from "@/features/transfers/transfer-dialog"
import { TransferDetailDialog } from "@/features/transfers/transfer-detail-dialog"

export default function TransfersPage() {
    const [items, setItems] = useState<Transfer[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [detailId, setDetailId] = useState<number | null>(null)
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const PAGE_SIZE = 25

    async function load() {
        try {
            setItems(await transfersApi.list())
        } catch {
            sileo.error({ title: "Error al cargar transferencias" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])
    useEffect(() => { setPage(1) }, [search])

    const filtered = useMemo(() => items.filter((t) =>
        t.doc_no.toLowerCase().includes(search.toLowerCase()) ||
        t.from_branch_name.toLowerCase().includes(search.toLowerCase()) ||
        t.to_branch_name.toLowerCase().includes(search.toLowerCase()) ||
        t.user_name.toLowerCase().includes(search.toLowerCase())
    ), [items, search])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Transferencias</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{items.length} transferencia{items.length !== 1 ? "s" : ""}</p>
                </div>
                <Button onClick={() => setDialogOpen(true)} size="sm">
                    <Plus size={16} className="mr-2" /> Nueva transferencia
                </Button>
            </div>

            <div className="relative max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar por doc, sucursal o usuario..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            {["Documento", "Origen", "", "Destino", "Usuario", "Nota", "Fecha", ""].map((h, i) => (
                                <th key={i} className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Cargando...</td></tr>}
                        {!loading && paginated.length === 0 && (
                            <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                <div className="flex flex-col items-center gap-2"><ArrowLeftRight size={32} className="text-muted-foreground/40" />No hay transferencias registradas</div>
                            </td></tr>
                        )}
                        {paginated.map((t) => (
                            <tr key={t.id} className="border-t hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs font-medium">{t.doc_no}</td>
                                <td className="px-4 py-3">{t.from_branch_name}</td>
                                <td className="px-2 py-3 text-muted-foreground"><ArrowLeftRight size={14} /></td>
                                <td className="px-4 py-3">{t.to_branch_name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{t.user_name}</td>
                                <td className="px-4 py-3 text-muted-foreground text-xs max-w-[140px] truncate">{t.note || "—"}</td>
                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(t.created_at)}</td>
                                <td className="px-4 py-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}>
                                            <MoreHorizontal size={16} />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setDetailId(t.id)}>Ver detalle</DropdownMenuItem>
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

            <TransferDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSuccess={() => { setDialogOpen(false); load() }} />
            <TransferDetailDialog open={!!detailId} onClose={() => setDetailId(null)} transferId={detailId} />
        </div>
    )
}