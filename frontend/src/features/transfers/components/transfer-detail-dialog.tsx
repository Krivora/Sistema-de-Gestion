"use client"
import { useEffect, useState } from "react"
import { transfersApi, type Transfer } from "@/lib/api/transfers"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

interface Props {
    open: boolean
    onClose: () => void
    transferId: number | null
}

export function TransferDetailDialog({ open, onClose, transferId }: Props) {
    const [transfer, setTransfer] = useState<Transfer | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open && transferId) {
            setLoading(true)
            transfersApi.get(transferId).then(setTransfer).finally(() => setLoading(false))
        }
    }, [open, transferId])

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Detalle de transferencia</DialogTitle>
                </DialogHeader>
                {loading && <p className="text-sm text-muted-foreground py-4 text-center">Cargando...</p>}
                {transfer && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><span className="text-muted-foreground">Doc:</span> <span className="font-mono font-medium">{transfer.doc_no}</span></div>
                            <div><span className="text-muted-foreground">Usuario:</span> {transfer.user_name}</div>
                            <div className="col-span-2 flex items-center gap-2">
                                <span className="font-medium">{transfer.from_branch_name}</span>
                                <ArrowRight size={14} className="text-muted-foreground" />
                                <span className="font-medium">{transfer.to_branch_name}</span>
                            </div>
                            {transfer.note && <div className="col-span-2"><span className="text-muted-foreground">Nota:</span> {transfer.note}</div>}
                            <div className="col-span-2"><span className="text-muted-foreground">Fecha:</span> {formatDate(transfer.created_at)}</div>
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
                                    {transfer.items?.map((item) => (
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