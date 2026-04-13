"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { branchProductsApi, type BranchProduct, type CreateBranchProductDto } from "@/lib/api/branch-products"
import { branchesApi, type Branch } from "@/lib/api/branches"
import { productsApi, type Product } from "@/lib/api/products"
import { getApiError, onlyDecimals, onlyDigits } from "@/lib/input-helpers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthStore } from "@/store/auth.store"
import { cn } from "@/lib/utils"

interface Props {
    open: boolean
    onClose: () => void
    branchProduct: BranchProduct | null
    onSuccess: () => void
}

const EMPTY: CreateBranchProductDto = { branch_id: "", product_id: "", price: "", cost: "", min_stock: "", reorder_point: "", currency: "MXN" }

export function BranchProductDialog({ open, onClose, branchProduct, onSuccess }: Props) {
    const user = useAuthStore((s) => s.user)
    const [form, setForm] = useState<CreateBranchProductDto>(EMPTY)
    const [branches, setBranches] = useState<Branch[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [errors, setErrors] = useState<Partial<Record<keyof CreateBranchProductDto, string>>>({})
    const [loading, setLoading] = useState(false)
    const [optionalOpen, setOptionalOpen] = useState(false)
    const SELECT_WIDTH = "w-full md:w-100";
    useEffect(() => {
        Promise.all([branchesApi.list(), productsApi.list()]).then(([b, p]) => {
            setBranches(b.filter((br) => br.is_active))
            setProducts(p.filter((pr) => pr.status === "active"))
        })
    }, [])

    useEffect(() => {
        if (open) {
            setErrors({})
            setOptionalOpen(false)
            setForm(branchProduct ? {
                branch_id: branchProduct.branch_id,
                product_id: branchProduct.product_id,
                price: branchProduct.price,
                cost: branchProduct.cost,
                min_stock: branchProduct.min_stock,
                reorder_point: branchProduct.reorder_point,
                currency: branchProduct.currency,
            } : { ...EMPTY, branch_id: user?.branch_id ?? "" })
        }
    }, [open, branchProduct, user])

    function handleNumericChange(field: keyof CreateBranchProductDto, value: string, decimals = false) {
        const cleaned = decimals ? onlyDecimals(value) : onlyDigits(value)
        setForm((prev) => ({ ...prev, [field]: cleaned }))
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    function validate(): boolean {
        const e: typeof errors = {}
        if (!form.branch_id) e.branch_id = "Selecciona una sucursal"
        if (!form.product_id) e.product_id = "Selecciona un producto"
        if (form.price === "" || Number(form.price) < 0) e.price = "Ingresa un precio válido"
        if (form.cost === "" || Number(form.cost) < 0) e.cost = "Ingresa un costo válido"
        setErrors(e)
        return Object.keys(e).length === 0
    }

    async function handleSubmit() {
        if (!validate()) return
        setLoading(true)
        try {
            if (branchProduct) {
                await branchProductsApi.update(branchProduct.id, {
                    price: Number(form.price), cost: Number(form.cost), currency: form.currency,
                    min_stock: form.min_stock !== "" ? Number(form.min_stock) : undefined,
                    reorder_point: form.reorder_point !== "" ? Number(form.reorder_point) : undefined,
                })
                sileo.success({ title: "Producto actualizado" })
            } else {
                await branchProductsApi.create({
                    ...form, price: Number(form.price), cost: Number(form.cost),
                    min_stock: form.min_stock !== "" ? Number(form.min_stock) : undefined,
                    reorder_point: form.reorder_point !== "" ? Number(form.reorder_point) : undefined,
                })
                sileo.success({ title: "Producto asignado a sucursal" })
            }
            onSuccess()
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al guardar") })
        } finally { setLoading(false) }
    }

    const isEdit = !!branchProduct
    const selectedBranch = branches.find((b) => String(b.id) === String(form.branch_id))
    const selectedProduct = products.find((p) => String(p.id) === String(form.product_id))

    // Progreso: sucursal, producto, precio, costo
    const filledRequired = [form.branch_id, form.product_id, form.price, form.cost].filter((v) => v !== "" && v !== undefined).length
    const progress = Math.round((filledRequired / 4) * 100)

    // Margen calculado
    const margin = form.price && form.cost && Number(form.price) > 0
        ? (((Number(form.price) - Number(form.cost)) / Number(form.price)) * 100).toFixed(1)
        : null

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-120 p-0 gap-0 overflow-hidden rounded-2xl">

                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b">
                    <div className="space-y-1">
                        <span className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md",
                            isEdit ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        )}>
                            {isEdit ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            )}
                            {isEdit ? "Editar asignación" : "Asignar producto"}
                        </span>
                        <DialogTitle className="text-base font-medium leading-snug text-foreground">
                            {isEdit
                                ? `${branchProduct.product_name} — ${branchProduct.branch_name}`
                                : selectedProduct && selectedBranch
                                    ? `${selectedProduct.name} → ${selectedBranch.name}`
                                    : "¿Qué producto vas a asignar?"}
                        </DialogTitle>
                    </div>
                </div>

                {/* Progreso */}
                <div className="h-0.5 bg-border">
                    <div className="h-full transition-all duration-300 rounded-r-full bg-emerald-500"
                        style={{ width: `${progress}%` }} />
                </div>

                <div className="px-6 py-5 space-y-4">
                    {/* Sucursal */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                            Sucursal <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={form.branch_id ? String(form.branch_id) : ""}
                            onValueChange={(v) => { setForm((p) => ({ ...p, branch_id: Number(v) })); setErrors((p) => ({ ...p, branch_id: undefined })) }}
                            disabled={isEdit || !!user?.branch_id}
                        >
                            <SelectTrigger
                                className={cn(
                                    SELECT_WIDTH,
                                    errors.branch_id && "border-destructive"
                                )}
                            >
                                <SelectValue placeholder="Selecciona una sucursal">
                                    {selectedBranch?.name}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {branches.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {errors.branch_id && <p className="text-[11px] text-destructive flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>{errors.branch_id}</p>}
                    </div>

                    {/* Producto */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                            Producto <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={form.product_id ? String(form.product_id) : ""}
                            onValueChange={(v) => { setForm((p) => ({ ...p, product_id: Number(v) })); setErrors((p) => ({ ...p, product_id: undefined })) }}
                            disabled={isEdit}
                        >
                            <SelectTrigger className={cn(SELECT_WIDTH, errors.product_id && "border-destructive")}>
                                <SelectValue placeholder="Selecciona un producto">
                                    {selectedProduct && (
                                        <span className="flex items-center gap-2">
                                            {selectedProduct.name}
                                            <span className="text-xs text-muted-foreground font-mono">{selectedProduct.sku}</span>
                                        </span>
                                    )}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                        <span>{p.name}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.product_id && <p className="text-[11px] text-destructive flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>{errors.product_id}</p>}
                    </div>

                    {/* Precio + Costo + Moneda */}
                    <div className="grid grid-cols-[1fr_1fr_100px] gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                                Costo <span className="text-destructive">*</span>
                            </Label>
                            <Input placeholder="0.00" value={form.cost} inputMode="decimal"
                                onChange={(e) => handleNumericChange("cost", e.target.value, true)}
                                className={cn(errors.cost && "border-destructive")} />
                            {errors.cost && <p className="text-[11px] text-destructive">{errors.cost}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                                Precio <span className="text-destructive">*</span>
                            </Label>
                            <Input placeholder="0.00" value={form.price} inputMode="decimal"
                                onChange={(e) => handleNumericChange("price", e.target.value, true)}
                                className={cn(errors.price && "border-destructive")} />
                            {errors.price && <p className="text-[11px] text-destructive">{errors.price}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">Moneda</Label>
                            <Select value={form.currency} onValueChange={(v) => setForm((p) => ({ ...p, currency: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MXN">MXN</SelectItem>
                                    <SelectItem value="USD">USD</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Margen calculado */}
                    {margin !== null && (
                        <div className={cn(
                            "flex items-center gap-2 text-xs px-3 py-2 rounded-lg",
                            Number(margin) >= 30 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                : Number(margin) >= 10 ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                                    : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                        )}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                            Margen estimado: <strong>{margin}%</strong>
                        </div>
                    )}

                    {/* Toggle opcionales */}
                    <button type="button" onClick={() => setOptionalOpen((p) => !p)}
                        className="w-full flex items-center gap-3 text-[11px] text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors">
                        <span className="flex-1 h-px bg-border" />
                        Stock y reorden
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className={cn("transition-transform duration-200", optionalOpen && "rotate-180")}>
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                        <span className="flex-1 h-px bg-border" />
                    </button>

                    <div className={cn("grid grid-cols-2 gap-4 overflow-hidden transition-all duration-200",
                        optionalOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                        <div className="overflow-hidden space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">Stock mínimo</Label>
                            <Input placeholder="0" value={form.min_stock} inputMode="numeric"
                                onChange={(e) => handleNumericChange("min_stock", e.target.value)} />
                        </div>
                        <div className="overflow-hidden space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">Punto de reorden</Label>
                            <Input placeholder="0" value={form.reorder_point} inputMode="numeric"
                                onChange={(e) => handleNumericChange("reorder_point", e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex items-center justify-between gap-4">
                    <p className={cn("text-xs transition-colors", progress === 100 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground")}>
                        {progress === 100 ? "✓ Listo para guardar" : `${filledRequired}/4 campos requeridos`}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>Cancelar</Button>
                        <Button size="sm" onClick={handleSubmit} disabled={loading} className="min-w-32.5">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                    Guardando...
                                </span>
                            ) : isEdit ? "Guardar cambios" : "Asignar producto"}
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}