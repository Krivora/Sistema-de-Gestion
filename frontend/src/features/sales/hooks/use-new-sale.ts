"use client"
import { useEffect, useState, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { sileo } from "sileo"
import { salesApi, type SaleItemDto, type SalePackageDto } from "@/lib/api/sales"
import { branchesApi, type Branch } from "@/lib/api/branches"
import { customersApi, type Customer } from "@/lib/api/customers"
import { branchProductsApi, type BranchProduct } from "@/lib/api/branch-products"
import { packagesApi, type Package, type PackageKind } from "@/lib/api/packages"
import { getApiError, onlyDecimals, onlyDigits, toInputNumber } from "@/lib/input-helpers"
import { useAuthStore } from "@/store/auth.store"

export interface CartItem {
    product_id: number
    product_name: string
    sku: string
    qty: string
    unit_price: string
    current_stock: number
    min_stock: number
}

/** Un producto dentro de un paquete del carrito. `qty` es por paquete. */
export interface CartPackageItem {
    product_id: number
    product_name: string
    sku: string
    qty: number
}

export interface CartPackage {
    /** Identificador local: el mismo paquete puede ir dos veces con contenidos distintos */
    uid: string
    package_id: number
    name: string
    code: string
    kind: PackageKind
    /** Cuántos paquetes iguales */
    qty: string
    /** Precio de un paquete, tal como está en el catálogo */
    unit_price: number
    items: CartPackageItem[]
}

export interface StockWarning {
    product_id: number
    product_name: string
    needed: number
    available: number
}

export function useNewSale(saleId?: number) {
    const user = useAuthStore((s) => s.user)
    const router = useRouter()
    const isEdit = !!saleId

    const [branches, setBranches] = useState<Branch[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const [branchProducts, setBranchProducts] = useState<BranchProduct[]>([])
    const [catalogPackages, setCatalogPackages] = useState<Package[]>([])
    const [branchId, setBranchId] = useState<string>(user?.branch_id ? String(user.branch_id) : "")
    const [customerId, setCustomerId] = useState<string>("")
    const [customerName, setCustomerName] = useState("")
    const [customerPhone, setCustomerPhone] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("EFECTIVO")
    const [paymentType, setPaymentType] = useState<"contado" | "credito">("contado")
    const [docNo, setDocNo] = useState("")
    const [cart, setCart] = useState<CartItem[]>([])
    const [cartPackages, setCartPackages] = useState<CartPackage[]>([])
    // Paquete armable que se está llenando. `uid` presente = se está editando uno ya agregado.
    const [builder, setBuilder] = useState<{ pkg: Package; uid: string | null } | null>(null)
    const [productSearch, setProductSearch] = useState("")
    const [packageSearch, setPackageSearch] = useState("")
    const [barcode, setBarcode] = useState("")
    const scannerRef = useRef<HTMLInputElement>(null)
    const [searchOpen, setSearchOpen] = useState(false)
    const [packageSearchOpen, setPackageSearchOpen] = useState(false)
    const [customerSearch, setCustomerSearch] = useState("")
    const [customerSearchOpen, setCustomerSearchOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingSale, setLoadingSale] = useState(isEdit)
    const [loadingProducts, setLoadingProducts] = useState(false)
    const [postSale, setPostSale] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const packageSearchRef = useRef<HTMLDivElement>(null)
    const customerSearchRef = useRef<HTMLDivElement>(null)


    useEffect(() => {
        Promise.all([branchesApi.list(), customersApi.list()]).then(([b, c]) => {
            setBranches(b.filter((br) => br.is_active))
            setCustomers(c.filter((cu) => cu.is_active))
        })
        // Sin permiso de paquetes la venta sigue funcionando: solo no se ofrecen.
        packagesApi.list()
            .then((p) => setCatalogPackages(p.filter((x) => x.status === "active")))
            .catch(() => setCatalogPackages([]))
    }, [])

    // Modo edición: carga la venta y precarga el formulario
    useEffect(() => {
        if (!saleId) return
        setLoadingSale(true)
        salesApi.get(saleId)
            .then((sale) => {
                if (sale.status !== "open") {
                    sileo.error({ title: "Solo las ventas abiertas pueden editarse" })
                    router.replace("/dashboard/sales")
                    return
                }
                setBranchId(String(sale.branch_id))
                setPaymentMethod(sale.payment_method || "EFECTIVO")
                setPaymentType(sale.payment_type === "credito" ? "credito" : "contado")
                setDocNo(sale.doc_no ?? "")

                const name = sale.customer_name_full ?? sale.customer_name ?? ""
                setCustomerId(sale.customer_id ? String(sale.customer_id) : "")
                setCustomerName(name)
                setCustomerPhone(sale.customer_phone ?? "")
                setCustomerSearch(sale.customer_id ? name : "")

                const salePackages = sale.packages ?? []
                const groups = new Map<number, CartPackage>()
                for (const sp of salePackages) {
                    // Sin package_id el paquete ya no existe en el catálogo y no se
                    // puede volver a mandar: sus productos se quedan como sueltos.
                    if (!sp.package_id) continue
                    groups.set(sp.id, {
                        uid: `sp-${sp.id}`,
                        package_id: sp.package_id,
                        name: sp.name,
                        code: sp.package_code ?? "",
                        kind: sp.package_kind ?? "fixed",
                        qty: toInputNumber(sp.qty) || "1",
                        unit_price: sp.unit_price,
                        items: [],
                    })
                }

                const loose: CartItem[] = []
                for (const it of sale.items ?? []) {
                    const group = it.sale_package_id ? groups.get(it.sale_package_id) : undefined
                    if (!group) {
                        loose.push({
                            product_id: it.product_id,
                            product_name: it.product_name,
                            sku: it.sku,
                            qty: toInputNumber(it.qty),
                            unit_price: toInputNumber(it.unit_price),
                            current_stock: 0,
                            min_stock: 0,
                        })
                        continue
                    }
                    // En la venta la cantidad ya viene multiplicada por el número
                    // de paquetes; aquí se guarda por paquete.
                    const perPackage = Number(group.qty) > 0 ? it.qty / Number(group.qty) : it.qty
                    group.items.push({
                        product_id: it.product_id,
                        product_name: it.product_name,
                        sku: it.sku,
                        qty: perPackage,
                    })
                }

                setCart(loose)
                setCartPackages([...groups.values()].filter((g) => g.items.length > 0))
            })
            .catch((err) => {
                sileo.error({ title: getApiError(err, "Error al cargar la venta") })
                router.replace("/dashboard/sales")
            })
            .finally(() => setLoadingSale(false))
    }, [saleId])

    useEffect(() => {
        if (!branchId || !Number.isFinite(Number(branchId))) { setBranchProducts([]); return }
        setLoadingProducts(true)
        branchProductsApi.listByBranch(Number(branchId))
            .then((data) => setBranchProducts(data.filter((p) => p.is_active)))
            .finally(() => setLoadingProducts(false))
    }, [branchId])

    // Completa stock/mínimos del carrito precargado. Depende también de `cart` porque
    // los productos de la sucursal pueden llegar antes que la venta en modo edición.
    useEffect(() => {
        if (!branchProducts.length) return
        setCart((prev) => {
            let changed = false
            const next = prev.map((c) => {
                const bp = branchProducts.find((p) => p.product_id === c.product_id)
                if (!bp) return c
                if (c.current_stock === bp.current_stock && c.min_stock === bp.min_stock) return c
                changed = true
                return { ...c, current_stock: bp.current_stock, min_stock: bp.min_stock }
            })
            return changed ? next : prev   // misma referencia => React no re-renderiza
        })
    }, [branchProducts, cart])

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node))
                setSearchOpen(false)
            if (packageSearchRef.current && !packageSearchRef.current.contains(e.target as Node))
                setPackageSearchOpen(false)
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

    /**
     * Paquetes ofrecibles en esta sucursal. Un paquete predefinido cuyo contenido
     * no está dado de alta en la sucursal reventaría al guardar, así que se marca
     * como no disponible en vez de dejar que el vendedor lo intente.
     */
    const filteredPackages = useMemo(() => {
        const branchIds = new Set(branchProducts.map((p) => p.product_id))
        const q = packageSearch.trim().toLowerCase()

        return catalogPackages
            .filter((p) => !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
            .map((pkg) => {
                const missing = pkg.kind === "fixed"
                    ? pkg.items.filter((i) => !branchIds.has(i.product_id)).length
                    : 0
                return { pkg, available: missing === 0 && branchProducts.length > 0 }
            })
    }, [catalogPackages, packageSearch, branchProducts])

    function addToCart(bp: BranchProduct) {

        setCart((prev) => {
            const existing = prev.find(
                (c) => c.product_id === bp.product_id
            )
            if (existing) {
                return prev.map((c) =>
                    c.product_id === bp.product_id
                        ? {
                            ...c,
                            qty: String(Number(c.qty) + 1)
                        }
                        : c
                )
            }
            return [
                ...prev,
                {
                    product_id: bp.product_id,
                    product_name: bp.product_name,
                    sku: bp.sku,
                    qty: "1",
                    unit_price: toInputNumber(bp.price),
                    current_stock: bp.current_stock,
                    min_stock: bp.min_stock,
                }
            ]
        })

        setProductSearch("")
        setSearchOpen(false)

        setTimeout(() => {
            scannerRef.current?.focus()
        }, 50)
    }

    function removeFromCart(productId: number) {
        setCart((prev) => prev.filter((c) => c.product_id !== productId))
    }

    function updateCart(productId: number, field: "qty" | "unit_price", value: string) {
        const cleaned = field === "qty" ? onlyDigits(value) : onlyDecimals(value)
        setCart((prev) => prev.map((c) => c.product_id === productId ? { ...c, [field]: cleaned } : c))
    }

    /**
     * Cambiar de sucursal vacía la venta: los precios, el stock y hasta qué
     * paquetes se pueden surtir son distintos en cada una.
     */
    function changeBranch(value: string) {
        setBranchId(value)
        setCart([])
        setCartPackages([])
    }

    function selectCustomer(customer: Customer) {
        setCustomerId(String(customer.id))
        setCustomerName(customer.name)
        setCustomerPhone(customer.phone ?? "")
        setCustomerSearch(customer.name)
        setCustomerSearchOpen(false)
    }

    function clearCustomer() {
        setCustomerId(""); setCustomerName(""); setCustomerPhone(""); setCustomerSearch("")
    }

    /* ── Paquetes ─────────────────────────────────────────── */

    function resolveItemNames(items: { product_id: number; qty: number }[]): CartPackageItem[] {
        return items.map((i) => {
            const bp = branchProducts.find((p) => p.product_id === i.product_id)
            return {
                product_id: i.product_id,
                product_name: bp?.product_name ?? `Producto #${i.product_id}`,
                sku: bp?.sku ?? "",
                qty: i.qty,
            }
        })
    }

    /** Un predefinido entra directo; uno armable abre el armador. */
    function addPackage(pkg: Package) {
        setPackageSearch("")
        setPackageSearchOpen(false)

        if (pkg.kind === "flexible") {
            setBuilder({ pkg, uid: null })
            return
        }

        setCartPackages((prev) => [
            ...prev,
            {
                uid: crypto.randomUUID(),
                package_id: pkg.id,
                name: pkg.name,
                code: pkg.code,
                kind: pkg.kind,
                qty: "1",
                unit_price: pkg.price,
                items: resolveItemNames(pkg.items.map((i) => ({ product_id: i.product_id, qty: i.qty }))),
            },
        ])
    }

    function editPackage(uid: string) {
        const group = cartPackages.find((g) => g.uid === uid)
        if (!group) return
        const pkg = catalogPackages.find((p) => p.id === group.package_id)
        if (!pkg) {
            sileo.error({ title: "Este paquete ya no está en el catálogo" })
            return
        }
        setBuilder({ pkg, uid })
    }

    function confirmBuilder(items: { product_id: number; qty: number }[]) {
        if (!builder) return
        const { pkg, uid } = builder
        const resolved = resolveItemNames(items)

        setCartPackages((prev) => uid
            ? prev.map((g) => (g.uid === uid ? { ...g, items: resolved } : g))
            : [
                ...prev,
                {
                    uid: crypto.randomUUID(),
                    package_id: pkg.id,
                    name: pkg.name,
                    code: pkg.code,
                    kind: pkg.kind,
                    qty: "1",
                    unit_price: pkg.price,
                    items: resolved,
                },
            ]
        )
        setBuilder(null)
    }

    function removePackage(uid: string) {
        setCartPackages((prev) => prev.filter((g) => g.uid !== uid))
    }

    function updatePackageQty(uid: string, value: string) {
        const qty = onlyDigits(value)
        setCartPackages((prev) => prev.map((g) => (g.uid === uid ? { ...g, qty } : g)))
    }

    /* ── Totales ──────────────────────────────────────────── */

    const itemsSubtotal = cart.reduce((acc, c) => acc + (Number(c.qty) || 0) * (Number(c.unit_price) || 0), 0)
    const packagesSubtotal = cartPackages.reduce((acc, g) => acc + (Number(g.qty) || 0) * g.unit_price, 0)
    const subtotal = itemsSubtotal + packagesSubtotal

    const totalUnits = cart.reduce((acc, c) => acc + (Number(c.qty) || 0), 0)
        + cartPackages.reduce(
            (acc, g) => acc + g.items.reduce((a, i) => a + i.qty, 0) * (Number(g.qty) || 0), 0
        )

    /**
     * El stock se revisa por producto sumando lo suelto y lo que aportan los
     * paquetes: dos renglones distintos del mismo producto se llevan el mismo
     * inventario, y revisarlos por separado dejaría pasar el sobregiro.
     */
    const stockWarnings = useMemo<StockWarning[]>(() => {
        if (loadingProducts || loadingSale || !branchProducts.length) return []

        const needed = new Map<number, { name: string; qty: number }>()
        const add = (product_id: number, name: string, qty: number) => {
            const prev = needed.get(product_id)
            needed.set(product_id, { name, qty: (prev?.qty ?? 0) + qty })
        }

        cart.forEach((c) => add(c.product_id, c.product_name, Number(c.qty) || 0))
        cartPackages.forEach((g) => {
            const packs = Number(g.qty) || 0
            g.items.forEach((i) => add(i.product_id, i.product_name, i.qty * packs))
        })

        return [...needed.entries()]
            .map(([product_id, { name, qty }]) => ({
                product_id,
                product_name: name,
                needed: qty,
                available: Number(
                    branchProducts.find((p) => p.product_id === product_id)?.current_stock ?? 0
                ),
            }))
            .filter((w) => w.needed > w.available)
    }, [cart, cartPackages, branchProducts, loadingProducts, loadingSale])

    const canSubmit = !!branchId
        && (cart.length > 0 || cartPackages.length > 0)
        && cart.every((c) => Number(c.qty) > 0 && Number(c.unit_price) >= 0)
        && cartPackages.every((g) => Number(g.qty) > 0 && g.items.length > 0)

    async function handleSubmit(post: boolean) {
        if (!canSubmit) return
        setLoading(true)
        try {
            const items: SaleItemDto[] = cart.map((c) => ({
                product_id: c.product_id,
                qty: Number(c.qty),
                unit_price: Number(c.unit_price),
            }))
            // El contenido de un predefinido y el precio de cualquiera los resuelve
            // el servidor desde el catálogo; aquí solo viaja lo que eligió el vendedor.
            const packages: SalePackageDto[] = cartPackages.map((g) => ({
                package_id: g.package_id,
                qty: Number(g.qty),
                ...(g.kind === "flexible"
                    ? { items: g.items.map((i) => ({ product_id: i.product_id, qty: i.qty })) }
                    : {}),
            }))
            const payload = {
                branch_id: Number(branchId),
                customer_id: customerId ? Number(customerId) : null,
                customer_name: !customerId && customerName ? customerName : undefined,
                customer_phone: !customerId && customerPhone ? customerPhone : undefined,
                payment_method: paymentMethod,
                doc_no: docNo || undefined,
                items,
                packages,
            }

            // Una venta a abonos nace abierta por definición: se salda con
            // abonos y se publica después, desde el diálogo de abonos.
            if (!isEdit && paymentType === "credito") {
                const created = await salesApi.create({ ...payload, payment_type: "credito", post: false })
                sileo.success({
                    title: "Venta a abonos registrada",
                    description: `Registra los abonos de ${created.doc_no} para poder publicarla`,
                })
                router.push("/dashboard/sales")
                return
            }

            if (isEdit) {
                await salesApi.update(saleId!, payload)
                if (post) await salesApi.post(saleId!)
                sileo.success({ title: post ? "Venta actualizada y publicada" : "Cambios guardados" })
            } else {
                await salesApi.create({ ...payload, post })
                sileo.success({ title: post ? "Venta registrada y publicada" : "Venta guardada como abierta" })
            }
            router.push("/dashboard/sales")
        } catch (err) {
            sileo.error({ title: getApiError(err, isEdit ? "Error al actualizar venta" : "Error al registrar venta") })
        } finally {
            setLoading(false)
        }
    }

    function handleBarcodeScan(value: string) {

    const sku = value.trim()

    if (!sku) return


    const product = branchProducts.find(
        (p) => p.sku === sku
    )

    if (!product) {
            sileo.error({
                title: `Producto no encontrado: ${sku}`
            })
            setBarcode("")
            return
        }
        addToCart(product)
        setBarcode("")

    }

    return {
        handleSubmitOpen:  () => handleSubmit(false),
        handleSubmitPost:  () => handleSubmit(true),
        // state
        branches, customers, branchId, customerId, customerName, customerPhone,
        paymentMethod, docNo, cart, productSearch, searchOpen, customerSearch, barcode, scannerRef,
        customerSearchOpen, loading, loadingSale, loadingProducts, subtotal, stockWarnings, canSubmit,
        isEdit, paymentType, setPaymentType,
        filteredProducts, filteredCustomers,
        postSale, setPostSale,
        totalUnits, itemsSubtotal, packagesSubtotal,
        // paquetes
        cartPackages, builder, packageSearch, packageSearchOpen, packageSearchRef,
        filteredPackages, branchProducts,
        // refs
        searchRef, customerSearchRef,
        setCustomerName,
        setCustomerPhone,
        // setters
        setBranchId, changeBranch, setPaymentMethod, setDocNo, setProductSearch, setSearchOpen,
        setCustomerSearch, setCustomerSearchOpen, setPackageSearch, setPackageSearchOpen,
        // actions
        addToCart, removeFromCart, updateCart, selectCustomer, clearCustomer,
        handleSubmit, handleBarcodeScan, setBarcode,
        addPackage, editPackage, removePackage, updatePackageQty,
        confirmBuilder, cancelBuilder: () => setBuilder(null),
    }
}
