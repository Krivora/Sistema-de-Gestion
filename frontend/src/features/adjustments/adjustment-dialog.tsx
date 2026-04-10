"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { adjustmentsApi, type CreateAdjustmentDto } from "@/lib/api/adjustments"
import { branchProductsApi, type BranchProduct } from "@/lib/api/branch-products"
import { branchesApi, type Branch } from "@/lib/api/branches"
import { getApiError } from "@/lib/input-helpers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus } from "lucide-react"

interface Props {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

const EMPTY: CreateAdjustmentDto = { branch_id: "", type: "", note: "", items: [] }

export function AdjustmentDialog({ open, onClose, onSuccess }: Props) {
    const [form, setForm] = useState<CreateAdjustmentDto>(EMPTY)
    const [branches, setBranches] = useState<Branch[]>([])
    const [branchProducts, setBranchProducts] = useState<BranchProduct[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        branchesApi.list().then(setBranches)
    }, [])

    useEffect(() => {
        if (open) { setForm(EMPTY) }
    }, [open])

    useEffect(() => {
        if (form.branch_id) {
            branchProductsApi.byBranch(form.branch_id as number).then(setBranchProducts)
        } else {
            setBranchProducts([])
        }
    }, [form.branch_id])

    function addItem() {
        setForm((prev) => ({ ...prev, items: [...prev.items, { product_id: 0, qty: 1, note: "" }] }))
    }

    function removeItem(i: number) {
        setForm((prev) => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) }))
    }

    function updateItem(i: number, field: string, value: string | number) {
        setForm((prev) => ({
            ...prev,
            items: prev.items.map((item, idx) => idx === i ? { ...item, [field]: value } : item),
        }))
    }

    async function handleSubmit() {
        if (!form.branch_id || !form.type || form.items.length === 0) {
            sileo.error({ title: "Completa sucursal, tipo y al menos un producto" })
            return
        }
        if (form.items.some((i) => !i.product_id || i.qty <= 0)) {
            sileo.error({ title: "Todos los items deben tener producto y cantidad válida" })
            return
        }
        setLoading(true)
        try {
            await adjustmentsApi.create(form)
            sileo.success({ title: "Ajuste creado" })
            onSuccess()
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al crear ajuste") })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nuevo ajuste de inventario</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Sucursal <span className="text-destructive">*</span></Label>
                            <Select value={String(form.branch_id)} onValueChange={(v) => setForm((p) => ({ ...p, branch_id: Number(v), items: [] }))}>
                                <SelectTrigger><SelectValue placeholder="Selecciona sucursal" /></SelectTrigger>
                                <SelectContent>
                                    {branches.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Tipo <span className="text-destructive">*</span></Label>
                            <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v as "ADJUSTMENT_IN" | "ADJUSTMENT_OUT" }))}>
                                <SelectTrigger><SelectValue placeholder="Tipo de ajuste" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADJUSTMENT_IN">Entrada (aumento)</SelectItem>
                                    <SelectItem value="ADJUSTMENT_OUT">Salida (disminución)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="note">Nota</Label>
                        <Input id="note" placeholder="Ej. Conteo físico enero" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Productos <span className="text-destructive">*</span></Label>
                            <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={!form.branch_id}>
                                <Plus size={14} className="mr-1" /> Agregar
                            </Button>
                        </div>
                        {form.items.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4 border rounded-md">
                                {form.branch_id ? "Agrega productos al ajuste" : "Selecciona una sucursal primero"}
                            </p>
                        )}
                        {form.items.map((item, i) => (
                            <div key={i} className="grid grid-cols-[1fr_100px_1fr_auto] gap-2 items-end">
                                <div className="space-y-1">
                                    {i === 0 && <Label className="text-xs text-muted-foreground">Producto</Label>}
                                    <Select value={String(item.product_id || "")} onValueChange={(v) => updateItem(i, "product_id", Number(v))}>
                                        <SelectTrigger><SelectValue placeholder="Producto" /></SelectTrigger>
                                        <SelectContent>
                                            {branchProducts.filter((bp) => bp.is_active).map((bp) => (
                                                <SelectItem key={bp.product_id} value={String(bp.product_id)}>{bp.product_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    {i === 0 && <Label className="text-xs text-muted-foreground">Cantidad</Label>}
                                    <Input type="number" min={1} value={item.qty} onChange={(e) => updateItem(i, "qty", Number(e.target.value))} />
                                </div>
                                <div className="space-y-1">
                                    {i === 0 && <Label className="text-xs text-muted-foreground">Nota</Label>}
                                    <Input placeholder="Opcional" value={item.note || ""} onChange={(e) => updateItem(i, "note", e.target.value)} />
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive" onClick={() => removeItem(i)}>
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={loading}>{loading ? "Guardando..." : "Crear ajuste"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}