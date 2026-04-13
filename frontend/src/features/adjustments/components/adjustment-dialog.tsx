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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props { open: boolean; onClose: () => void; onSuccess: () => void }

const EMPTY: CreateAdjustmentDto = { branch_id: "", type: "", note: "", items: [] }

const TYPE_CONFIG = {
    ADJUSTMENT_IN: { label: "Entrada", desc: "Aumenta el stock", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
    ADJUSTMENT_OUT: { label: "Salida", desc: "Disminuye el stock", color: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400" },
}

export function AdjustmentDialog({ open, onClose, onSuccess }: Props) {
    const [form, setForm] = useState<CreateAdjustmentDto>(EMPTY)
    const [branches, setBranches] = useState<Branch[]>([])
    const [branchProducts, setBranchProducts] = useState<BranchProduct[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => { branchesApi.list().then(setBranches) }, [])
    useEffect(() => { if (open) setForm(EMPTY) }, [open])
    useEffect(() => {
        if (form.branch_id) branchProductsApi.byBranch(form.branch_id as number).then(setBranchProducts)
        else setBranchProducts([])
    }, [form.branch_id])

    function addItem() {
        setForm((p) => ({ ...p, items: [...p.items, { product_id: 0, qty: 1, note: "" }] }))
    }
    function removeItem(i: number) {
        setForm((p) => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }))
    }
    function updateItem(i: number, field: string, value: string | number) {
        setForm((p) => ({ ...p, items: p.items.map((item, idx) => idx === i ? { ...item, [field]: value } : item) }))
    }

    async function handleSubmit() {
        if (!form.branch_id || !form.type || form.items.length === 0) {
            sileo.error({ title: "Completa sucursal, tipo y al menos un producto" }); return
        }
        if (form.items.some((i) => !i.product_id || i.qty <= 0)) {
            sileo.error({ title: "Todos los productos deben tener cantidad válida" }); return
        }
        setLoading(true)
        try {
            await adjustmentsApi.create(form)
            sileo.success({ title: "Ajuste creado" })
            onSuccess()
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al crear ajuste") })
        } finally { setLoading(false) }
    }

    const selectedBranch = branches.find((b) => String(b.id) === String(form.branch_id))
    const typeConfig = form.type ? TYPE_CONFIG[form.type as keyof typeof TYPE_CONFIG] : null
    const filledRequired = [form.branch_id, form.type, form.items.length > 0 ? "ok" : ""].filter(Boolean).length
    const progress = Math.round((filledRequired / 3) * 100)

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl">

                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                Ajuste de inventario
                            </span>
                            {typeConfig && (
                                <span className={cn("inline-flex text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md", typeConfig.color)}>
                                    {typeConfig.label} — {typeConfig.desc}
                                </span>
                            )}
                        </div>
                        <DialogTitle className="text-base font-medium leading-snug text-foreground">
                            {selectedBranch
                                ? `${selectedBranch.name}${form.items.length > 0 ? ` · ${form.items.length} producto${form.items.length !== 1 ? "s" : ""}` : ""}`
                                : "¿En qué sucursal vas a ajustar?"}
                        </DialogTitle>
                    </div>
                </div>

                {/* Progreso */}
                <div className="h-0.5 bg-border">
                    <div className="h-full transition-all duration-300 rounded-r-full"
                        style={{
                            width: `${progress}%`,
                            background: form.type === "ADJUSTMENT_OUT" ? "rgb(239 68 68)" : "rgb(16 185 129)"
                        }} />
                </div>

                <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
                    {/* Sucursal + Tipo */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                                Sucursal <span className="text-destructive">*</span>
                            </Label>
                            {/* Sucursal */}
                            <Select value={String(form.branch_id)} onValueChange={(v) => setForm((p) => ({ ...p, branch_id: Number(v), items: [] }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona sucursal">
                                        {selectedBranch?.name}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {branches.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                                Tipo <span className="text-destructive">*</span>
                            </Label>
                            <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v as "ADJUSTMENT_IN" | "ADJUSTMENT_OUT" }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Tipo de ajuste">
                                        {form.type === "ADJUSTMENT_IN" && "↑ Entrada — aumenta stock"}
                                        {form.type === "ADJUSTMENT_OUT" && "↓ Salida — disminuye stock"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADJUSTMENT_IN">↑ Entrada — aumenta stock</SelectItem>
                                    <SelectItem value="ADJUSTMENT_OUT">↓ Salida — disminuye stock</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Productos */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                                Productos <span className="text-destructive">*</span>
                            </Label>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}
                                disabled={!form.branch_id} className="h-7 text-xs gap-1">
                                <Plus size={12} /> Agregar
                            </Button>
                        </div>

                        {form.items.length === 0 ? (
                            <div className="border border-dashed rounded-lg py-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    {form.branch_id ? "Agrega los productos a ajustar" : "Selecciona la sucursal primero"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {form.items.map((item, i) => {
                                    const bp = branchProducts.find((p) => p.product_id === item.product_id)
                                    const overStock = form.type === "ADJUSTMENT_OUT" && bp && item.qty > bp.current_stock
                                    const selectedProduct = branchProducts.find((p) => p.product_id === item.product_id)
                                    return (
                                        <div key={i} className="flex items-center gap-5 p-2 rounded-lg border bg-muted/20">
                                            <Select value={String(item.product_id || "")} onValueChange={(v) => updateItem(i, "product_id", Number(v))}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona producto">
                                                        {selectedProduct?.product_name}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {branchProducts.filter((bp) => bp.is_active).map((bp) => (
                                                        <SelectItem key={bp.product_id} value={String(bp.product_id)}>
                                                            <span>{bp.product_name}</span>
                                                            <span className="ml-2 text-xs text-muted-foreground">({bp.current_stock} disp.)</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <div>
                                                <Input type="number" min={1} value={item.qty}
                                                    onChange={(e) => updateItem(i, "qty", Number(e.target.value))}
                                                    className={cn("text-center", overStock && "border-destructive focus-visible:ring-destructive")} />
                                                {overStock && <p className="text-[10px] text-destructive mt-0.5">Stock disponible: {Math.floor(bp?.current_stock)}</p>}
                                            </div>
                                            <Button type="button" variant="ghost" size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeItem(i)}>
                                                <Trash2 size={13} />
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Nota general */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">Nota general</Label>
                        <Input placeholder="Ej. Conteo físico enero" value={form.note}
                            onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex items-center justify-between gap-4">
                    <p className={cn("text-xs transition-colors", progress === 100 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground")}>
                        {progress === 100 ? "✓ Listo para guardar" : `${filledRequired}/3 pasos completados`}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>Cancelar</Button>
                        <Button size="sm" onClick={handleSubmit} disabled={loading} className="min-w-[120px]">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                    Guardando...
                                </span>
                            ) : "Crear ajuste"}
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}