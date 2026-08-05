"use client"
import { useCallback, useEffect, useState } from "react"
import { sileo } from "sileo"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoneyInput } from "@/components/ui/money-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Printer, Trash2, Plus, CheckCircle2 } from "lucide-react"
import { salesApi, PAYMENT_METHODS, type Sale, type SalePayment } from "@/lib/api/sales"
import { getApiError } from "@/lib/input-helpers"
import { formatCurrency, formatDate } from "@/lib/utils"
import { generatePaymentReceipt } from "@/lib/pdf/payment-receipt"
import { useAuthStore } from "@/store/auth.store"

interface Props {
    saleId: number | null
    onClose: () => void
    /** Se llama tras cualquier cambio, para refrescar la lista de ventas */
    onChange?: () => void
}

export function SalePaymentsDialog({ saleId, onClose, onChange }: Props) {
    const user = useAuthStore((s) => s.user)
    const [sale, setSale] = useState<Sale | null>(null)
    const [payments, setPayments] = useState<SalePayment[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    const [amount, setAmount] = useState("")
    const [method, setMethod] = useState("EFECTIVO")
    const [note, setNote] = useState("")

    const load = useCallback(async () => {
        if (!saleId) return
        setLoading(true)
        try {
            const data = await salesApi.payments(saleId)
            setSale(data.sale)
            setPayments(data.payments)
            // Propone saldar de una vez; el usuario puede bajarlo
            setAmount(data.sale.balance > 0 ? String(data.sale.balance) : "")
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al cargar los abonos") })
        } finally {
            setLoading(false)
        }
    }, [saleId])

    useEffect(() => { load() }, [load])

    if (!saleId) return null

    const balance = sale?.balance ?? 0
    const settled = balance <= 0.009

    async function handleAdd() {
        if (!sale || !amount) return
        setSaving(true)
        try {
            const res = await salesApi.addPayment(sale.id, {
                amount: Number(amount),
                method,
                note: note || undefined,
            })
            setNote("")
            sileo.success({
                title: res.sale.balance <= 0.009
                    ? "Abono registrado — venta saldada"
                    : `Abono registrado — saldo ${formatCurrency(res.sale.balance)}`,
            })
            await load()
            onChange?.()
            // El comprobante se imprime de inmediato: es el momento en que el
            // cliente está enfrente esperando su papel
            await printReceipt(res.payment, res.sale)
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al registrar el abono") })
        } finally {
            setSaving(false)
        }
    }

    async function printReceipt(payment: SalePayment, forSale?: Sale) {
        const target = forSale ?? sale
        if (!target) return
        try {
            const fresh = await salesApi.payments(target.id)
            await generatePaymentReceipt(fresh.sale, payment, fresh.payments, {
                businessName: user?.business_name ?? target.branch_name,
                logoUrl: user?.logo_url,
                phone: user?.phone,
                email: user?.email,
            })
        } catch {
            sileo.error({ title: "Error al generar el comprobante" })
        }
    }

    async function handleDelete(payment: SalePayment) {
        if (!sale) return
        try {
            await salesApi.deletePayment(sale.id, payment.id)
            sileo.success({ title: "Abono cancelado" })
            await load()
            onChange?.()
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al cancelar el abono") })
        }
    }

    return (
        <Dialog open={!!saleId} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogTitle>
                    Abonos {sale && <span className="font-mono text-muted-foreground">{sale.doc_no}</span>}
                </DialogTitle>

                {loading && !sale ? (
                    <div className="space-y-3 pt-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                        ))}
                    </div>
                ) : sale ? (
                    <div className="space-y-4 pt-2">
                        {/* Estado de cuenta */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="rounded-lg border p-2.5">
                                <p className="text-[11px] text-muted-foreground">Total</p>
                                <p className="font-semibold text-sm">{formatCurrency(sale.total)}</p>
                            </div>
                            <div className="rounded-lg border p-2.5">
                                <p className="text-[11px] text-muted-foreground">Abonado</p>
                                <p className="font-semibold text-sm">{formatCurrency(sale.paid_amount)}</p>
                            </div>
                            <div className={`rounded-lg border p-2.5 ${settled ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900" : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900"}`}>
                                <p className="text-[11px] text-muted-foreground">Saldo</p>
                                <p className={`font-semibold text-sm ${settled ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
                                    {formatCurrency(balance)}
                                </p>
                            </div>
                        </div>

                        {settled && (
                            <p className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 size={14} />
                                Venta saldada — ya puedes publicarla
                            </p>
                        )}

                        {/* Historial */}
                        <div className="space-y-1.5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Abonos registrados ({payments.length})
                            </p>
                            {payments.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic py-3 text-center">
                                    Sin abonos todavía
                                </p>
                            ) : (
                                <ul className="space-y-1">
                                    {payments.map((p, i) => (
                                        <li key={p.id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                                            <span className="text-xs text-muted-foreground w-5">#{i + 1}</span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium">{formatCurrency(p.amount)}</p>
                                                <p className="text-[11px] text-muted-foreground truncate">
                                                    {formatDate(p.paid_at)} · {PAYMENT_METHODS.find((m) => m.value === p.method)?.label ?? p.method}
                                                    {p.note ? ` · ${p.note}` : ""}
                                                </p>
                                            </div>
                                            <Button
                                                size="sm" variant="ghost" className="h-7 w-7 p-0"
                                                onClick={() => printReceipt(p)}
                                                title="Imprimir comprobante"
                                                aria-label={`Imprimir comprobante del abono ${i + 1}`}
                                            >
                                                <Printer size={14} />
                                            </Button>
                                            {sale.status !== "posted" && (
                                                <Button
                                                    size="sm" variant="ghost"
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleDelete(p)}
                                                    title="Cancelar abono"
                                                    aria-label={`Cancelar abono ${i + 1}`}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Nuevo abono */}
                        {!settled && sale.status !== "cancelled" && (
                            <div className="space-y-3 border-t pt-4">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Registrar abono
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="abono">Monto</Label>
                                        <MoneyInput
                                            id="abono" value={amount} onValueChange={setAmount}
                                            className="text-right"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Forma de pago</Label>
                                        <Select value={method} onValueChange={(v) => v && setMethod(v)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue>
                                                    {PAYMENT_METHODS.find((m) => m.value === method)?.label}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PAYMENT_METHODS.map((m) => (
                                                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="nota">
                                        Referencia <span className="text-xs text-muted-foreground ml-1">(opcional)</span>
                                    </Label>
                                    <Input
                                        id="nota" value={note} onChange={(e) => setNote(e.target.value)}
                                        placeholder="Ej. transferencia 4821"
                                    />
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={handleAdd}
                                    disabled={saving || !amount || Number(amount) <= 0}
                                >
                                    <Plus size={15} className="mr-1.5" />
                                    {saving ? "Registrando..." : "Registrar abono e imprimir"}
                                </Button>
                                <p className="text-[11px] text-muted-foreground text-center">
                                    Máximo {formatCurrency(balance)} — no se aceptan abonos mayores al saldo
                                </p>
                            </div>
                        )}
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    )
}
