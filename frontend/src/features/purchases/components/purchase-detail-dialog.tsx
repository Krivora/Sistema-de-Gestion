"use client"
import { useEffect, useState } from "react"
import { sileo } from "sileo"
import { purchasesApi, type Purchase } from "@/lib/api/purchases"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Package, Building2, User, FileText, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Props {
    purchaseId: number | null
    onClose: () => void
}

const STATUS_LABEL: Record<Purchase["status"], string> = {
    draft: "Borrador",
    posted: "Publicada",
    cancelled: "Cancelada",
}

const STATUS_VARIANT: Record<Purchase["status"], "default" | "secondary" | "destructive"> = {
    draft: "secondary",
    posted: "default",
    cancelled: "destructive",
}

function formatCurrency(n: number) {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n)
}

export function PurchaseDetailDialog({ purchaseId, onClose }: Props) {
    const [purchase, setPurchase] = useState<Purchase | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!purchaseId) { setPurchase(null); return }
        setLoading(true)
        purchasesApi.get(purchaseId)
            .then(setPurchase)
            .catch(() => sileo.error({ title: "Error al cargar detalle" }))
            .finally(() => setLoading(false))
    }, [purchaseId])

    const total = purchase?.items?.reduce(
        (acc, item) => acc + item.qty * item.unit_cost, 0
    ) ?? 0

    return (
        <Dialog open={!!purchaseId} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <span className="font-mono">{purchase?.doc_no ?? "..."}</span>
                        {purchase && (
                            <Badge variant={STATUS_VARIANT[purchase.status]}>
                                {STATUS_LABEL[purchase.status]}
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                {loading && (
                    <div className="py-8 text-center text-muted-foreground text-sm">Cargando...</div>
                )}

                {!loading && purchase && (
                    <div className="space-y-5">
                        {/* Meta info */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Building2 size={14} />
                                <span>{purchase.branch_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User size={14} />
                                <span>{purchase.user_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar size={14} />
                                <span>{formatDate(purchase.created_at)}</span>
                            </div>
                            {purchase.posted_at && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <FileText size={14} />
                                    <span>Publicada {formatDate(purchase.posted_at)}</span>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Items */}
                        <div className="space-y-1">
                            <div className="grid grid-cols-[1fr_60px_90px_90px] gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                <span>Producto</span>
                                <span className="text-center">Cant.</span>
                                <span className="text-right">Costo unit.</span>
                                <span className="text-right">Subtotal</span>
                            </div>
                            {purchase.items?.map((item) => (
                                <div
                                    key={item.id}
                                    className="grid grid-cols-[1fr_60px_90px_90px] gap-2 items-center px-2 py-2 rounded-md hover:bg-muted/40 transition-colors"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                            <Package size={12} className="text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{item.product_name}</p>
                                            <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-center">{item.qty}</p>
                                    <p className="text-sm text-right text-muted-foreground">
                                        {formatCurrency(item.unit_cost)}
                                    </p>
                                    <p className="text-sm text-right font-medium">
                                        {formatCurrency(item.qty * item.unit_cost)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <Separator />

                        {/* Total */}
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                                {purchase.items?.length} producto{purchase.items?.length !== 1 ? "s" : ""}
                                {" · "}
                                {purchase.items?.reduce((a, i) => a + i.qty, 0)} unidades
                            </span>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Total</p>
                                <p className="text-xl font-bold">{formatCurrency(total)}</p>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}