"use client"
import { useEffect, useState, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { sileo } from "sileo"
import { purchasesApi, type PurchaseItemDto } from "@/lib/api/purchases"
import { branchesApi, type Branch } from "@/lib/api/branches"
import { suppliersApi, type Supplier } from "@/lib/api/suppliers"
import { branchProductsApi, type BranchProduct } from "@/lib/api/branch-products"
import { getApiError, onlyDecimals, onlyDigits } from "@/lib/input-helpers"
import { useAuthStore } from "@/store/auth.store"

export interface CartItem {
    branch_product_id: number
    product_id: number
    product_name: string
    sku: string
    qty: string
    unit_cost: string
    current_stock: number
}

export function useNewPurchase() {
    const user = useAuthStore((s) => s.user)
    const router = useRouter()

    const [branches, setBranches] = useState<Branch[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [branchProducts, setBranchProducts] = useState<BranchProduct[]>([])
    const [branchId, setBranchId] = useState<string>(user?.branch_id ? String(user.branch_id) : "")
    const [supplierId, setSupplierId] = useState<string>("")
    const [docNo, setDocNo] = useState("")
    const [cart, setCart] = useState<CartItem[]>([])
    const [productSearch, setProductSearch] = useState("")
    const [searchOpen, setSearchOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingProducts, setLoadingProducts] = useState(false)

    const searchRef = useRef<HTMLDivElement>(null)

    const selectedBranch = branches.find((b) => String(b.id) === branchId)
    const selectedSupplier = suppliers.find((s) => String(s.id) === supplierId)

    useEffect(() => {
        Promise.all([branchesApi.list(), suppliersApi.list()]).then(([b, s]) => {
            setBranches(b.filter((br) => br.is_active))
            setSuppliers(s.filter((su) => su.is_active))
        })
    }, [])

    useEffect(() => {
        if (!branchId) { setBranchProducts([]); return }
        setLoadingProducts(true)
        branchProductsApi.listByBranch(Number(branchId))
            .then((data) => setBranchProducts(data.filter((p) => p.is_active)))
            .finally(() => setLoadingProducts(false))
    }, [branchId])

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node))
                setSearchOpen(false)
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
    }, [branchProducts, productSearch, cartProductIds])

    function addToCart(bp: BranchProduct) {
        setCart((prev) => [...prev, {
            branch_product_id: bp.id,
            product_id: bp.product_id,
            product_name: bp.product_name,
            sku: bp.sku,
            qty: "1",
            unit_cost: String(bp.cost),
            current_stock: bp.current_stock,
        }])
        setProductSearch("")
        setSearchOpen(false)
    }

    function removeFromCart(productId: number) {
        setCart((prev) => prev.filter((c) => c.product_id !== productId))
    }

    function updateCart(productId: number, field: "qty" | "unit_cost", value: string) {
        const cleaned = field === "qty" ? onlyDigits(value) : onlyDecimals(value)
        setCart((prev) => prev.map((c) => c.product_id === productId ? { ...c, [field]: cleaned } : c))
    }

    const subtotal = cart.reduce((acc, c) => acc + (Number(c.qty) || 0) * (Number(c.unit_cost) || 0), 0)
    const canSubmit = branchId && cart.length > 0 && cart.every((c) => Number(c.qty) > 0 && Number(c.unit_cost) >= 0)

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

    return {
        branches, suppliers, branchId, supplierId, docNo, cart,
        productSearch, searchOpen, loading, loadingProducts,
        subtotal, canSubmit, filteredProducts,
        selectedBranch, selectedSupplier,
        searchRef,
        setBranchId, setSupplierId, setDocNo, setProductSearch, setSearchOpen,
        addToCart, removeFromCart, updateCart, handleSubmit,
    }
}