"use client"
import { useEffect, useState, useMemo } from "react"
import { sileo } from "sileo"
import { branchProductsApi, type BranchProduct } from "@/lib/api/branch-products"
import { branchesApi, type Branch } from "@/lib/api/branches"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    MoreHorizontal, Plus, Search, Package,
    ChevronLeft, ChevronRight, AlertTriangle,
} from "lucide-react"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { getApiError } from "@/lib/input-helpers"
import { useAuthStore } from "@/store/auth.store"
import { BranchProductDialog } from "@/features/branch-products/branch-product-dialog"

const PAGE_SIZE_OPTIONS = [10, 25, 50]

function formatCurrency(value: number, currency = "MXN") {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(value)
}

export default function BranchProductsPage() {
    const user = useAuthStore((s) => s.user)
    const [items, setItems] = useState<BranchProduct[]>([])
    const [branches, setBranches] = useState<Branch[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selected, setSelected] = useState<BranchProduct | null>(null)

    // Filtros
    const [search, setSearch] = useState("")
    const [filterBranch, setFilterBranch] = useState<"all" | string>(
        user?.branch_id ? String(user.branch_id) : "all"
    )
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
    const [filterStock, setFilterStock] = useState<"all" | "low">("all")

    // Paginación
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    async function load() {
        try {
            const [data, branchList] = await Promise.all([
                branchProductsApi.list(),
                branchesApi.list(),
            ])
            setItems(data)
            setBranches(branchList.filter((b) => b.is_active))
        } catch {
            sileo.error({ title: "Error al cargar stock" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])
    useEffect(() => { setPage(1) }, [search, filterBranch, filterStatus, filterStock, pageSize])

    function openCreate() { setSelected(null); setDialogOpen(true) }
    function openEdit(item: BranchProduct) { setSelected(item); setDialogOpen(true) }

    async function handleToggle(item: BranchProduct) {
        try {
            await branchProductsApi.toggleStatus(item.id, !item.is_active)
            sileo.success({ title: `"${item.product_name}" ${item.is_active ? "desactivado" : "activado"}` })
            load()
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al cambiar estado") })
        }
    }

    async function handleDelete(item: BranchProduct) {
        try {
            await branchProductsApi.delete(item.id)
            sileo.success({ title: `"${item.product_name}" eliminado de ${item.branch_name}` })
            load()
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al eliminar") })
        }
    }

    // Filtrado
    const filtered = useMemo(() => {
        return items.filter((i) => {
            const matchSearch =
                i.product_name.toLowerCase().includes(search.toLowerCase()) ||
                i.sku.toLowerCase().includes(search.toLowerCase()) ||
                i.branch_name.toLowerCase().includes(search.toLowerCase())
            const matchBranch = filterBranch === "all" || String(i.branch_id) === filterBranch
            const matchStatus = filterStatus === "all" || (filterStatus === "active" ? i.is_active : !i.is_active)
            const matchStock = filterStock === "all" || (filterStock === "low" && i.current_stock <= i.min_stock)
            return matchSearch && matchBranch && matchStatus && matchStock
        })
    }, [items, search, filterBranch, filterStatus, filterStock])

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)
    const hasActiveFilters = search || filterBranch !== "all" || filterStatus !== "all" || filterStock !== "all"
    const lowStockCount = items.filter((i) => i.is_active && i.current_stock <= i.min_stock).length

    function clearFilters() {
        setSearch("")
        setFilterBranch(user?.branch_id ? String(user.branch_id) : "all")
        setFilterStatus("all")
        setFilterStock("all")
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Stock por Sucursal</h1>
                    <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-sm text-muted-foreground">
                            {items.length} asignación{items.length !== 1 ? "es" : ""}
                        </p>
                        {lowStockCount > 0 && (
                            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                                <AlertTriangle size={12} />
                                {lowStockCount} con stock bajo
                            </span>
                        )}
                    </div>
                </div>
                <Button onClick={openCreate} size="sm">
                    <Plus size={16} className="mr-2" />
                    Asignar producto
                </Button>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-50 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por producto, SKU o sucursal..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Filtro sucursal — solo si no tiene branch_id fijo */}
                {!user?.branch_id && (
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
                )}

                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                    <SelectTrigger className="w-35">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Activos</SelectItem>
                        <SelectItem value="inactive">Inactivos</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterStock} onValueChange={(v) => setFilterStock(v as typeof filterStock)}>
                    <SelectTrigger className="w-37.5">
                        <SelectValue placeholder="Stock" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todo el stock</SelectItem>
                        <SelectItem value="low">Stock bajo</SelectItem>
                    </SelectContent>
                </Select>

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
                            {["Producto", "Sucursal", "Costo", "Precio", "Utilidad", "Stock", "Mín.", "Estado", ""].map((h) => (
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
                                        <Package size={32} className="text-muted-foreground/40" />
                                        {hasActiveFilters
                                            ? "Sin resultados para los filtros aplicados"
                                            : "No hay productos asignados a sucursales"}
                                    </div>
                                </td>
                            </tr>
                        )}
                        {paginated.map((item) => {
                            const isLowStock = item.is_active && item.current_stock <= item.min_stock
                            return (
                                <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                                    {/* Producto */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                                <Package size={14} className="text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium truncate">{item.product_name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{item.branch_name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(item.cost, item.currency)}</td>
                                    <td className="px-4 py-3 font-medium">{formatCurrency(item.price, item.currency)}</td>
                                    <td className="px-4 py-3">
                                        <span className={item.price - item.cost > 0 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-red-500 font-medium"}>
                                            {formatCurrency(item.price - item.cost, item.currency)}
                                        </span>
                                    </td>
                                    {/* Stock con alerta */}
                                    <td className="px-4 py-3">
                                        <span
                                            className={`flex items-center gap-1.5 font-semibold ${isLowStock ? "text-amber-600 dark:text-amber-400" : ""
                                                }`}
                                        >
                                            {isLowStock && <AlertTriangle size={13} />}
                                            {Math.floor(item.current_stock)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{Math.floor(item.min_stock)}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={item.is_active ? "default" : "secondary"}>
                                            {item.is_active ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger
                                                className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}
                                            >
                                                <MoreHorizontal size={16} />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEdit(item)}>
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleToggle(item)}>
                                                    {item.is_active ? "Desactivar" : "Activar"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(item)}
                                                    variant="destructive"
                                                >
                                                    Eliminar asignación
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {!loading && filtered.length > 0 && (
                <div className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <span>
                            {filtered.length === items.length
                                ? `${items.length} asignación${items.length !== 1 ? "es" : ""}`
                                : `${filtered.length} de ${items.length} asignaciones`}
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
                        <Button
                            variant="outline" size="icon" className="h-8 w-8"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft size={14} />
                        </Button>
                        <Button
                            variant="outline" size="icon" className="h-8 w-8"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            <ChevronRight size={14} />
                        </Button>
                    </div>
                </div>
            )}

            <BranchProductDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                branchProduct={selected}
                onSuccess={() => { setDialogOpen(false); load() }}
            />
        </div>
    )
}