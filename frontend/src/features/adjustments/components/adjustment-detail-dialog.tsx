"use client"
import { useEffect, useState } from "react"
import { adjustmentsApi, type Adjustment } from "@/lib/api/adjustments"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

interface Props {
    open: boolean
    onClose: () => void
    adjustmentId: number | null
}

export function AdjustmentDetailDialog({ open, onClose, adjustmentId }: Props) {
    const [adjustment, setAdjustment] = useState<Adjustment | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open && adjustmentId) {
            setLoading(true)
            adjustmentsApi.get(adjustmentId).then(setAdjustment).finally(() => setLoading(false))
        }
    }, [open, adjustmentId])

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Detalle de ajuste</DialogTitle>
                </DialogHeader>
                {loading && <p className="text-sm text-muted-foreground py-4 text-center">Cargando...</p>}
                {adjustment && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><span className="text-muted-foreground">Doc:</span> <span className="font-mono font-medium">{adjustment.doc_no}</span></div>
                            <div><span className="text-muted-foreground">Tipo:</span> <Badge variant={adjustment.type === "ADJUSTMENT_IN" ? "default" : "secondary"}>{adjustment.type === "ADJUSTMENT_IN" ? "Entrada" : "Salida"}</Badge></div>
                            <div><span className="text-muted-foreground">Sucursal:</span> {adjustment.branch_name}</div>
                            <div><span className="text-muted-foreground">Usuario:</span> {adjustment.user_name}</div>
                            {adjustment.note && <div className="col-span-2"><span className="text-muted-foreground">Nota:</span> {adjustment.note}</div>}
                            <div className="col-span-2"><span className="text-muted-foreground">Fecha:</span> {formatDate(adjustment.created_at)}</div>
                        </div>
                        <div className="border rounded-md overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">Producto</th>
                                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">SKU</th>
                                        <th className="text-right px-3 py-2 font-medium text-muted-foreground">Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adjustment.items?.map((item) => (
                                        <tr key={item.id} className="border-t">
                                            <td className="px-3 py-2">{item.product_name}</td>
                                            <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{item.sku}</td>
                                            <td className="px-3 py-2 text-right font-medium">{item.qty}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}