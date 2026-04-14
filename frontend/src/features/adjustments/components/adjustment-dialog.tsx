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
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"
interface Props { open: boolean; onClose: () => void; onSuccess: () => void }

const EMPTY: CreateAdjustmentDto = { branch_id: "", type: "", note: "", items: [] }
const NOTE_OPTIONS = {
    ADJUSTMENT_IN: [
        "Ajuste por migración de sistema",
        "Carga inicial de inventario",
        "Compra urgente no registrada",
        "Conteo físico de inventario",
        "Corrección de error",
        "Devolución de cliente",
        "Ingreso por consignación",
        "Producto encontrado",
        "Producción terminada",
        "Recepción de mercancía",
        "Recepción parcial previa no registrada",
        "Recuperación de producto",
        "Regularización administrativa",
        "Reempaque o conversión de unidades",
        "Sincronización de sistema",
        "Transferencia recibida de otra sucursal"
    ],

    ADJUSTMENT_OUT: [
        "Ajuste por migración de sistema",
        "Baja administrativa",
        "Consumo en producción",
        "Conversión de unidades",
        "Corrección de error",
        "Depuración de inventario",
        "Desensamble de producto",
        "Entrega parcial no registrada",
        "Merma o producto dañado",
        "Muestra o regalo",
        "Pérdida por desastre (incendio, inundación, etc.)",
        "Producto en cuarentena",
        "Producto no localizado",
        "Producto vencido",
        "Retiro por defecto de calidad",
        "Retiro sanitario",
        "Robo o extravío",
        "Salida por consignación",
        "Transferencia a otra sucursal",
        "Venta no registrada"
    ]
};
const TYPE_CONFIG = {
    ADJUSTMENT_IN: { label: "Entrada", desc: "Aumenta el stock", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
    ADJUSTMENT_OUT: { label: "Salida", desc: "Disminuye el stock", color: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400" },
}

export function AdjustmentDialog({ open, onClose, onSuccess }: Props) {
    const [form, setForm] = useState<CreateAdjustmentDto>(EMPTY)
    const [branches, setBranches] = useState<Branch[]>([])
    const [branchProducts, setBranchProducts] = useState<BranchProduct[]>([])
    const [loading, setLoading] = useState(false)
    const isMobile = useMediaQuery("(max-width: 639px)")
    const SELECT_WIDTH = "w-full";
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

    const Content = (
        <>
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Ajuste de inventario
                        </span>
                        {typeConfig && (
                            <span
                                className={cn(
                                    "inline-flex text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md",
                                    typeConfig.color
                                )}
                            >
                                {typeConfig.label} — {typeConfig.desc}
                            </span>
                        )}
                    </div>

                    <DialogTitle className="text-base font-medium leading-snug text-foreground">
                        {selectedBranch
                            ? `${selectedBranch.name}${form.items.length > 0
                                ? ` · ${form.items.length} producto${form.items.length !== 1 ? "s" : ""
                                }`
                                : ""
                            }`
                            : "¿En qué sucursal vas a ajustar?"}
                    </DialogTitle>
                </div>
            </div>

            {/* Progreso */}
            <div className="h-0.5 bg-border">
                <div
                    className="h-full transition-all duration-300 rounded-r-full"
                    style={{
                        width: `${progress}%`,
                        background:
                            form.type === "ADJUSTMENT_OUT"
                                ? "rgb(239 68 68)"
                                : "rgb(16 185 129)",
                    }}
                />
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5 flex-1 overflow-y-auto">
                {/* Sucursal + Tipo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Sucursal */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                            Sucursal <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={form.branch_id ? String(form.branch_id) : ""}
                            onValueChange={(v) =>
                                setForm((p) => ({
                                    ...p,
                                    branch_id: Number(v),
                                    items: [],
                                }))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona sucursal" />
                            </SelectTrigger>
                            <SelectContent>
                                {branches.map((b) => (
                                    <SelectItem key={b.id} value={String(b.id)}>
                                        {b.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tipo */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                            Tipo <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={form.type || ""}
                            onValueChange={(v) =>
                                setForm((p) => ({
                                    ...p,
                                    type: v as "ADJUSTMENT_IN" | "ADJUSTMENT_OUT",
                                    note: "",
                                }))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona el tipo de ajuste" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ADJUSTMENT_IN">
                                    ↑ Entrada — aumenta stock
                                </SelectItem>
                                <SelectItem value="ADJUSTMENT_OUT">
                                    ↓ Salida — disminuye stock
                                </SelectItem>
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
                            disabled={!form.branch_id}
                            className="h-7 text-xs gap-1"
                        >
                            <Plus size={12} /> Agregar
                        </Button>
                    </div>

                    {form.items.map((item, i) => {
                        const bp = branchProducts.find(
                            (p) => p.product_id === item.product_id
                        )
                        const overStock =
                            form.type === "ADJUSTMENT_OUT" &&
                            bp &&
                            item.qty > bp.current_stock

                        return (
                            <div
                                key={i}
                                className="grid grid-cols-1 sm:grid-cols-[7fr_2fr_auto] gap-3 items-start p-3 rounded-lg border bg-muted/20"
                            >
                                {/* Producto */}
                                <Select
                                    value={String(item.product_id || "")}
                                    onValueChange={(v) =>
                                        updateItem(i, "product_id", Number(v))
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona producto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branchProducts
                                            .filter((bp) => bp.is_active)
                                            .map((bp) => (
                                                <SelectItem
                                                    key={bp.product_id}
                                                    value={String(bp.product_id)}
                                                >
                                                    {bp.product_name} ({bp.current_stock} disp.)
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>

                                {/* Cantidad */}
                                <div className="space-y-1">
                                    <Input
                                        type="number"
                                        min={1}
                                        value={item.qty}
                                        onChange={(e) =>
                                            updateItem(i, "qty", Number(e.target.value))
                                        }
                                        className={cn(
                                            "text-center w-full",
                                            overStock &&
                                            "border-destructive focus-visible:ring-destructive"
                                        )}
                                    />
                                    {overStock && (
                                        <p className="text-[10px] text-destructive">
                                            Stock disponible: {Math.floor(bp?.current_stock ?? 0)}
                                        </p>
                                    )}
                                </div>

                                {/* Eliminar */}
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
                        )
                    })}
                </div>

                {/* Motivo */}
                <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                        Motivo
                    </Label>
                    <Select
                        value={form.note || ""}
                        onValueChange={(v) =>
                            setForm((p) => ({ ...p, note: v }))
                        }
                        disabled={!form.type}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona el motivo" />
                        </SelectTrigger>
                        <SelectContent>
                            {(NOTE_OPTIONS[
                                form.type as keyof typeof NOTE_OPTIONS
                            ] ?? []).map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
                <p
                    className={cn(
                        "text-xs transition-colors",
                        progress === 100
                            ? "text-emerald-600 dark:text-emerald-400 font-medium"
                            : "text-muted-foreground"
                    )}
                >
                    {progress === 100
                        ? "✓ Listo para guardar"
                        : `${filledRequired}/3 pasos completados`}
                </p>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 sm:flex-none"
                    >
                        Cancelar
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 sm:flex-none min-w-[120px]"
                    >
                        {loading ? "Guardando..." : "Crear ajuste"}
                    </Button>
                </div>
            </div>
        </>
    )

    return isMobile ? (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent
                side="bottom"
                className="p-0 gap-0 rounded-t-2xl max-h-[92dvh] flex flex-col"
            >
                <SheetTitle className="sr-only">
                    Ajuste de inventario
                </SheetTitle>
                <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1 shrink-0" />
                {Content}
            </SheetContent>
        </Sheet>
    ) : (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl">
                {Content}
            </DialogContent>
        </Dialog>
    )
}