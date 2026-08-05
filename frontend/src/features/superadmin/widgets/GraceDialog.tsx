"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { reportsApi, type SuperadminClientRow } from "@/lib/api/reports"
import { getApiError } from "@/lib/input-helpers"
import { formatDate, formatLocalDate } from "@/lib/utils"

interface Props {
    client: SuperadminClientRow | null
    onClose: () => void
    onSuccess: () => void
}

export function GraceDialog({ client, onClose, onSuccess }: Props) {
    const [until, setUntil] = useState("")
    const [loading, setLoading] = useState(false)

    // Propuesta por defecto: hasta el próximo corte
    useEffect(() => {
        if (!client) return
        setUntil(client.next_due ?? "")
    }, [client])

    if (!client) return null

    const today = formatLocalDate(new Date())

    async function handleSubmit() {
        if (!client || !until) return
        setLoading(true)
        try {
            await reportsApi.grantGrace(client.id, until)
            sileo.success({ title: `Prórroga para ${client.name} hasta ${formatDate(until)}` })
            onSuccess()
            onClose()
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al dar la prórroga") })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={!!client} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogTitle>Dar prórroga</DialogTitle>

                <div className="space-y-4 pt-2">
                    <div className="rounded-lg border p-3 text-sm">
                        <p className="font-medium">{client.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {client.pending_cycles > 0
                                ? `Debe ${client.pending_cycles} corte${client.pending_cycles !== 1 ? "s" : ""}. La deuda se conserva.`
                                : "Sin cortes pendientes."}
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="until">Reactivar hasta</Label>
                        <Input
                            id="until"
                            type="date"
                            min={today}
                            value={until}
                            onChange={(e) => setUntil(e.target.value)}
                        />
                        <p className="text-[11px] text-muted-foreground">
                            La cuenta vuelve a funcionar sin registrar ningún pago. Pasada esa
                            fecha, si sigue debiendo, se suspende sola otra vez.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading || !until}>
                            {loading ? "Guardando..." : "Dar prórroga"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
