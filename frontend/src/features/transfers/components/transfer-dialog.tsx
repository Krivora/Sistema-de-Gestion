"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { transfersApi, type CreateTransferDto } from "@/lib/api/transfers"
import { branchProductsApi, type BranchProduct } from "@/lib/api/branch-products"
import { branchesApi, type Branch } from "@/lib/api/branches"
import { getApiError } from "@/lib/input-helpers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props { open: boolean; onClose: () => void; onSuccess: () => void }

const EMPTY: CreateTransferDto = { from_branch_id: "", to_branch_id: "", note: "", items: [] }
const NOTE_OPTIONS = [
    "Abastecimiento de sucursal",
    "Corrección de error",
    "Error en transferencia previa",
    "Optimización logística",
    "Reabastecimiento mensual",
    "Rebalanceo de inventario",
    "Redistribución por demanda",
    "Solicitud de sucursal",
    "Transferencia urgente"
];
export function TransferDialog({ open, onClose, onSuccess }: Props) {
    const [form, setForm] = useState<CreateTransferDto>(EMPTY)
    const [branches, setBranches] = useState<Branch[]>([])
    const [branchProducts, setBranchProducts] = useState<BranchProduct[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => { branchesApi.list().then(setBranches) }, [])
    useEffect(() => { if (open) setForm(EMPTY) }, [open])
    useEffect(() => {
        if (form.from_branch_id) branchProductsApi.byBranch(form.from_branch_id as number).then(setBranchProducts)
        else setBranchProducts([])
    }, [form.from_branch_id])

    function addItem() {
        setForm((p) => ({ ...p, items: [...p.items, { product_id: 0, qty: 1 }] }))
    }
    function removeItem(i: number) {
        setForm((p) => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }))
    }
    function updateItem(i: number, field: string, value: number) {
        setForm((p) => ({ ...p, items: p.items.map((item, idx) => idx === i ? { ...item, [field]: value } : item) }))
    }

    async function handleSubmit() {
        if (!form.from_branch_id || !form.to_branch_id || form.items.length === 0) {
            sileo.error({ title: "Completa origen, destino y al menos un producto" }); return
        }
        if (form.from_branch_id === form.to_branch_id) {
            sileo.error({ title: "Origen y destino no pueden ser la misma sucursal" }); return
        }
        if (form.items.some((i) => !i.product_id || i.qty <= 0)) {
            sileo.error({ title: "Todos los productos deben tener cantidad válida" }); return
        }
        setLoading(true)
        try {
            await transfersApi.create(form)
            sileo.success({ title: "Transferencia creada" })
            onSuccess()
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al crear transferencia") })
        } finally { setLoading(false) }
    }

    const fromBranch = branches.find((b) => String(b.id) === String(form.from_branch_id))
    const toBranch = branches.find((b) => String(b.id) === String(form.to_branch_id))
    const filledRequired = [form.from_branch_id, form.to_branch_id, form.items.length > 0 ? "ok" : ""].filter(Boolean).length
    const progress = Math.round((filledRequired / 3) * 100)

    const SELECT_WIDTH = "w-full";
    const SELECT_CONTENT_WIDTH = "md:w-100";


    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl">

                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b">
                    <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Nueva transferencia
                        </span>

                        {/* Ruta visual origen → destino */}
                        <div className="flex items-center gap-2 pt-1">
                            <span className={cn("text-base font-medium", fromBranch ? "text-foreground" : "text-muted-foreground")}>
                                {fromBranch?.name ?? "Origen"}
                            </span>
                            <ArrowRight size={16} className="text-muted-foreground shrink-0" />
                            <span className={cn("text-base font-medium", toBranch ? "text-foreground" : "text-muted-foreground")}>
                                {toBranch?.name ?? "Destino"}
                            </span>
                            {form.items.length > 0 && (
                                <span className="ml-auto text-[11px] text-muted-foreground">
                                    {form.items.length} producto{form.items.length !== 1 ? "s" : ""}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Barra de progreso 3 pasos */}
                <div className="h-0.5 bg-border">
                    <div className="h-full transition-all duration-300 rounded-r-full bg-blue-500"
                        style={{ width: `${progress}%` }} />
                </div>

                <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">

                    {/* Origen → Destino */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Origen */}
                        <div className="space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                                Origen <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={String(form.from_branch_id || "")}
                                onValueChange={(v) =>
                                    setForm((p) => ({
                                        ...p,
                                        from_branch_id: Number(v),
                                        items: [],
                                    }))
                                }
                            >
                                <SelectTrigger className={SELECT_WIDTH}>
                                    <SelectValue placeholder="Selecciona sucursal">
                                        {fromBranch ? (
                                            <span className="block truncate">
                                                {fromBranch.name}
                                            </span>
                                        ) : (
                                            "Selecciona sucursal"
                                        )}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className={SELECT_CONTENT_WIDTH}>
                                    {branches.map((b) => (
                                        <SelectItem key={b.id} value={String(b.id)}>
                                            <span className="block truncate">{b.name}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Destino */}
                        <div className="space-y-1.5">
                            <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                                Destino <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={String(form.to_branch_id || "")}
                                onValueChange={(v) =>
                                    setForm((p) => ({
                                        ...p,
                                        to_branch_id: Number(v),
                                    }))
                                }
                            >
                                <SelectTrigger className={SELECT_WIDTH}>
                                    <SelectValue placeholder="Selecciona sucursal">
                                        {toBranch ? (
                                            <span className="block truncate">
                                                {toBranch.name}
                                            </span>
                                        ) : (
                                            "Selecciona sucursal"
                                        )}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className={SELECT_CONTENT_WIDTH}>
                                    {branches
                                        .filter((b) => b.id !== form.from_branch_id)
                                        .map((b) => (
                                            <SelectItem key={b.id} value={String(b.id)}>
                                                <span className="block truncate">
                                                    {b.name}
                                                </span>
                                            </SelectItem>
                                        ))}
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
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addItem}
                                disabled={!form.from_branch_id}
                                className="h-7 text-xs gap-1"
                            >
                                <Plus size={12} /> Agregar
                            </Button>
                        </div>

                        {form.items.length === 0 ? (
                            <div className="border border-dashed rounded-lg py-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    {form.from_branch_id
                                        ? "Agrega los productos a transferir"
                                        : "Selecciona la sucursal de origen primero"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {form.items.map((item, i) => {
                                    const bp = branchProducts.find(
                                        (p) => p.product_id === item.product_id
                                    )
                                    const selectedProduct = bp
                                    const overStock = bp && item.qty > bp.current_stock
                                    return (
                                        <div
                                            key={i}
                                            className="grid grid-cols-1 md:grid-cols-[7fr_2fr_auto] gap-3 items-start p-3 rounded-lg border bg-muted/20"
                                        >
                                            {/* Producto */}
                                            <div className="space-y-1">
                                                <Select
                                                    value={String(item.product_id || "")}
                                                    onValueChange={(v) =>
                                                        updateItem(i, "product_id", Number(v))
                                                    }
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Selecciona producto">
                                                            {selectedProduct ? (
                                                                <span className="flex items-center justify-between gap-2 w-full">
                                                                    <span className="truncate">
                                                                        {selectedProduct.product_name}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground font-mono shrink-0">
                                                                        {selectedProduct.sku}
                                                                    </span>
                                                                </span>
                                                            ) : (
                                                                "Selecciona producto"
                                                            )}
                                                        </SelectValue>
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        {branchProducts
                                                            .filter((bp) => bp.is_active)
                                                            .map((bp) => (
                                                                <SelectItem
                                                                    key={bp.product_id}
                                                                    value={String(bp.product_id)}
                                                                >
                                                                    <div className="flex justify-between w-full gap-2">
                                                                        <span className="truncate">
                                                                            {bp.product_name}
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            ({bp.current_stock} disp.)
                                                                        </span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Cantidad */}
                                            <div className="space-y-1">
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={item.qty}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            i,
                                                            "qty",
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    className={cn(
                                                        "text-center w-full",
                                                        overStock &&
                                                        "border-destructive focus-visible:ring-destructive"
                                                    )}
                                                />
                                                {overStock && (
                                                    <p className="text-[10px] text-destructive">
                                                        Stock disponible:{" "}
                                                        {Math.floor(bp?.current_stock ?? 0)}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Eliminar */}
                                            <div className="flex items-center justify-center pt-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => removeItem(i)}
                                                >
                                                    <Trash2 size={13} />
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Nota */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">Nota</Label>
                        <Select
                            value={form.note || ""}
                            onValueChange={(v) => setForm((p) => ({ ...p, note: v }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona el motivo" />
                            </SelectTrigger>
                            <SelectContent>
                                {NOTE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex items-center justify-between gap-4">
                    <p className={cn("text-xs transition-colors", progress === 100 ? "text-blue-600 dark:text-blue-400 font-medium" : "text-muted-foreground")}>
                        {progress === 100 ? "✓ Listo para transferir" : `${filledRequired}/3 pasos completados`}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>Cancelar</Button>
                        <Button size="sm" onClick={handleSubmit} disabled={loading} className="min-w-35">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Guardando...
                                </span>
                            ) : "Crear transferencia"}
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}