"use client"
import { useEffect, useState, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { sileo } from "sileo"
import { salesApi, type SaleItemDto, PAYMENT_METHODS } from "@/lib/api/sales"
import { branchesApi, type Branch } from "@/lib/api/branches"
import { customersApi, type Customer } from "@/lib/api/customers"
import { branchProductsApi, type BranchProduct } from "@/lib/api/branch-products"
import { getApiError, onlyDecimals, onlyDigits } from "@/lib/input-helpers"
import { Button, buttonVariants } from "@/components/ui/button"
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
    ChevronLeft, ShoppingBag, AlertCircle,
    User, AlertTriangle,
} from "lucide-react"
import { useAuthStore } from "@/store/auth.store"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface CartItem {
    product_id: number
    product_name: string
    sku: string
    qty: string
    unit_price: string
    current_stock: number
    min_stock: number
}

function formatCurrency(n: number) {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n)
}

export default function NewSalePage() {
    const user = useAuthStore((s) => s.user)
    const router = useRouter()

    const [branches, setBranches] = useState<Branch[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const [branchProducts, setBranchProducts] = useState<BranchProduct[]>([])

    const [branchId, setBranchId] = useState<string>(user?.branch_id ? String(user.branch_id) : "")
    const [customerId, setCustomerId] = useState<string>("")
    const [customerName, setCustomerName] = useState("")
    const [customerPhone, setCustomerPhone] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("EFECTIVO")
    const [docNo, setDocNo] = useState("")
    const [cart, setCart] = useState<CartItem[]>([])

    // Buscador productos
    const [productSearch, setProductSearch] = useState("")
    const [searchOpen, setSearchOpen] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)

    // Buscador clientes
    const [customerSearch, setCustomerSearch] = useState("")
    const [customerSearchOpen, setCustomerSearchOpen] = useState(false)
    const customerSearchRef = useRef<HTMLDivElement>(null)

    const [loading, setLoading] = useState(false)
    const [loadingProducts, setLoadingProducts] = useState(false)

    useEffect(() => {
        Promise.all([branchesApi.list(), customersApi.list()]).then(([b, c]) => {
            setBranches(b.filter((br) => br.is_active))
            setCustomers(c.filter((cu) => cu.is_active))
        })
    }, [])

    useEffect(() => {
        if (!branchId) { setBranchProducts([]); return }
        setLoadingProducts(true)
        branchProductsApi.listByBranch(Number(branchId))
            .then((data) => setBranchProducts(data.filter((p) => p.is_active)))
            .finally(() => setLoadingProducts(false))
    }, [branchId])

    // Cerrar dropdowns al click fuera
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node))
                setSearchOpen(false)
            if (customerSearchRef.current && !customerSearchRef.current.contains(e.target as Node))
                setCustomerSearchOpen(false)
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const cartProductIds = cart.map((c) => c.product_id)

    const filteredProducts = useMemo(() => {
        const available = branchProducts.filter((p) => !cartProductIds.includes(p.product_id))
        if (!productSearch.trim()) return available
        const q = productSearch.toLowerCase()
        return available.filter(
            (p) => p.product_name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
        )
    }, [branchProducts, productSearch, cart])

    const filteredCustomers = useMemo(() => {
        if (!customerSearch.trim()) return customers.slice(0, 8)
        const q = customerSearch.toLowerCase()
        return customers.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.phone?.includes(customerSearch) ||
                c.email?.toLowerCase().includes(q)
        ).slice(0, 8)
    }, [customers, customerSearch])

    function addToCart(bp: BranchProduct) {
        setCart((prev) => [
            ...prev,
            {
                product_id: bp.product_id,
                product_name: bp.product_name,
                sku: bp.sku,
                qty: "1",
                unit_price: String(bp.price),
                current_stock: bp.current_stock,
                min_stock: bp.min_stock,
            },
        ])
        setProductSearch("")
        setSearchOpen(false)
    }

    function removeFromCart(productId: number) {
        setCart((prev) => prev.filter((c) => c.product_id !== productId))
    }

    function updateCart(productId: number, field: "qty" | "unit_price", value: string) {
        const cleaned = field === "qty" ? onlyDigits(value) : onlyDecimals(value)
        setCart((prev) =>
            prev.map((c) => c.product_id === productId ? { ...c, [field]: cleaned } : c)
        )
    }

    function selectCustomer(customer: Customer) {
        setCustomerId(String(customer.id))
        setCustomerName(customer.name)
        setCustomerPhone(customer.phone ?? "")
        setCustomerSearch(customer.name)
        setCustomerSearchOpen(false)
    }

    function clearCustomer() {
        setCustomerId("")
        setCustomerName("")
        setCustomerPhone("")
        setCustomerSearch("")
    }

    const subtotal = cart.reduce(
        (acc, c) => acc + (Number(c.qty) || 0) * (Number(c.unit_price) || 0), 0
    )

    // Validar stock suficiente
    const stockWarnings = cart.filter((c) => Number(c.qty) > c.current_stock)

    const canSubmit =
        branchId &&
        cart.length > 0 &&
        cart.every((c) => Number(c.qty) > 0 && Number(c.unit_price) >= 0)

    async function handleSubmit() {
        if (!canSubmit) return
        setLoading(true)
        try {
            const items: SaleItemDto[] = cart.map((c) => ({
                product_id: c.product_id,
                qty: Number(c.qty),
                unit_price: Number(c.unit_price),
            }))
            await salesApi.create({
                branch_id: Number(branchId),
                customer_id: customerId ? Number(customerId) : null,
                customer_name: !customerId && customerName ? customerName : undefined,
                customer_phone: !customerId && customerPhone ? customerPhone : undefined,
                payment_method: paymentMethod,
                doc_no: docNo || undefined,
                items,
            })
            sileo.success({ title: "Venta registrada correctamente" })
            router.push("/dashboard/sales")
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al registrar venta") })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/sales"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft size={16} />
                    Ventas
                </Link>
                <Separator orientation="vertical" className="h-4" />
                <h1 className="text-xl font-semibold">Nueva venta</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Panel izquierdo ── */}
                <div className="lg:col-span-1 space-y-5">
                    {/* Detalles */}
                    <div className="border rounded-lg p-5 space-y-4">
                        <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                            Detalles
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

                        {/* Método de pago */}
                        <div className="space-y-1.5">
                            <Label>Método de pago</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAYMENT_METHODS.map((m) => (
                                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* No. documento */}
                        <div className="space-y-1.5">
                            <Label htmlFor="doc_no">
                                No. de documento
                                <span className="text-xs text-muted-foreground ml-1">(opcional)</span>
                            </Label>
                            <Input
                                id="doc_no"
                                placeholder="Ej. OPC-001"
                                value={docNo}
                                onChange={(e) => setDocNo(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Cliente */}
                    <div className="border rounded-lg p-5 space-y-4">
                        <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                            Cliente
                            <span className="ml-1 normal-case font-normal text-muted-foreground/60">(opcional)</span>
                        </h2>

                        {/* Buscador de clientes */}
                        <div ref={customerSearchRef} className="relative">
                            <div className="relative">
                                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar cliente..."
                                    value={customerSearch}
                                    onChange={(e) => {
                                        setCustomerSearch(e.target.value)
                                        setCustomerSearchOpen(true)
                                        if (!e.target.value) clearCustomer()
                                    }}
                                    onFocus={() => setCustomerSearchOpen(true)}
                                    className="pl-9"
                                />
                                {customerId && (
                                    <button
                                        onClick={clearCustomer}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {customerSearchOpen && filteredCustomers.length > 0 && !customerId && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1 border rounded-lg bg-popover shadow-lg overflow-hidden">
                                    <div className="max-h-[200px] overflow-y-auto">
                                        {filteredCustomers.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => selectCustomer(c)}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors text-left"
                                            >
                                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-semibold text-primary">
                                                    {c.name.slice(0, 1).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">{c.name}</p>
                                                    {c.phone && (
                                                        <p className="text-xs text-muted-foreground">{c.phone}</p>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cliente walk-in (sin seleccionar de la lista) */}
                        {!customerId && (
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="customer_name">Nombre</Label>
                                    <Input
                                        id="customer_name"
                                        placeholder="Nombre del cliente"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="customer_phone">Teléfono</Label>
                                    <Input
                                        id="customer_phone"
                                        placeholder="Teléfono"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(onlyDigits(e.target.value))}
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Cliente seleccionado */}
                        {customerId && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-semibold text-primary">
                                    {customerName.slice(0, 1).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">{customerName}</p>
                                    {customerPhone && (
                                        <p className="text-xs text-muted-foreground">{customerPhone}</p>
                                    )}
                                </div>
                                <Badge variant="secondary" className="text-xs">Registrado</Badge>
                            </div>
                        )}
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
                            <div className="flex justify-between text-muted-foreground">
                                <span>Método de pago</span>
                                <span>{PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-semibold text-base">
                                <span>Total</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                        </div>

                        {stockWarnings.length > 0 && (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs">
                                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                <span>
                                    {stockWarnings.map((w) => w.product_name).join(", ")} supera el stock disponible
                                </span>
                            </div>
                        )}

                        <Button
                            className="w-full"
                            onClick={handleSubmit}
                            disabled={!canSubmit || loading}
                        >
                            <ShoppingBag size={16} className="mr-2" />
                            {loading ? "Registrando..." : "Registrar venta"}
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
                                                    <p className="text-xs text-muted-foreground">Precio</p>
                                                    <p className="text-sm font-semibold">{formatCurrency(bp.price)}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs text-muted-foreground">Stock</p>
                                                    <p className={cn(
                                                        "text-sm font-semibold",
                                                        bp.current_stock <= bp.min_stock && "text-amber-600 dark:text-amber-400"
                                                    )}>
                                                        {bp.current_stock}
                                                    </p>
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

                        {/* Carrito */}
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <ShoppingBag size={36} className="mb-3 opacity-30" />
                                <p className="text-sm">Agrega productos usando el buscador</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <div className="grid grid-cols-[1fr_100px_120px_36px] gap-3 px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    <span>Producto</span>
                                    <span className="text-center">Cantidad</span>
                                    <span className="text-center">Precio unit.</span>
                                    <span />
                                </div>

                                {cart.map((item) => {
                                    const overStock = Number(item.qty) > item.current_stock
                                    return (
                                        <div
                                            key={item.product_id}
                                            className={cn(
                                                "grid grid-cols-[1fr_100px_120px_36px] gap-3 items-center px-3 py-2 rounded-lg transition-colors",
                                                overStock ? "bg-amber-50/50 dark:bg-amber-950/20" : "hover:bg-muted/40"
                                            )}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Package size={12} className="text-primary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">{item.product_name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground font-mono">{item.sku}</span>
                                                        <Badge
                                                            variant={overStock ? "destructive" : "secondary"}
                                                            className="text-[10px] px-1 py-0 h-4"
                                                        >
                                                            Stock: {item.current_stock}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            <Input
                                                value={item.qty}
                                                onChange={(e) => updateCart(item.product_id, "qty", e.target.value)}
                                                inputMode="numeric"
                                                className={cn(
                                                    "h-8 text-center text-sm",
                                                    (!item.qty || Number(item.qty) <= 0 || overStock) && "border-destructive"
                                                )}
                                            />

                                            <Input
                                                value={item.unit_price}
                                                onChange={(e) => updateCart(item.product_id, "unit_price", e.target.value)}
                                                inputMode="decimal"
                                                className={cn(
                                                    "h-8 text-right text-sm",
                                                    item.unit_price === "" && "border-destructive"
                                                )}
                                            />

                                            <button
                                                onClick={() => removeFromCart(item.product_id)}
                                                className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )
                                })}

                                <Separator className="my-2" />

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