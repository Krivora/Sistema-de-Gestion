"use client"
import { useEffect, useState, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { sileo } from "sileo"
import { salesApi, type SaleItemDto } from "@/lib/api/sales"
import { branchesApi, type Branch } from "@/lib/api/branches"
import { customersApi, type Customer } from "@/lib/api/customers"
import { branchProductsApi, type BranchProduct } from "@/lib/api/branch-products"
import { getApiError, onlyDecimals, onlyDigits } from "@/lib/input-helpers"
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

export function useNewSale() {
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
    const [productSearch, setProductSearch] = useState("")
    const [searchOpen, setSearchOpen] = useState(false)
    const [customerSearch, setCustomerSearch] = useState("")
    const [customerSearchOpen, setCustomerSearchOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingProducts, setLoadingProducts] = useState(false)
    const [postSale, setPostSale] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const customerSearchRef = useRef<HTMLDivElement>(null)


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
        setCart((prev) => [...prev, {
            product_id: bp.product_id,
            product_name: bp.product_name,
            sku: bp.sku,
            qty: "1",
            unit_price: String(bp.price),
            current_stock: bp.current_stock,
            min_stock: bp.min_stock,
        }])
        setProductSearch("")
        setSearchOpen(false)
    }

    function removeFromCart(productId: number) {
        setCart((prev) => prev.filter((c) => c.product_id !== productId))
    }

    function updateCart(productId: number, field: "qty" | "unit_price", value: string) {
        const cleaned = field === "qty" ? onlyDigits(value) : onlyDecimals(value)
        setCart((prev) => prev.map((c) => c.product_id === productId ? { ...c, [field]: cleaned } : c))
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

    const subtotal = cart.reduce((acc, c) => acc + (Number(c.qty) || 0) * (Number(c.unit_price) || 0), 0)
    const stockWarnings = cart.filter((c) => Number(c.qty) > c.current_stock)
    const canSubmit = branchId && cart.length > 0 && cart.every((c) => Number(c.qty) > 0 && Number(c.unit_price) >= 0)

    async function handleSubmit(post: boolean) {
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
                post,
            })
            sileo.success({ title: post ? "Venta registrada y publicada" : "Venta guardada como abierta" })
            router.push("/dashboard/sales")
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al registrar venta") })
        } finally {
            setLoading(false)
        }
    }

    return {
        handleSubmitOpen:  () => handleSubmit(false),
        handleSubmitPost:  () => handleSubmit(true),
        // state
        branches, customers, branchId, customerId, customerName, customerPhone,
        paymentMethod, docNo, cart, productSearch, searchOpen, customerSearch,
        customerSearchOpen, loading, loadingProducts, subtotal, stockWarnings, canSubmit,
        filteredProducts, filteredCustomers,
        postSale, setPostSale,
        // refs
        searchRef, customerSearchRef,
        setCustomerName,
        setCustomerPhone,
        // setters
        setBranchId, setPaymentMethod, setDocNo, setProductSearch, setSearchOpen,
        setCustomerSearch, setCustomerSearchOpen,
        // actions
        addToCart, removeFromCart, updateCart, selectCustomer, clearCustomer, handleSubmit,
    }
}