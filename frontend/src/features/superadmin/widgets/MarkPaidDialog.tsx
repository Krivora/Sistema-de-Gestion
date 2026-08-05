"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoneyInput } from "@/components/ui/money-input"
import { reportsApi, type SuperadminClientRow } from "@/lib/api/reports"
import { getApiError } from "@/lib/input-helpers"
import { formatDate } from "@/lib/utils"

interface Props {
    client: SuperadminClientRow | null
    onClose: () => void
    onSuccess: () => void
}

export function MarkPaidDialog({ client, onClose, onSuccess }: Props) {
    const [amount, setAmount] = useState("")
    const [note, setNote] = useState("")
    const [loading, setLoading] = useState(false)

    // Precarga el último monto cobrado: casi siempre es el mismo
    useEffect(() => {
        if (!client) return
        setAmount(client.last_payment_amount != null ? String(client.last_payment_amount) : "")
        setNote("")
    }, [client])

    if (!client) return null

    // Lo calcula Postgres: sumar meses en JS se rompe en fin de mes
    const dueDate = client.oldest_unpaid_due

    async function handleSubmit() {
        if (!client || !dueDate) return
        setLoading(true)
        try {
            await reportsApi.registerPayment(client.id, {
                due_date: dueDate,
                amount: amount === "" ? null : Number(amount),
                note: note || undefined,
            })
            sileo.success({ title: `Pago registrado para ${client.name}` })
            onSuccess()
            onClose()
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al registrar el pago") })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={!!client} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogTitle>Registrar pago</DialogTitle>

                <div className="space-y-4 pt-2">
                    <div className="rounded-lg border p-3 text-sm">
                        <p className="font-medium">{client.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {dueDate
                                ? <>Corte del <strong>{formatDate(dueDate)}</strong></>
                                : "Sin cortes pendientes"}
                        </p>
                        {client.pending_cycles > 1 && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                Debe {client.pending_cycles} cortes. Este registro salda el más
                                antiguo; repite para los demás.
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="amount">
                            Monto <span className="text-xs text-muted-foreground ml-1">(opcional)</span>
                        </Label>
                        <MoneyInput
                            id="amount"
                            value={amount}
                            onValueChange={setAmount}
                            placeholder="0.00"
                            className="text-right"
                        />
                        <p className="text-[11px] text-muted-foreground">
                            Sirve para estimar lo pendiente de este cliente en los próximos cortes.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="note">
                            Nota <span className="text-xs text-muted-foreground ml-1">(opcional)</span>
                        </Label>
                        <Input
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Ej. transferencia, referencia 4821"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading || !dueDate}>
                            {loading ? "Guardando..." : "Registrar pago"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
