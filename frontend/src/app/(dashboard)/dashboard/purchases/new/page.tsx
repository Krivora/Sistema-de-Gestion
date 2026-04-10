"use client"
import { useEffect, useState, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { sileo } from "sileo"
import { purchasesApi, type PurchaseItemDto } from "@/lib/api/purchases"
import { branchesApi, type Branch } from "@/lib/api/branches"
import { suppliersApi, type Supplier } from "@/lib/api/suppliers"
import { branchProductsApi, type BranchProduct } from "@/lib/api/branch-products"
import { getApiError, onlyDecimals, onlyDigits } from "@/lib/input-helpers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    Search, Plus, Trash2, Package,
    ChevronLeft, ShoppingCart, AlertCircle,
} from "lucide-react"
import { useAuthStore } from "@/store/auth.store"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface CartItem {
    branch_product_id: number
    product_id: number
    product_name: string
    sku: string
    qty: string
    unit_cost: string
    current_stock: number
}

function formatCurrency(n: number) {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n)
}

export default function NewPurchasePage() {
    const user = useAuthStore((s) => s.user)
    const router = useRouter()

    const [branches, setBranches] = useState<Branch[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [branchProducts, setBranchProducts] = useState<BranchProduct[]>([])

    const [branchId, setBranchId] = useState<string>(user?.branch_id ? String(user.branch_id) : "")
    const [supplierId, setSupplierId] = useState<string>("")
    const [docNo, setDocNo] = useState("")
    const [cart, setCart] = useState<CartItem[]>([])

    // Buscador de productos
    const [productSearch, setProductSearch] = useState("")
    const [searchOpen, setSearchOpen] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)

    const [loading, setLoading] = useState(false)
    const [loadingProducts, setLoadingProducts] = useState(false)

    // Cargar sucursales y proveedores
    useEffect(() => {
        Promise.all([branchesApi.list(), suppliersApi.list()]).then(([b, s]) => {
            setBranches(b.filter((br) => br.is_active))
            setSuppliers(s.filter((su) => su.is_active))
        })
    }, [])

    // Cargar productos cuando cambia la sucursal
    useEffect(() => {
        if (!branchId) { setBranchProducts([]); return }
        setLoadingProducts(true)
        branchProductsApi.listByBranch(Number(branchId))
            .then((data) => setBranchProducts(data.filter((p) => p.is_active)))
            .finally(() => setLoadingProducts(false))
    }, [branchId])

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    // Productos filtrados por búsqueda (excluye los ya en el carrito)
    const cartProductIds = cart.map((c) => c.product_id)
    const filteredProducts = useMemo(() => {
        if (!productSearch.trim()) return branchProducts.filter((p) => !cartProductIds.includes(p.product_id))
        const q = productSearch.toLowerCase()
        return branchProducts.filter(
            (p) =>
                !cartProductIds.includes(p.product_id) &&
                (p.product_name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
        )
    }, [branchProducts, productSearch, cart])

    function addToCart(bp: BranchProduct) {
        setCart((prev) => [
            ...prev,
            {
                branch_product_id: bp.id,
                product_id: bp.product_id,
                product_name: bp.product_name,
                sku: bp.sku,
                qty: "1",
                unit_cost: String(bp.cost),
                current_stock: bp.current_stock,
            },
        ])
        setProductSearch("")
        setSearchOpen(false)
    }

    function removeFromCart(productId: number) {
        setCart((prev) => prev.filter((c) => c.product_id !== productId))
    }

    function updateCart(productId: number, field: "qty" | "unit_cost", value: string) {
        const cleaned = field === "qty" ? onlyDigits(value) : onlyDecimals(value)
        setCart((prev) =>
            prev.map((c) => c.product_id === productId ? { ...c, [field]: cleaned } : c)
        )
    }

    const subtotal = cart.reduce((acc, c) => acc + (Number(c.qty) || 0) * (Number(c.unit_cost) || 0), 0)

    const canSubmit = branchId && cart.length > 0 &&
        cart.every((c) => Number(c.qty) > 0 && Number(c.unit_cost) >= 0)

    async function handleSubmit() {
        if (!canSubmit) return
        setLoading(true)
        try {
            const items: PurchaseItemDto[] = cart.map((c) => ({
                product_id: c.product_id,
                qty: Number(c.qty),
                unit_cost: Number(c.unit_cost),
            }))
            await purchasesApi.create({
                branch_id: Number(branchId),
                supplier_id: supplierId ? Number(supplierId) : null,
                doc_no: docNo || undefined,
                items,
            })
            sileo.success({ title: "Compra registrada correctamente" })
            router.push("/dashboard/purchases")
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al registrar compra") })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/purchases"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft size={16} />
                    Compras
                </Link>
                <Separator orientation="vertical" className="h-4" />
                <h1 className="text-xl font-semibold">Nueva compra</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Panel izquierdo: Detalles ── */}
                <div className="lg:col-span-1 space-y-5">
                    <div className="border rounded-lg p-5 space-y-4">
                        <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                            Detalles de la compra
                        </h2>

                        {/* Sucursal */}
                        <div className="space-y-1.5">
                            <Label>Sucursal <span className="text-destructive">*</span></Label>
                            <Select
                                value={branchId}
                                onValueChange={(v) => { setBranchId(v); setCart([]) }}
                                disabled={!!user?.branch_id}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona sucursal" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branches.map((b) => (
                                        <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Proveedor */}
                        <div className="space-y-1.5">
                            <Label>Proveedor <span className="text-xs text-muted-foreground">(opcional)</span></Label>
                            <Select value={supplierId} onValueChange={setSupplierId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sin proveedor" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Sin proveedor</SelectItem>
                                    {suppliers.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Número de documento */}
                        <div className="space-y-1.5">
                            <Label htmlFor="doc_no">
                                No. de documento
                                <span className="text-xs text-muted-foreground ml-1">(opcional)</span>
                            </Label>
                            <Input
                                id="doc_no"
                                placeholder="Ej. FAC-12345"
                                value={docNo}
                                onChange={(e) => setDocNo(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Se autogenera si no se especifica
                            </p>
                        </div>
                    </div>

                    {/* Resumen */}
                    <div className="border rounded-lg p-5 space-y-4">
                        <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                            Resumen
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Productos</span>
                                <span>{cart.length}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Total unidades</span>
                                <span>{cart.reduce((a, c) => a + (Number(c.qty) || 0), 0)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-semibold text-base">
                                <span>Total</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            onClick={handleSubmit}
                            disabled={!canSubmit || loading}
                        >
                            <ShoppingCart size={16} className="mr-2" />
                            {loading ? "Registrando..." : "Registrar compra"}
                        </Button>

                        {!branchId && (
                            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                                <AlertCircle size={12} />
                                Selecciona una sucursal para agregar productos
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Panel derecho: Productos ── */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="border rounded-lg p-5 space-y-4">
                        <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                            Productos
                        </h2>

                        {/* Buscador */}
                        <div ref={searchRef} className="relative">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={
                                        !branchId
                                            ? "Selecciona una sucursal primero..."
                                            : loadingProducts
                                            ? "Cargando productos..."
                                            : "Buscar producto por nombre o SKU..."
                                    }
                                    value={productSearch}
                                    onChange={(e) => { setProductSearch(e.target.value); setSearchOpen(true) }}
                                    onFocus={() => setSearchOpen(true)}
                                    disabled={!branchId || loadingProducts}
                                    className="pl-9"
                                />
                            </div>

                            {/* Dropdown de resultados */}
                            {searchOpen && branchId && filteredProducts.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1 border rounded-lg bg-popover shadow-lg overflow-hidden">
                                    <div className="max-h-[260px] overflow-y-auto">
                                        {filteredProducts.slice(0, 10).map((bp) => (
                                            <button
                                                key={bp.id}
                                                onClick={() => addToCart(bp)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                                            >
                                                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Package size={13} className="text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{bp.product_name}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">{bp.sku}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs text-muted-foreground">Stock actual</p>
                                                    <p className="text-sm font-semibold">{bp.current_stock}</p>
                                                </div>
                                                <Plus size={16} className="text-muted-foreground shrink-0" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {searchOpen && branchId && productSearch && filteredProducts.length === 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1 border rounded-lg bg-popover shadow-sm px-4 py-3 text-sm text-muted-foreground">
                                    Sin resultados para "{productSearch}"
                                </div>
                            )}
                        </div>

                        {/* Lista del carrito */}
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <ShoppingCart size={36} className="mb-3 opacity-30" />
                                <p className="text-sm">Agrega productos usando el buscador</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {/* Header tabla */}
                                <div className="grid grid-cols-[1fr_100px_120px_36px] gap-3 px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    <span>Producto</span>
                                    <span className="text-center">Cantidad</span>
                                    <span className="text-center">Costo unit.</span>
                                    <span />
                                </div>

                                {cart.map((item) => (
                                    <div
                                        key={item.product_id}
                                        className="grid grid-cols-[1fr_100px_120px_36px] gap-3 items-center px-3 py-2 rounded-lg hover:bg-muted/40 transition-colors"
                                    >
                                        {/* Producto */}
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                                <Package size={12} className="text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{item.product_name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground font-mono">{item.sku}</span>
                                                    <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                                        Stock: {item.current_stock}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cantidad */}
                                        <Input
                                            value={item.qty}
                                            onChange={(e) => updateCart(item.product_id, "qty", e.target.value)}
                                            inputMode="numeric"
                                            className={cn(
                                                "h-8 text-center text-sm",
                                                (!item.qty || Number(item.qty) <= 0) && "border-destructive"
                                            )}
                                        />

                                        {/* Costo */}
                                        <Input
                                            value={item.unit_cost}
                                            onChange={(e) => updateCart(item.product_id, "unit_cost", e.target.value)}
                                            inputMode="decimal"
                                            className={cn(
                                                "h-8 text-right text-sm",
                                                item.unit_cost === "" && "border-destructive"
                                            )}
                                        />

                                        {/* Eliminar */}
                                        <button
                                            onClick={() => removeFromCart(item.product_id)}
                                            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}

                                <Separator className="my-2" />

                                {/* Total inline */}
                                <div className="flex justify-end px-3 py-1">
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Total estimado</p>
                                        <p className="text-lg font-bold">{formatCurrency(subtotal)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}