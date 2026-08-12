"use client"
import { useCallback, useEffect, useState } from "react"
import { sileo } from "sileo"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Undo2, PackageCheck } from "lucide-react"
import { salesApi, type Sale, type ReturnableItem, type SaleReturn } from "@/lib/api/sales"
import { getApiError, onlyDecimals } from "@/lib/input-helpers"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Props {
    saleId: number | null
    onClose: () => void
    onChange?: () => void
}

export function SaleReturnDialog({ saleId, onClose, onChange }: Props) {
    const [sale, setSale] = useState<Sale | null>(null)
    const [items, setItems] = useState<ReturnableItem[]>([])
    const [history, setHistory] = useState<SaleReturn[]>([])
    const [qty, setQty] = useState<Record<number, string>>({})
    const [reason, setReason] = useState("")
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    const load = useCallback(async () => {
        if (!saleId) return
        setLoading(true)
        try {
            const data = await salesApi.returnable(saleId)
            setSale(data.sale)
            setItems(data.items)
            setHistory(data.returns)
            setQty({})
            setReason("")
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al cargar la venta") })
        } finally {
            setLoading(false)
        }
    }, [saleId])

    useEffect(() => { load() }, [load])

    if (!saleId) return null

    const selected = items
        .map((it) => ({ it, q: Number(qty[it.id] ?? 0) }))
        .filter(({ q }) => q > 0)

    const total = selected.reduce((acc, { it, q }) => acc + q * it.unit_price, 0)
    // Misma regla que el servidor: primero baja la deuda, el resto es efectivo
    const balance = Math.max(sale?.balance ?? 0, 0)
    const credited = Math.min(total, balance)
    const refunded = total - credited

    const anythingReturnable = items.some((it) => it.returnable_qty > 0)

    function setQtyFor(item: ReturnableItem, value: string) {
        const clean = onlyDecimals(value)
        const n = Number(clean)
        // No dejes capturar más de lo que queda: el API lo rechaza igual
        if (clean !== "" && n > item.returnable_qty) {
            setQty((p) => ({ ...p, [item.id]: String(item.returnable_qty) }))
            return
        }
        setQty((p) => ({ ...p, [item.id]: clean }))
    }

    async function handleSubmit() {
        if (!sale || !selected.length) return
        setSaving(true)
        try {
            const res = await salesApi.createReturn(sale.id, {
                items: selected.map(({ it, q }) => ({ sale_item_id: it.id, qty: q })),
                reason: reason || undefined,
            })
            sileo.success({
                title: `Devolución de ${formatCurrency(res.return.total)} registrada`,
                description: res.return.refunded > 0
                    ? `Regresa ${formatCurrency(res.return.refunded)} en efectivo`
                    : "Se aplicó completa a lo que debía",
            })
            await load()
            onChange?.()
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al registrar la devolución") })
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={!!saleId} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogTitle>
                    Devolución {sale && <span className="font-mono text-muted-foreground">{sale.doc_no}</span>}
                </DialogTitle>

                {loading && !sale ? (
                    <div className="space-y-3 pt-2">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
                    </div>
                ) : sale ? (
                    <div className="space-y-4 pt-2">
                        {!anythingReturnable ? (
                            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                                <PackageCheck size={32} className="opacity-40" />
                                <p className="text-sm">Todos los productos de esta venta ya fueron devueltos</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-1.5">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        ¿Qué trae de vuelta?
                                    </p>
                                    <ul className="space-y-1">
                                        {items.map((it) => (
                                            <li
                                                key={it.id}
                                                className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${it.returnable_qty <= 0 ? "opacity-50" : ""}`}
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium truncate">{it.product_name}</p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {formatCurrency(it.unit_price)} c/u · vendidas {it.qty}
                                                        {it.returned_qty > 0 && ` · devueltas ${it.returned_qty}`}
                                                    </p>
                                                    {/* El precio de arriba es la parte prorrateada del paquete */}
                                                    {it.package_name && (
                                                        <p className="text-[11px] text-muted-foreground">
                                                            Del paquete &quot;{it.package_name}&quot;
                                                        </p>
                                                    )}
                                                </div>
                                                {it.returnable_qty > 0 ? (
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <Input
                                                            value={qty[it.id] ?? ""}
                                                            onChange={(e) => setQtyFor(it, e.target.value)}
                                                            placeholder="0"
                                                            inputMode="decimal"
                                                            className="h-8 w-16 text-center text-sm"
                                                            aria-label={`Piezas a devolver de ${it.product_name}`}
                                                        />
                                                        <span className="text-[11px] text-muted-foreground w-12">
                                                            de {it.returnable_qty}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-muted-foreground shrink-0">
                                                        devuelto
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {total > 0 && (
                                    <div className="rounded-lg border p-3 space-y-1.5 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Importe devuelto</span>
                                            <span className="font-semibold">{formatCurrency(total)}</span>
                                        </div>
                                        {credited > 0 && (
                                            <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                                                <span>Se aplica a lo que debe</span>
                                                <span>−{formatCurrency(credited)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-semibold border-t pt-1.5">
                                            <span>A regresar en efectivo</span>
                                            <span className={refunded > 0 ? "text-amber-600 dark:text-amber-400" : ""}>
                                                {formatCurrency(refunded)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label htmlFor="motivo">
                                        Motivo <span className="text-xs text-muted-foreground ml-1">(opcional)</span>
                                    </Label>
                                    <Input
                                        id="motivo" value={reason} onChange={(e) => setReason(e.target.value)}
                                        placeholder="Ej. producto defectuoso"
                                    />
                                </div>

                                <Button
                                    className="w-full"
                                    onClick={handleSubmit}
                                    disabled={saving || !selected.length}
                                >
                                    <Undo2 size={15} className="mr-1.5" />
                                    {saving ? "Registrando..." : "Registrar devolución"}
                                </Button>
                            </>
                        )}

                        {history.length > 0 && (
                            <div className="space-y-1.5 border-t pt-4">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Devoluciones anteriores ({history.length})
                                </p>
                                <ul className="space-y-1">
                                    {history.map((r) => (
                                        <li key={r.id} className="rounded-lg border px-3 py-2">
                                            <div className="flex justify-between gap-2">
                                                <span className="text-sm font-medium">{formatCurrency(r.total)}</span>
                                                <span className="text-[11px] text-muted-foreground">
                                                    {formatDate(r.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                {r.items.map((i) => `${i.qty}× ${i.product_name}`).join(", ")}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {formatCurrency(r.credited)} a cuenta · {formatCurrency(r.refunded)} en efectivo
                                                {r.reason ? ` · ${r.reason}` : ""}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    )
}
