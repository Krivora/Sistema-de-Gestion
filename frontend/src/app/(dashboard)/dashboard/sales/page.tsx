"use client"
import { useEffect, useState, useMemo } from "react"
import { sileo } from "sileo"
import { salesApi, type Sale, PAYMENT_METHODS } from "@/lib/api/sales"
import { branchesApi, type Branch } from "@/lib/api/branches"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Search, Plus, ChevronLeft, ChevronRight,
    ShoppingBag, Eye, FileDown
} from "lucide-react"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { SaleDetailDialog } from "@/features/sales/sale-detail-dialog"
import { useAuthStore } from "@/store/auth.store"
import { generateSaleReceipt } from "@/lib/pdf/sale-receipt"
const STATUS_LABEL: Record<Sale["status"], string> = {
    open: "Abierta",
    posted: "Publicada",
    cancelled: "Cancelada",
}

const STATUS_VARIANT: Record<Sale["status"], "default" | "secondary" | "destructive"> = {
    open: "secondary",
    posted: "default",
    cancelled: "destructive",
}

const PAGE_SIZE_OPTIONS = [10, 25, 50]

function formatCurrency(n: number) {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n)
}

export default function SalesPage() {
    const user = useAuthStore((s) => s.user)
    const [sales, setSales] = useState<Sale[]>([])
    const [branches, setBranches] = useState<Branch[]>([])
    const [loading, setLoading] = useState(true)
    const [detailId, setDetailId] = useState<number | null>(null)

    // Filtros
    const [search, setSearch] = useState("")
    const [filterStatus, setFilterStatus] = useState<"all" | Sale["status"]>("all")
    const [filterBranch, setFilterBranch] = useState<"all" | string>("all")
    const [filterPayment, setFilterPayment] = useState<"all" | string>("all")
    const [dateFrom, setDateFrom] = useState("")
    const [dateTo, setDateTo] = useState("")

    // Paginación
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    async function load() {
        try {
            const [data, branchList] = await Promise.all([
                salesApi.list(),
                branchesApi.list(),
            ])
            setSales(data)
            setBranches(branchList)
        } catch {
            sileo.error({ title: "Error al cargar ventas" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])
    useEffect(() => { setPage(1) }, [search, filterStatus, filterBranch, filterPayment, dateFrom, dateTo, pageSize])

    const filtered = useMemo(() => {
        return sales.filter((s) => {
            const matchSearch =
                s.doc_no.toLowerCase().includes(search.toLowerCase()) ||
                s.branch_name.toLowerCase().includes(search.toLowerCase()) ||
                s.user_name.toLowerCase().includes(search.toLowerCase()) ||
                (s.customer_name ?? "").toLowerCase().includes(search.toLowerCase())
            const matchStatus = filterStatus === "all" || s.status === filterStatus
            const matchBranch = filterBranch === "all" || String(s.branch_id) === filterBranch
            const matchPayment = filterPayment === "all" || s.payment_method === filterPayment
            const matchFrom = !dateFrom || s.created_at >= dateFrom
            const matchTo = !dateTo || s.created_at <= dateTo + "T23:59:59"
            return matchSearch && matchStatus && matchBranch && matchPayment && matchFrom && matchTo
        })
    }, [sales, search, filterStatus, filterBranch, filterPayment, dateFrom, dateTo])

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)
    const hasActiveFilters = search || filterStatus !== "all" || filterBranch !== "all" || filterPayment !== "all" || dateFrom || dateTo

    function clearFilters() {
        setSearch("")
        setFilterStatus("all")
        setFilterBranch("all")
        setFilterPayment("all")
        setDateFrom("")
        setDateTo("")
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Ventas</h1>
                    <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-sm text-muted-foreground">
                            {sales.filter((s) => s.status === "posted").length} ventas registradas
                        </p>
                    </div>
                </div>
                <Link href="/dashboard/sales/new" className={buttonVariants({ size: "sm" })}>
                    <Plus size={16} className="mr-2" />
                    Nueva venta
                </Link>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-50 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por folio, cliente, sucursal..."
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
                        <SelectItem value="open">Abiertas</SelectItem>
                        <SelectItem value="cancelled">Canceladas</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterBranch} onValueChange={setFilterBranch}>
                    <SelectTrigger className="w-45">
                        <SelectValue placeholder="Sucursal" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las sucursales</SelectItem>
                        {branches.map((b) => (
                            <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filterPayment} onValueChange={setFilterPayment}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los métodos</SelectItem>
                        {PAYMENT_METHODS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                    <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-36.25 text-sm"
                    />
                    <span className="text-muted-foreground text-sm">—</span>
                    <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-36.25 text-sm"
                    />
                </div>

                {hasActiveFilters && (
                    <button onClick={clearFilters} className={buttonVariants({ variant: "ghost", size: "sm" }) + " text-muted-foreground"}>
                        Limpiar filtros
                    </button>
                )}
            </div>

            {/* Tabla */}
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            {["Folio", "Cliente", "Sucursal", "Pago", "Total", "Estado", "Fecha", ""].map((h) => (
                                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                    Cargando...
                                </td>
                            </tr>
                        )}
                        {!loading && paginated.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <ShoppingBag size={32} className="text-muted-foreground/40" />
                                        {hasActiveFilters ? "Sin resultados para los filtros aplicados" : "No hay ventas registradas"}
                                    </div>
                                </td>
                            </tr>
                        )}
                        {paginated.map((sale) => (
                            <tr key={sale.id} className="border-t hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3 font-mono font-medium">{sale.doc_no}</td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {sale.customer_name ?? <span className="italic opacity-50">Sin cliente</span>}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{sale.branch_name}</td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {PAYMENT_METHODS.find((m) => m.value === sale.payment_method)?.label ?? sale.payment_method}
                                </td>
                                <td className="px-4 py-3 font-semibold">{formatCurrency(sale.total)}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={STATUS_VARIANT[sale.status]}>
                                        {STATUS_LABEL[sale.status]}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                    {formatDate(sale.created_at)}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setDetailId(sale.id)}
                                            className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}
                                        >
                                            <Eye size={15} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const opts = {
                                                    businessName: user?.business_name ?? sale.branch_name,
                                                    logoUrl: user?.logo_url,
                                                    phone: user?.phone,
                                                    email: user?.email,
                                                }
                                                if (sale.items) {
                                                    generateSaleReceipt(sale, opts)
                                                } else {
                                                    salesApi.get(sale.id).then(s => generateSaleReceipt(s, opts))
                                                }
                                            }}
                                            className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}
                                        >
                                            <FileDown size={15} />
                                        </button>
                                    </div>
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
                            {filtered.length === sales.length
                                ? `${sales.length} venta${sales.length !== 1 ? "s" : ""}`
                                : `${filtered.length} de ${sales.length} ventas`}
                        </span>
                        <span className="text-border">|</span>
                        <div className="flex items-center gap-2">
                            <span>Mostrar</span>
                            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                                <SelectTrigger className="h-8 w-17.5">
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
                        <button
                            className={buttonVariants({ variant: "outline", size: "icon" }) + " h-8 w-8"}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            className={buttonVariants({ variant: "outline", size: "icon" }) + " h-8 w-8"}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            <SaleDetailDialog
                saleId={detailId}
                onClose={() => setDetailId(null)}
            />
        </div>
    )
}