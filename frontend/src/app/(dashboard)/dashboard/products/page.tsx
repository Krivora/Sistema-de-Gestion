"use client"
import { useEffect, useState, useMemo } from "react"
import { sileo } from "sileo"
import { productsApi, type Product } from "@/lib/api/products"
import { categoriesApi, type Category } from "@/lib/api/categories"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Plus, Search, Package, ChevronLeft, ChevronRight } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/utils"
import { getApiError } from "@/lib/input-helpers"
import { ProductDialog } from "@/features/products/product-dialog"

const STATUS_LABEL: Record<Product["status"], string> = {
    active: "Activo",
    inactive: "Inactivo",
    deleted: "Eliminado",
}

const STATUS_VARIANT: Record<Product["status"], "default" | "secondary" | "destructive"> = {
    active: "default",
    inactive: "secondary",
    deleted: "destructive",
}

const PAGE_SIZE_OPTIONS = [10, 25, 50]

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selected, setSelected] = useState<Product | null>(null)

    // Filtros
    const [search, setSearch] = useState("")
    const [filterStatus, setFilterStatus] = useState<"all" | Product["status"]>("all")
    const [filterCategory, setFilterCategory] = useState<"all" | string>("all")

    // Paginación
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    async function load() {
        try {
            const [prods, cats] = await Promise.all([
                productsApi.list(),
                categoriesApi.list(),
            ])
            setProducts(prods)
            setCategories(cats)
        } catch {
            sileo.error({ title: "Error al cargar productos" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    // Resetear página al cambiar filtros
    useEffect(() => { setPage(1) }, [search, filterStatus, filterCategory, pageSize])

    function openCreate() { setSelected(null); setDialogOpen(true) }
    function openEdit(product: Product) { setSelected(product); setDialogOpen(true) }

    async function handleActivate(product: Product) {
        try {
            await productsApi.activate(product.id)
            sileo.success({ title: `"${product.name}" activado` })
            load()
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al activar producto") })
        }
    }

    async function handleDeactivate(product: Product) {
        try {
            await productsApi.deactivate(product.id)
            sileo.success({ title: `"${product.name}" desactivado` })
            load()
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al desactivar producto") })
        }
    }

    async function handleDelete(product: Product) {
        try {
            await productsApi.delete(product.id)
            sileo.success({ title: `"${product.name}" eliminado` })
            load()
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al eliminar producto") })
        }
    }

    // Filtrado
    const filtered = useMemo(() => {
        return products.filter((p) => {
            const matchSearch =
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.sku.toLowerCase().includes(search.toLowerCase()) ||
                p.category_name.toLowerCase().includes(search.toLowerCase())
            const matchStatus = filterStatus === "all" || p.status === filterStatus
            const matchCategory = filterCategory === "all" || String(p.category_id) === filterCategory
            return matchSearch && matchStatus && matchCategory
        })
    }, [products, search, filterStatus, filterCategory])

    // Paginación
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)
    const activeCount = products.filter((p) => p.status === "active").length
    const hasActiveFilters = search || filterStatus !== "all" || filterCategory !== "all"

    function clearFilters() {
        setSearch("")
        setFilterStatus("all")
        setFilterCategory("all")
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Productos</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {activeCount} producto{activeCount !== 1 ? "s" : ""} activo{activeCount !== 1 ? "s" : ""}
                    </p>
                </div>
                <Button onClick={openCreate} size="sm">
                    <Plus size={16} className="mr-2" />
                    Nuevo producto
                </Button>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, SKU o categoría..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="active">Activos</SelectItem>
                        <SelectItem value="inactive">Inactivos</SelectItem>
                        <SelectItem value="deleted">Eliminados</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                                {cat.name}
                            </SelectItem>
                        ))}
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
                            {["Producto", "SKU", "Categoría", "Estado", "Creado", ""].map((h) => (
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
                                        <Package size={32} className="text-muted-foreground/40" />
                                        {hasActiveFilters
                                            ? "Sin resultados para los filtros aplicados"
                                            : "No hay productos registrados"}
                                    </div>
                                </td>
                            </tr>
                        )}
                        {paginated.map((product) => (
                            <tr key={product.id} className="border-t hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                            <Package size={14} className="text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{product.name}</p>
                                            {product.description && (
                                                <p className="text-xs text-muted-foreground truncate">{product.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{product.sku}</td>
                                <td className="px-4 py-3 text-muted-foreground">{product.category_name}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={STATUS_VARIANT[product.status]}>
                                        {STATUS_LABEL[product.status]}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                    {formatDate(product.created_at)}
                                </td>
                                <td className="px-4 py-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger
                                            className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}
                                        >
                                            <MoreHorizontal size={16} />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEdit(product)}>
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {product.status === "active" && (
                                                <DropdownMenuItem onClick={() => handleDeactivate(product)}>
                                                    Desactivar
                                                </DropdownMenuItem>
                                            )}
                                            {product.status === "inactive" && (
                                                <>
                                                    <DropdownMenuItem onClick={() => handleActivate(product)}>
                                                        Activar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(product)}
                                                        variant="destructive"
                                                    >
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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
                            {filtered.length === products.length
                                ? `${products.length} producto${products.length !== 1 ? "s" : ""}`
                                : `${filtered.length} de ${products.length} productos`}
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
                        <span className="text-muted-foreground">
                            Página {page} de {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft size={14} />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            <ChevronRight size={14} />
                        </Button>
                    </div>
                </div>
            )}

            <ProductDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                product={selected}
                onSuccess={() => { setDialogOpen(false); load() }}
            />
        </div>
    )
}