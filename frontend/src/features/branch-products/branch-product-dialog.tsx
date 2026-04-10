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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useAuthStore } from "@/store/auth.store"

interface Props {
    open: boolean
    onClose: () => void
    branchProduct: BranchProduct | null
    onSuccess: () => void
}

const EMPTY: CreateBranchProductDto = {
    branch_id: "",
    product_id: "",
    price: "",
    cost: "",
    min_stock: "",
    reorder_point: "",
    currency: "MXN",
}

export function BranchProductDialog({ open, onClose, branchProduct, onSuccess }: Props) {
    const user = useAuthStore((s) => s.user)
    const [form, setForm] = useState<CreateBranchProductDto>(EMPTY)
    const [branches, setBranches] = useState<Branch[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [errors, setErrors] = useState<Partial<Record<keyof CreateBranchProductDto, string>>>({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        Promise.all([
            branchesApi.list(),
            productsApi.list(),
        ]).then(([b, p]) => {
            setBranches(b.filter((br) => br.is_active))
            setProducts(p.filter((pr) => pr.status === "active"))
        })
    }, [])

    useEffect(() => {
        if (open) {
            setErrors({})
            if (branchProduct) {
                setForm({
                    branch_id: branchProduct.branch_id,
                    product_id: branchProduct.product_id,
                    price: branchProduct.price,
                    cost: branchProduct.cost,
                    min_stock: branchProduct.min_stock,
                    reorder_point: branchProduct.reorder_point,
                    currency: branchProduct.currency,
                })
            } else {
                setForm({
                    ...EMPTY,
                    // Si el usuario tiene sucursal asignada, preseleccionarla
                    branch_id: user?.branch_id ?? "",
                })
            }
        }
    }, [open, branchProduct, user])

    function handleNumericChange(field: keyof CreateBranchProductDto, value: string, decimals = false) {
        const cleaned = decimals ? onlyDecimals(value) : onlyDigits(value)
        setForm((prev) => ({ ...prev, [field]: cleaned }))
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    function validate(): boolean {
        const newErrors: typeof errors = {}
        if (!form.branch_id) newErrors.branch_id = "Selecciona una sucursal"
        if (!form.product_id) newErrors.product_id = "Selecciona un producto"
        if (form.price === "" || Number(form.price) < 0) newErrors.price = "Ingresa un precio válido"
        if (form.cost === "" || Number(form.cost) < 0) newErrors.cost = "Ingresa un costo válido"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    async function handleSubmit() {
        if (!validate()) return
        setLoading(true)
        try {
            if (branchProduct) {
                await branchProductsApi.update(branchProduct.id, {
                    price: Number(form.price),
                    cost: Number(form.cost),
                    min_stock: form.min_stock !== "" ? Number(form.min_stock) : undefined,
                    reorder_point: form.reorder_point !== "" ? Number(form.reorder_point) : undefined,
                    currency: form.currency,
                })
                sileo.success({ title: "Producto actualizado" })
            } else {
                await branchProductsApi.create({
                    ...form,
                    price: Number(form.price),
                    cost: Number(form.cost),
                    min_stock: form.min_stock !== "" ? Number(form.min_stock) : undefined,
                    reorder_point: form.reorder_point !== "" ? Number(form.reorder_point) : undefined,
                })
                sileo.success({ title: "Producto asignado a sucursal" })
            }
            onSuccess()
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al guardar") })
        } finally {
            setLoading(false)
        }
    }

    const isEdit = !!branchProduct

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Editar producto en sucursal" : "Asignar producto a sucursal"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Sucursal */}
                    <div className="space-y-1.5">
                        <Label>Sucursal <span className="text-destructive">*</span></Label>
                        <Select
                            value={form.branch_id ? String(form.branch_id) : ""}
                            onValueChange={(v) => {
                                setForm((prev) => ({ ...prev, branch_id: Number(v) }))
                                setErrors((prev) => ({ ...prev, branch_id: undefined }))
                            }}
                            disabled={isEdit || !!user?.branch_id}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una sucursal" />
                            </SelectTrigger>
                            <SelectContent>
                                {branches.map((b) => (
                                    <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.branch_id && <p className="text-xs text-destructive">{errors.branch_id}</p>}
                    </div>

                    {/* Producto */}
                    <div className="space-y-1.5">
                        <Label>Producto <span className="text-destructive">*</span></Label>
                        <Select
                            value={form.product_id ? String(form.product_id) : ""}
                            onValueChange={(v) => {
                                setForm((prev) => ({ ...prev, product_id: Number(v) }))
                                setErrors((prev) => ({ ...prev, product_id: undefined }))
                            }}
                            disabled={isEdit}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un producto" />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                        <span>{p.name}</span>
                                        <span className="ml-2 text-xs text-muted-foreground font-mono">{p.sku}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.product_id && <p className="text-xs text-destructive">{errors.product_id}</p>}
                    </div>

                    {/* Precio y Costo */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="price">Precio <span className="text-destructive">*</span></Label>
                            <Input
                                id="price"
                                placeholder="0.00"
                                value={form.price}
                                onChange={(e) => handleNumericChange("price", e.target.value, true)}
                                inputMode="decimal"
                            />
                            {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="cost">Costo <span className="text-destructive">*</span></Label>
                            <Input
                                id="cost"
                                placeholder="0.00"
                                value={form.cost}
                                onChange={(e) => handleNumericChange("cost", e.target.value, true)}
                                inputMode="decimal"
                            />
                            {errors.cost && <p className="text-xs text-destructive">{errors.cost}</p>}
                        </div>
                    </div>

                    {/* Stock mínimo y Punto de reorden */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="min_stock">
                                Stock mínimo
                                <span className="text-xs text-muted-foreground ml-1">(opcional)</span>
                            </Label>
                            <Input
                                id="min_stock"
                                placeholder="0"
                                value={form.min_stock}
                                onChange={(e) => handleNumericChange("min_stock", e.target.value)}
                                inputMode="numeric"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="reorder_point">
                                Punto de reorden
                                <span className="text-xs text-muted-foreground ml-1">(opcional)</span>
                            </Label>
                            <Input
                                id="reorder_point"
                                placeholder="0"
                                value={form.reorder_point}
                                onChange={(e) => handleNumericChange("reorder_point", e.target.value)}
                                inputMode="numeric"
                            />
                        </div>
                    </div>

                    {/* Moneda */}
                    <div className="space-y-1.5">
                        <Label>Moneda</Label>
                        <Select
                            value={form.currency}
                            onValueChange={(v) => setForm((prev) => ({ ...prev, currency: v }))}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MXN">MXN</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Asignar producto"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}