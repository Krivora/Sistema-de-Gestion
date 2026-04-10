"use client"
import { useEffect, useState, useMemo } from "react"
import { sileo } from "sileo"
import { purchasesApi, type Purchase } from "@/lib/api/purchases"
import { branchesApi, type Branch } from "@/lib/api/branches"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Search, Plus, ChevronLeft, ChevronRight,
    ShoppingCart, Eye, ChevronDown,
} from "lucide-react"
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { PurchaseDetailDialog } from "@/features/purchases/purchase-detail-dialog"

const STATUS_LABEL: Record<Purchase["status"], string> = {
    draft: "Borrador",
    posted: "Publicada",
    cancelled: "Cancelada",
}

const STATUS_VARIANT: Record<Purchase["status"], "default" | "secondary" | "destructive"> = {
    draft: "secondary",
    posted: "default",
    cancelled: "destructive",
}

const PAGE_SIZE_OPTIONS = [10, 25, 50]

function formatCurrency(n: number) {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n)
}

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState<Purchase[]>([])
    const [branches, setBranches] = useState<Branch[]>([])
    const [loading, setLoading] = useState(true)
    const [detailId, setDetailId] = useState<number | null>(null)

    // Filtros
    const [search, setSearch] = useState("")
    const [filterStatus, setFilterStatus] = useState<"all" | Purchase["status"]>("all")
    const [filterBranch, setFilterBranch] = useState<"all" | string>("all")
    const [dateFrom, setDateFrom] = useState("")
    const [dateTo, setDateTo] = useState("")

    // Paginación
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    async function load() {
        try {
            const [data, branchList] = await Promise.all([
                purchasesApi.list(),
                branchesApi.list(),
            ])
            setPurchases(data)
            setBranches(branchList)
        } catch {
            sileo.error({ title: "Error al cargar compras" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])
    useEffect(() => { setPage(1) }, [search, filterStatus, filterBranch, dateFrom, dateTo, pageSize])

    const filtered = useMemo(() => {
        return purchases.filter((p) => {
            const matchSearch =
                p.doc_no.toLowerCase().includes(search.toLowerCase()) ||
                p.branch_name.toLowerCase().includes(search.toLowerCase()) ||
                p.user_name.toLowerCase().includes(search.toLowerCase())
            const matchStatus = filterStatus === "all" || p.status === filterStatus
            const matchBranch = filterBranch === "all" || String(p.branch_id) === filterBranch
            const matchFrom = !dateFrom || p.created_at >= dateFrom
            const matchTo = !dateTo || p.created_at <= dateTo + "T23:59:59"
            return matchSearch && matchStatus && matchBranch && matchFrom && matchTo
        })
    }, [purchases, search, filterStatus, filterBranch, dateFrom, dateTo])

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)
    const hasActiveFilters = search || filterStatus !== "all" || filterBranch !== "all" || dateFrom || dateTo

    function clearFilters() {
        setSearch("")
        setFilterStatus("all")
        setFilterBranch("all")
        setDateFrom("")
        setDateTo("")
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Compras</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {purchases.filter((p) => p.status === "posted").length} compras registradas
                    </p>
                </div>
                <Button size="sm">
                    <Link href="/dashboard/purchases/new" className={buttonVariants({ size: "sm" })}>
                        <Plus size={16} className="mr-2" />
                        Nueva compra
                    </Link>
                </Button>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por folio, sucursal o usuario..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="posted">Publicadas</SelectItem>
                        <SelectItem value="draft">Borradores</SelectItem>
                        <SelectItem value="cancelled">Canceladas</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterBranch} onValueChange={setFilterBranch}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sucursal" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las sucursales</SelectItem>
                        {branches.map((b) => (
                            <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Rango de fechas */}
                <div className="flex items-center gap-2">
                    <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-[145px] text-sm"
                    />
                    <span className="text-muted-foreground text-sm">—</span>
                    <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-[145px] text-sm"
                    />
                </div>

                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                        Limpiar filtros
                    </Button>
                )}
            </div>

            {/* Tabla */}
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            {["Folio", "Sucursal", "Usuario", "Estado", "Fecha", ""].map((h) => (
                                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                    Cargando...
                                </td>
                            </tr>
                        )}
                        {!loading && paginated.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <ShoppingCart size={32} className="text-muted-foreground/40" />
                                        {hasActiveFilters ? "Sin resultados para los filtros aplicados" : "No hay compras registradas"}
                                    </div>
                                </td>
                            </tr>
                        )}
                        {paginated.map((purchase) => (
                            <tr key={purchase.id} className="border-t hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3">
                                    <span className="font-mono font-medium">{purchase.doc_no}</span>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{purchase.branch_name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{purchase.user_name}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={STATUS_VARIANT[purchase.status]}>
                                        {STATUS_LABEL[purchase.status]}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                    {formatDate(purchase.created_at)}
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => setDetailId(purchase.id)}
                                        className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}
                                    >
                                        <Eye size={15} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {!loading && filtered.length > 0 && (
                <div className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <span>
                            {filtered.length === purchases.length
                                ? `${purchases.length} compra${purchases.length !== 1 ? "s" : ""}`
                                : `${filtered.length} de ${purchases.length} compras`}
                        </span>
                        <span className="text-border">|</span>
                        <div className="flex items-center gap-2">
                            <span>Mostrar</span>
                            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAGE_SIZE_OPTIONS.map((n) => (
                                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span>por página</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Página {page} de {totalPages}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8"
                            onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                            <ChevronLeft size={14} />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                            <ChevronRight size={14} />
                        </Button>
                    </div>
                </div>
            )}

            <PurchaseDetailDialog
                purchaseId={detailId}
                onClose={() => setDetailId(null)}
            />
        </div>
    )
}